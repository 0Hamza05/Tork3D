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
          <h1 className="text-5xl font-bold mb-4 text-foreground">Tork3D Shop</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">High-quality 3D printed parts, ready to ship.</p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={fadeIn} className="flex flex-col lg:flex-row gap-6 mb-12 items-center justify-between glass-card p-4 rounded-xl">
          <div className="relative w-full lg:w-96 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..."
              className="w-full bg-white dark:bg-[#121212] border border-black/5 dark:border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-foreground focus:outline-none focus:border-accent-orange transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="w-full lg:w-48 flex-shrink-0">
            <select 
              className="w-full bg-white dark:bg-[#121212] border border-black/5 dark:border-white/10 rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-accent-orange appearance-none"
              value={activeSort}
              onChange={(e) => setActiveSort(e.target.value)}
            >
              {SORTS.map(sort => <option key={sort} className="bg-white text-gray-900 dark:bg-[#121212] dark:text-white">{sort}</option>)}
            </select>
          </div>
        </motion.div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No products found for your search.</p>
            <Button className="mt-4" onClick={() => setSearchQuery('')}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <motion.div key={product.id} variants={fadeIn}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </SectionWrapper>
    </div>
  );
}
