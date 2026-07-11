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
    image: '/Product Photos/Cigrettes/Cigrette - 1_result.webp',
    description: 'A fun and unique cigarette-shaped bubble blower set. This novelty kit includes a custom-designed carrying case that perfectly fits 3 individual cigarette-shaped bubble blowers, making it highly portable and a hilarious conversation starter.',
    highlights: [
      'Set includes 1 carrying case and 3 bubble blowers',
      'Realistic novelty shape for a fun party trick',
      'Compact, pocket-sized, and highly portable',
      'Durable and lightweight PLA construction',
    ],
    images: [
      '/Product Photos/Cigrettes/Cigrette - 1_result.webp',
      '/Product Photos/Cigrettes/Cigrette - 2_result.webp',
      '/Product Photos/Cigrettes/Cigrette - 3_result.webp'
    ],
    specs: {
      'Dimensions': '85 x 35 x 15 mm (Case)',
      'Weight': '40 g',
      'Included': '1 Case, 3 Blowers',
      'Preparation Time (before dispatch)': '2–4 Business Days',
    }
  },
  {
    id: 2,
    name: 'Minecraft TNT Keychain',
    price: 79,
    bundle: { qty: 2, price: 140 },      // "2 for ₹140" deal
    weight: 10,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 13, w: 13, h: 8 }, // packed dims in cm
    category: 'Accessories',
    material: 'PLA',
    image: '/Product Photos/TNT Keychain/TNT Keychain - 1_result.webp',
    description: 'Bring a piece of your favorite block-building game wherever you go with this highly detailed Minecraft TNT block keychain. Perfect for backpacks, keys, or as a small gift for any gamer.',
    highlights: [
      'Accurate pixel-art aesthetic and coloring',
      'Includes a durable metal split ring for easy attachment',
      'Lightweight but extremely sturdy PLA construction',
      'Perfect gift for gamers and Minecraft fans'
    ],
    images: [
      '/Product Photos/TNT Keychain/TNT Keychain - 1_result.webp',
      '/Product Photos/TNT Keychain/TNT Keychain - 2_result.webp',
      '/Product Photos/TNT Keychain/TNT Keychain - 3_result.webp',
      '/Product Photos/TNT Keychain/TNT Keychain - 4_result.webp'
    ],
    specs: {
      'Dimensions': '20 x 20 x 20 mm',
      'Weight': '10 g',
      'Preparation Time (before dispatch)': '2–4 Business Days',
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
    image: '/Product Photos/Spiderman Hueforge/Spiderman Hueforge 1_result.webp',
    description: 'A stunning 3D printed painting of Spiderman created using Hueforge technology. The unique layer-blending technique creates a highly detailed, textured artwork perfect for any Marvel fan.',
    highlights: [
      'High-quality Hueforge 3D printing technology',
      'Unique textured depth and shading effect',
      'Sturdy PLA construction',
      'Perfect for wall mounting or desk display'
    ],
    images: [
      '/Product Photos/Spiderman Hueforge/Spiderman Hueforge 1_result.webp',
      '/Product Photos/Spiderman Hueforge/Spiderman Hueforge 2_result.webp'
    ],
    specs: {
      'Dimensions': '200 x 200 x 2 mm',
      'Weight': '30 g',
      'Preparation Time (before dispatch)': '3–5 Business Days',
    }
  },
  {
    id: 4,
    name: 'Pokedex Magnetic Fidget',
    price: 349,
    weight: 25,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 13, w: 13, h: 8 }, // packed dims in cm
    category: 'Fidgets',
    material: 'PLA',
    image: '/Product Photos/Fidgets/Pokedex Fidget/WhatsApp Image 2026-07-11 at 19.48.27_result.webp',
    description: 'Satisfy your fidgeting needs with this Pokédex-themed magnetic fidget slider. Featuring smooth sliding feedback, tactile clicks, and strong neodymium magnets, it is the ultimate EDC pocket toy for Pokémon fans and fidget lovers alike.',
    highlights: [
      'Highly tactile magnetic sliding mechanism',
      'Pocket-sized and portable Everyday Carry (EDC)',
      'Iconic Pokédex-inspired red and white design',
      'Premium quality construction with strong neodymium magnets',
    ],
    images: [
      '/Product Photos/Fidgets/Pokedex Fidget/WhatsApp Image 2026-07-11 at 19.48.27_result.webp',
      '/Product Photos/Fidgets/Pokedex Fidget/WhatsApp Image 2026-07-11 at 19.48.26_result.webp',
      '/Product Photos/Fidgets/Pokedex Fidget/WhatsApp Image 2026-07-11 at 19.48.26 (1)_result.webp',
      '/Product Photos/Fidgets/Pokedex Fidget/WhatsApp Video 2026-07-11 at 19.48.10.mp4',
    ],
    specs: {
      'Dimensions': '45 x 35 x 15 mm',
      'Weight': '25 g',
      'Material': 'PLA, Neodymium Magnets',
      'Preparation Time (before dispatch)': '2–4 Business Days',
    }
  },
  {
    id: 5,
    name: 'Batman Magnetic Fidget',
    price: 399,
    weight: 25,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 13, w: 13, h: 8 }, // packed dims in cm
    category: 'Fidgets',
    material: 'PLA',
    image: '/Product Photos/Fidgets/Batman Fidget/WhatsApp Image 2026-07-11 at 19.48.24_result.webp',
    description: 'Channel your inner dark knight with this Batman-themed magnetic fidget toy. Designed with a sleek bat logo shape, this tactile magnetic slider provides deeply satisfying haptic feedback to keep your hands busy and mind focused.',
    highlights: [
      'Sleek Dark Knight Bat-themed aesthetic',
      'Tactile haptic clicks and smooth slide action',
      'Durable PLA design with secure magnet placement',
      'Great stress-relieving tool for work or study',
    ],
    images: [
      '/Product Photos/Fidgets/Batman Fidget/WhatsApp Image 2026-07-11 at 19.48.24_result.webp',
      '/Product Photos/Fidgets/Batman Fidget/WhatsApp Image 2026-07-11 at 19.48.22 (2)_result.webp',
      '/Product Photos/Fidgets/Batman Fidget/WhatsApp Image 2026-07-11 at 19.48.23_result.webp',
      '/Product Photos/Fidgets/Batman Fidget/WhatsApp Video 2026-07-11 at 19.48.21.mp4',
    ],
    specs: {
      'Dimensions': '45 x 35 x 15 mm',
      'Weight': '25 g',
      'Material': 'PLA, Neodymium Magnets',
      'Preparation Time (before dispatch)': '2–4 Business Days',
    }
  },
  {
    id: 8,
    name: 'Cigarette Bubble Blower (2-Pack)',
    price: 249,
    weight: 100,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 13, w: 13, h: 8 }, // packed dims in cm
    category: 'Novelty',
    material: 'PLA',
    image: '/Product Photos/2 pack cigrette/Cig-1_result.webp',
    description: 'The classic cigarette-shaped bubble blower, now in a convenient 2-pack — no case needed. Each blower is realistically shaped like a cigarette and produces a stream of bubbles, making it a hilarious pocket prank and a guaranteed conversation starter wherever you go.',
    highlights: [
      'Set of 2 cigarette-shaped bubble blowers',
      'No case — slim, lightweight, and ready to carry',
      'Realistic novelty shape — perfect party trick',
      'Durable and lightweight PLA construction',
    ],
    images: [
      '/Product Photos/2 pack cigrette/Cig-1_result.webp',
      '/Product Photos/2 pack cigrette/Cig-2_result.webp',
      '/Product Photos/2 pack cigrette/Cig-3_result.webp',
      '/Product Photos/2 pack cigrette/Cig-4_result.webp',
      '/Product Photos/2 pack cigrette/Cig-5_result.webp',
    ],
    specs: {
      'Dimensions': '78 x 8 x 8 mm (per blower)',
      'Weight': '15 g',
      'Included': '2 Bubble Blowers',
      'Preparation Time (before dispatch)': '2–4 Business Days',
    }
  },
  {
    id: 6,
    name: 'Spiderman Magnetic Fidget',
    price: 399,
    weight: 25,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 13, w: 13, h: 8 }, // packed dims in cm
    category: 'Fidgets',
    material: 'PLA',
    image: '/Product Photos/Fidgets/Spiderman Fidget/WhatsApp Image 2026-07-11 at 19.48.22 (1)_result.webp',
    description: 'Bring the web-slinger along on your daily routine with this Spiderman-themed magnetic fidget slider. Combining a sleek web-patterned red and black design with deeply tactile and responsive magnetic clicks, this is the perfect desk toy.',
    highlights: [
      'Spiderman web-patterned red and black styling',
      'Extremely satisfying magnetic feedback and slide',
      'Sturdy and lightweight pocket-friendly EDC',
      'Includes premium neodymium magnets for strong haptic feel',
    ],
    images: [
      '/Product Photos/Fidgets/Spiderman Fidget/WhatsApp Image 2026-07-11 at 19.48.22 (1)_result.webp',
      '/Product Photos/Fidgets/Spiderman Fidget/WhatsApp Image 2026-07-11 at 19.48.21_result.webp',
      '/Product Photos/Fidgets/Spiderman Fidget/WhatsApp Image 2026-07-11 at 19.48.22_result.webp',
      '/Product Photos/Fidgets/Spiderman Fidget/WhatsApp Video 2026-07-11 at 19.48.21 (1).mp4',
    ],
    specs: {
      'Dimensions': '45 x 35 x 15 mm',
      'Weight': '25 g',
      'Material': 'PLA, Neodymium Magnets',
      'Preparation Time (before dispatch)': '2–4 Business Days',
    }
  },
  {
    id: 7,
    name: 'Screaming Whistle',
    price: 299,
    weight: 100,                          // dead weight in grams
    packageType: 'flyer',                  // 'box' | 'flyer'
    packageDimensions: { l: 13, w: 13, h: 8 }, // packed dims in cm
    category: 'Novelty',
    material: 'PLA',
    image: '/Product Photos/Screaming Whistle/Screaming Whistle - 1_result.webp',
    description: 'A hauntingly unique Mayan skull-shaped whistle that releases a blood-curdling scream when blown with force. Inspired by ancient Aztec death whistles, this eerie novelty piece produces a startlingly realistic human-scream sound that will shock anyone nearby. A jaw-dropping conversation starter and collector\'s item.',
    highlights: [
      'Authentic Mayan/Aztec death whistle design',
      'Produces a chilling human-like screaming sound',
      'Unique skull shape — great novelty gift or collector\'s item',
      'Lightweight and durable PLA construction',
    ],
    images: [
      '/Product Photos/Screaming Whistle/Screaming Whistle - 1_result.webp',
      '/Product Photos/Screaming Whistle/Screaming Whistle - 2_result.webp',
      '/Product Photos/Screaming Whistle/Screaming Whistle - 3_result.webp',
    ],
    specs: {
      'Dimensions': '43 x 33 x 32 mm',
      'Weight': '~15 g',
      'Preparation Time (before dispatch)': '2–4 Business Days',
    }
  },
  {
    id: 9,
    name: 'Japanese Pagoda Lantern',
    price: 649,
    weight: 200,                          // package (dead) weight in grams
    packageType: 'box',                    // 'box' | 'flyer'
    packageDimensions: { l: 11, w: 11, h: 15 }, // packed dims in cm
    category: 'Decor',
    material: 'PLA',
    image: '/Product Photos/Pagoda/Type 1/Pagoda 1_result.webp',
    description: 'A beautifully detailed Japanese-style pagoda lantern with a built-in warm-glow LED light. Its intricately latticed windows cast a soft, cozy glow, making it a striking centerpiece for any desk, shelf, or bedside table.',
    highlights: [
      'Includes a built-in warm-white LED light',
      'Intricately latticed windows for a soft ambient glow',
      'Elegant pagoda-inspired silhouette with fine roof detailing',
      'Durable PLA construction, perfect as a gift or decor piece',
    ],
    images: [
      '/Product Photos/Pagoda/Type 1/Pagoda 1_result.webp',
      '/Product Photos/Pagoda/Type 1/Pagoda 2_result.webp',
    ],
    specs: {
      'Dimensions': '90 x 90 x 110 mm',
      'Weight': '150 g',
      'Included': '1 Lantern, 1 LED Light',
      'Preparation Time (before dispatch)': '3–5 Business Days',
    },
    // Roof style — each style has its own reference photos
    styles: [
      {
        id: 'double-roof',
        name: 'Double Roof',
        image: '/Product Photos/Pagoda/Type 1/Pagoda 1_result.webp',
        images: [
          '/Product Photos/Pagoda/Type 1/Pagoda 1_result.webp',
          '/Product Photos/Pagoda/Type 1/Pagoda 2_result.webp',
        ],
      },
      {
        id: 'single-roof',
        name: 'Single Roof',
        image: '/Product Photos/Pagoda/Type 2/Pagoda 1_result.webp',
        images: [
          '/Product Photos/Pagoda/Type 2/Pagoda 1_result.webp',
          '/Product Photos/Pagoda/Type 2/Pagoda 2_result.webp',
        ],
      },
    ],
    // Shared color palette — customer picks an independent color for the main
    // stand and for the lattice "net" windows (made-to-order PLA prints).
    colorSlots: [
      { key: 'stand', label: 'Main Stand Color' },
      { key: 'net', label: 'Net (Lattice) Color' },
    ],
    colorOptions: [
      { id: 'red', name: 'Red', hex: '#DC2626' },
      { id: 'white', name: 'White', hex: '#F8FAFC' },
      { id: 'black', name: 'Black', hex: '#1F2937' },
      { id: 'yellow', name: 'Yellow', hex: '#FACC15' },
      { id: 'light-blue', name: 'Light Blue', hex: '#7DD3FC' },
      { id: 'dark-gray', name: 'Dark Gray', hex: '#4B5563' },
      { id: 'brown', name: 'Brown', hex: '#78350F' },
      { id: 'pink', name: 'Pink', hex: '#F472B6' },
      { id: 'lavender', name: 'Lavender', hex: '#C4B5FD' },
      { id: 'dark-green', name: 'Dark Green', hex: '#166534' },
    ],
  },
  {
    id: 10,
    name: 'Double Barrel Shotgun Keychain',
    price: 299,
    weight: 100,                          // package (dead) weight in grams
    packageType: 'flyer',                  // 'box' | 'flyer'
    packageDimensions: { l: 13, w: 13, h: 8 }, // packed dims in cm
    category: 'Novelty',
    material: 'PLA',
    image: '/Product Photos/Shotgun Keychain/Shotgun1_result.webp',
    description: 'A miniature double-barrel shotgun keychain with a working spring-loaded mechanism that actually fires small BBs. Pull back, take aim, and let it rip — a genuinely fun, functional novelty piece that doubles as a sturdy keychain.',
    highlights: [
      'Functional spring-loaded firing mechanism — shoots small BBs',
      'Intricately detailed double-barrel shotgun design',
      'Compact and pocket-sized, perfect for keys or bags',
      'Durable PLA construction built to handle everyday use',
    ],
    images: [
      '/Product Photos/Shotgun Keychain/Shotgun1_result.webp',
      '/Product Photos/Shotgun Keychain/Shotgun2_result.webp',
      '/Product Photos/Shotgun Keychain/Shotgun3_result.webp',
      '/Product Photos/Shotgun Keychain/Shotgun4_result.webp',
    ],
    specs: {
      'Dimensions': '60 x 30 x 30 mm',
      'Weight': '35 g',
      'Included': '1 Keychain, Spring-loaded BBs',
      'Preparation Time (before dispatch)': '2–4 Business Days',
    }
  },
  {
    id: 11,
    name: 'Name Keychain',
    price: 79,
    engravable: true,                    // customer must supply a name to engrave at checkout
    weight: 10,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 13, w: 13, h: 8 }, // packed dims in cm
    category: 'Accessories',
    material: 'PLA',
    image: '/Product Photos/Name Keychain/Name Keychain_result.webp',
    description: 'A personalized 3D-printed name keychain. Just send us the name you want and we will print it for you — a simple, thoughtful accessory for keys, bags, or as a small gift.',
    highlights: [
      'Personalized with the name of your choice',
      'Includes a durable metal split ring for easy attachment',
      'Lightweight but sturdy PLA construction',
      'Makes a great low-cost personalized gift'
    ],
    images: [
      '/Product Photos/Name Keychain/Name Keychain_result.webp'
    ],
    specs: {
      'Dimensions': '20 x 20 x 20 mm',
      'Weight': '10 g',
      'Preparation Time (before dispatch)': '2–4 Business Days',
    }
  },
  {
    id: 12,
    name: 'Infinity Cube',
    price: 249,
    weight: 40,                          // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 13, w: 13, h: 8 }, // packed dims in cm
    category: 'Fidgets',
    material: 'PLA',
    image: '/Product Photos/Infinity Cube/Infinity-cube-1_result.webp',
    description: 'A satisfying 3D-printed infinity cube — fold it endlessly in your hand for a smooth, stress-melting fidget. Compact, quiet, and the perfect everyday-carry desk toy or thoughtful little gift.',
    highlights: [
      'Endless folding motion for calming, repetitive fidgeting',
      'Smooth, quiet hinges — discreet enough for desk or class',
      'Pocket-sized everyday-carry (EDC) form factor',
      'Made to order in your choice of colour',
    ],
    images: [
      '/Product Photos/Infinity Cube/Infinity-cube-1_result.webp',
      '/Product Photos/Infinity Cube/infinity-cube-2_result.webp',
      '/Product Photos/Infinity Cube/infinity-cube-3.mp4',
    ],
    specs: {
      'Dimensions': '40 x 40 x 40 mm',
      'Weight': '40 g',
      'Material': 'PLA',
      'Preparation Time (before dispatch)': '2–4 Business Days',
    },
    colorOptions: [
      { id: 'red', name: 'Red', hex: '#DC2626' },
      { id: 'white', name: 'White', hex: '#F8FAFC' },
      { id: 'black', name: 'Black', hex: '#1F2937' },
      { id: 'yellow', name: 'Yellow', hex: '#FACC15' },
      { id: 'light-blue', name: 'Light Blue', hex: '#7DD3FC' },
      { id: 'dark-gray', name: 'Dark Gray', hex: '#4B5563' },
      { id: 'brown', name: 'Brown', hex: '#78350F' },
      { id: 'pink', name: 'Pink', hex: '#F472B6' },
      { id: 'lavender', name: 'Lavender', hex: '#C4B5FD' },
      { id: 'dark-green', name: 'Dark Green', hex: '#166534' },
    ],
  },
  {
    id: 13,
    name: 'Superman Magnetic Fidget',
    price: 399,
    weight: 25,                         // dead weight in grams
    packageType: 'flyer',                 // 'box' | 'flyer'
    packageDimensions: { l: 13, w: 13, h: 8 }, // packed dims in cm
    category: 'Fidgets',
    material: 'PLA',
    image: '/Product Photos/Fidgets/Superman Fidget/WhatsApp Image 2026-07-11 at 19.48.25 (1)_result.webp',
    description: 'Suit up with this Superman-themed magnetic fidget slider. Featuring the iconic red, blue, and yellow S-shield design, this tactile magnetic slider delivers deeply satisfying haptic clicks to keep your hands busy and your focus sharp.',
    highlights: [
      'Iconic Man of Steel S-shield styling',
      'Tactile haptic clicks and smooth slide action',
      'Durable PLA design with secure magnet placement',
      'Great stress-relieving tool for work or study',
    ],
    images: [
      '/Product Photos/Fidgets/Superman Fidget/WhatsApp Image 2026-07-11 at 19.48.25 (1)_result.webp',
      '/Product Photos/Fidgets/Superman Fidget/WhatsApp Image 2026-07-11 at 19.48.24 (1)_result.webp',
      '/Product Photos/Fidgets/Superman Fidget/WhatsApp Image 2026-07-11 at 19.48.25_result.webp',
      '/Product Photos/Fidgets/Superman Fidget/WhatsApp Video 2026-07-11 at 19.48.12.mp4',
    ],
    specs: {
      'Dimensions': '45 x 35 x 15 mm',
      'Weight': '25 g',
      'Material': 'PLA, Neodymium Magnets',
      'Preparation Time (before dispatch)': '2–4 Business Days',
    }
  },
  {
    id: 14,
    name: 'Superhero Fidgets Pack',
    price: 999,
    weight: 75,                          // dead weight in grams (3 fidgets)
    packageType: 'box',                    // 'box' | 'flyer'
    packageDimensions: { l: 15, w: 15, h: 8 }, // packed dims in cm
    category: 'Fidgets',
    material: 'PLA',
    image: '/Product Photos/Fidgets/Superhero Fidgets Pack/WhatsApp Image 2026-07-11 at 19.48.00_result.webp',
    description: 'The ultimate trio — get the Batman, Spiderman, and Superman magnetic fidget sliders together in one combo pack, at a price better than buying them separately. Same tactile magnetic clicks and durable PLA build across all three, now in one satisfying bundle.',
    highlights: [
      'Includes Batman, Spiderman, and Superman magnetic fidgets',
      'Save over buying all three individually',
      'Same deeply tactile magnetic haptic feedback on every piece',
      'Makes a great gift set for fidget and superhero fans alike',
    ],
    images: [
      '/Product Photos/Fidgets/Superhero Fidgets Pack/WhatsApp Image 2026-07-11 at 19.48.00_result.webp',
      '/Product Photos/Fidgets/Superhero Fidgets Pack/WhatsApp Image 2026-07-11 at 19.48.01_result.webp',
      '/Product Photos/Fidgets/Superhero Fidgets Pack/WhatsApp Image 2026-07-11 at 19.48.02_result.webp',
    ],
    specs: {
      'Dimensions': '45 x 35 x 15 mm (each)',
      'Weight': '75 g (set of 3)',
      'Included': '1 Batman, 1 Spiderman, 1 Superman Fidget',
      'Material': 'PLA, Neodymium Magnets',
      'Preparation Time (before dispatch)': '2–4 Business Days',
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

/**
 * Line total (₹) for a product at a given quantity, honoring any bundle deal
 * (e.g. TNT keychain "2 for ₹99"): each full bundle costs bundle.price, the
 * remainder is charged at the unit price. No bundle → unit price × quantity.
 */
export const lineTotal = (product, quantity = 1) => {
  if (product && product.bundle && product.bundle.qty > 0) {
    const bundles = Math.floor(quantity / product.bundle.qty);
    const remainder = quantity % product.bundle.qty;
    return bundles * product.bundle.price + remainder * product.price;
  }
  return (product ? product.price : 0) * quantity;
};
