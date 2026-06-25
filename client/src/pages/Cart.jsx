import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ChevronRight, ShieldCheck, Truck, Loader2, CheckCircle2, AlertCircle, Zap, CreditCard, Banknote } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { SectionWrapper, fadeIn } from '../components/layout/SectionWrapper';
import { API_BASE_URL } from '../config';
import { products } from '../data/products';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '', email: '', phone: '', address1: '', city: '', state: '', pincode: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [codSuccess, setCodSuccess] = useState(false);

  // Fulfillment & payment state
  const [fulfillment, setFulfillment] = useState('delivery'); // 'delivery' | 'pickup'
  const [paymentType, setPaymentType] = useState('prepaid'); // 'prepaid' | 'cod'

  // Shipping state
  const [shippingRates, setShippingRates] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState('');
  const [selectedMode, setSelectedMode] = useState(null);
  const debounceRef = useRef(null);
const getCookie = (name) => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
};
  // Terms and Conditions states
  const [showTcModal, setShowTcModal] = useState(false);
  const [agreedTc, setAgreedTc] = useState(false);
  const [pendingCheckoutType, setPendingCheckoutType] = useState(null); // 'online' | 'cod'

  // Display weight = simple sum of dead weights across all cart items
  const totalWeightGrams = cart.reduce((sum, item) => sum + ((item.weight || 200) * item.quantity), 0);

  const FREE_SHIPPING_THRESHOLD = 500;
  const hasFreeShipping = fulfillment === 'delivery' && subtotal >= FREE_SHIPPING_THRESHOLD;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  // Coupon (early-access launch coupon) state
  const [couponInput, setCouponInput] = useState('');
  const [couponApplying, setCouponApplying] = useState(false);
  const [couponStatus, setCouponStatus] = useState(null); // { valid, discount, code, message }
  const [keychainName, setKeychainName] = useState('');
  const couponDiscount = couponStatus?.valid ? couponStatus.discount : 0;

  // Free name keychain (product id 11) bundled with a valid early-access coupon (subtotal >= ₹350).
  // The server treats this as free (freeKeychain flag); it is never added to the charged items.
  const FREE_KEYCHAIN_ID = 11;
  const freeKeychainProduct = products.find(p => p.id === FREE_KEYCHAIN_ID);

  const shippingCost = fulfillment === 'pickup' || hasFreeShipping
    ? 0
    : paymentType === 'prepaid' ? shippingRates?.prepaidSurface ?? 0
    : paymentType === 'cod' ? shippingRates?.codSurface ?? 0
    : 0;

  const totalPrice = Math.max(0, subtotal - couponDiscount) + shippingCost;

  const applyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponApplying(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/validate-coupon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: couponInput.trim(),
          items: cart.map(i => ({ id: i.id, quantity: i.quantity }))
        })
      });
      const data = await res.json();
      if (data.success && data.valid) {
        setCouponStatus({ valid: true, discount: data.discount, code: data.code, message: data.message });
        toast.success(data.message);
      } else {
        setCouponStatus({ valid: false, message: data.message || 'Invalid coupon.' });
      }
    } catch {
      setCouponStatus({ valid: false, message: 'Could not validate coupon. Please try again.' });
    } finally {
      setCouponApplying(false);
    }
  };

  const removeCoupon = () => {
    setCouponStatus(null);
    setCouponInput('');
    setKeychainName('');
  };

  // Re-validate the coupon whenever the cart subtotal changes (keeps the ₹350 min & discount honest)
  useEffect(() => {
    if (!couponStatus?.valid) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/validate-coupon`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code: couponStatus.code,
            items: cart.map(i => ({ id: i.id, quantity: i.quantity }))
          })
        });
        const data = await res.json();
        if (cancelled) return;
        if (data.success && data.valid) {
          setCouponStatus({ valid: true, discount: data.discount, code: data.code, message: data.message });
        } else {
          setCouponStatus({ valid: false, message: data.message || 'Coupon no longer applies.' });
        }
      } catch { /* keep prior state on network error */ }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  // Re-fetch rates when pincode, weight, or subtotal changes
  useEffect(() => {
    const pincode = customerInfo.pincode;
    if (fulfillment === 'pickup') return;
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      setShippingRates(null); setShippingError(''); setSelectedMode(null);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setShippingLoading(true); setShippingError(''); setShippingRates(null); setSelectedMode(null);
      try {
        const itemsParam = encodeURIComponent(JSON.stringify(cart.map(i => ({ id: i.id, quantity: i.quantity }))));
        const [prepaidRes, codRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/shipping-rate?pincode=${pincode}&pt=Pre-paid&codAmount=0&items=${itemsParam}`),
          fetch(`${API_BASE_URL}/api/shipping-rate?pincode=${pincode}&pt=COD&codAmount=${subtotal}&items=${itemsParam}`)
        ]);
        
        const prepaidData = await prepaidRes.json();
        const codData = await codRes.json();

        if (prepaidData.success && codData.success) {
          setShippingRates({
            prepaidSurface: prepaidData.surface || prepaidData.express || 0,
            codSurface: codData.surface || codData.express || 0
          });
          setSelectedMode('surface');
        } else {
          setShippingError(prepaidData.message || codData.message || 'Pincode not serviceable');
        }
      } catch (err) {
        setShippingError('Could not fetch shipping rate. Please try again.');
      } finally {
        setShippingLoading(false);
      }
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [customerInfo.pincode, totalWeightGrams, fulfillment, subtotal]);

  const buildOrderData = () => ({
    type: 'cart',
    items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
    shippingCost,
    shippingMode: fulfillment === 'pickup' ? 'pickup' : selectedMode,
    customerName: customerInfo.name,
    customerEmail: customerInfo.email,
    customerPhone: customerInfo.phone,
    referredBy: getCookie('tork3d_ref'),
    couponCode: couponStatus?.valid ? couponStatus.code : undefined,
    keychainName: couponStatus?.valid ? keychainName.trim() : undefined,
    shippingAddress: fulfillment === 'pickup' ? null : {
      address1: customerInfo.address1,
      city: customerInfo.city,
      state: customerInfo.state,
      pincode: customerInfo.pincode
    }
  });

  const validateForm = () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast.error('Please fill in your name, email and phone.'); return false;
    }
    if (fulfillment === 'delivery' && (!customerInfo.address1 || !customerInfo.city || !customerInfo.state || !customerInfo.pincode)) {
      toast.error('Please fill in your delivery address.'); return false;
    }
    if (fulfillment === 'delivery' && !selectedMode) {
      toast.error('Please wait for shipping rates to load.'); return false;
    }
    if (couponStatus?.valid && !keychainName.trim()) {
      toast.error('Please enter the name for your free keychain.'); return false;
    }
    return true;
  };

  const executeCodCheckout = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/create-cod-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData: buildOrderData() })
      });
      const data = await res.json();
      if (data.success) {
        clearCart();
        setShowModal(false);
        setCodSuccess(true);
      } else {
        toast.error('Failed to place order: ' + data.message);
      }
    } catch {
      toast.error('Could not reach server. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const executeOnlineCheckout = async () => {
    setIsProcessing(true);
    try {
      const orderData = buildOrderData();
      const res = await fetch(`${API_BASE_URL}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setShowModal(false);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount, currency: 'INR',
        name: 'Tork3D Fabrication',
        description: `Order of ${cart.length} items`,
        order_id: data.order.id,
        prefill: { name: customerInfo.name, email: customerInfo.email, contact: customerInfo.phone },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: { ...orderData, amount: data.amount }
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) { clearCart(); toast.success('Payment Successful! Your order has been placed.'); navigate('/shop'); }
            else toast.error('Payment verification failed: ' + verifyData.message);
          } catch { toast.error('Could not reach the server for verification.'); }
        },
        theme: { color: '#F97316' }
      };
      new window.Razorpay(options).open();
    } catch (error) {
      console.error(error); toast.error('Error initiating checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCodCheckout = () => {
    if (!validateForm()) return;
    setPendingCheckoutType('cod');
    setAgreedTc(false);
    setShowTcModal(true);
  };

  const handleOnlineCheckout = () => {
    if (!validateForm()) return;
    setPendingCheckoutType('online');
    setAgreedTc(false);
    setShowTcModal(true);
  };

  const canProceed = !isProcessing && !shippingLoading &&
    (fulfillment === 'pickup' || selectedMode !== null);

  if (codSuccess) {
    return (
      <div className="pt-32 min-h-screen">
        <SectionWrapper>
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 max-w-md mx-auto">
            <CheckCircle2 className="w-20 h-20 text-green-500" />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Order Placed!</h1>
            <p className="text-slate-600 dark:text-slate-300">Your Cash on Delivery order has been confirmed. We'll contact you once it's ready to ship.</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">A confirmation message/email will be sent to the mobile number or email address you provided.</p>
            <Link to="/shop" className="inline-block"><Button size="lg" className="w-full">Continue Shopping</Button></Link>
          </div>
        </SectionWrapper>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="pt-32 min-h-screen text-center">
        <SectionWrapper>
          <div className="flex flex-col items-center justify-center space-y-6 py-20">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-slate-400" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Your cart is empty</h1>
            <p className="text-slate-600 dark:text-slate-300 max-w-sm mx-auto">Looks like you haven't added any industrial-grade prints yet.</p>
            <Link to="/shop" className="inline-block"><Button size="lg" className="w-full">Browse Products</Button></Link>
          </div>
        </SectionWrapper>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen">

      {/* Checkout Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] flex flex-col py-4">
            <div className="px-6 overflow-y-auto flex-1 custom-scrollbar">
              <h2 className="text-2xl font-bold mb-2 placeholder-slate-400 text-slate-900 dark:text-white">Checkout Details</h2>
            <p className="text-slate-600 dark:text-slate-300 text-sm mb-6">Enter your information to complete the order.</p>

            <div className="space-y-4">
              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Full Name *</label>
                <input required type="text" placeholder="Your Name"
                  className="w-full bg-secondary dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue placeholder-slate-400 text-slate-900 dark:text-white"
                  value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Email Address *</label>
                <input required type="email" placeholder="your@email.com"
                  className="w-full bg-secondary dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue placeholder-slate-400 text-slate-900 dark:text-white"
                  value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Phone Number *</label>
                <input required type="tel" placeholder="+91 98765 43210"
                  className="w-full bg-secondary dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue placeholder-slate-400 text-slate-900 dark:text-white"
                  value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
              </div>

              {/* Payment Method - Only shown for pickup fulfillment since delivery has unified comparative options at the bottom */}
              {fulfillment === 'pickup' && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-semibold mb-3 placeholder-slate-400 text-slate-900 dark:text-white">Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setPaymentType('prepaid')}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${paymentType === 'prepaid' ? 'border-accent-orange bg-accent-orange/10' : 'border-slate-300 dark:border-slate-700 hover:border-accent-orange/40'}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <CreditCard className="w-3.5 h-3.5 text-accent-orange" />
                        <span className="text-xs font-bold placeholder-slate-400 text-slate-900 dark:text-white">Pay Online</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">UPI, Cards, Net Banking</p>
                    </button>
                    <button type="button" onClick={() => setPaymentType('cod')}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${paymentType === 'cod' ? 'border-green-500 bg-green-500/10' : 'border-slate-300 dark:border-slate-700 hover:border-green-500/40'}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Banknote className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-xs font-bold placeholder-slate-400 text-slate-900 dark:text-white">Cash on Delivery</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">Pay when it arrives</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">* ₹99 online pre‑payment required before confirming COD order.</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Fulfilment Method */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-semibold mb-3 placeholder-slate-400 text-slate-900 dark:text-white">Fulfilment Method</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button type="button" onClick={() => setFulfillment('delivery')}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${fulfillment === 'delivery' ? 'border-accent-blue bg-accent-blue/10' : 'border-slate-300 dark:border-slate-700 hover:border-accent-blue/40'}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Truck className="w-3.5 h-3.5 text-accent-blue" />
                      <span className="text-xs font-bold placeholder-slate-400 text-slate-900 dark:text-white">Deliver to me</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">Delhivery shipping</p>
                  </button>
                  <button type="button"
                    onClick={() => { setFulfillment('pickup'); setShippingRates(null); setSelectedMode(null); setShippingError(''); }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${fulfillment === 'pickup' ? 'border-green-500 bg-green-500/10' : 'border-slate-300 dark:border-slate-700 hover:border-green-500/40'}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm">🏭</span>
                      <span className="text-xs font-bold placeholder-slate-400 text-slate-900 dark:text-white">Collect from site</span>
                    </div>
                    <p className="text-xs text-green-700 font-bold">FREE</p>
                  </button>
                </div>

                {fulfillment === 'pickup' && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-2">
                    <p className="text-xs font-bold text-green-700 mb-1">📍 Pickup Location</p>
                    <p className="text-sm placeholder-slate-400 text-slate-900 dark:text-white">Tork3D Workshop</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 font-medium">Pune - 411040, Maharashtra</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">We'll contact you when your order is ready for collection.</p>
                  </div>
                )}

                {fulfillment === 'delivery' && (
                  <div className="space-y-3">
                    <input required type="text" placeholder="Address Line 1"
                      className="w-full bg-secondary dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue placeholder-slate-400 text-slate-900 dark:text-white text-sm"
                      value={customerInfo.address1} onChange={e => setCustomerInfo({...customerInfo, address1: e.target.value})} />
                    <div className="grid grid-cols-2 gap-3">
                      <input required type="text" placeholder="City"
                        className="w-full bg-secondary dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue placeholder-slate-400 text-slate-900 dark:text-white text-sm"
                        value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})} />
                      <input required type="text" placeholder="State"
                        className="w-full bg-secondary dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue placeholder-slate-400 text-slate-900 dark:text-white text-sm"
                        value={customerInfo.state} onChange={e => setCustomerInfo({...customerInfo, state: e.target.value})} />
                    </div>
                    <input required type="text" placeholder="Pincode" maxLength={6}
                      className="w-full bg-secondary dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue placeholder-slate-400 text-slate-900 dark:text-white text-sm"
                      value={customerInfo.pincode} onChange={e => setCustomerInfo({...customerInfo, pincode: e.target.value.replace(/\D/g, '')})} />

                    {shippingLoading && (
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 py-1">
                        <Loader2 className="w-4 h-4 animate-spin text-accent-orange" /> Fetching delivery rates…
                      </div>
                    )}
                    {shippingError && !shippingLoading && (
                      <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 p-3 rounded-xl border border-red-500/20 mt-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" /> {shippingError}
                      </div>
                    )}
                    {shippingRates && !shippingLoading && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                        <div className="flex items-start gap-2 text-sm text-accent-blue bg-accent-blue/10 p-3 rounded-xl border border-accent-blue/20">
                          <Truck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>
                            Estimated delivery to <strong>{customerInfo.pincode}</strong>: <strong>4–7 business days</strong> (standard surface shipping via Delhivery).
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Choose Payment & Shipping</p>
                        <div className="grid grid-cols-1 gap-3">
                          {/* Pay Online Option */}
                          <button type="button" onClick={() => setPaymentType('prepaid')}
                            className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-4 ${paymentType === 'prepaid' ? 'border-accent-orange bg-accent-orange/10' : 'border-slate-300 dark:border-slate-700 hover:border-accent-orange/40 bg-transparent'}`}>
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-accent-orange/10 rounded-lg mt-0.5">
                                <CreditCard className="w-5 h-5 text-accent-orange" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">Pay Online</span>
                                  <span className="text-[10px] font-bold bg-green-500/20 text-green-600 dark:text-green-400 px-1.5 py-0.5 rounded-full">Recommended</span>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">UPI, Cards, Net Banking</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-semibold">Shipping</p>
                              {hasFreeShipping
                                ? <p className="text-base font-extrabold text-green-600 dark:text-green-400">FREE</p>
                                : <p className="text-base font-extrabold text-slate-900 dark:text-white">₹{shippingRates.prepaidSurface}</p>
                              }
                            </div>
                          </button>
            <div className="bg-red-100 text-red-800 p-2 rounded-md mb-2 text-sm">⚠️ Cash on Delivery requires a ₹99 online pre‑payment before order confirmation.</div>
                          {/* Cash on Delivery Option */}
                          <button type="button" onClick={() => setPaymentType('cod')}
                            className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-4 ${paymentType === 'cod' ? 'border-green-500 bg-green-500/10' : 'border-slate-300 dark:border-slate-700 hover:border-green-500/40 bg-transparent'}`}>
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-green-500/10 rounded-lg mt-0.5">
                                <Banknote className="w-5 h-5 text-green-500" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-slate-900 dark:text-white">Cash on Delivery (₹99 pre‑pay required)</span>
                                </div>
                                <p className="text-xs text-slate-650 dark:text-slate-400 mt-0.5 font-medium">Pay when order is delivered</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-slate-500 dark:text-slate-450 uppercase font-semibold">Shipping</p>
                              {hasFreeShipping
                                ? <p className="text-base font-extrabold text-green-600 dark:text-green-400">FREE</p>
                                : <p className="text-base font-extrabold text-slate-900 dark:text-white">₹{shippingRates.codSurface}</p>
                              }
                            </div>
                          </button>
                        </div>
                        {paymentType === 'cod' ? (
                          <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1.5 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span>COD standard shipping includes a surcharge charged by the courier for cash collection. Save on shipping fees by choosing to Pay Online.</span>
                          </p>
                        ) : (
                          <p className="text-[11px] text-green-600 dark:text-green-400 flex items-start gap-1.5 bg-green-500/5 p-2 rounded-lg border border-green-500/10">
                            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                            <span>You are saving on shipping charges by paying online! Thank you for choosing prepaid.</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:bg-slate-800 transition-colors">
                Cancel
              </button>
              {paymentType === 'cod' ? (
                <Button className="flex-1 bg-green-600 hover:bg-green-700" disabled={!canProceed} onClick={handleCodCheckout}>
                  {isProcessing ? 'Placing Order…' : `Pay ₹99 & Place COD Order`}
                </Button>
              ) : (
                <Button className="flex-1" disabled={!canProceed} onClick={handleOnlineCheckout}>
                  {isProcessing ? 'Processing…' : `Pay ₹${totalPrice}`}
                </Button>
              )}
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTcModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-2xl shadow-2xl max-h-[85vh] flex flex-col py-4">
            <div className="px-6 overflow-y-auto flex-1 custom-scrollbar">
              <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Terms & Conditions</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">Please review and agree to our policies to proceed with your order.</p>

              <div className="space-y-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 max-h-[35vh] overflow-y-auto custom-scrollbar mb-4">
                <p className="font-semibold text-slate-900 dark:text-white">
                  By accessing this website and placing an order with Tork3D, you agree to the following terms and conditions:
                </p>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Please review all product descriptions, specifications, dimensions, and details carefully before placing an order.</li>
                  <li>Returns, refunds, replacements, and cancellations are governed strictly by our Return & Refund Policy.</li>
                  <li><strong>An unboxing video is mandatory</strong> for any claim related to damaged products, missing items, wrong products, refunds, or replacements. The video must be recorded clearly from the beginning of opening the package without cuts or edits.</li>
                  <li>Claims raised without a valid unboxing video will not be accepted.</li>
                  <li>Customized, personalized, made-to-order, or commissioned products are non-cancellable, non-returnable, and non-refundable unless received damaged or defective.</li>
                  <li>Slight variations in color, finish, texture, dimensions, or appearance may occur due to lighting conditions, screen settings, material properties, and the nature of the 3D printing process.</li>
                  <li>Minor layer lines, support marks, dimensional tolerances, or surface imperfections inherent to the 3D printing process shall not be considered manufacturing defects.</li>
                  <li>Orders once shipped cannot be cancelled.</li>
                  <li>Delivery timelines are estimates only and may vary due to courier delays, operational issues, weather conditions, or unforeseen circumstances.</li>
                  <li>Customers are responsible for providing accurate shipping and contact details. Orders returned due to incorrect or incomplete information may incur additional reshipping charges.</li>
                  <li>We reserve the right to cancel, refuse, or limit any order at our sole discretion.</li>
                  <li>Our liability is limited strictly to the purchase value of the ordered product.</li>
                  <li>We reserve the right to update or modify these terms and policies at any time without prior notice.</li>
                </ul>
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none mb-4 mt-2">
                <input 
                  type="checkbox" 
                  checked={agreedTc} 
                  onChange={(e) => setAgreedTc(e.target.checked)} 
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-accent-orange focus:ring-accent-orange mt-0.5 cursor-pointer accent-orange-600" 
                />
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  I have read, understood, and agree to the Terms & Conditions.
                </span>
              </label>

              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowTcModal(false)} 
                  className="flex-1 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
                >
                  Go Back
                </button>
                <Button
                  className="flex-1 text-sm"
                  disabled={!agreedTc || isProcessing}
                  onClick={async () => {
  setShowTcModal(false);
  if (pendingCheckoutType === 'cod') {
    // Create a server-side Razorpay order for the ₹99 COD prepayment
    setIsProcessing(true);
    try {
      const prepayRes = await fetch(`${API_BASE_URL}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderData: { ...buildOrderData(), type: 'cod-prepay', amount: 99 } })
      });
      const prepayData = await prepayRes.json();
      if (!prepayData.success) { toast.error('Could not initiate prepayment.'); setIsProcessing(false); return; }
      const prepayOrderData = buildOrderData();
      const prepayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: prepayData.amount,
        currency: 'INR',
        name: 'Tork3D Fabrication',
        description: 'COD Prepayment ₹99',
        order_id: prepayData.order.id,
        prefill: { name: customerInfo.name, email: customerInfo.email, contact: customerInfo.phone },
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_BASE_URL}/api/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: { ...prepayOrderData, amount: prepayData.amount }
              })
            });
            const verifyData = await verifyRes.json();
            if (!verifyData.success) { toast.error('Prepayment verification failed.'); return; }
            await executeCodCheckout();
          } catch { toast.error('Could not verify prepayment.'); }
        },
        theme: { color: '#F97316' }
      };
      new window.Razorpay(prepayOptions).open();
    } catch {
      toast.error('Could not reach server for prepayment.');
    } finally {
      setIsProcessing(false);
    }
  } else {
    await executeOnlineCheckout();
  }
}}
                >
                  {isProcessing ? 'Processing…' : pendingCheckoutType === 'cod' ? 'Agree & Place Order' : 'Agree & Pay'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SectionWrapper>
        <div className="mb-12">
          {/* Breadcrumbs Navigation */}
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium flex-wrap">
            <Link to="/" className="hover:text-accent-blue transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <Link to="/shop" className="hover:text-accent-blue transition-colors">Shop</Link>
            <ChevronRight className="w-4 h-4 opacity-50" />
            <span className="text-slate-900 dark:text-white">Shopping Cart</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Shopping Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={item.id}
                className="glass-card p-6 flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-500 dark:text-slate-400 hover:text-red-600 transition-colors p-1">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">{item.material} • {item.category}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center bg-secondary dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-800 p-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-slate-50 dark:bg-slate-800 rounded-md transition-colors text-slate-600 dark:text-slate-300"><Minus className="w-4 h-4" /></button>
                      <span className="w-10 text-center font-medium text-slate-900 dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-slate-50 dark:bg-slate-800 rounded-md transition-colors text-slate-600 dark:text-slate-300"><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">₹{item.price * item.quantity}</div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Free name keychain — bundled with a valid coupon */}
            {couponStatus?.valid && freeKeychainProduct && (
              <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6 flex flex-col sm:flex-row gap-6 border-2 border-accent-orange/40 relative">
                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-accent-orange text-white px-2 py-1 rounded-full">Free Gift</span>
                <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  <img src={freeKeychainProduct.image} alt={freeKeychainProduct.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{freeKeychainProduct.name}</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">🎁 Included free with coupon <strong className="text-slate-900 dark:text-white">{couponStatus.code}</strong></p>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Name to engrave *</label>
                      <input
                        type="text"
                        value={keychainName}
                        onChange={e => setKeychainName(e.target.value)}
                        maxLength={20}
                        placeholder="e.g. Arya"
                        className="w-full max-w-xs bg-secondary dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-blue text-slate-900 dark:text-white"
                      />
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">This name will be engraved on your free keychain.</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <span className="text-base text-slate-400 line-through">₹{freeKeychainProduct.price}</span>
                    <span className="text-xl font-bold text-green-600 dark:text-green-400">FREE</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div>
            <div className="glass-card p-8 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Order Summary</h2>

              {/* Free shipping progress bar */}
              {fulfillment === 'delivery' && (
                <div className="mb-6">
                  {hasFreeShipping ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                      <Truck className="w-4 h-4 flex-shrink-0" />
                      You've unlocked free shipping!
                    </div>
                  ) : (
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 space-y-2">
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Add <span className="font-bold text-slate-900 dark:text-white">₹{amountToFreeShipping}</span> more for <span className="font-bold text-accent-orange">free shipping</span>
                      </p>
                      <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-orange rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Coupon code */}
              <div className="mb-6">
                {couponStatus?.valid ? (
                  <div className="flex items-center justify-between gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>{couponStatus.code} applied · 🎁 free keychain added</span>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 font-medium">
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        placeholder="Coupon code"
                        className="flex-1 bg-secondary dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent-blue text-slate-900 dark:text-white uppercase"
                      />
                      <button
                        onClick={applyCoupon}
                        disabled={couponApplying || !couponInput.trim()}
                        className="px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-sm font-semibold disabled:opacity-50 hover:opacity-90 transition-opacity"
                      >
                        {couponApplying ? '…' : 'Apply'}
                      </button>
                    </div>
                    {couponStatus && !couponStatus.valid && (
                      <p className="mt-2 text-xs text-red-500">{couponStatus.message}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span className="text-slate-900 dark:text-white">₹{subtotal}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                    <span>Discount ({couponStatus.code})</span>
                    <span>−₹{couponDiscount}</span>
                  </div>
                )}
                {couponStatus?.valid && freeKeychainProduct && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>{freeKeychainProduct.name} (gift)</span>
                    <span className="text-green-600 dark:text-green-400 font-medium">FREE</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Shipping</span>
                  <span>
                    {hasFreeShipping
                      ? <span className="text-green-600 dark:text-green-400 font-bold">FREE</span>
                      : selectedMode
                        ? <span className="text-slate-900 dark:text-white font-medium">₹{shippingCost}</span>
                        : <span className="text-xs text-slate-600 dark:text-slate-300 italic">Enter pincode at checkout</span>
                    }
                  </span>
                </div>
                {selectedMode && !hasFreeShipping && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 text-right -mt-2">
                    {selectedMode === 'express' ? '⚡ Express · 1–3 days' : '📦 Standard · 4–7 days'}
                    {paymentType === 'cod' && ' (incl. COD charge)'}
                  </p>
                )}
                <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex justify-between text-xl font-bold text-slate-900 dark:text-white">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 text-right">Est. package: {totalWeightGrams}g</p>
              </div>

              <Button size="lg" className="w-full mb-6" onClick={() => setShowModal(true)}>Checkout</Button>

              {/* Trust badges */}
              <div className="rounded-md border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { Icon: ShieldCheck, label: 'Secured by Razorpay' },
                  { Icon: Truck,       label: 'Shipped via Delhivery' },
                  { Icon: CheckCircle2, label: 'Quality checked before dispatch' },
                  { Icon: Banknote,   label: 'COD available across India' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-3 px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <Icon className="w-4 h-4 text-accent-orange shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
