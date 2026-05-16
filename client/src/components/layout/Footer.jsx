import React from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, Instagram, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <Hexagon className="h-6 w-6 text-accent-orange" />
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Tork<span className="text-accent-orange">3D</span></span>
            </Link>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Premium custom 3D printing, rapid prototyping, and engineering solutions tailored for modern businesses and creators.
            </p>
          </div>

          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li><Link to="/shop" className="hover:text-accent-blue transition-colors">Shop Products</Link></li>
              <li><Link to="/custom" className="hover:text-accent-blue transition-colors">Custom Order</Link></li>
              <li><Link to="/gallery" className="hover:text-accent-blue transition-colors">Gallery</Link></li>

            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li>Rapid Prototyping</li>
              <li>CAD Engineering</li>
              <li>Custom Production Runs</li>
              <li>Material Consultation</li>
            </ul>
          </div>

          <div>
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">Contact</h3>
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

        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>&copy; {new Date().getFullYear()} Tork3D Fabrication. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
