import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { products } from './data/products.js';

dotenv.config();

// ── Startup env var check ────────────────────────────────────────────────────
const REQUIRED_VARS = [
  'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RAZORPAY_WEBHOOK_SECRET',
  'SUPABASE_URL', 'SUPABASE_SERVICE_KEY',
  'RESEND_API_KEY', 'DELHIVERY_TOKEN', 'CONTACT_EMAIL'
];
REQUIRED_VARS.forEach(v => {
  if (!process.env[v] || process.env[v].startsWith('your_')) {
    console.warn(`⚠️  Missing or placeholder env var: ${v}`);
  }
});

// ── HTML-escaping utility (prevent XSS in email templates) ──────────────────
const escHtml = (str) => String(str ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

// ── Rate limiters ────────────────────────────────────────────────────────────
const orderLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: 'Too many requests. Please try again later.' } });
const shippingLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 20, message: { success: false, message: 'Too many requests. Please try again later.' } });
const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5, message: { success: false, message: 'Too many messages sent. Please try again later.' } });

const app = express();

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// Raw body for Razorpay webhook signature verification
app.use('/api/webhook', express.raw({ type: 'application/json' }));

// JSON body limit — prevents large-payload DoS
app.use(express.json({ limit: '50kb' }));

// CORS — restrict to Vite dev server (update to production domain before deploying)
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }));

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl || 'http://localhost', supabaseServiceKey || 'dummy');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
});

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY || 'dummy');

// (multer removed — no file upload routes in current flow)

// Server-Side Calculate Price Logic (Zero-Trust)
const calculatePrice = (orderData) => {
  if (orderData.type === 'shop') {
    const product = products.find(p => p.id === orderData.productId);
    if (product) return product.price * 100;
    return (orderData.price || 0) * 100;
  } else if (orderData.type === 'cart') {
    // Validate each item's price against the server's product database
    const subtotal = orderData.items.reduce((sum, item) => {
      const dbProduct = products.find(p => p.id === item.id);
      const itemPrice = dbProduct ? dbProduct.price : 0;
      return sum + (itemPrice * item.quantity);
    }, 0);

    // Use the Delhivery-calculated shipping cost from the frontend
    const shippingCost = parseFloat(orderData.shippingCost) || 0;

    return (subtotal + shippingCost) * 100;
  }
  return 0;
};

// 1. Create Order Endpoint
app.post('/api/create-order', orderLimiter, async (req, res) => {
  try {
    const { orderData } = req.body;

    // Calculate actual price securely on backend
    const amountInPaise = calculatePrice(orderData);

    const options = {
      amount: Math.round(amountInPaise),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        orderType: orderData.type,
        customerName: orderData.customerName,
      }
    };

    const order = await razorpay.orders.create(options);
    console.log('Razorpay Order Created Successfully:', order.id);

    // Insert into Supabase as payment_pending
    const { error } = await supabase
      .from('tork3d_orders')
      .insert([{
        razorpay_order_id: order.id,
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        total_amount: amountInPaise / 100, // convert back to INR
        order_type: orderData.type,
        order_details: orderData.type === 'cart' ? { items: orderData.items, shippingMode: orderData.shippingMode, shippingCost: orderData.shippingCost, shippingAddress: orderData.shippingAddress, customerPhone: orderData.customerPhone } : (orderData.specs || {}),
        status: 'payment_pending'
      }]);

    if (error) {
      console.error('Supabase insert error on create order:', error);
      // We still proceed so the user can pay, webhook will handle it or verify-payment
    }

    res.json({
      success: true,
      order: order,
      amount: Math.round(amountInPaise)
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Could not create order' });
  }
});

// 2. Verify Payment (Frontend Callback Fallback)
app.post('/api/verify-payment', orderLimiter, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = req.body;

    // Cryptographic Signature Verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is verified! Update Supabase status to paid and fetch the record
      const { data: updatedOrders, error } = await supabase
        .from('tork3d_orders')
        .update({ status: 'paid', payment_id: razorpay_payment_id })
        .eq('razorpay_order_id', razorpay_order_id)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }

      // Send business notification email
      if (updatedOrders && updatedOrders.length > 0) {
        const orderRecord = updatedOrders[0];
        try {
          const details = orderRecord.order_details || {};
          const addr = details.shippingAddress || {};

          const itemsHtml = details.items
            ? details.items.map(item =>
              `<li style="padding:6px 0;border-bottom:1px solid #2a2a2a;">
                  <strong style="color:#fff;">${item.quantity}x ${item.name}</strong>
                  <span style="color:#999;float:right;">₹${item.price * item.quantity}</span>
                </li>`
            ).join('')
            : `<li style="padding:6px 0;color:#ccc;">Single product order</li>`;

          const addressText = addr.address1
            ? `${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}, ${addr.city} - ${addr.pincode}, ${addr.state}`
            : 'No address provided';

          const shippingModeLabel = details.shippingMode === 'express'
            ? '⚡ Express (1–3 days)'
            : details.shippingMode === 'surface'
              ? '📦 Standard (4–7 days)'
              : details.shippingMode === 'pickup'
                ? '🏭 Collect from Site (FREE)'
                : '—';

          await resend.emails.send({
            from: 'Tork3D Orders <onboarding@resend.dev>',
            to: [process.env.CONTACT_EMAIL || 'tork3d.design@gmail.com'],
            subject: `💰 NEW PAID ORDER — ${orderRecord.customer_name} (₹${orderRecord.total_amount})`,
            html: `
              <div style="font-family:'Segoe UI',Arial,sans-serif;background:#0f0f0f;padding:32px;border-radius:12px;max-width:560px;margin:auto;">
                <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#F97316;font-weight:700;">Tork3D</p>
                <h2 style="margin:0 0 24px;font-size:22px;color:#fff;">New Paid Order Received</h2>

                <table width="100%" style="margin-bottom:20px;">
                  <tr>
                    <td style="color:#777;font-size:12px;padding:4px 0;">Customer</td>
                    <td style="color:#fff;font-weight:600;text-align:right;">${orderRecord.customer_name}</td>
                  </tr>
                  <tr>
                    <td style="color:#777;font-size:12px;padding:4px 0;">Email</td>
                    <td style="color:#fff;text-align:right;">${orderRecord.customer_email}</td>
                  </tr>
                  <tr>
                    <td style="color:#777;font-size:12px;padding:4px 0;">Phone</td>
                    <td style="color:#fff;text-align:right;">${details.customerPhone || '—'}</td>
                  </tr>
                  <tr>
                    <td style="color:#777;font-size:12px;padding:4px 0;">Delivery</td>
                    <td style="color:#fff;text-align:right;">${shippingModeLabel}</td>
                  </tr>
                  <tr>
                    <td style="color:#777;font-size:12px;padding:4px 0;">Shipping Cost</td>
                    <td style="color:#fff;text-align:right;">₹${details.shippingCost || 0}</td>
                  </tr>
                  <tr>
                    <td style="color:#777;font-size:12px;padding:4px 0;">Payment ID</td>
                    <td style="color:#22c55e;text-align:right;font-size:12px;">${razorpay_payment_id}</td>
                  </tr>
                </table>

                <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
                  <p style="margin:0 0 10px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Items Ordered</p>
                  <ul style="margin:0;padding:0;list-style:none;">${itemsHtml}</ul>
                  <div style="margin-top:12px;padding-top:12px;border-top:1px solid #333;">
                    <strong style="color:#fff;">Total: </strong>
                    <strong style="color:#F97316;font-size:18px;">₹${orderRecord.total_amount}</strong>
                  </div>
                </div>

                <div style="background:#1a1a1a;border-radius:8px;padding:16px;">
                  <p style="margin:0 0 6px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Delivery Address</p>
                  <p style="margin:0;color:#ccc;font-size:14px;line-height:1.6;">${addressText}</p>
                </div>
              </div>
            `
          });
          console.log('✅ Order notification email sent to business.');
        } catch (emailErr) {
          console.error('⚠️ Failed to send order notification email:', emailErr);
        }
      }

      res.json({ success: true, message: 'Payment verified and order updated to paid!' });
    } else {
      res.status(400).json({ success: false, message: 'Invalid Signature' });
    }
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ success: false, message: 'Server error during verification' });
  }
});

// 3. Webhook Endpoint (Server-to-Server)
app.post('/api/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      return res.status(400).send('Webhook Secret or Signature missing');
    }

    const body = req.body.toString();

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).send('Invalid Signature');
    }

    const event = JSON.parse(body);

    // Process payment.captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const razorpay_order_id = payment.order_id;
      const razorpay_payment_id = payment.id;

      // Update Supabase to 'paid'
      const { data: updatedOrderData, error } = await supabase
        .from('tork3d_orders')
        .update({ status: 'paid', payment_id: razorpay_payment_id })
        .eq('razorpay_order_id', razorpay_order_id)
        .select();

      if (error) {
        console.error('Webhook Supabase update error:', error);
      } else if (updatedOrderData && updatedOrderData.length > 0) {
        console.log(`Order ${razorpay_order_id} marked as paid via webhook.`);
        const orderRecord = updatedOrderData[0];

        // --- Send business notification email for shop orders ---
        if (orderRecord.order_type === 'cart' || orderRecord.order_type === 'shop') {
          try {
            const details = orderRecord.order_details || {};
            const addr = details.shippingAddress || {};

            const itemsHtml = details.items
              ? details.items.map(item =>
                `<li style="padding:6px 0;border-bottom:1px solid #2a2a2a;">
                    <strong style="color:#fff;">${item.quantity}x ${item.name}</strong>
                    <span style="color:#999;float:right;">₹${item.price * item.quantity}</span>
                  </li>`
              ).join('')
              : `<li style="padding:6px 0;color:#ccc;">Single product order</li>`;

            const addressText = addr.address1
              ? `${addr.address1}${addr.address2 ? ', ' + addr.address2 : ''}, ${addr.city} - ${addr.pincode}, ${addr.state}`
              : 'No address provided';

            await resend.emails.send({
              from: 'Tork3D Orders <onboarding@resend.dev>',
              to: [process.env.CONTACT_EMAIL || 'tork3d.design@gmail.com'],
              subject: `💰 NEW PAID ORDER — ${orderRecord.customer_name} (₹${orderRecord.total_amount})`,
              html: `
                <div style="font-family:'Segoe UI',Arial,sans-serif;background:#0f0f0f;padding:32px;border-radius:12px;max-width:560px;margin:auto;">
                  <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#F97316;font-weight:700;">Tork3D</p>
                  <h2 style="margin:0 0 24px;font-size:22px;color:#fff;">New Paid Order Received</h2>

                  <table width="100%" style="margin-bottom:20px;">
                    <tr>
                      <td style="color:#777;font-size:12px;padding:4px 0;">Customer</td>
                      <td style="color:#fff;font-weight:600;text-align:right;">${orderRecord.customer_name}</td>
                    </tr>
                    <tr>
                      <td style="color:#777;font-size:12px;padding:4px 0;">Email</td>
                      <td style="color:#fff;text-align:right;">${orderRecord.customer_email}</td>
                    </tr>
                    <tr>
                      <td style="color:#777;font-size:12px;padding:4px 0;">Phone</td>
                      <td style="color:#fff;text-align:right;">${details.customerPhone || '—'}</td>
                    </tr>
                    <tr>
                      <td style="color:#777;font-size:12px;padding:4px 0;">Payment ID</td>
                      <td style="color:#22c55e;text-align:right;font-size:12px;">${razorpay_payment_id}</td>
                    </tr>
                  </table>

                  <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
                    <p style="margin:0 0 10px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Items Ordered</p>
                    <ul style="margin:0;padding:0;list-style:none;">${itemsHtml}</ul>
                    <div style="margin-top:12px;padding-top:12px;border-top:1px solid #333;display:flex;justify-content:space-between;">
                      <strong style="color:#fff;">Total</strong>
                      <strong style="color:#F97316;font-size:18px;">₹${orderRecord.total_amount}</strong>
                    </div>
                  </div>

                  <div style="background:#1a1a1a;border-radius:8px;padding:16px;">
                    <p style="margin:0 0 6px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Delivery Address</p>
                    <p style="margin:0;color:#ccc;font-size:14px;line-height:1.6;">${addressText}</p>
                  </div>
                </div>
              `
            });
            console.log('✅ Shop order notification email sent to business.');
          } catch (emailErr) {
            console.error('⚠️ Failed to send shop order email:', emailErr);
          }
        }

        // Trigger Live Delhivery API
        if (orderRecord.order_type === 'cart' && orderRecord.order_details?.shippingAddress) {
          console.log('\n📦 --- INITIATING DELHIVERY SHIPMENT --- 📦');
          try {
            const payload = {
              format: 'json',
              data: JSON.stringify({
                shipments: [{
                  name: orderRecord.customer_name,
                  add: orderRecord.order_details.shippingAddress.address1,
                  pin: orderRecord.order_details.shippingAddress.pincode,
                  city: orderRecord.order_details.shippingAddress.city,
                  state: orderRecord.order_details.shippingAddress.state,
                  country: 'India',
                  phone: orderRecord.order_details.customerPhone,
                  order: razorpay_order_id,
                  payment_mode: 'Pre-paid',
                  products_desc: '3D Printed Parts',
                  total_amount: orderRecord.total_amount,
                  quantity: '1',
                }],
                pickup_location: {
                  name: process.env.DELHIVERY_PICKUP_LOCATION || 'Tork3D_HQ'
                }
              })
            };

            const delhiveryRes = await fetch('https://track.delhivery.com/api/cmu/create.json', {
              method: 'POST',
              headers: {
                'Authorization': `Token ${process.env.DELHIVERY_TOKEN}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(payload)
            });

            const delhiveryData = await delhiveryRes.json();

            if (delhiveryData.success && delhiveryData.packages && delhiveryData.packages.length > 0) {
              const waybill = delhiveryData.packages[0].waybill;
              console.log(`✅ Delhivery Waybill Created: ${waybill}`);

              // Save waybill to Supabase
              await supabase
                .from('tork3d_orders')
                .update({ shipping_waybill: waybill })
                .eq('razorpay_order_id', razorpay_order_id);
            } else {
              console.error('❌ Delhivery API Error:', delhiveryData);
            }
          } catch (delhiveryError) {
            console.error('❌ Delhivery Request Failed:', delhiveryError);
          }
        }
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook Error');
  }
});

// 4. Delhivery Shipping Rate Estimator
app.get('/api/shipping-rate', shippingLimiter, async (req, res) => {
  try {
    const { pincode, pt = 'Pre-paid', codAmount = '0', items, productId } = req.query;

    if (!pincode || pincode.length !== 6) {
      return res.status(400).json({ success: false, message: 'Valid 6-digit pincode required' });
    }

    let expressTotal = 0;
    let surfaceTotal = 0;
    let totalWeight = 0;
    let anyValid = false;

    // Helper for Delhivery calls
    const makeRateCall = async (mode, cgm, ptParam, codParam, extraParams = {}) => {
      const params = new URLSearchParams({
        md: mode,
        ss: 'Delivered',
        d_pin: pincode,
        o_pin: '411048',
        pt: ptParam,
        cod: codParam,
        cgm: cgm,
        ...extraParams
      });
      const response = await fetch(
        `https://track.delhivery.com/api/kinko/v1/invoice/charges/.json?${params}`,
        { headers: { 'Authorization': `Token ${process.env.DELHIVERY_TOKEN}` } }
      );
      const data = await response.json();
      const result = Array.isArray(data) ? data[0] : data;
      return result?.total_amount ? Math.ceil(result.total_amount) : null;
    };

    if (productId) {
      // Single product order
      const dbProduct = products.find(p => p.id === parseInt(productId));
      if (!dbProduct) return res.status(404).json({ success: false, message: 'Product not found' });

      const cgm = Math.ceil((dbProduct.weight || 200) / 10) * 10;
      const d = dbProduct.packageDimensions;
      const extraParams = d ? { l: d.l, b: d.w, h: d.h } : {};

      totalWeight = cgm;
      const [express, surface] = await Promise.all([
        makeRateCall('E', cgm, pt, pt === 'COD' ? codAmount : '0', extraParams),
        makeRateCall('S', cgm, pt, pt === 'COD' ? codAmount : '0', extraParams)
      ]);

      if (express || surface) anyValid = true;
      if (express) expressTotal += express;
      if (surface) surfaceTotal += surface;

    } else if (items) {
      // Cart order — separate API call per unique item to offload volumetric calculation to Delhivery
      try {
        const parsedItems = JSON.parse(items);
        const itemPromises = parsedItems.map(async (item) => {
          const dbProduct = products.find(p => p.id === item.id);
          if (!dbProduct) return;

          // Pass raw dead weight rounded to 10g, along with dimensions
          const cgm = Math.ceil((dbProduct.weight || 200) / 10) * 10;
          const d = dbProduct.packageDimensions;
          const extraParams = d ? { l: d.l, b: d.w, h: d.h } : {};

          totalWeight += cgm * item.quantity;

          // If COD, pass the value of THIS single package to Delhivery
          const itemCodAmount = pt === 'COD' ? (dbProduct.price || 0) : '0';

          // Fetch exact rate (including COD surcharge if applicable) for ONE unit of this item
          const [express, surface] = await Promise.all([
            makeRateCall('E', cgm, pt, itemCodAmount, extraParams),
            makeRateCall('S', cgm, pt, itemCodAmount, extraParams)
          ]);

          if (express || surface) anyValid = true;
          // Multiply the base rate + per-package COD fee by quantity
          if (express) expressTotal += (express * item.quantity);
          if (surface) surfaceTotal += (surface * item.quantity);
        });

        await Promise.all(itemPromises);

      } catch (err) {
        console.error(err);
        return res.status(400).json({ success: false, message: 'Invalid items parameter' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Provide either productId or items' });
    }

    if (!anyValid) {
      return res.json({ success: false, message: 'Pincode not serviceable or invalid' });
    }

    res.json({
      success: true,
      express: expressTotal,
      surface: surfaceTotal,
      weight: totalWeight
    });
  } catch (error) {
    console.error('Shipping rate error:', error);
    res.status(500).json({ success: false, message: 'Could not fetch shipping rate' });
  }
});


// 5. COD Order Endpoint
app.post('/api/create-cod-order', orderLimiter, async (req, res) => {
  try {
    const { orderData } = req.body;

    // Calculate subtotal server-side
    const subtotal = orderData.items.reduce((sum, item) => {
      const dbProduct = products.find(p => p.id === item.id);
      return sum + ((dbProduct ? dbProduct.price : 0) * item.quantity);
    }, 0);
    // Cap shippingCost at ₹500 to prevent frontend manipulation
    const shippingCost = Math.min(parseFloat(orderData.shippingCost) || 0, 500);
    const totalAmount = subtotal + shippingCost;

    // Save to Supabase
    const { error: dbError } = await supabase
      .from('tork3d_orders')
      .insert([{
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        total_amount: totalAmount,
        order_type: orderData.type,
        order_details: {
          items: orderData.items,
          shippingMode: orderData.shippingMode,
          shippingCost,
          paymentType: 'COD',
          shippingAddress: orderData.shippingAddress || null,
          customerPhone: orderData.customerPhone
        },
        status: 'cod_pending'
      }]);

    if (dbError) {
      console.error('COD order Supabase error:', dbError);
      throw dbError;
    }

    // Send business notification email
    try {
      const addr = orderData.shippingAddress || {};
      const addressText = addr.address1
        ? `${addr.address1}, ${addr.city} - ${addr.pincode}, ${addr.state}`
        : orderData.shippingMode === 'pickup' ? 'Collect from Site' : 'No address';

      const shippingModeLabel = orderData.shippingMode === 'express'
        ? '⚡ Express (1–3 days)'
        : orderData.shippingMode === 'surface'
          ? '📦 Standard (4–7 days)'
          : '🏭 Collect from Site (FREE)';

      const itemsHtml = orderData.items
        ? orderData.items.map(item =>
          `<li style="padding:6px 0;border-bottom:1px solid #2a2a2a;">
              <strong style="color:#fff;">${escHtml(item.quantity + 'x ' + item.name)}</strong>
              <span style="color:#999;float:right;">&#8377;${item.price * item.quantity}</span>
            </li>`
        ).join('')
        : '';

      await resend.emails.send({
        from: 'Tork3D Orders <onboarding@resend.dev>',
        to: [process.env.CONTACT_EMAIL || 'tork3d.design@gmail.com'],
        subject: `📦 NEW COD ORDER — ${escHtml(orderData.customerName)} (₹${totalAmount})`,
        html: `
          <div style="font-family:'Segoe UI',Arial,sans-serif;background:#0f0f0f;padding:32px;border-radius:12px;max-width:560px;margin:auto;">
            <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#F97316;font-weight:700;">Tork3D</p>
            <h2 style="margin:0 0 6px;font-size:22px;color:#fff;">New COD Order</h2>
            <p style="margin:0 0 24px;font-size:13px;background:#F97316;color:#fff;display:inline-block;padding:4px 10px;border-radius:6px;font-weight:700;">💵 CASH ON DELIVERY</p>

            <table width="100%" style="margin-bottom:20px;">
              <tr><td style="color:#777;font-size:12px;padding:4px 0;">Customer</td><td style="color:#fff;font-weight:600;text-align:right;">${escHtml(orderData.customerName)}</td></tr>
              <tr><td style="color:#777;font-size:12px;padding:4px 0;">Email</td><td style="color:#fff;text-align:right;">${escHtml(orderData.customerEmail)}</td></tr>
              <tr><td style="color:#777;font-size:12px;padding:4px 0;">Phone</td><td style="color:#fff;text-align:right;">${escHtml(orderData.customerPhone || '—')}</td></tr>
              <tr><td style="color:#777;font-size:12px;padding:4px 0;">Delivery</td><td style="color:#fff;text-align:right;">${escHtml(shippingModeLabel)}</td></tr>
              <tr><td style="color:#777;font-size:12px;padding:4px 0;">Shipping Cost</td><td style="color:#fff;text-align:right;">₹${shippingCost}</td></tr>
            </table>

            <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
              <p style="margin:0 0 10px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Items Ordered</p>
              <ul style="margin:0;padding:0;list-style:none;">${itemsHtml}</ul>
              <div style="margin-top:12px;padding-top:12px;border-top:1px solid #333;">
                <strong style="color:#fff;">Total to Collect: </strong>
                <strong style="color:#F97316;font-size:18px;">₹${totalAmount}</strong>
              </div>
            </div>

            <div style="background:#1a1a1a;border-radius:8px;padding:16px;">
              <p style="margin:0 0 6px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Delivery Address</p>
              <p style="margin:0;color:#ccc;font-size:14px;line-height:1.6;">${addressText}</p>
            </div>
          </div>
        `
      });
      console.log('✅ COD order notification email sent.');
    } catch (emailErr) {
      console.error('⚠️ COD email failed:', emailErr);
    }

    res.json({ success: true, totalAmount });
  } catch (error) {
    console.error('COD order error:', error);
    res.status(500).json({ success: false, message: 'Failed to place COD order.' });
  }
});

// 6. Contact Form Endpoint
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ success: false, message: 'Message must be under 2000 characters.' });
    }

    const { data, error } = await resend.emails.send({
      from: 'Tork3D Contact <onboarding@resend.dev>',
      to: [process.env.CONTACT_EMAIL || 'tork3d.design@gmail.com'],
      reply_to: email,
      subject: `📩 New Message — ${escHtml(subject || 'No Subject')} (from ${escHtml(name)})`,
      html: `
        <div style="font-family:'Segoe UI',Arial,sans-serif;background:#0f0f0f;padding:32px;border-radius:12px;max-width:560px;margin:auto;">
          <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#F97316;font-weight:700;">Tork3D</p>
          <h2 style="margin:0 0 24px;font-size:22px;color:#fff;">New Contact Message</h2>
          <table width="100%" style="margin-bottom:20px;">
            <tr><td style="color:#777;font-size:12px;padding:4px 0;">Name</td><td style="color:#fff;font-weight:600;text-align:right;">${escHtml(name)}</td></tr>
            <tr><td style="color:#777;font-size:12px;padding:4px 0;">Email</td><td style="text-align:right;"><a href="mailto:${escHtml(email)}" style="color:#F97316;">${escHtml(email)}</a></td></tr>
            <tr><td style="color:#777;font-size:12px;padding:4px 0;">Phone</td><td style="color:#fff;text-align:right;">${escHtml(phone || '—')}</td></tr>
            <tr><td style="color:#777;font-size:12px;padding:4px 0;">Subject</td><td style="color:#fff;text-align:right;">${escHtml(subject || '—')}</td></tr>
          </table>
          <div style="background:#1a1a1a;border-radius:8px;padding:16px;">
            <p style="margin:0 0 8px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Message</p>
            <p style="margin:0;color:#ccc;font-size:14px;line-height:1.7;white-space:pre-wrap;">${escHtml(message)}</p>
          </div>
          <p style="margin:20px 0 0;font-size:11px;color:#444;">Reply directly to this email to respond to ${escHtml(name)}.</p>
        </div>
      `
    });

    if (error) throw error;

    console.log('✅ Contact form email sent:', data.id);
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message. Please try again.' });
  }
});

// 7. Quote Request Endpoint (Using Resend)
app.post('/api/create-quote', orderLimiter, async (req, res) => {
  try {
    const quoteData = req.body;
    console.log('New Quote Request Received:', quoteData);

    // Save to Supabase
    const { error } = await supabase
      .from('tork3d_orders')
      .insert([{
        customer_name: quoteData.customerName,
        customer_email: quoteData.customerEmail,
        order_type: 'Quote Request',
        order_details: quoteData.specs,
        status: 'lead_pending'
      }]);

    if (error) console.error('Supabase quote log error:', error);



    // Send email via Resend
    const { data, error: resendError } = await resend.emails.send({
      from: 'Tork3D <onboarding@resend.dev>', // Use onboarding@resend.dev for testing without verified domain
      to: [process.env.CONTACT_EMAIL || 'tork3d.design@gmail.com'],
      subject: `🚨 NEW QUOTE REQUEST: ${quoteData.customerName}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #F97316;">New Custom Order Request</h2>
          <p><strong>Customer:</strong> ${quoteData.customerName}</p>
          <p><strong>Email:</strong> ${quoteData.customerEmail}</p>
          <hr style="border: 1px solid #eee;" />
          <h3>Specifications:</h3>
          <ul>
            <li><strong>Material:</strong> ${quoteData.specs.material}</li>
            <li><strong>Color:</strong> ${quoteData.specs.color}</li>
            <li><strong>Infill:</strong> ${quoteData.specs.infill}%</li>
            <li><strong>Quantity:</strong> ${quoteData.specs.quantity}</li>
          </ul>
          <p><strong>Notes:</strong> ${quoteData.specs.description || 'None provided'}</p>
          <p><em>Customer will send 3D model files via WhatsApp.</em></p>
          <br />
          <p style="font-size: 12px; color: #999;">This email was sent automatically from the Tork3D website.</p>
        </div>
      `
    });

    if (resendError) {
      console.error('❌ Resend Error (business email):', resendError);
      throw resendError;
    }

    console.log('✅ Business notification email sent! ID:', data.id);

    res.json({ success: true, message: 'Quote request logged and email sent' });
  } catch (error) {
    console.error('Quote submission error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Global Error Guard
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running securely on port ${PORT}`);
});
