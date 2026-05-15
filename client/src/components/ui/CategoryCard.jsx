import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export function CategoryCard({ title, image }) {
  return (
    <Link to={`/shop?category=${encodeURIComponent(title)}`}>
      <motion.div 
        whileHover={{ scale: 1.03 }}
        className="relative group rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
      >
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        <div className="absolute inset-0 p-6 flex items-end">
          <h3 className="text-xl font-bold text-white group-hover:text-accent-blue transition-colors duration-300">
            {title}
          </h3>
        </div>
      </motion.div>
    </Link>
  );
}
