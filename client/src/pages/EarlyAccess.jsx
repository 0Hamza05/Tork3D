import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Tag, Calendar, ArrowLeft, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function EarlyAccess() {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { couponCode, alreadyRegistered }

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/early-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setResult({ couponCode: data.couponCode, alreadyRegistered: data.alreadyRegistered });
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard?.writeText(result.couponCode);
    toast.success('Coupon code copied!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg mx-auto"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-accent-orange transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {result ? (
          <div className="glass-card p-8 text-center space-y-5">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {result.alreadyRegistered ? "You're already on the list!" : "You're all set!"}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              We've sent your coupon to your email. Here it is too — use it at checkout when we're back on 25th June.
            </p>
            <div className="flex items-center justify-center gap-2 bg-accent-orange/10 border border-accent-orange/30 rounded-xl px-4 py-3">
              <span className="text-xl font-black tracking-widest text-accent-orange">{result.couponCode}</span>
              <button onClick={copyCode} className="text-accent-orange hover:opacity-70" aria-label="Copy coupon code">
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Free name keychain + 10% off, valid on orders above ₹350.
            </p>
          </div>
        ) : (
          <div className="glass-card p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-accent-orange/10 flex items-center justify-center mx-auto">
                <Gift className="w-8 h-8 text-accent-orange" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Claim your reopening coupon</h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                We'll let you know the moment we're back — plus you'll unlock a few perks for waiting.
              </p>
            </div>

            <div className="space-y-3 bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-accent-orange flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Order once we're back on <span className="font-bold">25th June</span>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Gift className="w-5 h-5 text-accent-orange flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Get a <span className="font-bold">free name keychain</span> with your order.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-accent-orange flex-shrink-0 mt-0.5" />
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Plus a <span className="font-bold">10% discount coupon</span> (on orders above ₹350).
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Fill in your details below to lock in your coupon — the free keychain &amp; discount are only for those who register.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Name *</label>
                <input name="name" type="text" required value={form.name} onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full bg-secondary dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Email *</label>
                <input name="email" type="email" required value={form.email} onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full bg-secondary dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">Mobile Number *</label>
                <input name="phone" type="tel" required pattern="\d{10}" title="Please enter a valid 10-digit phone number."
                  value={form.phone} onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="w-full bg-secondary dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-slate-900 dark:text-white" />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
                  </span>
                ) : 'Notify me & reserve my coupon'}
              </Button>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
}
