import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-canvas dark:bg-canvas-dark border-t-2 border-accent-orange pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src="/favicon.png" alt="Tork3D Logo" className="h-6 w-6 object-contain" />
              <span className="font-display font-black text-xl tracking-tight text-slate-900 dark:text-white">Tork<span className="text-accent-orange">3D</span></span>
            </Link>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Premium custom 3D printing, rapid prototyping, and engineering solutions tailored for modern businesses and creators.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li><Link to="/shop" className="hover:text-accent-blue transition-colors">Shop Products</Link></li>
              <li><Link to="/custom" className="hover:text-accent-blue transition-colors">Custom Order</Link></li>
              <li><Link to="/gallery" className="hover:text-accent-blue transition-colors">Gallery</Link></li>
              <li><Link to="/contact?topic=affiliate" className="hover:text-accent-blue transition-colors">Become an Affiliate</Link></li>

            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Legal</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li><Link to="/policies" className="hover:text-accent-blue transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/policies" className="hover:text-accent-blue transition-colors">Return & Refund Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Contact</h3>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:tork3d.design@gmail.com" className="hover:text-accent-blue transition-colors">
                  tork3d.design@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 99003 90390 / 70730 85538</span>
              </li>
              <li className="flex items-center gap-2 mt-4">
                <a 
                  href="https://www.instagram.com/tork3d_/" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 hover:text-accent-orange transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                  <span>@tork3d_</span>
                </a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 dark:text-slate-500">
            &copy; {new Date().getFullYear()} Tork3D Fabrication. All rights reserved.
          </p>
          {/* Payment methods */}
          <div className="flex flex-wrap items-center gap-2">
            {['UPI', 'Visa', 'Mastercard', 'RuPay', 'Net Banking', 'COD'].map(method => (
              <span
                key={method}
                className="text-[10px] font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 tracking-wider uppercase"
              >
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
