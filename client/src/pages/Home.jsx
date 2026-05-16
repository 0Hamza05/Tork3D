import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Settings, Clock, Layers, ShieldCheck, PenTool, Cpu } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionWrapper, fadeIn } from '../components/layout/SectionWrapper';
import { ProductCard } from '../components/ui/ProductCard';

import { products } from '../data/products';

const FEATURES = [
  { icon: Settings, title: 'Precision', desc: 'Down to 0.08mm layer height' },
  { icon: Clock, title: 'Fast Turnaround', desc: 'As quick as 24 hours' },
  { icon: Layers, title: 'CAD Support', desc: 'Dedicated engineering team' },
  { icon: ShieldCheck, title: 'Reliability', desc: 'Quality control on every print' },
  { icon: Cpu, title: 'Engineered Materials', desc: 'PLA, PETG, and TPU' },
  { icon: PenTool, title: 'Customization', desc: 'From idea to final product' },
];

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-24">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-accent-blue/5 rounded-full filter blur-[120px] animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-accent-orange/5 rounded-full filter blur-[120px] animate-blob animation-delay-2000" />
          <div className="absolute -bottom-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-accent-blue/5 rounded-full filter blur-[150px] animate-blob animation-delay-4000" />
          
          {/* Decorative Blueprint Markers */}
          <div className="absolute top-20 left-20 w-32 h-32 border-l border-t border-slate-200 dark:border-slate-800" />
          <div className="absolute bottom-20 right-20 w-32 h-32 border-r border-b border-slate-200 dark:border-slate-800" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex justify-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-accent-orange mb-8 backdrop-blur-sm shadow-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-orange opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-orange"></span>
                </span>
                <span className="text-sm font-medium">Now accepting custom orders</span>
              </div>
            </motion.div>

            <div className="relative inline-block mb-6">
              <motion.h1 
                className="text-5xl md:text-7xl font-extrabold tracking-tight pb-2 text-slate-900 dark:text-white"
                initial={{ clipPath: "inset(100% 0 0 0)" }}
                animate={{ clipPath: "inset(0% 0 0 0)" }}
                transition={{ duration: 0.8, ease: "linear", delay: 0.2 }}
              >
                Custom 3D Printing & <br className="hidden md:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-blue to-accent-orange pb-2">
                  Engineering Solutions
                </span>
              </motion.h1>
              
              {/* Laser / Extruder Line */}
              <motion.div
                className="absolute left-[-5%] right-[-5%] h-[3px] bg-accent-blue shadow-[0_0_20px_rgba(56,189,248,1),0_0_40px_rgba(56,189,248,0.8)] rounded-full z-20 pointer-events-none"
                initial={{ top: "100%", opacity: 0 }}
                animate={{ 
                  top: "0%", 
                  opacity: [0, 1, 1, 0],
                  scaleX: [0.8, 1, 1, 0.8] 
                }}
                transition={{ 
                  top: { duration: 0.8, ease: "linear", delay: 0.2 },
                  opacity: { duration: 1.0, times: [0, 0.1, 0.9, 1], ease: "linear", delay: 0.1 },
                  scaleX: { duration: 0.8, ease: "linear", delay: 0.2 }
                }}
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 1.2 }}
            >
              <p className="mt-4 max-w-2xl text-xl text-slate-600 dark:text-slate-300 mx-auto mb-10">
                Bring your ideas to life with industrial-grade materials, precision engineering, and lightning-fast turnaround times.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/custom" className="w-full sm:w-auto">
                  <Button size="lg" className="group w-full">
                    <span className="flex items-center justify-center whitespace-nowrap">
                      Request Custom Print
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </Link>
                <Link to="/shop" className="w-full sm:w-auto">
                  <Button variant="secondary" size="lg" className="w-full">
                    Shop Products
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <SectionWrapper>
        <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
          <motion.div variants={fadeIn}>
            <h2 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">Featured Prints</h2>
            <p className="text-slate-600 dark:text-slate-300">Our best-selling ready-to-ship models.</p>
          </motion.div>
          <motion.div variants={fadeIn}>
            <Link to="/shop" className="inline-block">
              <Button variant="outline">
                View All Products
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.slice(0, 3).map((prod, i) => (
            <motion.div key={prod.id} variants={fadeIn}>
              <ProductCard product={prod} />
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Why Choose Us */}
      <SectionWrapper className="bg-[rgb(var(--secondary-bg))] dark:bg-slate-800">
        <motion.div variants={fadeIn} className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Why Tork3D</h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">We combine top-tier technology with engineering expertise.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div key={feature.title} variants={fadeIn} className="glass-card p-8 group">
                <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-accent-orange/10 transition-colors duration-300">
                  <Icon className="w-7 h-7 text-accent-orange" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{feature.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </SectionWrapper>

      {/* CTA Section */}
      <SectionWrapper>
        <motion.div variants={fadeIn} className="relative rounded-3xl overflow-hidden glass-card p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-blue/20 to-accent-orange/20 opacity-50 mix-blend-overlay" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900 dark:text-white">Ready to print your idea?</h2>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 max-w-2xl mx-auto">
              Upload your STL file, get an instant quote, and let our farm handle the rest.
            </p>
            <Link to="/custom" className="inline-block">
              <Button size="lg" className="group text-lg px-8 py-6">
                <span className="flex items-center justify-center whitespace-nowrap">
                  Get a Quote Now
                  <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </span>
              </Button>
            </Link>
          </div>
        </motion.div>
      </SectionWrapper>
    </div>
  );
}
