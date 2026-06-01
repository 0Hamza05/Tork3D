import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className,
  asChild,
  ...props 
}) {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-semibold tracking-tight transition-all focus:outline-none focus:ring-2 focus:ring-accent-orange focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-accent-orange text-white hover:bg-accent-orange/90 shadow-lg shadow-orange-500/20",
    secondary: "bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:bg-slate-800",
    outline: "border-2 border-accent-blue text-accent-blue hover:bg-accent-blue/5",
    ghost: "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-50 dark:bg-slate-800"
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-6 text-base",
    lg: "py-4 px-8 text-base md:text-lg font-bold"
  };

  const Comp = asChild ? motion.a : motion.button;

  return (
    <Comp 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </Comp>
  );
}
