import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionWrapper, fadeIn } from '../components/layout/SectionWrapper';

export default function NotFound() {
  return (
    <div className="pt-32 pb-24 min-h-screen flex items-center justify-center">
      <SectionWrapper className="w-full">
        <motion.div 
          variants={fadeIn} 
          className="max-w-xl mx-auto text-center glass-card p-12 rounded-3xl"
        >
          <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <AlertCircle className="w-12 h-12 text-red-500" />
          </div>
          
          <h1 className="text-6xl font-black text-slate-900 dark:text-white mb-4">404</h1>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Page Not Found</h2>
          
          <p className="text-slate-600 dark:text-slate-300 mb-10">
            Oops! The page you are looking for seems to have been misplaced or doesn't exist. Let's get you back to safety.
          </p>
          
          <Link to="/" className="inline-block">
            <Button size="lg" className="group">
              <span className="flex items-center gap-2">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </span>
            </Button>
          </Link>
        </motion.div>
      </SectionWrapper>
    </div>
  );
}
