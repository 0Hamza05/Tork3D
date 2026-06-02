export const products = [
  {
    id: 1,
    name: 'Cigarette Shaped Bubble Blower',
    price: 399,
    weight: 150,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 13, w: 13, h: 8 }, // packed dims in cm
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
    price: 299,
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
  },
  {
    id: 4,
    name: 'Pokedex Magnetic Fidget',
    price: 249,
    weight: 25,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 12, w: 12, h: 3 }, // packed dims in cm
    category: 'Fidgets',
    material: 'PLA',
    image: '/Product Photos/Pokedex Fidget/Pokedex fidget - 1.jpeg',
    description: 'Satisfy your fidgeting needs with this Pokédex-themed magnetic fidget slider. Featuring smooth sliding feedback, tactile clicks, and strong neodymium magnets, it is the ultimate EDC pocket toy for Pokémon fans and fidget lovers alike.',
    highlights: [
      'Highly tactile magnetic sliding mechanism',
      'Pocket-sized and portable Everyday Carry (EDC)',
      'Iconic Pokédex-inspired red and white design',
      'Premium quality construction with strong neodymium magnets',
    ],
    images: [
      '/Product Photos/Pokedex Fidget/Pokedex fidget - 1.jpeg',
      '/Product Photos/Pokedex Fidget/Pokedex fidget - 2.jpeg',
      '/Product Photos/Pokedex Fidget/Pokedex fidget - 3.jpeg',
      '/Product Photos/Pokedex Fidget/Pokedex fidget - 4.jpeg',
    ],
    specs: {
      'Dimensions': '45 x 35 x 15 mm',
      'Weight': '25 g',
      'Material': 'PLA, Neodymium Magnets',
      'Lead Time': '2–4 Business Days',
    }
  },
  {
    id: 5,
    name: 'Batman Magnetic Fidget',
    price: 249,
    weight: 25,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 12, w: 12, h: 3 }, // packed dims in cm
    category: 'Fidgets',
    material: 'PLA',
    image: '/Product Photos/Batman Fidget/Batman fidget - 1.jpeg',
    description: 'Channel your inner dark knight with this Batman-themed magnetic fidget toy. Designed with a sleek bat logo shape, this tactile magnetic slider provides deeply satisfying haptic feedback to keep your hands busy and mind focused.',
    highlights: [
      'Sleek Dark Knight Bat-themed aesthetic',
      'Tactile haptic clicks and smooth slide action',
      'Durable PLA design with secure magnet placement',
      'Great stress-relieving tool for work or study',
    ],
    images: [
      '/Product Photos/Batman Fidget/Batman fidget - 1.jpeg',
      '/Product Photos/Batman Fidget/Batman fidget - 2.jpeg',
      '/Product Photos/Batman Fidget/Batman fidget - 3.jpeg',
      '/Product Photos/Batman Fidget/Batman fidget - 4.mp4',
    ],
    specs: {
      'Dimensions': '45 x 35 x 15 mm',
      'Weight': '25 g',
      'Material': 'PLA, Neodymium Magnets',
      'Lead Time': '2–4 Business Days',
    }
  },
  {
    id: 7,
    name: 'Screaming Whistle',
    price: 299,
    weight: 100,                          // dead weight in grams
    packageType: 'flyer',                  // 'box' | 'flyer'
    packageDimensions: { l: 13, w: 13, h: 8 }, // packed dims in cm (same as Cigarette Bubble Blower)
    category: 'Novelty',
    material: 'PLA',
    image: '/Product Photos/Screaming Whistle/Screaming Whistle - 1.jpeg',
    description: 'A hauntingly unique Mayan skull-shaped whistle that releases a blood-curdling scream when blown with force. Inspired by ancient Aztec death whistles, this eerie novelty piece produces a startlingly realistic human-scream sound that will shock anyone nearby. A jaw-dropping conversation starter and collector\'s item.',
    highlights: [
      'Authentic Mayan/Aztec death whistle design',
      'Produces a chilling human-like screaming sound',
      'Unique skull shape — great novelty gift or collector\'s item',
      'Lightweight and durable PLA construction',
    ],
    images: [
      '/Product Photos/Screaming Whistle/Screaming Whistle - 1.jpeg',
      '/Product Photos/Screaming Whistle/Screaming Whistle - 2.jpeg',
      '/Product Photos/Screaming Whistle/Screaming Whistle - 3.jpeg',
    ],
    specs: {
      'Dimensions': '43 x 33 x 32 mm',
      'Weight': '~50 g',
      'Lead Time': '2–4 Business Days',
    }
  },
  {
    id: 6,
    name: 'Spiderman Magnetic Fidget',
    price: 249,
    weight: 25,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 12, w: 12, h: 3 }, // packed dims in cm
    category: 'Fidgets',
    material: 'PLA',
    image: '/Product Photos/Spiderman Fidget/Spiderman fidget - 1.jpeg',
    description: 'Bring the web-slinger along on your daily routine with this Spiderman-themed magnetic fidget slider. Combining a sleek web-patterned red and black design with deeply tactile and responsive magnetic clicks, this is the perfect desk toy.',
    highlights: [
      'Spiderman web-patterned red and black styling',
      'Extremely satisfying magnetic feedback and slide',
      'Sturdy and lightweight pocket-friendly EDC',
      'Includes premium neodymium magnets for strong haptic feel',
    ],
    images: [
      '/Product Photos/Spiderman Fidget/Spiderman fidget - 1.jpeg',
      '/Product Photos/Spiderman Fidget/Spiderman fidget - 2.jpeg',
      '/Product Photos/Spiderman Fidget/Spiderman fidget - 3.jpeg',
      '/Product Photos/Spiderman Fidget/Spiderman fidget - 4.mp4',
    ],
    specs: {
      'Dimensions': '45 x 35 x 15 mm',
      'Weight': '25 g',
      'Material': 'PLA, Neodymium Magnets',
      'Lead Time': '2–4 Business Days',
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
