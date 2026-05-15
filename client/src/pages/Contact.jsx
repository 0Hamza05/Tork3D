import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Mail, Phone, MessageCircle, Instagram, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionWrapper, fadeIn } from '../components/layout/SectionWrapper';
import { API_BASE_URL } from '../config';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Could not reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen">
      <SectionWrapper>
        <motion.div variants={fadeIn} className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-slate-900 dark:text-white">Get in Touch</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">Have a question or want to discuss a large project? We're here to help.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {/* Contact Info */}
          <motion.div variants={fadeIn} className="space-y-8">
            <div className="glass-card p-8 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-orange/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-accent-orange" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Location</h3>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    Mandke Advantage Homes, Lullanagar,<br />
                    Pune, Maharashtra, India 411040
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-orange/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-accent-orange" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Email Us</h3>
                  <p className="text-slate-600 dark:text-slate-300">tork3d.design@gmail.com</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">We typically reply within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-orange/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-accent-orange" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Call Us</h3>
                  <p className="text-slate-600 dark:text-slate-300">+91 99003 90390 / 70730 85538</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent-orange/10 flex items-center justify-center flex-shrink-0">
                  <Instagram className="w-6 h-6 text-accent-orange" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1 text-slate-900 dark:text-white">Follow Us</h3>
                  <a href="https://www.instagram.com/tork3d_/" target="_blank" rel="noreferrer"
                    className="text-slate-600 dark:text-slate-300 hover:text-accent-orange transition-colors">
                    @tork3d_
                  </a>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">See our latest 3D prints &amp; projects</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Need an instant reply?</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">Message us directly on WhatsApp for real-time support.</p>
              <Button size="lg" className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white shadow-none" asChild>
                <a href="https://wa.me/919900390390" target="_blank" rel="noreferrer" className="flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" /> Chat on WhatsApp
                </a>
              </Button>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={fadeIn} className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Send a Message</h2>

            {success ? (
              <div className="flex flex-col items-center justify-center text-center py-16 space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Message Sent!</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
                  We've received your message and will get back to you within 24 hours.
                </p>
                <button onClick={() => setSuccess(false)} className="text-sm text-accent-orange hover:underline mt-2">
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Name *</label>
                  <input name="name" type="text" required value={form.name} onChange={handleChange}
                    className="w-full bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Email *</label>
                  <input name="email" type="email" required value={form.email} onChange={handleChange}
                    className="w-full bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Mobile Number</label>
                  <input name="phone" type="tel" pattern="\d{10}" title="Please enter a valid 10-digit phone number." value={form.phone} onChange={handleChange}
                    className="w-full bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Subject</label>
                  <input name="subject" type="text" value={form.subject} onChange={handleChange}
                    className="w-full bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Message *</label>
                  <textarea name="message" rows="5" required value={form.message} onChange={handleChange}
                    className="w-full bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-blue resize-none text-slate-900 dark:text-white" />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                    </span>
                  ) : 'Send Message'}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
}
