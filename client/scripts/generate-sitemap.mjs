// Generates public/sitemap.xml from the live product catalog. Runs
// automatically before every build (see package.json "prebuild"), so the
// sitemap can never go stale when products are added, removed, or repriced —
// a hand-maintained static file would need editing every time the catalog
// changes, which happens often on this project.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { products, productUrl } from '../src/data/products.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_URL = 'https://tork3d.in';

// Only stable, indexable routes — /cart is intentionally excluded (marked
// noindex in the app itself; no unique content Google should index).
const staticPages = [
  { path: '/', changefreq: 'weekly', priority: '1.0' },
  { path: '/shop', changefreq: 'daily', priority: '0.9' },
  { path: '/custom', changefreq: 'monthly', priority: '0.6' },
  { path: '/gallery', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
  { path: '/policies', changefreq: 'yearly', priority: '0.3' },
];

const productPages = products.map((p) => ({
  path: productUrl(p),
  changefreq: 'weekly',
  priority: '0.8',
}));

const allPages = [...staticPages, ...productPages];

const urlEntries = allPages
  .map(
    ({ path: p, changefreq, priority }) => `  <url>
    <loc>${SITE_URL}${p}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;

const outPath = path.join(__dirname, '../public/sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');
console.log(`sitemap.xml generated with ${allPages.length} URLs (${productPages.length} products) -> ${outPath}`);
