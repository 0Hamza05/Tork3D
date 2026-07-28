import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Truck, Shield, MessageCircle, ArrowLeft, ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionWrapper, fadeIn } from '../components/layout/SectionWrapper';
import { ProductCard } from '../components/ui/ProductCard';
import { products } from '../data/products';
import { useCart } from '../context/CartContext';
import { SEO } from '../components/SEO';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();
  const product = products.find(p => p.id === parseInt(id));
  const hasStyles = !!product?.styles?.length;
  const hasColors = !!product?.colorOptions?.length;
  // Colors are configured via named "slots": a product can expose one picker
  // (the default) or several (e.g. the Pagoda's stand + net). Falls back to a
  // single "Color" slot when the product doesn't define its own.
  const colorSlots = hasColors
    ? (product.colorSlots?.length ? product.colorSlots : [{ key: 'color', label: 'Color' }])
    : [];
  const defaultColors = () => Object.fromEntries(colorSlots.map(s => [s.key, product.colorOptions[0]]));
  const [selectedStyle, setSelectedStyle] = React.useState(product?.styles?.[0] ?? null);
  const [selectedColors, setSelectedColors] = React.useState(hasColors ? defaultColors() : {});
  const [activeImg, setActiveImg] = React.useState(0);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const prefersReduced = useReducedMotion();
  const videoRef = React.useRef(null);

  // Reset configuration/gallery selection when navigating to a different product
  React.useEffect(() => {
    setSelectedStyle(product?.styles?.[0] ?? null);
    setSelectedColors(hasColors ? defaultColors() : {});
    setActiveImg(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // The "effective" product reflects the chosen style + colors — used for cart
  // actions and display, so each configuration is tracked as its own cart line.
  const hasConfig = hasStyles || hasColors;
  const displayProduct = hasConfig
    ? {
        ...product,
        id: [
          product.id,
          selectedStyle?.id,
          ...colorSlots.map(s => selectedColors[s.key] && `${s.key}-${selectedColors[s.key].id}`),
        ].filter(Boolean).join('-'),
        name: [
          product.name,
          selectedStyle && `— ${selectedStyle.name}`,
          colorSlots.length > 0 && `(${colorSlots.map(s => `${s.label}: ${selectedColors[s.key]?.name ?? '—'}`).join(', ')})`,
        ].filter(Boolean).join(' '),
        image: selectedStyle?.image ?? product.image,
        images: selectedStyle?.images ?? product.images,
      }
    : product;

  const cartItem = cart.find(item => item.id === displayProduct?.id);

  // Cross-sell: if this product is part of a combo (e.g. a Superhero Fidget is
  // part of the Superhero Fidgets Pack), show the pack + the savings vs.
  // buying the pieces separately. Savings is computed from real catalog
  // prices, not hardcoded, so it can't drift if prices change.
  const comboProduct = product?.comboId ? products.find(p => p.id === product.comboId) : null;
  const comboSavings = comboProduct?.components
    ? comboProduct.components.reduce((sum, cid) => sum + (products.find(p => p.id === cid)?.price || 0), 0) - comboProduct.price
    : 0;

  React.useEffect(() => {
    setIsLoaded(false);
  }, [activeImg]);

  React.useEffect(() => {
    if (prefersReduced && videoRef.current) {
      videoRef.current.pause();
    }
  }, [prefersReduced]);

  const nextImg = () => {
    if (displayProduct?.images) setActiveImg(prev => (prev + 1) % displayProduct.images.length);
  };

  const prevImg = () => {
    if (displayProduct?.images) setActiveImg(prev => (prev - 1 + displayProduct.images.length) % displayProduct.images.length);
  };

  if (!product) {
    return (
      <div className="pt-32 min-h-screen text-center">
        <SEO title="Product Not Found" noindex />
        <h1 className="text-3xl font-bold mb-4">Product Not Found</h1>
        <Link to="/shop" className="text-accent-blue hover:underline">Return to Shop</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(displayProduct);
    toast.success(`${displayProduct.name} added to cart!`);
  };

  const handleBuyNow = () => {
    addToCart(displayProduct);
    navigate('/cart');
  };

  // Meta descriptions should stay short — trim long product descriptions
  // rather than letting Google truncate them mid-sentence in search results.
  const metaDescription = product.description.length > 160
    ? `${product.description.slice(0, 157)}...`
    : product.description;

  return (
    <div className="pt-24 min-h-screen">
      <SEO
        title={`${product.name} — ₹${product.price}`}
        description={metaDescription}
        image={product.image}
        path={`/product/${product.id}`}
      />
      <SectionWrapper className="pb-0">
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
              {displayProduct.images?.[activeImg]?.toLowerCase().endsWith('.mp4') ? (
                <video
                  ref={videoRef}
                  src={displayProduct.images[activeImg]}
                  controls
                  playsInline
                  autoPlay={!prefersReduced}
                  loop
                  onCanPlay={() => setIsLoaded(true)}
                  className={`w-full h-full object-contain transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
              ) : (
                <img
                  src={displayProduct.images[activeImg]}
                  alt={displayProduct.name}
                  onLoad={() => setIsLoaded(true)}
                  className={`w-full h-full object-contain transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
                />
              )}

              {displayProduct.images.length > 1 && (
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
              displayProduct.images.length === 1 ? 'grid-cols-1' :
              displayProduct.images.length === 2 ? 'grid-cols-2' :
              displayProduct.images.length === 3 ? 'grid-cols-3' :
              'grid-cols-4'
            }`}>
              {displayProduct.images.map((img, i) => {
                const isVid = img.toLowerCase().endsWith('.mp4');
                return (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1} of ${displayProduct.images.length}`}
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
            <div className="flex items-baseline gap-3 mb-6">
              {product.compareAtPrice && (
                <span className="text-lg text-slate-400 line-through">₹{product.compareAtPrice}</span>
              )}
              <span className="text-3xl font-light text-slate-900 dark:text-white">₹{product.price}</span>
              {product.compareAtPrice && (
                <span className="text-xs font-bold uppercase tracking-wide bg-red-600/15 text-red-600 dark:text-red-400 px-2 py-1 rounded">
                  {Math.round((product.compareAtPrice - product.price) / product.compareAtPrice * 100)}% OFF
                </span>
              )}
              {product.bundle && (
                <span className="text-xs font-bold uppercase tracking-wide bg-accent-orange/15 text-accent-orange px-2 py-1 rounded">{product.bundle.qty} for ₹{product.bundle.price}</span>
              )}
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>

            {hasStyles && (
              <div className="mb-6">
                <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Style: <span className="font-normal text-slate-500 dark:text-slate-400">{selectedStyle?.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  {product.styles.map(style => (
                    <button
                      key={style.id}
                      onClick={() => { setSelectedStyle(style); setActiveImg(0); }}
                      aria-label={`Select ${style.name} style`}
                      aria-pressed={selectedStyle?.id === style.id}
                      className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedStyle?.id === style.id
                          ? 'border-accent-blue ring-2 ring-accent-blue/30'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                      }`}
                    >
                      <img src={style.image} alt={style.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasColors && (
              <div className="mb-8 space-y-6">
                {colorSlots.map(slot => {
                  const value = selectedColors[slot.key];
                  return (
                    <div key={slot.key}>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                        {slot.label}: <span className="font-normal text-slate-500 dark:text-slate-400">{value?.name}</span>
                      </div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {product.colorOptions.map(color => (
                          <button
                            key={color.id}
                            onClick={() => setSelectedColors(prev => ({ ...prev, [slot.key]: color }))}
                            aria-label={`Select ${color.name} for ${slot.label}`}
                            aria-pressed={value?.id === color.id}
                            title={color.name}
                            className={`relative w-9 h-9 rounded-full border-2 transition-all ${
                              value?.id === color.id
                                ? 'border-accent-blue ring-2 ring-accent-blue/30 scale-110'
                                : 'border-slate-200 dark:border-slate-700 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color.hex }}
                          >
                            {value?.id === color.id && (
                              <Check className={`w-4 h-4 absolute inset-0 m-auto drop-shadow ${
                                ['white', 'yellow', 'light-blue', 'pink', 'lavender'].includes(color.id) ? 'text-slate-900' : 'text-white'
                              }`} />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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

            {comboProduct && (
              <Link
                to={`/product/${comboProduct.id}`}
                className="group flex items-center gap-3 mb-8 p-4 rounded-xl border-2 border-accent-orange/40 bg-accent-orange/5 hover:bg-accent-orange/10 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-accent-orange/15 flex items-center justify-center shrink-0">
                  <Gift className="w-5 h-5 text-accent-orange" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Get all 3 for ₹{comboProduct.price}
                    {comboSavings > 0 && <span className="text-green-600 dark:text-green-400"> — save ₹{comboSavings}</span>}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{comboProduct.name} · Batman, Spiderman &amp; Superman</p>
                </div>
                <ChevronRight className="w-5 h-5 text-accent-orange shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            )}

            {cartItem ? (
              <div className="space-y-4 mb-12">
                <div className="flex items-center gap-4 bg-secondary dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3 w-fit">
                  <span className="text-slate-600 dark:text-slate-300 text-sm font-semibold">Quantity in Cart:</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        if (cartItem.quantity > 1) {
                          updateQuantity(displayProduct.id, cartItem.quantity - 1);
                        } else {
                          removeFromCart(displayProduct.id);
                          toast.success(`${displayProduct.name} removed from cart.`);
                        }
                      }}
                      className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center font-bold text-slate-800 dark:text-white transition-colors text-lg"
                    >
                      -
                    </button>
                    <span className="font-bold text-slate-900 dark:text-white w-8 text-center text-lg">{cartItem.quantity}</span>
                    <button
                      onClick={() => updateQuantity(displayProduct.id, cartItem.quantity + 1)}
                      className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center font-bold text-slate-800 dark:text-white transition-colors text-lg"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      removeFromCart(displayProduct.id);
                      toast.success(`${displayProduct.name} removed from cart.`);
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
                    href="https://wa.me/+917073085538" 
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
                  href="https://wa.me/+917073085538" 
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

      {/* Related Products */}
      {(() => {
        const related = [
          ...products.filter(p => p.id !== product.id && p.category === product.category),
          ...products.filter(p => p.id !== product.id && p.category !== product.category),
        ].slice(0, 4);
        if (related.length === 0) return null;
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-32">
            <div className="border-t border-slate-200 dark:border-slate-800 pt-10">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">You Might Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {related.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
