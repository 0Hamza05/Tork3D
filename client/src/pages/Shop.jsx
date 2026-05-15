import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ProductCard } from '../components/ui/ProductCard';
import { SectionWrapper, fadeIn } from '../components/layout/SectionWrapper';

import { products } from '../data/products';

const SORTS = ['Newest', 'Price: Low to High', 'Price: High to Low'];

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('Newest');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    if (activeSort === 'Price: Low to High') return a.price - b.price;
    if (activeSort === 'Price: High to Low') return b.price - a.price;
    return 0; // Newest keeps id order
  });

  return (
    <div className="pt-24 min-h-screen">
      <SectionWrapper>
        <motion.div variants={fadeIn} className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-slate-900 dark:text-white">Tork3D Shop</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">High-quality 3D printed parts, ready to ship.</p>
        </motion.div>

        {/* Coming Soon State */}
        <motion.div variants={fadeIn} className="flex flex-col items-center justify-center text-center py-20 px-4 glass-card mt-8">
          <div className="w-20 h-20 bg-accent-orange/10 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl">🚀</span>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Our Shop is Launching Soon!</h2>
          <p className="text-slate-600 dark:text-slate-300 max-w-lg mx-auto mb-8">
            We are working hard to stock our shelves with premium, ready-to-ship 3D printed parts and engineering components. Check back soon!
          </p>
          <Button asChild size="lg">
            <a href="/custom">Request a Custom Print Instead</a>
          </Button>
        </motion.div>

      </SectionWrapper>
    </div>
  );
}
