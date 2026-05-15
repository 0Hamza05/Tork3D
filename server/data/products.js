export const products = [
  {
    id: 1,
    name: 'Pagoda Mini Tea Light Lantern',
    price: 500,
    weight: 85,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 12, w: 10, h: 10 }, // packed dims in cm
    category: 'Decor',
    material: 'PLA',
    image: '/Product Photos/Pagoda/Pagoda 1.jpeg',
    description: 'Inspired by traditional Japanese pagoda architecture, this miniature tea light lantern casts beautiful, intricate shadow patterns when lit. A stunning conversation piece for any home or desk.',
    highlights: [
      'Casts intricate shadow patterns when lit',
      'Designed to hold standard tea light candles',
      'Lightweight and stable base',
      'Available in multiple colours on request',
    ],
    images: [
      '/Product Photos/Pagoda/Pagoda 1.jpeg',
      '/Product Photos/Pagoda/Pagoda 2.jpeg'
    ],
    specs: {
      'Dimensions': '115 × 90 × 90 mm',
      'Weight': '85 g',
      'Lead Time': '3–5 Business Days',
    }
  },
  {
    id: 2,
    name: 'Custom RC Chassis',
    price: 120,
    weight: 600,
    packageType: 'box',
    packageDimensions: { l: 42, w: 22, h: 8 },
    category: 'Automotive',
    material: 'PETG',
    image: 'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800&q=80',
    description: 'A high-strength, impact-resistant RC chassis built for serious hobbyists. Designed with modular mounting points so you can swap components without reprinting the whole frame.',
    highlights: [
      'High-impact PETG for crash durability',
      'Modular motor and servo mount points',
      'Compatible with most 1/10 scale hardware',
      'Custom sizing available on request',
    ],
    images: [
      'https://images.unsplash.com/photo-1581092335397-9583eb92d232?w=800&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80',
    ],
    specs: {
      'Dimensions': '400 × 200 × 50 mm',
      'Weight': '600 g',
      'Lead Time': '5–7 Business Days',
    }
  },

];

/**
 * Calculate chargeable weight for a product (grams).
 * Delhivery uses divisor 5000: vol_weight_kg = (L*W*H cm) / 5000
 * So vol_weight_g = (L*W*H) / 5
 * Chargeable = max(deadWeight, volumetricWeight), rounded up to nearest 100g.
 */
export const chargeableWeight = (product, quantity = 1) => {
  const dead = (product.weight || 200) * quantity;
  const d = product.packageDimensions;
  const vol = d ? ((d.l * d.w * d.h) / 5) * quantity : dead;
  return Math.ceil(Math.max(dead, vol) / 100) * 100;
};
