import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './Button';
import { useCart } from '../../context/CartContext';

export function ProductCard({ product }) {
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const cartItem = cart.find(item => item.id === product.id);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const needsConfig = !!(product.styles?.length || product.colorOptions?.length);
  // Discount % is computed from the real prices, not hardcoded, so it can't
  // drift out of sync if either price changes later.
  const discountPercent = product.compareAtPrice
    ? Math.round((product.compareAtPrice - product.price) / product.compareAtPrice * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (needsConfig) {
      // This product has style/color options — send to product page to configure
      navigate(`/product/${product.id}`);
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <Link to={`/product/${product.id}`} className="block">
      <motion.div 
        whileHover={{ y: -5 }}
        className="glass-card group overflow-hidden flex flex-col cursor-pointer"
      >
        <div className="relative aspect-square overflow-hidden bg-slate-50 dark:bg-slate-800">
          {discountPercent > 0 && (
            <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
              {discountPercent}% OFF
            </span>
          )}
          {cartItem && (
            <span className="absolute top-3 right-3 z-10 bg-green-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-sm bg-green-600/95">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {cartItem.quantity} In Cart
            </span>
          )}
          {!isLoaded && (
            <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />
          )}
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${isLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'}`}
          />
          <div className="absolute inset-0 bg-slate-900/15 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            {cartItem ? (
              <>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="rounded-full w-8 h-8 p-0 text-sm font-bold bg-slate-800 hover:bg-slate-700 flex items-center justify-center"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (cartItem.quantity > 1) {
                      updateQuantity(product.id, cartItem.quantity - 1);
                    } else {
                      removeFromCart(product.id);
                      toast.success(`${product.name} removed from cart.`);
                    }
                  }}
                >
                  -
                </Button>
                <span className="text-white font-bold bg-black/60 px-3 py-1 rounded-lg text-sm backdrop-blur-sm select-none">
                  {cartItem.quantity}
                </span>
                <Button 
                  variant="primary" 
                  size="sm" 
                  className="rounded-full w-8 h-8 p-0 text-sm font-bold bg-accent-blue flex items-center justify-center"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    updateQuantity(product.id, cartItem.quantity + 1);
                  }}
                >
                  +
                </Button>
              </>
            ) : (
              <Button 
                variant="primary" 
                size="sm" 
                className="rounded-full w-10 h-10 p-0"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
          <div className="text-xs text-accent-blue font-medium mb-2 uppercase tracking-wider">{product.category}</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{product.name}</h3>
          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              {product.compareAtPrice && (
                <span className="text-sm text-slate-400 line-through">₹{product.compareAtPrice}</span>
              )}
              <span className="text-xl font-bold text-slate-900 dark:text-white">₹{product.price}</span>
              {product.bundle && (
                <span className="text-[10px] font-bold uppercase tracking-wide bg-accent-orange/15 text-accent-orange px-1.5 py-0.5 rounded">{product.bundle.qty} for ₹{product.bundle.price}</span>
              )}
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">{product.material}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
