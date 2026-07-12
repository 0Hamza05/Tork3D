import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { products, lineTotal } from './data/products.js';

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

// ── Coupon code generator ────────────────────────────────────────────────────
// Excludes ambiguous chars (0/O/1/I) so codes are easy to read & type.
const COUPON_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generateCouponCode = () => {
  let suffix = '';
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) suffix += COUPON_ALPHABET[bytes[i] % COUPON_ALPHABET.length];
  return `TORK10-${suffix}`;
};

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
const SENDER_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

// (multer removed — no file upload routes in current flow)

// ── Shared order email builder ───────────────────────────────────────────────
const buildOrderEmailHtml = (orderRecord, paymentId) => {
  const details = orderRecord.order_details || {};
  const addr = details.shippingAddress || {};

  const itemsHtml = details.items
    ? details.items.map(item => {
        const dbProduct = resolveDbProduct(item.id);
        const unitPrice = dbProduct ? dbProduct.price : item.price;
        return `<li style="padding:6px 0;border-bottom:1px solid #2a2a2a;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <strong style="color:#fff;">${escHtml(item.quantity + 'x ' + item.name)}${item.engraveName ? ' — Engrave: ' + escHtml(item.engraveName) : ''}</strong>
          <span style="color:#999;white-space:nowrap;">&#8377;${dbProduct ? lineTotal(dbProduct, item.quantity) : unitPrice * item.quantity}</span>
        </li>`;
      }).join('')
    : `<li style="padding:6px 0;color:#ccc;">Single product order</li>`;

  const addressText = addr.address1
    ? `${escHtml(addr.address1)}${addr.address2 ? ', ' + escHtml(addr.address2) : ''}, ${escHtml(addr.city)} - ${escHtml(addr.pincode)}, ${escHtml(addr.state)}`
    : 'No address provided';

  const shippingModeLabel = details.shippingMode === 'express'
    ? '⚡ Express (1–3 days)'
    : details.shippingMode === 'surface'
      ? '📦 Standard (4–7 days)'
      : details.shippingMode === 'pickup'
        ? '🏭 Collect from Site (FREE)'
        : '—';

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;background:#0f0f0f;padding:32px;border-radius:12px;max-width:560px;margin:auto;">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#F97316;font-weight:700;">Tork3D</p>
      <h2 style="margin:0 0 24px;font-size:22px;color:#fff;">New Paid Order Received</h2>

      <table width="100%" style="margin-bottom:20px;">
        <tr><td style="color:#777;font-size:12px;padding:4px 0;">Customer</td><td style="color:#fff;font-weight:600;text-align:right;">${escHtml(orderRecord.customer_name)}</td></tr>
        <tr><td style="color:#777;font-size:12px;padding:4px 0;">Email</td><td style="color:#fff;text-align:right;">${escHtml(orderRecord.customer_email)}</td></tr>
        <tr><td style="color:#777;font-size:12px;padding:4px 0;">Phone</td><td style="color:#fff;text-align:right;">${escHtml(details.customerPhone || '—')}</td></tr>
        <tr><td style="color:#777;font-size:12px;padding:4px 0;">Delivery</td><td style="color:#fff;text-align:right;">${shippingModeLabel}</td></tr>
        <tr><td style="color:#777;font-size:12px;padding:4px 0;">Shipping Cost</td><td style="color:#fff;text-align:right;">&#8377;${details.shippingCost || 0}</td></tr>
        <tr><td style="color:#777;font-size:12px;padding:4px 0;">Referral</td><td style="color:#fff;text-align:right;">${escHtml(details.referredBy || '—')}</td></tr>
        ${paymentId ? `<tr><td style="color:#777;font-size:12px;padding:4px 0;">Payment ID</td><td style="color:#22c55e;text-align:right;font-size:12px;">${escHtml(paymentId)}</td></tr>` : ''}
      </table>

      <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="margin:0 0 10px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Items Ordered</p>
        <ul style="margin:0;padding:0;list-style:none;">${itemsHtml}</ul>
        ${details.couponDiscount ? `<div style="margin-top:10px;display:flex;justify-content:space-between;color:#22c55e;font-size:13px;">
          <span>Coupon${details.couponCode ? ' (' + escHtml(details.couponCode) + ')' : ''}</span>
          <span>&minus;&#8377;${details.couponDiscount}</span>
        </div>` : ''}
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #333;">
          <strong style="color:#fff;">Total: </strong>
          <strong style="color:#F97316;font-size:18px;">&#8377;${orderRecord.total_amount}</strong>
        </div>
      </div>

      ${details.freeKeychain ? `<div style="background:#1a1a1a;border:1px solid #F97316;border-radius:8px;padding:14px;margin-bottom:16px;text-align:center;">
        <span style="color:#F97316;font-size:14px;font-weight:700;">🎁 PACK A FREE NAME KEYCHAIN with this order</span>
        ${details.keychainName ? `<br/><span style="color:#fff;font-size:15px;">Engrave: <strong>${escHtml(details.keychainName)}</strong></span>` : ''}
      </div>` : ''}

      <div style="background:#1a1a1a;border-radius:8px;padding:16px;">
        <p style="margin:0 0 6px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Delivery Address</p>
        <p style="margin:0;color:#ccc;font-size:14px;line-height:1.6;">${addressText}</p>
      </div>
    </div>
  `;
};

// ── Customer-facing order confirmation email ─────────────────────────────────
const buildCustomerOrderEmailHtml = ({ customerName, items, total, shippingCost, shippingModeLabel, addressText, codRemaining, discount, couponCode, freeKeychain, keychainName }) => {
  const itemsHtml = items
    ? items.map(item => {
        const dbProduct = resolveDbProduct(item.id);
        const unitPrice = dbProduct ? dbProduct.price : item.price;
        return `<li style="padding:6px 0;border-bottom:1px solid #2a2a2a;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <strong style="color:#fff;">${escHtml(item.quantity + 'x ' + item.name)}${item.engraveName ? ' — Engrave: ' + escHtml(item.engraveName) : ''}</strong>
          <span style="color:#999;white-space:nowrap;">&#8377;${dbProduct ? lineTotal(dbProduct, item.quantity) : unitPrice * item.quantity}</span>
        </li>`;
      }).join('')
    : `<li style="padding:6px 0;color:#ccc;">Single product order</li>`;

  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;background:#0f0f0f;padding:32px;border-radius:12px;max-width:560px;margin:auto;">
      <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#F97316;font-weight:700;">Tork3D</p>
      <h2 style="margin:0 0 8px;font-size:22px;color:#fff;">Thanks for your order, ${escHtml(customerName)}!</h2>
      <p style="margin:0 0 24px;color:#ccc;font-size:14px;">We've received your order and will get it ready for dispatch soon.</p>

      <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="margin:0 0 10px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Items Ordered</p>
        <ul style="margin:0;padding:0;list-style:none;">${itemsHtml}</ul>
        ${discount ? `<div style="margin-top:10px;display:flex;justify-content:space-between;color:#22c55e;font-size:13px;">
          <span>Coupon${couponCode ? ' (' + escHtml(couponCode) + ')' : ''}</span>
          <span>&minus;&#8377;${discount}</span>
        </div>` : ''}
        <div style="margin-top:12px;padding-top:12px;border-top:1px solid #333;">
          <strong style="color:#fff;">Total: </strong>
          <strong style="color:#F97316;font-size:18px;">&#8377;${total}</strong>
          ${codRemaining != null ? `<br/><span style="color:#999;font-size:13px;">₹99 prepaid online &middot; ₹${codRemaining} payable on delivery</span>` : ''}
        </div>
      </div>

      ${freeKeychain ? `<div style="background:#1a1a1a;border:1px solid #F97316;border-radius:8px;padding:14px;margin-bottom:16px;text-align:center;">
        <span style="color:#F97316;font-size:14px;font-weight:700;">🎁 A free name keychain is included with this order!</span>
        ${keychainName ? `<br/><span style="color:#fff;font-size:15px;">Name on keychain: <strong>${escHtml(keychainName)}</strong></span>` : ''}
      </div>` : ''}

      <table width="100%" style="margin-bottom:16px;">
        <tr><td style="color:#777;font-size:12px;padding:4px 0;">Delivery</td><td style="color:#fff;text-align:right;">${shippingModeLabel}</td></tr>
        <tr><td style="color:#777;font-size:12px;padding:4px 0;">Shipping Cost</td><td style="color:#fff;text-align:right;">${shippingCost === 0 ? 'FREE' : '&#8377;' + shippingCost}</td></tr>
      </table>

      ${addressText ? `<div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
        <p style="margin:0 0 6px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Delivery Address</p>
        <p style="margin:0;color:#ccc;font-size:14px;line-height:1.6;">${addressText}</p>
      </div>` : ''}

      <p style="margin:0;color:#666;font-size:12px;">Questions about your order? Just reply to this email or reach us on WhatsApp.</p>
    </div>
  `;
};

// Sends the order confirmation email to the customer for a paid cart/shop order record
const sendCustomerConfirmationEmail = async (orderRecord) => {
  if (!orderRecord.customer_email) return;
  const details = orderRecord.order_details || {};
  const addr = details.shippingAddress || {};
  const addressText = addr.address1
    ? `${escHtml(addr.address1)}${addr.address2 ? ', ' + escHtml(addr.address2) : ''}, ${escHtml(addr.city)} - ${escHtml(addr.pincode)}, ${escHtml(addr.state)}`
    : '';
  const shippingModeLabel = details.shippingMode === 'express'
    ? '⚡ Express (1–3 days)'
    : details.shippingMode === 'surface'
      ? '📦 Standard (4–7 days)'
      : details.shippingMode === 'pickup'
        ? '🏭 Collect from Site'
        : '—';

  try {
    await resend.emails.send({
      from: `Tork3D Orders <${SENDER_EMAIL}>`,
      to: [orderRecord.customer_email],
      subject: `Your Tork3D order is confirmed!`,
      html: buildCustomerOrderEmailHtml({
        customerName: orderRecord.customer_name,
        items: details.items,
        total: orderRecord.total_amount,
        shippingCost: details.shippingCost || 0,
        shippingModeLabel,
        addressText,
        discount: details.couponDiscount,
        couponCode: details.couponCode,
        freeKeychain: details.freeKeychain,
        keychainName: details.keychainName
      })
    });
    console.log('✅ Order confirmation email sent to customer.');
  } catch (emailErr) {
    console.error('⚠️ Failed to send customer confirmation email:', emailErr);
  }
};

// Cart item ids may carry a variant suffix (e.g. "9-red" for the Pagoda Lantern's
// "Ivory White" variant) — strip it to resolve the underlying catalog product.
const resolveDbProduct = (itemId) => {
  const baseId = typeof itemId === 'string' ? parseInt(itemId.split('-')[0], 10) : itemId;
  return products.find(p => p.id === baseId);
};

// Compute the cart subtotal server-side from the authoritative product DB (never trust client prices).
const computeCartSubtotal = (items) => (Array.isArray(items) ? items : []).reduce((sum, item) => {
  const dbProduct = resolveDbProduct(item.id);
  return sum + (dbProduct ? lineTotal(dbProduct, item.quantity) : 0);
}, 0);

// ── Launch coupon (early-access) redemption rules ────────────────────────────
const COUPON_MIN_SUBTOTAL = 350;   // discount only applies on orders above this
const COUPON_DISCOUNT_RATE = 0.10; // 10% off

// Validates an early-access coupon against the DB. Returns { valid, discount, code, reason }.
const resolveCoupon = async (code, subtotal) => {
  if (!code) return { valid: false, discount: 0 };
  const normalized = String(code).trim().toUpperCase();
  const { data } = await supabase
    .from('tork3d_early_access')
    .select('id, coupon_code, used')
    .eq('coupon_code', normalized)
    .limit(1);
  if (!data || data.length === 0) return { valid: false, discount: 0, reason: 'Invalid coupon code.' };
  if (data[0].used) return { valid: false, discount: 0, reason: 'This coupon has already been used.' };
  if (subtotal < COUPON_MIN_SUBTOTAL) {
    return { valid: false, discount: 0, reason: `Coupon valid only on orders above ₹${COUPON_MIN_SUBTOTAL}.` };
  }
  return { valid: true, discount: Math.round(subtotal * COUPON_DISCOUNT_RATE), code: normalized };
};

// Marks a coupon as used (idempotent — only flips an unused code). orderRef links it to the order.
const markCouponUsed = async (couponCode, orderRef) => {
  if (!couponCode) return;
  const { error } = await supabase
    .from('tork3d_early_access')
    .update({ used: true, used_order_id: orderRef != null ? String(orderRef) : null })
    .eq('coupon_code', String(couponCode).trim().toUpperCase())
    .eq('used', false);
  if (error) console.error('⚠️ Failed to mark coupon used:', error);
};

// Server-Side Calculate Price Logic (Zero-Trust). `discount` is a pre-validated rupee amount.
const calculatePrice = (orderData, discount = 0) => {
  if (orderData.type === 'shop') {
    const product = products.find(p => p.id === orderData.productId);
    if (!product) return 0; // reject unknown products — never trust client price
    return product.price * 100;
  } else if (orderData.type === 'cart') {
    const subtotal = computeCartSubtotal(orderData.items);

    const FREE_SHIPPING_THRESHOLD = 699;
    const rawShipping = parseFloat(orderData.shippingCost) || 0;
    // Free shipping only for prepaid orders (not COD). Eligibility uses pre-discount subtotal.
    const shippingCost = (orderData.shippingMode !== 'cod' && subtotal >= FREE_SHIPPING_THRESHOLD) ? 0 : rawShipping;

    const goods = Math.max(0, subtotal - discount);
    return (goods + shippingCost) * 100;
  } else if (orderData.type === 'cod-prepay') {
    return 99 * 100; // fixed ₹99 COD prepayment
  }
  return 0;
};

// 1. Create Order Endpoint
app.post('/api/create-order', orderLimiter, async (req, res) => {
  try {
    const { orderData } = req.body;

    // Validate & apply the early-access coupon (prepaid cart orders only)
    let discount = 0;
    let couponApplied = null;
    if (orderData.type === 'cart' && orderData.couponCode) {
      const subtotal = computeCartSubtotal(orderData.items);
      const coupon = await resolveCoupon(orderData.couponCode, subtotal);
      if (coupon.valid) { discount = coupon.discount; couponApplied = coupon.code; }
    }

    // Calculate actual price securely on backend
    const amountInPaise = calculatePrice(orderData, discount);

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
        order_details: (orderData.type === 'cart' || orderData.type === 'cod-prepay') ? { items: orderData.items, shippingMode: orderData.shippingMode, shippingCost: orderData.shippingCost, shippingAddress: orderData.shippingAddress, customerPhone: orderData.customerPhone, referredBy: orderData.referredBy, couponCode: couponApplied || undefined, couponDiscount: discount || undefined, freeKeychain: couponApplied ? true : undefined, keychainName: couponApplied ? orderData.keychainName : undefined } : (orderData.specs || {}),
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
      // Check current status BEFORE updating, so we know if the webhook already processed this order
      const { data: existingOrders } = await supabase
        .from('tork3d_orders')
        .select('status')
        .eq('razorpay_order_id', razorpay_order_id);
      const alreadyPaid = existingOrders && existingOrders.length > 0 && existingOrders[0].status === 'paid';

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

      // Send business notification email — skip for cod-prepay (COD order email sent separately)
      // Also skip if webhook already processed this payment (status was already 'paid')
      if (updatedOrders && updatedOrders.length > 0) {
        const orderRecord = updatedOrders[0];
        const isCodPrepay = orderRecord.order_type === 'cod-prepay';
        if (!isCodPrepay && !alreadyPaid) {
          try {
            await resend.emails.send({
              from: `Tork3D Orders <${SENDER_EMAIL}>`,
              to: [process.env.CONTACT_EMAIL || 'tork3d.design@gmail.com'],
              subject: `💰 NEW PAID ORDER — ${escHtml(orderRecord.customer_name)} (₹${orderRecord.total_amount})`,
              html: buildOrderEmailHtml(orderRecord, razorpay_payment_id)
            });
            console.log('✅ Order notification email sent to business.');
          } catch (emailErr) {
            console.error('⚠️ Failed to send order notification email:', emailErr);
          }
          await sendCustomerConfirmationEmail(orderRecord);
          // Burn the coupon now that the order is paid
          if (orderRecord.order_details?.couponCode) {
            await markCouponUsed(orderRecord.order_details.couponCode, orderRecord.id);
          }
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

      // Check current status BEFORE updating, so we know if verify-payment already processed this order
      const { data: existingOrders } = await supabase
        .from('tork3d_orders')
        .select('status')
        .eq('razorpay_order_id', razorpay_order_id);
      const alreadyPaid = existingOrders && existingOrders.length > 0 && existingOrders[0].status === 'paid';

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

        // Send business notification email for shop/cart orders (skip if verify-payment already sent it)
        if (!alreadyPaid && (orderRecord.order_type === 'cart' || orderRecord.order_type === 'shop')) {
          try {
            await resend.emails.send({
              from: `Tork3D Orders <${SENDER_EMAIL}>`,
              to: [process.env.CONTACT_EMAIL || 'tork3d.design@gmail.com'],
              subject: `💰 NEW PAID ORDER — ${escHtml(orderRecord.customer_name)} (₹${orderRecord.total_amount})`,
              html: buildOrderEmailHtml(orderRecord, razorpay_payment_id)
            });
            console.log('✅ Shop order notification email sent to business.');
          } catch (emailErr) {
            console.error('⚠️ Failed to send shop order email:', emailErr);
          }
          await sendCustomerConfirmationEmail(orderRecord);
          // Burn the coupon now that the order is paid
          if (orderRecord.order_details?.couponCode) {
            await markCouponUsed(orderRecord.order_details.couponCode, orderRecord.id);
          }
        }

        // Waybills are now generated manually from the Supabase dashboard.
      }
    }

    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Webhook Error');
  }
});

// Flat per-parcel surcharge folded into the quoted courier rate (covers the
// parcel-tracking SMS service). Applied silently to both express & surface,
// prepaid & COD — never shown to the customer as a separate line.
const DELIVERY_SURCHARGE = 2;

// 4. Delhivery Shipping Rate Estimator
app.get('/api/shipping-rate', shippingLimiter, async (req, res) => {
  try {
    const { pincode, pt = 'Pre-paid', codAmount = '0', items, productId } = req.query;

    if (!pincode || !/^\d{6}$/.test(pincode)) {
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

      let cgm = Math.ceil((dbProduct.weight || 200) / 10) * 10;
      if (cgm < 50) cgm = 50; // Delhivery minimum is 50g
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
      // Cart order — Combine all items into a single package
      try {
        const parsedItems = JSON.parse(items);
        let totalCgm = 0;
        let totalCodAmount = 0;

        parsedItems.forEach(item => {
          const dbProduct = resolveDbProduct(item.id);
          if (dbProduct) {
            totalCgm += (dbProduct.weight || 200) * item.quantity;
            if (pt === 'COD') {
              totalCodAmount += lineTotal(dbProduct, item.quantity);
            }
          }
        });

        let cgm = Math.ceil(totalCgm / 10) * 10;
        if (cgm < 50) cgm = 50; // Delhivery minimum is 50g
        totalWeight = cgm;

        // Fetch exact rate (including total COD surcharge if applicable) for the combined package
        const [express, surface] = await Promise.all([
          makeRateCall('E', cgm, pt, pt === 'COD' ? totalCodAmount.toString() : '0'),
          makeRateCall('S', cgm, pt, pt === 'COD' ? totalCodAmount.toString() : '0')
        ]);

        if (express || surface) anyValid = true;
        if (express) expressTotal = express;
        if (surface) surfaceTotal = surface;

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
      express: expressTotal > 0 ? expressTotal + DELIVERY_SURCHARGE : expressTotal,
      surface: surfaceTotal > 0 ? surfaceTotal + DELIVERY_SURCHARGE : surfaceTotal,
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
    const subtotal = computeCartSubtotal(orderData.items);
    const FREE_SHIPPING_THRESHOLD = 699;
    const rawShipping = Math.min(parseFloat(orderData.shippingCost) || 0, 500);
    const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : rawShipping;

    // Validate & apply the early-access coupon
    let discount = 0;
    let couponApplied = null;
    if (orderData.couponCode) {
      const coupon = await resolveCoupon(orderData.couponCode, subtotal);
      if (coupon.valid) { discount = coupon.discount; couponApplied = coupon.code; }
    }

    const totalAmount = Math.max(0, subtotal - discount) + shippingCost;

    // Save to Supabase
    const { data: codInserted, error: dbError } = await supabase
      .from('tork3d_orders')
        .insert([
          {
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
              customerPhone: orderData.customerPhone,
              referredBy: orderData.referredBy,
              couponCode: couponApplied || undefined,
              couponDiscount: discount || undefined,
              freeKeychain: couponApplied ? true : undefined,
              keychainName: couponApplied ? orderData.keychainName : undefined
            },
            status: 'cod_pending'
          }
        ])
        .select();


    if (dbError) {
      console.error('COD order Supabase error:', dbError);
      throw dbError;
    }

    // Burn the coupon now that the COD order is confirmed (₹99 already prepaid)
    if (couponApplied) {
      await markCouponUsed(couponApplied, codInserted && codInserted[0] ? codInserted[0].id : null);
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
        ? orderData.items.map(item => {
            const dbProduct = resolveDbProduct(item.id);
            const unitPrice = dbProduct ? dbProduct.price : item.price;
            return `<li style="padding:6px 0;border-bottom:1px solid #2a2a2a;display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
              <strong style="color:#fff;">${escHtml(item.quantity + 'x ' + item.name)}${item.engraveName ? ' — Engrave: ' + escHtml(item.engraveName) : ''}</strong>
              <span style="color:#999;white-space:nowrap;">&#8377;${dbProduct ? lineTotal(dbProduct, item.quantity) : unitPrice * item.quantity}</span>
            </li>`;
          }).join('')
        : '';

      await resend.emails.send({
        from: `Tork3D Orders <${SENDER_EMAIL}>`,
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
              <tr><td style="color:#777;font-size:12px;padding:4px 0;">Referral</td><td style="color:#fff;text-align:right;">${escHtml(orderData.referredBy || '—')}</td></tr>
            </table>

            <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
              <p style="margin:0 0 10px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Items Ordered</p>
              <ul style="margin:0;padding:0;list-style:none;">${itemsHtml}</ul>
              ${discount ? `<div style="margin-top:10px;display:flex;justify-content:space-between;color:#22c55e;font-size:13px;">
                <span>Coupon${couponApplied ? ' (' + escHtml(couponApplied) + ')' : ''}</span>
                <span>&minus;₹${discount}</span>
              </div>` : ''}
              <div style="margin-top:12px;padding-top:12px;border-top:1px solid #333;">
                <strong style="color:#fff;">Full Order Amount: </strong>
                <strong style="color:#F97316;font-size:18px;">₹${totalAmount}</strong><br/>
                <strong style="color:#fff;">Prepaid: </strong>
                <strong style="color:#F97316;font-size:18px;">₹99</strong><br/>
                <strong style="color:#fff;">Remaining to Collect: </strong>
                <strong style="color:#F97316;font-size:18px;">₹${totalAmount - 99}</strong>
              </div>
            </div>

            ${couponApplied ? `<div style="background:#1a1a1a;border:1px solid #F97316;border-radius:8px;padding:14px;margin-bottom:16px;text-align:center;">
              <span style="color:#F97316;font-size:14px;font-weight:700;">🎁 PACK A FREE NAME KEYCHAIN with this order</span>
              ${orderData.keychainName ? `<br/><span style="color:#fff;font-size:15px;">Engrave: <strong>${escHtml(orderData.keychainName)}</strong></span>` : ''}
            </div>` : ''}

            <div style="background:#1a1a1a;border-radius:8px;padding:16px;">
              <p style="margin:0 0 6px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Delivery Address</p>
              <p style="margin:0;color:#ccc;font-size:14px;line-height:1.6;">${addressText}</p>
            </div>
          </div>
        `
      });
      console.log('✅ COD order notification email sent.');

      if (orderData.customerEmail) {
        await resend.emails.send({
          from: `Tork3D Orders <${SENDER_EMAIL}>`,
          to: [orderData.customerEmail],
          subject: `Your Tork3D order is confirmed!`,
          html: buildCustomerOrderEmailHtml({
            customerName: orderData.customerName,
            items: orderData.items,
            total: totalAmount,
            shippingCost,
            shippingModeLabel,
            addressText,
            codRemaining: totalAmount - 99,
            discount: discount || undefined,
            couponCode: couponApplied || undefined,
            freeKeychain: couponApplied ? true : undefined,
            keychainName: couponApplied ? orderData.keychainName : undefined
          })
        });
        console.log('✅ Order confirmation email sent to customer.');
      }
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
      from: `Tork3D Contact <${SENDER_EMAIL}>`,
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

// 6b. Early Access / Launch Coupon Signup
app.post('/api/early-access', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email and mobile number are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }
    if (!/^\d{10}$/.test(String(phone).replace(/\D/g, '').slice(-10))) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // If this email already signed up, return their existing coupon (no duplicates)
    const { data: existing } = await supabase
      .from('tork3d_early_access')
      .select('coupon_code')
      .eq('email', normalizedEmail)
      .limit(1);

    let couponCode;
    let alreadyRegistered = false;

    if (existing && existing.length > 0) {
      couponCode = existing[0].coupon_code;
      alreadyRegistered = true;
    } else {
      // Generate a unique coupon code (retry on the rare collision)
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = generateCouponCode();
        const { data: clash } = await supabase
          .from('tork3d_early_access')
          .select('id')
          .eq('coupon_code', candidate)
          .limit(1);
        if (!clash || clash.length === 0) { couponCode = candidate; break; }
      }
      if (!couponCode) throw new Error('Could not generate a unique coupon code.');

      const { error: insertError } = await supabase
        .from('tork3d_early_access')
        .insert([{
          name: String(name).trim(),
          email: normalizedEmail,
          phone: String(phone).trim(),
          coupon_code: couponCode,
          used: false
        }]);

      if (insertError) {
        console.error('Early access insert error:', insertError);
        throw insertError;
      }
    }

    // Send the customer their coupon confirmation
    try {
      await resend.emails.send({
        from: `Tork3D <${SENDER_EMAIL}>`,
        to: [normalizedEmail],
        subject: `Your Tork3D coupon is reserved! 🎁`,
        html: `
          <div style="font-family:'Segoe UI',Arial,sans-serif;background:#0f0f0f;padding:32px;border-radius:12px;max-width:560px;margin:auto;">
            <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#F97316;font-weight:700;">Tork3D</p>
            <h2 style="margin:0 0 8px;font-size:22px;color:#fff;">Thanks for waiting, ${escHtml(name)}!</h2>
            <p style="margin:0 0 24px;color:#ccc;font-size:14px;">We're on a short break and we've saved you something for when we're back. Here's your coupon — keep it safe and use it at checkout once we reopen.</p>

            <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin-bottom:16px;text-align:center;">
              <p style="margin:0 0 8px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">Your Coupon Code</p>
              <p style="margin:0;font-size:26px;font-weight:800;letter-spacing:3px;color:#fff;">${escHtml(couponCode)}</p>
            </div>

            <div style="background:#1a1a1a;border-radius:8px;padding:16px;margin-bottom:16px;">
              <p style="margin:0 0 10px;font-size:11px;color:#F97316;text-transform:uppercase;letter-spacing:1px;">What you get</p>
              <ul style="margin:0;padding-left:18px;color:#ccc;font-size:14px;line-height:1.8;">
                <li>🎁 A <strong style="color:#fff;">free name keychain</strong> with your order</li>
                <li>🏷️ <strong style="color:#fff;">10% off</strong> your order (valid on orders above &#8377;350)</li>
              </ul>
            </div>

            <p style="margin:0 0 4px;color:#ccc;font-size:14px;">☕ We're back on <strong style="color:#fff;">30th June</strong>. Place your order then and apply this code at checkout.</p>
            <p style="margin:16px 0 0;font-size:11px;color:#444;">Questions? Just reply to this email or reach us on WhatsApp.</p>
          </div>
        `
      });
      console.log('✅ Early access coupon email sent to customer.');
    } catch (emailErr) {
      console.error('⚠️ Early access customer email failed:', emailErr);
    }

    // Notify the business of the new signup (only for brand-new registrations)
    if (!alreadyRegistered) {
      try {
        await resend.emails.send({
          from: `Tork3D <${SENDER_EMAIL}>`,
          to: [process.env.CONTACT_EMAIL || 'tork3d.design@gmail.com'],
          subject: `🎯 New break coupon signup — ${escHtml(name)}`,
          html: `
            <div style="font-family:'Segoe UI',Arial,sans-serif;background:#0f0f0f;padding:32px;border-radius:12px;max-width:560px;margin:auto;">
              <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#F97316;font-weight:700;">Tork3D</p>
              <h2 style="margin:0 0 24px;font-size:22px;color:#fff;">New Break Coupon Signup</h2>
              <table width="100%">
                <tr><td style="color:#777;font-size:12px;padding:4px 0;">Name</td><td style="color:#fff;font-weight:600;text-align:right;">${escHtml(name)}</td></tr>
                <tr><td style="color:#777;font-size:12px;padding:4px 0;">Email</td><td style="color:#fff;text-align:right;">${escHtml(normalizedEmail)}</td></tr>
                <tr><td style="color:#777;font-size:12px;padding:4px 0;">Phone</td><td style="color:#fff;text-align:right;">${escHtml(phone)}</td></tr>
                <tr><td style="color:#777;font-size:12px;padding:4px 0;">Coupon</td><td style="color:#22c55e;text-align:right;font-weight:700;">${escHtml(couponCode)}</td></tr>
              </table>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('⚠️ Early access business email failed:', emailErr);
      }
    }

    res.json({ success: true, couponCode, alreadyRegistered });
  } catch (error) {
    console.error('Early access error:', error);
    res.status(500).json({ success: false, message: 'Could not reserve your coupon. Please try again.' });
  }
});

// 6c. Validate Coupon (preview for cart — final discount is recomputed at order time)
app.post('/api/validate-coupon', shippingLimiter, async (req, res) => {
  try {
    const { code, items } = req.body;
    if (!code) return res.json({ success: true, valid: false, message: 'Enter a coupon code.' });

    const subtotal = computeCartSubtotal(items);
    const coupon = await resolveCoupon(code, subtotal);

    if (!coupon.valid) {
      return res.json({ success: true, valid: false, message: coupon.reason || 'Invalid coupon code.' });
    }
    return res.json({
      success: true,
      valid: true,
      discount: coupon.discount,
      code: coupon.code,
      message: `Coupon applied! ₹${coupon.discount} off + a free name keychain.`
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    res.status(500).json({ success: false, message: 'Could not validate coupon. Please try again.' });
  }
});

// 7. Quote Request Endpoint (Using Resend)
app.post('/api/create-quote', orderLimiter, async (req, res) => {
  try {
    const quoteData = req.body;
    const specs = quoteData.specs || {};

    if (!quoteData.customerName || !quoteData.customerEmail) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quoteData.customerEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    console.log('New Quote Request Received:', quoteData);

    // Save to Supabase
    const { error } = await supabase
      .from('tork3d_orders')
      .insert([{
        customer_name: quoteData.customerName,
        customer_email: quoteData.customerEmail,
        order_type: 'Quote Request',
        order_details: specs,
        status: 'lead_pending'
      }]);

    if (error) console.error('Supabase quote log error:', error);



    // Send email via Resend
    const { data, error: resendError } = await resend.emails.send({
      from: `Tork3D <${SENDER_EMAIL}>`,
      to: [process.env.CONTACT_EMAIL || 'tork3d.design@gmail.com'],
      subject: `🚨 NEW QUOTE REQUEST: ${escHtml(quoteData.customerName)}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #F97316;">New Custom Order Request</h2>
          <p><strong>Customer:</strong> ${escHtml(quoteData.customerName)}</p>
          <p><strong>Email:</strong> ${escHtml(quoteData.customerEmail)}</p>
          <p><strong>Phone:</strong> ${specs.phone ? escHtml(specs.phone) : '—'}</p>
          <hr style="border: 1px solid #eee;" />
          <h3>Specifications:</h3>
          <ul>
            <li><strong>Material:</strong> ${escHtml(specs.material)}</li>
            <li><strong>Color:</strong> ${escHtml(specs.color)}</li>
            <li><strong>Infill:</strong> ${escHtml(specs.infill)}%</li>
            <li><strong>Quantity:</strong> ${escHtml(specs.quantity)}</li>
          </ul>
          <p><strong>Notes:</strong> ${specs.description ? escHtml(specs.description) : 'None provided'}</p>
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global Error Guard
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running securely on port ${PORT}`);
});
