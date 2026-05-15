import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { SectionWrapper, fadeIn } from '../components/layout/SectionWrapper';

// Automatically load all images from the src/assets/gallery folder
const imageModules = import.meta.glob('../assets/gallery/*.{jpg,jpeg,png,webp,gif}', { eager: true });
const GALLERY = Object.values(imageModules).map(module => module.default);

export default function Gallery() {
  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <div className="pt-24 min-h-screen">
      <SectionWrapper>
        <motion.div variants={fadeIn} className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl font-bold mb-4 text-slate-900">Our Work</h1>
          <p className="text-xl text-slate-600">A showcase of custom parts, prototypes, and prints made by Tork3D.</p>
        </motion.div>

        {/* Masonry-style Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {GALLERY.map((img, idx) => (
            <motion.div
              key={idx}
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className="relative group rounded-2xl overflow-hidden cursor-pointer"
              onClick={() => setSelectedImg(img)}
            >
              <img src={img} alt="Gallery item" className="w-full h-auto object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionWrapper>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedImg(null)}
          >
            <button
              className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              onClick={() => setSelectedImg(null)}
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImg}
              alt="Enlarged gallery item"
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
