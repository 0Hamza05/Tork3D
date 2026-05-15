import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Trash2, Plus, Minus, ArrowLeft, ShieldCheck, Truck, Loader2, CheckCircle2, AlertCircle, Zap, CreditCard, Banknote } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { SectionWrapper, fadeIn } from '../components/layout/SectionWrapper';
import { API_BASE_URL } from '../config';

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

  // Display weight = simple sum of dead weights across all cart items
  const totalWeightGrams = cart.reduce((sum, item) => sum + ((item.weight || 200) * item.quantity), 0);

  const shippingCost = fulfillment === 'pickup'
    ? 0
    : selectedMode === 'express' ? shippingRates?.express ?? 0
    : selectedMode === 'surface' ? shippingRates?.surface ?? 0
    : 0;

  const totalPrice = subtotal + shippingCost;

  // Re-fetch rates when pincode, weight, or payment type changes
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
        const pt = paymentType === 'cod' ? 'COD' : 'Pre-paid';
        const codAmount = paymentType === 'cod' ? subtotal : 0;
        const itemsParam = encodeURIComponent(JSON.stringify(cart.map(i => ({ id: i.id, quantity: i.quantity }))));
        const res = await fetch(
          `${API_BASE_URL}/api/shipping-rate?pincode=${pincode}&pt=${pt}&codAmount=${codAmount}&items=${itemsParam}`
        );
        const data = await res.json();
        if (data.success) {
          setShippingRates(data);
          setSelectedMode(data.express ? 'express' : 'surface');
        } else {
          setShippingError(data.message || 'Pincode not serviceable');
        }
      } catch {
        setShippingError('Could not fetch shipping rate. Please try again.');
      } finally {
        setShippingLoading(false);
      }
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [customerInfo.pincode, totalWeightGrams, fulfillment, paymentType]);

  const buildOrderData = () => ({
    type: 'cart',
    items: cart.map(item => ({ id: item.id, name: item.name, price: item.price, quantity: item.quantity })),
    shippingCost,
    shippingMode: fulfillment === 'pickup' ? 'pickup' : selectedMode,
    customerName: customerInfo.name,
    customerEmail: customerInfo.email,
    customerPhone: customerInfo.phone,
    shippingAddress: fulfillment === 'pickup' ? null : {
      address1: customerInfo.address1,
      city: customerInfo.city,
      state: customerInfo.state,
      pincode: customerInfo.pincode
    }
  });

  const validateForm = () => {
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      alert('Please fill in your name, email and phone.'); return false;
    }
    if (fulfillment === 'delivery' && (!customerInfo.address1 || !customerInfo.city || !customerInfo.state || !customerInfo.pincode)) {
      alert('Please fill in your delivery address.'); return false;
    }
    if (fulfillment === 'delivery' && !selectedMode) {
      alert('Please wait for shipping rates to load.'); return false;
    }
    return true;
  };

  const handleCodCheckout = async () => {
    if (!validateForm()) return;
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
        alert('Failed to place order: ' + data.message);
      }
    } catch {
      alert('Could not reach server. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOnlineCheckout = async () => {
    if (!validateForm()) return;
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
            if (verifyData.success) { clearCart(); alert('Payment Successful! Your order has been placed.'); navigate('/shop'); }
            else alert('Payment verification failed: ' + verifyData.message);
          } catch { alert('Could not reach the server for verification.'); }
        },
        theme: { color: '#F97316' }
      };
      new window.Razorpay(options).open();
    } catch (error) {
      console.error(error); alert('Error initiating checkout.');
    } finally {
      setIsProcessing(false);
    }
  };

  const canProceed = !isProcessing && !shippingLoading &&
    (fulfillment === 'pickup' || selectedMode !== null);

  if (codSuccess) {
    return (
      <div className="pt-32 min-h-screen">
        <SectionWrapper>
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 max-w-md mx-auto">
            <CheckCircle2 className="w-20 h-20 text-green-500" />
            <h1 className="text-3xl font-bold text-foreground">Order Placed!</h1>
            <p className="text-gray-500 dark:text-gray-400">Your Cash on Delivery order has been confirmed. We'll contact you once it's ready to ship.</p>
            <Button asChild size="lg"><Link to="/shop">Continue Shopping</Link></Button>
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
            <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Your cart is empty</h1>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">Looks like you haven't added any industrial-grade prints yet.</p>
            <Button asChild size="lg"><Link to="/shop">Browse Products</Link></Button>
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
          <div className="bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/10 p-8 w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-2 text-foreground">Checkout Details</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">Enter your information to complete the order.</p>

            <div className="space-y-4">
              {/* Contact */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                <input required type="text" placeholder="Your Name"
                  className="w-full bg-[rgb(var(--secondary-bg))] border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-foreground"
                  value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                <input required type="email" placeholder="your@email.com"
                  className="w-full bg-[rgb(var(--secondary-bg))] border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-foreground"
                  value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                <input required type="tel" placeholder="+91 98765 43210"
                  className="w-full bg-[rgb(var(--secondary-bg))] border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-foreground"
                  value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} />
              </div>

              {/* Payment Method */}
              <div className="pt-2 border-t border-black/10 dark:border-white/10">
                <h3 className="text-sm font-semibold mb-3 text-foreground">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setPaymentType('prepaid')}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${paymentType === 'prepaid' ? 'border-accent-orange bg-accent-orange/10' : 'border-black/10 dark:border-white/10 hover:border-accent-orange/40'}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <CreditCard className="w-3.5 h-3.5 text-accent-orange" />
                      <span className="text-xs font-bold text-foreground">Pay Online</span>
                    </div>
                    <p className="text-xs text-gray-500">UPI, Cards, Net Banking</p>
                  </button>
                  <button type="button" onClick={() => setPaymentType('cod')}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${paymentType === 'cod' ? 'border-green-500 bg-green-500/10' : 'border-black/10 dark:border-white/10 hover:border-green-500/40'}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Banknote className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-xs font-bold text-foreground">Cash on Delivery</span>
                    </div>
                    <p className="text-xs text-gray-500">Pay when it arrives</p>
                  </button>
                </div>
                {paymentType === 'cod' && (
                  <p className="text-xs text-amber-500 mt-2">⚠ COD surcharge may apply and is included in the shipping rate shown below.</p>
                )}
              </div>

              {/* Fulfilment Method */}
              <div className="pt-2 border-t border-black/10 dark:border-white/10">
                <h3 className="text-sm font-semibold mb-3 text-foreground">Fulfilment Method</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button type="button" onClick={() => setFulfillment('delivery')}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${fulfillment === 'delivery' ? 'border-accent-blue bg-accent-blue/10' : 'border-black/10 dark:border-white/10 hover:border-accent-blue/40'}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Truck className="w-3.5 h-3.5 text-accent-blue" />
                      <span className="text-xs font-bold text-foreground">Deliver to me</span>
                    </div>
                    <p className="text-xs text-gray-500">Delhivery shipping</p>
                  </button>
                  <button type="button"
                    onClick={() => { setFulfillment('pickup'); setShippingRates(null); setSelectedMode(null); setShippingError(''); }}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${fulfillment === 'pickup' ? 'border-green-500 bg-green-500/10' : 'border-black/10 dark:border-white/10 hover:border-green-500/40'}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-sm">🏭</span>
                      <span className="text-xs font-bold text-foreground">Collect from site</span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold">FREE</p>
                  </button>
                </div>

                {fulfillment === 'pickup' && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-2">
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-1">📍 Pickup Location</p>
                    <p className="text-sm text-foreground">Tork3D Workshop</p>
                    <p className="text-xs text-gray-500 mt-0.5">Pune - 411048, Maharashtra</p>
                    <p className="text-xs text-gray-400 mt-1">We'll contact you when your order is ready for collection.</p>
                  </div>
                )}

                {fulfillment === 'delivery' && (
                  <div className="space-y-3">
                    <input required type="text" placeholder="Address Line 1"
                      className="w-full bg-[rgb(var(--secondary-bg))] border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-foreground text-sm"
                      value={customerInfo.address1} onChange={e => setCustomerInfo({...customerInfo, address1: e.target.value})} />
                    <div className="grid grid-cols-2 gap-3">
                      <input required type="text" placeholder="City"
                        className="w-full bg-[rgb(var(--secondary-bg))] border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-foreground text-sm"
                        value={customerInfo.city} onChange={e => setCustomerInfo({...customerInfo, city: e.target.value})} />
                      <input required type="text" placeholder="State"
                        className="w-full bg-[rgb(var(--secondary-bg))] border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-foreground text-sm"
                        value={customerInfo.state} onChange={e => setCustomerInfo({...customerInfo, state: e.target.value})} />
                    </div>
                    <input required type="text" placeholder="Pincode" maxLength={6}
                      className="w-full bg-[rgb(var(--secondary-bg))] border border-black/10 dark:border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-foreground text-sm"
                      value={customerInfo.pincode} onChange={e => setCustomerInfo({...customerInfo, pincode: e.target.value.replace(/\D/g, '')})} />

                    {shippingLoading && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="w-4 h-4 animate-spin" /> Fetching delivery rates…
                      </div>
                    )}
                    {shippingError && !shippingLoading && (
                      <div className="flex items-center gap-2 text-sm text-red-500">
                        <AlertCircle className="w-4 h-4" /> {shippingError}
                      </div>
                    )}
                    {shippingRates && !shippingLoading && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Choose delivery speed</p>
                        <div className="grid grid-cols-2 gap-3">
                          {shippingRates.express && (
                            <button type="button" onClick={() => setSelectedMode('express')}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${selectedMode === 'express' ? 'border-accent-orange bg-accent-orange/10' : 'border-black/10 dark:border-white/10 hover:border-accent-orange/50'}`}>
                              <div className="flex items-center gap-1.5 mb-1">
                                <Zap className="w-3.5 h-3.5 text-accent-orange" />
                                <span className="text-xs font-bold text-foreground">Express</span>
                              </div>
                              <p className="text-lg font-bold text-foreground">₹{shippingRates.express}</p>
                              <p className="text-xs text-gray-500">1–3 business days</p>
                            </button>
                          )}
                          {shippingRates.surface && (
                            <button type="button" onClick={() => setSelectedMode('surface')}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${selectedMode === 'surface' ? 'border-accent-blue bg-accent-blue/10' : 'border-black/10 dark:border-white/10 hover:border-accent-blue/50'}`}>
                              <div className="flex items-center gap-1.5 mb-1">
                                <Truck className="w-3.5 h-3.5 text-accent-blue" />
                                <span className="text-xs font-bold text-foreground">Standard</span>
                              </div>
                              <p className="text-lg font-bold text-foreground">₹{shippingRates.surface}</p>
                              <p className="text-xs text-gray-500">4–7 business days</p>
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-lg border border-black/10 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                Cancel
              </button>
              {paymentType === 'cod' ? (
                <Button className="flex-1 bg-green-600 hover:bg-green-700" disabled={!canProceed} onClick={handleCodCheckout}>
                  {isProcessing ? 'Placing Order…' : `Place Order · ₹${totalPrice} COD`}
                </Button>
              ) : (
                <Button className="flex-1" disabled={!canProceed} onClick={handleOnlineCheckout}>
                  {isProcessing ? 'Processing…' : `Pay ₹${totalPrice}`}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <SectionWrapper>
        <div className="mb-12">
          <Link to="/shop" className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-accent-blue transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Shopping Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={item.id}
                className="glass-card p-6 flex flex-col sm:flex-row gap-6">
                <div className="w-full sm:w-32 h-32 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#1a1a1a] flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{item.name}</h3>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{item.material} • {item.category}</p>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center bg-[rgb(var(--secondary-bg))] rounded-lg border border-black/5 dark:border-white/10 p-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors text-gray-500 dark:text-gray-400"><Minus className="w-4 h-4" /></button>
                      <span className="w-10 text-center font-medium text-foreground">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors text-gray-500 dark:text-gray-400"><Plus className="w-4 h-4" /></button>
                    </div>
                    <div className="text-xl font-bold text-foreground">₹{item.price * item.quantity}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div>
            <div className="glass-card p-8 sticky top-24">
              <h2 className="text-2xl font-bold mb-6 text-foreground">Order Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span className="text-foreground">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1.5"><Truck className="w-4 h-4" /> Shipping</span>
                  <span>
                    {selectedMode
                      ? <span className="text-foreground font-medium">₹{shippingCost}</span>
                      : <span className="text-xs text-gray-400 italic">Enter pincode at checkout</span>
                    }
                  </span>
                </div>
                {selectedMode && (
                  <p className="text-xs text-gray-400 text-right -mt-2">
                    {selectedMode === 'express' ? '⚡ Express · 1–3 days' : '📦 Standard · 4–7 days'}
                    {paymentType === 'cod' && ' (incl. COD charge)'}
                  </p>
                )}
                <div className="border-t border-black/10 dark:border-white/10 pt-4 flex justify-between text-xl font-bold text-foreground">
                  <span>Total</span>
                  <span>₹{totalPrice}</span>
                </div>
                <p className="text-xs text-gray-400 text-right">Est. package: {totalWeightGrams}g</p>
              </div>

              <Button size="lg" className="w-full mb-6" onClick={() => setShowModal(true)}>Checkout</Button>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <ShieldCheck className="w-4 h-4 text-accent-blue flex-shrink-0" />
                  Secure payment via Razorpay
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <Truck className="w-4 h-4 text-accent-blue flex-shrink-0" />
                  Live shipping rates via Delhivery
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <Banknote className="w-4 h-4 text-accent-blue flex-shrink-0" />
                  Cash on Delivery available
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
