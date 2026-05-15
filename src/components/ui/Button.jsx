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
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
  
  const variants = {
    primary: "bg-accent-blue text-white hover:bg-accent-blue/90 glow-btn",
    secondary: "bg-gray-100 dark:bg-[#1a1a1a] text-foreground border border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/20 hover:bg-black/5 dark:hover:bg-white/5",
    outline: "border-2 border-accent-blue text-accent-blue hover:bg-accent-blue/10",
    ghost: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
  };

  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg"
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
