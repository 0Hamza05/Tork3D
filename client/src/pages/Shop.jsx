import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronRight } from 'lucide-react';
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
    return b.id - a.id; // Newest = highest id first
  });

  return (
    <div className="pt-24 min-h-screen">
      <SectionWrapper>
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
          <Link to="/" className="hover:text-accent-blue transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 opacity-50" />
          <span className="text-slate-900 dark:text-white">Shop</span>
        </div>

        <motion.div variants={fadeIn} className="mb-12">
          <h1 className="text-5xl font-bold mb-4 text-slate-900 dark:text-white">Tork3D Shop</h1>
          <p className="text-xl text-slate-600 dark:text-slate-300">High-quality 3D printed parts, ready to ship.</p>
        </motion.div>

        {/* Search & Sort Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12">
          <div className="relative w-full md:w-96">
            <label htmlFor="product-search" className="sr-only">Search products</label>
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" aria-hidden="true" />
            <input
              id="product-search"
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-secondary dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-accent-blue text-slate-900 dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <Filter className="w-5 h-5 text-slate-500" />
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {SORTS.map(sort => (
                <button
                  key={sort}
                  onClick={() => setActiveSort(sort)}
                  aria-pressed={activeSort === sort}
                  className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSort === sort ? 'bg-accent-blue text-white' : 'bg-secondary dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'}`}
                >
                  {sort}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-xl text-slate-500 dark:text-slate-400">No products found matching "{searchQuery}"</h3>
          </div>
        )}

      </SectionWrapper>
    </div>
  );
}
