import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Coffee } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { LAUNCH_DATE } from '../config';

function getTimeLeft() {
  const diff = new Date(LAUNCH_DATE).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    done: false,
  };
}

function CountdownUnit({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-16 sm:w-24 h-16 sm:h-24 rounded-2xl bg-slate-900 dark:bg-slate-800 border border-slate-700 flex items-center justify-center">
        <span className="text-2xl sm:text-4xl font-black text-white tabular-nums">
          {String(value).padStart(2, '0')}
        </span>
      </div>
      <span className="mt-2 text-xs sm:text-sm uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
        {label}
      </span>
    </div>
  );
}

export default function ComingSoon() {
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    const id = setInterval(() => setTime(getTimeLeft()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl mx-auto text-center space-y-10"
      >
        <div className="flex items-center justify-center gap-2">
          <img src="/favicon.png" alt="Tork3D Logo" className="h-8 w-8 object-contain" />
          <span className="font-display font-black text-2xl tracking-tight text-slate-900 dark:text-white">
            Tork<span className="text-accent-orange">3D</span>
          </span>
        </div>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-orange/10 text-accent-orange text-sm font-semibold">
            <Coffee className="w-4 h-4" />
            On a Short Break
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            We're taking a short break
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
            Our store is closed for a few days while we recharge. We'll be back and
            ready to print on <span className="font-bold text-slate-900 dark:text-white">25th June</span>.
            Thanks for your patience!
          </p>
        </div>

        {time.done ? (
          <p className="text-xl font-bold text-accent-orange">We're back! Refresh the page 🎉</p>
        ) : (
          <div className="flex items-center justify-center gap-3 sm:gap-5">
            <CountdownUnit value={time.days} label="Days" />
            <CountdownUnit value={time.hours} label="Hours" />
            <CountdownUnit value={time.minutes} label="Mins" />
            <CountdownUnit value={time.seconds} label="Secs" />
          </div>
        )}

        <div className="pt-2">
          <Link to="/early-access" className="inline-block">
            <Button size="lg" className="flex items-center justify-center gap-2">
              <Gift className="w-5 h-5" />
              Claim a Coupon for Reopening
            </Button>
          </Link>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Get a free name keychain + 10% off when we're back.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
