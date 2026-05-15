import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function SectionWrapper({ children, className, id }) {
  return (
    <section id={id} className={cn("py-20 md:py-32 overflow-hidden", className)}>
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {children}
      </motion.div>
    </section>
  );
}

export const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', duration: 0.8, bounce: 0.3 }
  }
};
