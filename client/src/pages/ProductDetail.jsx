import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Truck, Shield, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionWrapper, fadeIn } from '../components/layout/SectionWrapper';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = products.find(p => p.id === parseInt(id));
  const [activeImg, setActiveImg] = React.useState(0);

  const nextImg = () => {
    if (product?.images) setActiveImg(prev => (prev + 1) % product.images.length);
  };

  const prevImg = () => {
    if (product?.images) setActiveImg(prev => (prev - 1 + product.images.length) % product.images.length);
  };

  if (!product) {
    return (
      <div className="pt-32 min-h-screen text-center">
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <Link to="/shop" className="text-accent-blue hover:underline">Return to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    alert(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div className="pt-24 min-h-screen">
      <SectionWrapper>
        <Link to="/shop" className="inline-flex items-center text-slate-600 dark:text-slate-300 hover:text-accent-blue mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <motion.div variants={fadeIn} className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden glass-card border-none bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 group">
              <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover" />
              
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImg}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                  >
                    <ChevronLeft className="w-6 h-6 -ml-0.5" />
                  </button>
                  <button 
                    onClick={nextImg}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                  >
                    <ChevronRight className="w-6 h-6 ml-0.5" />
                  </button>
                </>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-accent-blue opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div variants={fadeIn} className="flex flex-col">
            <div className="text-sm text-accent-blue font-medium mb-2 uppercase tracking-wider">{product.category}</div>
            <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">{product.name}</h1>
            <div className="text-3xl font-light mb-6 text-slate-900 dark:text-white">₹{product.price}</div>

            <p className="text-slate-600 dark:text-slate-300 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Check className="w-5 h-5 text-green-600" /> In stock (Made to order)
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Truck className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Ships via Priority Mail
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Shield className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Quality Guarantee
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>Add to Cart</Button>
              <Button size="lg" variant="secondary" className="flex-1" onClick={handleBuyNow}>Buy Now</Button>
              <Button variant="outline" size="lg" asChild>
                <a href="https://wa.me/+919900390390" target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-[#25D366]" />
                  WhatsApp
                </a>
              </Button>
            </div>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800 pt-8 mb-8">
                <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">What's great about it</h3>
                <ul className="space-y-3">
                  {product.highlights.map((point, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                      <Check className="w-4 h-4 text-accent-orange mt-0.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Slim details strip */}
            {Object.keys(product.specs).length > 0 && (
              <div className="flex flex-wrap gap-4">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div key={key} className="bg-[rgb(var(--secondary-bg))] dark:bg-slate-800 rounded-xl px-5 py-3 border border-slate-200 dark:border-slate-800 text-center">
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">{key}</div>
                    <div className="font-semibold text-slate-900 dark:text-white text-sm">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </SectionWrapper>
    </div>
  );
}
