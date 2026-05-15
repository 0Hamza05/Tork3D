import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from './Button';
import { useCart } from '../../context/CartContext';

export function ProductCard({ product }) {
  const { addToCart } = useCart();

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  return (
    <Link to={`/product/${product.id}`} className="block">
      <motion.div 
        whileHover={{ y: -5 }}
        className="glass-card group overflow-hidden flex flex-col cursor-pointer"
      >
        <div className="relative aspect-square overflow-hidden bg-slate-50">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button 
              variant="primary" 
              size="sm" 
              className="rounded-full w-10 h-10 p-0"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="text-xs text-accent-blue font-medium mb-2 uppercase tracking-wider">{product.category}</div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between">
            <span className="text-xl font-bold text-slate-900">₹{product.price}</span>
            <span className="text-sm text-slate-500">{product.material}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
