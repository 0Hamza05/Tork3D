import React, { useMemo, useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Settings, Clock, Layers, ShieldCheck, PenTool, Cpu, Circle, Gift } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionWrapper, fadeIn } from '../components/layout/SectionWrapper';
import { ProductCard } from '../components/ui/ProductCard';
import { products } from '../data/products';

// Pull in all gallery images + every product image for the hero carousel
const galleryModules = import.meta.glob('../assets/gallery/**/*.{jpg,jpeg,png,webp,gif,JPG,JPEG,PNG,WEBP}', { eager: true });
const GALLERY_IMGS = Object.values(galleryModules).map(m => m.default).filter(Boolean);
const PRODUCT_IMGS = products
  .map(p => p.image)
  .filter(src => src && /\.(jpe?g|png|webp|gif)$/i.test(src));

const FEATURES = [
  { icon: Settings, title: 'Precision',           desc: 'Down to 0.08mm layer height' },
  { icon: Clock,    title: 'Fast Turnaround',     desc: 'Quick dispatch on every order' },
  { icon: Layers,   title: 'CAD Support',         desc: 'Dedicated engineering team' },
  { icon: ShieldCheck, title: 'Reliability',      desc: 'Quality control on every print' },
  { icon: Cpu,      title: 'Engineered Materials', desc: 'PLA, PETG, and TPU' },
  { icon: PenTool,  title: 'Customization',       desc: 'From idea to final product' },
];

// ── Hero Carousel ──────────────────────────────────────────────────────────
function HeroCarousel({ prefersReduced }) {
  const imgs = useMemo(() => [...GALLERY_IMGS, ...PRODUCT_IMGS], []);
  const [current, setCurrent] = useState(0);

  // Auto-advance every 3 seconds
  useEffect(() => {
    if (prefersReduced || imgs.length === 0) return;
    const id = setInterval(() => {
      setCurrent(c => (c + 1) % imgs.length);
    }, 3000);
    return () => clearInterval(id);
  }, [imgs.length, prefersReduced]);

  if (imgs.length === 0) return null;

  return (
    <motion.div
      className="hidden lg:block relative h-[560px] xl:h-[640px] rounded-lg overflow-hidden"
      initial={{ opacity: prefersReduced ? 1 : 0, scale: prefersReduced ? 1 : 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={prefersReduced ? { duration: 0 } : { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
    >
      {imgs.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
          loading={i === 0 ? 'eager' : 'lazy'}
        />
      ))}

      {/* Orange gradient wash at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-accent-orange/20 via-transparent to-transparent pointer-events-none" />

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {imgs.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'bg-white w-4' : 'bg-white/40'
            }`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="flex flex-col w-full">

      {/* ── Coupon promo banner ──────────────────────────────────── */}
      <Link
        to="/shop"
        className="group block bg-accent-orange hover:bg-orange-600 transition-colors"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-center gap-2.5 text-center">
          <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
          </span>
          <Gift className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
          <p className="text-xs sm:text-sm font-semibold text-white">
            <span className="font-bold">Early-access coupons are now live!</span>
            <span className="hidden sm:inline"> Apply yours at checkout for 10% off plus a free name keychain.</span>
          </p>
          <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-white whitespace-nowrap underline-offset-2 group-hover:underline">
            Shop now <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-canvas dark:bg-canvas-dark">

        {/* Engineering grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none dark:block hidden"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-32 lg:py-0 lg:min-h-screen flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_460px] xl:grid-cols-[1fr_540px] gap-12 xl:gap-20 items-center w-full">

            {/* Left: text */}
            <div>
              <motion.div
                initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReduced ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2.5 mb-10"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-orange flex-shrink-0" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-[0.18em]">
                  Now accepting custom orders
                </span>
              </motion.div>

              <motion.h1
                className="font-display font-black leading-[0.88] tracking-tight text-slate-900 dark:text-white mb-8"
                style={{ fontSize: 'clamp(64px, 10vw, 128px)' }}
                initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReduced ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
              >
                Precision<br />
                <span className="text-accent-orange">3D</span><br />
                Printing.
              </motion.h1>

              <motion.p
                className="text-lg text-slate-500 dark:text-slate-400 max-w-[38ch] mb-10 leading-relaxed"
                initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReduced ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.18 }}
              >
                Industrial-grade materials, 0.08mm layer height, quality-checked on every print. Made in India.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 pb-20 sm:pb-0"
                initial={{ opacity: prefersReduced ? 1 : 0, y: prefersReduced ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={prefersReduced ? { duration: 0 } : { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.26 }}
              >
                <Link to="/custom">
                  <Button size="lg" className="group">
                    Request a Quote
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/shop">
                  <Button variant="secondary" size="lg">
                    Browse Products
                  </Button>
                </Link>
              </motion.div>
            </div>

            {/* Right: scrolling image carousel */}
            <HeroCarousel prefersReduced={prefersReduced} />

          </div>
        </div>
      </section>

      {/* ── Marquee spec strip ───────────────────────────────────── */}
      <div className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden py-3.5 select-none">
        <div className="marquee-track" aria-hidden="true">
          {[...Array(2)].map((_, pass) => (
            <div key={pass} className="flex items-center shrink-0">
              {[
                'PLA', 'PETG', 'TPU',
                '0.08 mm precision', 'Fast dispatch',
                'Custom prints', 'Made in India',
                'Same-day quotes', 'CAD support',
                'Quality checked',
              ].map((item) => (
                <React.Fragment key={item}>
                  <span className="font-display font-bold text-sm uppercase tracking-widest text-slate-800 dark:text-slate-200 whitespace-nowrap px-6">
                    {item}
                  </span>
                  <span className="text-accent-orange text-xs" aria-hidden="true">◆</span>
                </React.Fragment>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Featured Products ────────────────────────────────────── */}
      <SectionWrapper>
        <div className="flex justify-between items-end mb-10">
          <motion.div variants={fadeIn}>
            <h2 className="font-display font-black text-4xl md:text-5xl text-slate-900 dark:text-white leading-tight">
              Featured Products
            </h2>
          </motion.div>
          <Link
            to="/shop"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-accent-orange hover:text-accent-orange/80 transition-colors"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <Link
          to="/shop"
          className="sm:hidden mt-8 flex justify-center items-center gap-1.5 text-sm font-semibold text-accent-orange hover:text-accent-orange/80 transition-colors"
        >
          View all products <ArrowRight className="w-4 h-4" />
        </Link>
      </SectionWrapper>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <SectionWrapper>
        <motion.div variants={fadeIn} className="mb-12">
          <h2 className="font-display font-black text-4xl md:text-5xl text-slate-900 dark:text-white leading-tight">
            How it works
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3">
          {[
            {
              n: '01',
              title: 'Browse or upload',
              desc: 'Order from our ready-to-ship catalog, or submit your own design and specs via the custom order form.',
            },
            {
              n: '02',
              title: 'We print with precision',
              desc: 'Your order enters our print farm. Every part is dimensionally checked and quality-reviewed before packing.',
            },
            {
              n: '03',
              title: 'Delivered across India',
              desc: 'Shipped via Delhivery with live tracking. Prepaid or cash on delivery — your choice at checkout.',
            },
          ].map(({ n, title, desc }) => (
            <motion.div
              key={n}
              variants={fadeIn}
              className="flex gap-5 py-8 md:py-0 md:px-10 md:flex-col border-b md:border-b-0 md:border-l border-slate-200 dark:border-slate-800 first:border-l-0 first:md:pl-0 last:border-b-0"
            >
              <div className="font-display font-black text-6xl md:text-7xl text-slate-300 dark:text-slate-600 leading-none select-none shrink-0 md:mb-4">
                {n}
              </div>
              <div className="pt-1">
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-2 leading-tight">
                  {title}
                </h3>
                <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed">
                  {desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* ── Why Tork3D ───────────────────────────────────────────── */}
      <SectionWrapper className="bg-secondary dark:bg-slate-900/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div variants={fadeIn}>
            <h2 className="font-display font-black text-4xl md:text-5xl text-slate-900 dark:text-white leading-tight mb-4">
              Why Tork3D
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400 max-w-[34ch] leading-relaxed">
              Top-tier technology and engineering expertise, from first prototype to final product.
            </p>
          </motion.div>

          <dl className="divide-y divide-slate-200 dark:divide-slate-800">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeIn}
                  className="flex items-center gap-6 py-5 first:pt-0 last:pb-0"
                >
                  <Icon className="w-5 h-5 text-accent-orange shrink-0" />
                  <div className="flex-1 min-w-0">
                    <dt className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                      {feature.title}
                    </dt>
                    <dd className="text-base text-slate-500 dark:text-slate-400 mt-0.5">{feature.desc}</dd>
                  </div>
                </motion.div>
              );
            })}
          </dl>
        </div>
      </SectionWrapper>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="bg-accent-orange">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeIn}
            className="max-w-2xl"
          >
            <h2 className="font-display font-black text-5xl md:text-6xl xl:text-7xl text-white leading-[0.92] tracking-tight mb-6">
              Ready to print your idea?
            </h2>
            <p className="text-orange-100 text-lg mb-10 max-w-[42ch] leading-relaxed">
              Upload your STL file, choose your specs, and get a quote within the hour.
            </p>
            <Link to="/custom" className="inline-block">
              <Button
                size="lg"
                className="bg-white text-accent-orange hover:bg-orange-50 shadow-none font-bold"
              >
                Request a Custom Print
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
