import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Truck, Shield, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionWrapper, fadeIn } from '../components/layout/SectionWrapper';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const product = products.find(p => p.id === parseInt(id));
  const cartItem = cart.find(item => item.id === product?.id);
  const [activeImg, setActiveImg] = React.useState(0);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const prefersReduced = useReducedMotion();
  const videoRef = React.useRef(null);

  React.useEffect(() => {
    setIsLoaded(false);
  }, [activeImg]);

  React.useEffect(() => {
    if (prefersReduced && videoRef.current) {
      videoRef.current.pause();
    }
  }, [prefersReduced]);

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
    toast.success(`${product.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div className="pt-24 min-h-screen">
      <SectionWrapper>
        {/* Breadcrumbs Navigation */}
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium flex-wrap">
          <Link to="/" className="hover:text-accent-blue transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4 opacity-50" />
          <Link to="/shop" className="hover:text-accent-blue transition-colors">Shop</Link>
          <ChevronRight className="w-4 h-4 opacity-50" />
          <span className="text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <motion.div variants={fadeIn} className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden glass-card border-none bg-secondary dark:bg-slate-800 group">
              {!isLoaded && (
                <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-700" />
              )}
              {product.images?.[activeImg]?.toLowerCase().endsWith('.mp4') ? (
                <video
                  ref={videoRef}
                  src={product.images[activeImg]}
                  controls
                  playsInline
                  autoPlay={!prefersReduced}
                  loop
                  onCanPlay={() => setIsLoaded(true)}
                  className={`w-full h-full object-contain transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
              ) : (
                <img 
                  src={product.images[activeImg]} 
                  alt={product.name} 
                  onLoad={() => setIsLoaded(true)}
                  className={`w-full h-full object-contain transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`} 
                />
              )}
              
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    aria-label="Previous image"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-10"
                  >
                    <ChevronLeft className="w-6 h-6 -ml-0.5" />
                  </button>
                  <button
                    onClick={nextImg}
                    aria-label="Next image"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm z-10"
                  >
                    <ChevronRight className="w-6 h-6 ml-0.5" />
                  </button>
                </>
              )}
            </div>
            <div className={`grid gap-4 ${
              product.images.length === 1 ? 'grid-cols-1' :
              product.images.length === 2 ? 'grid-cols-2' :
              product.images.length === 3 ? 'grid-cols-3' :
              'grid-cols-4'
            }`}>
              {product.images.map((img, i) => {
                const isVid = img.toLowerCase().endsWith('.mp4');
                return (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1} of ${product.images.length}`}
                    className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all relative ${
                      activeImg === i ? 'border-accent-blue opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {isVid ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
                        <video src={img} muted className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <svg className="w-6 h-6 text-white drop-shadow" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    ) : (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                );
              })}
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
                <Truck className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Ships via Delhivery across India
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                <Shield className="w-5 h-5 text-slate-500 dark:text-slate-400" /> Quality Guarantee
              </div>
            </div>

            {cartItem ? (
              <div className="space-y-4 mb-12">
                <div className="flex items-center gap-4 bg-secondary dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 w-fit">
                  <span className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Quantity in Cart:</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        if (cartItem.quantity > 1) {
                          updateQuantity(product.id, cartItem.quantity - 1);
                        } else {
                          removeFromCart(product.id);
                          toast.success(`${product.name} removed from cart.`);
                        }
                      }}
                      className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center font-bold text-slate-800 dark:text-white transition-colors text-lg"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-900 dark:text-white w-8 text-center text-lg">{cartItem.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                      className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center font-bold text-slate-800 dark:text-white transition-colors text-lg"
                    >
                      +
                    </button>
                  </div>
                  <button 
                    onClick={() => {
                      removeFromCart(product.id);
                      toast.success(`${product.name} removed from cart.`);
                    }}
                    className="text-xs text-red-500 hover:text-red-600 ml-4 font-semibold hover:underline"
                  >
                    Remove
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="flex-1" onClick={() => navigate('/cart')}>
                    Go to Cart
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    asChild 
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2"
                    href="https://wa.me/+919900390390" 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    <MessageCircle className="w-5 h-5 text-whatsapp" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button size="lg" className="flex-1" onClick={handleBuyNow}>Buy Now</Button>
                <Button size="lg" variant="secondary" className="flex-1" onClick={handleAddToCart}>Add to Cart</Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  asChild
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2"
                  href="https://wa.me/+919900390390" 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <MessageCircle className="w-5 h-5 text-whatsapp" />
                  WhatsApp
                </Button>
              </div>
            )}

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
                  <div key={key} className="bg-secondary dark:bg-slate-800 rounded-xl px-5 py-3 border border-slate-200 dark:border-slate-800 text-center">
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
