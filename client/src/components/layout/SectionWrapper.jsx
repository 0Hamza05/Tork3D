import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

export function SectionWrapper({ children, className, id }) {
  const prefersReduced = useReducedMotion();

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
              staggerChildren: prefersReduced ? 0 : 0.1
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

export function useFadeIn() {
  const prefersReduced = useReducedMotion();
  return {
    hidden: { opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 30 },
    show: {
      opacity: 1,
      y: 0,
      transition: prefersReduced ? { duration: 0 } : { ease: [0.16, 1, 0.3, 1], duration: 0.6 }
    }
  };
}

export const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { ease: [0.16, 1, 0.3, 1], duration: 0.6 }
  }
};
