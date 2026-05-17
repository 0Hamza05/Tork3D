export const products = [
  {
    id: 1,
    name: 'Cigarette Shaped Bubble Blower',
    price: 399,
    weight: 40,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 12, w: 12, h: 3 }, // packed dims in cm
    category: 'Novelty',
    material: 'PLA',
    image: '/Product Photos/Cigrettes/Cigrette - 1.jpeg',
    description: 'A fun and unique cigarette-shaped bubble blower set. This novelty kit includes a custom-designed carrying case that perfectly fits 3 individual cigarette-shaped bubble blowers, making it highly portable and a hilarious conversation starter.',
    highlights: [
      'Set includes 1 carrying case and 3 bubble blowers',
      'Realistic novelty shape for a fun party trick',
      'Compact, pocket-sized, and highly portable',
      'Durable and lightweight PLA construction',
    ],
    images: [
      '/Product Photos/Cigrettes/Cigrette - 1.jpeg',
      '/Product Photos/Cigrettes/Cigrette - 2.jpeg',
      '/Product Photos/Cigrettes/Cigrette - 3.jpeg'
    ],
    specs: {
      'Dimensions': '85 x 35 x 15 mm (Case)',
      'Weight': '40 g',
      'Included': '1 Case, 3 Blowers',
      'Lead Time': '2–4 Business Days',
    }
  },
  {
    id: 2,
    name: 'Minecraft TNT Keychain',
    price: 50,
    weight: 10,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 12, w: 12, h: 3 }, // packed dims in cm
    category: 'Accessories',
    material: 'PLA',
    image: '/Product Photos/TNT Keychain/TNT Keychain - 1.jpeg',
    description: 'Bring a piece of your favorite block-building game wherever you go with this highly detailed Minecraft TNT block keychain. Perfect for backpacks, keys, or as a small gift for any gamer.',
    highlights: [
      'Accurate pixel-art aesthetic and coloring',
      'Includes a durable metal split ring for easy attachment',
      'Lightweight but extremely sturdy PLA construction',
      'Perfect gift for gamers and Minecraft fans'
    ],
    images: [
      '/Product Photos/TNT Keychain/TNT Keychain - 1.jpeg',
      '/Product Photos/TNT Keychain/TNT Keychain - 2.jpeg',
      '/Product Photos/TNT Keychain/TNT Keychain - 3.jpeg',
      '/Product Photos/TNT Keychain/TNT Keychain - 4.jpeg'
    ],
    specs: {
      'Dimensions': '20 x 20 x 20 mm',
      'Weight': '10 g',
      'Lead Time': '2–4 Business Days',
    }
  },
  {
    id: 3,
    name: 'Spiderman Hueforge',
    price: 250,
    weight: 30,                         // dead weight in grams
    packageType: 'box',                   // 'box' | 'flyer'
    packageDimensions: { l: 25, w: 25, h: 5 }, // packed dims in cm
    category: 'Art',
    material: 'PLA',
    image: '/Product Photos/Spiderman Hueforge/Spiderman Hueforge 1.jpeg',
    description: 'A stunning 3D printed painting of Spiderman created using Hueforge technology. The unique layer-blending technique creates a highly detailed, textured artwork perfect for any Marvel fan.',
    highlights: [
      'High-quality Hueforge 3D printing technology',
      'Unique textured depth and shading effect',
      'Sturdy PLA construction',
      'Perfect for wall mounting or desk display'
    ],
    images: [
      '/Product Photos/Spiderman Hueforge/Spiderman Hueforge 1.jpeg',
      '/Product Photos/Spiderman Hueforge/Spiderman Hueforge 2.jpeg'
    ],
    specs: {
      'Dimensions': '200 x 200 x 2 mm',
      'Weight': '30 g',
      'Lead Time': '3–5 Business Days',
    }
  }
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
