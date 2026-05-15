import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, CheckCircle2, Factory, Printer, Truck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionWrapper, fadeIn } from '../components/layout/SectionWrapper';
import { API_BASE_URL } from '../config';

const WORKFLOW = [
  { icon: CheckCircle2, title: 'Get Quote', desc: 'Instant pricing and timeline' },
  { icon: Printer, title: 'Printing', desc: 'Printed in our high-end farm' },
  { icon: Truck, title: 'Delivery', desc: 'Shipped to your doorstep' },
];

export default function CustomOrder() {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', material: 'PLA', color: 'Black', quantity: 1, infill: 20, description: '', deadline: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      alert("Please fill in your name, email, and phone number.");
      return;
    }
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      const quoteData = {
        type: 'quote_request',
        customerName: formData.name,
        customerEmail: formData.email,
        specs: formData,
      };

      // Send to backend/database as a quote request
      const res = await fetch(`${API_BASE_URL}/api/create-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quoteData)
      });

      const data = await res.json();

      if (data.success) {
        setIsSubmitted(true);
      } else {
        throw new Error(data.message || 'Submission failed');
      }

    } catch (error) {
      console.error(error);
      alert('Your quote request was saved locally, but we couldn\'t reach the server. Please contact us directly at tork3d.design@gmail.com.');
    }
  };



  return (
    <div className="pt-24 min-h-screen">
      <SectionWrapper>
        <motion.div variants={fadeIn} className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-slate-900 dark:text-white">Print Your Own Model</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">Upload your STL file, select your specifications, and we'll handle the fabrication.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <motion.div variants={fadeIn} className="lg:col-span-2 glass-card p-6 md:p-10">
            {isSubmitted ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Request Submitted Successfully!</h2>
                <p className="text-slate-600 dark:text-slate-300 mb-8 max-w-md mx-auto">
                  We've received your project details. Please send us your 3D model files via WhatsApp so we can provide an accurate quote.
                </p>
                <a
                  href={`https://wa.me/919900390390?text=Hi%20Tork3D!%20I%20just%20submitted%20a%20quote%20request.%20My%20Email%20is%20${encodeURIComponent(formData.email)}.%20I'm%20sending%20my%20CAD%20files%20now.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold transition-colors"
                >
                  Send Files on WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">



                {/* Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Material</label>
                    <select
                      className="w-full bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-orange text-slate-900 dark:text-white"
                      value={formData.material} onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    >
                      <option>PLA</option><option>PETG</option><option>TPU</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Color</label>
                    <select
                      className="w-full bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-orange text-slate-900 dark:text-white"
                      value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    >
                      <option>Black</option><option>White</option><option>Grey</option><option>Red</option><option>Blue</option><option>Custom (Specify below)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Quantity: {formData.quantity}</label>
                    <input type="number" min="1" max="1000"
                      className="w-full bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-orange text-slate-900 dark:text-white"
                      value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Infill Percentage: {formData.infill}%</label>
                    <input type="range" min="0" max="100" step="5"
                      className="w-full accent-accent-orange py-3"
                      value={formData.infill} onChange={(e) => setFormData({ ...formData, infill: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Full Name</label>
                    <input type="text" required
                      className="w-full bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-orange text-slate-900 dark:text-white"
                      value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Email Address</label>
                    <input type="email" required
                      className="w-full bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-orange text-slate-900 dark:text-white"
                      value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Mobile Number</label>
                    <input type="tel" required
                      pattern="\d{10}"
                      title="Please enter a valid 10-digit phone number."
                      className="w-full bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-orange text-slate-900 dark:text-white"
                      value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Project Description</label>
                  <textarea rows="4"
                    className="w-full bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-accent-orange text-slate-900 dark:text-white"
                    placeholder="Special instructions, tolerances, intended use..."
                    value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" className="w-full md:w-auto">Submit Details</Button>
                </div>
              </form>
            )}
          </motion.div>

          {/* Sidebar / Workflow */}
          <motion.div variants={fadeIn} className="space-y-8">
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                <Factory className="text-accent-orange" />
                Our Workflow
              </h3>
              <div className="space-y-6">
                {WORKFLOW.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-2">
                        <step.icon className="w-5 h-5 text-accent-orange" />
                      </div>
                      {i < WORKFLOW.length - 1 && <div className="w-0.5 h-10 bg-slate-200" />}
                    </div>
                    <div className="pt-2">
                      <h4 className="font-semibold text-slate-900 dark:text-white">{step.title}</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-accent-blue/20 to-accent-orange/20 border border-white/10 p-8 rounded-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Need Bulk Production?</h3>
                <p className="text-sm text-slate-700 dark:text-slate-200 mb-6">We offer print farm scaling for runs of 100+ units. Chat with us on WhatsApp for wholesale pricing.</p>
                <a
                  href="https://wa.me/919900390390"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5d] transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
}
