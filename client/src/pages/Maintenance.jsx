import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionWrapper } from '../components/layout/SectionWrapper';
import { SEO } from '../components/SEO';

export default function Maintenance() {
  return (
    <div className="pt-24 min-h-screen flex items-center">
      <SEO title="Under Maintenance" noindex />
      <SectionWrapper>
        <div className="flex flex-col items-center justify-center text-center space-y-6 py-20 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-accent-orange/10 rounded-full flex items-center justify-center">
            <Wrench className="w-10 h-10 text-accent-orange" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">We'll be right back</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Our shop is currently down for a bit of maintenance. We're working hard to get things back
            up and running — please check back again soon!
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Need something urgently? Reach out to us on WhatsApp and we'll help you out directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link to="/" className="flex-1">
              <Button size="lg" className="w-full">Back to Home</Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="flex-1 flex items-center justify-center gap-2"
              href="https://wa.me/+917073085538"
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="w-5 h-5 text-whatsapp" />
              WhatsApp
            </Button>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
