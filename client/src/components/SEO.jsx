import { useEffect } from 'react';

const SITE_NAME = 'Tork3D';
const SITE_URL = 'https://tork3d.in';
const DEFAULT_TITLE = 'Tork3D - Custom 3D Printing & Engineering Solutions';
const DEFAULT_DESCRIPTION = 'Tork3D offers premium custom 3D printing and engineering solutions. Rapid prototyping, fast turnaround, and high-quality materials including PLA, PETG, and TPU.';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.png`;

// Creates (once) or updates a <head> tag matching `selector`, setting the
// given attributes on it.
const upsertTag = (tagName, selector, attrs) => {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(tagName);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
};

// Sets the per-route <title>, meta description, canonical URL, and Open
// Graph/Twitter tags. Without this every route shared the exact same static
// tags from index.html, so Google (and link previews) couldn't tell a
// product page apart from the homepage.
//
// Plain DOM writes via useEffect rather than react-helmet-async: that
// library (last released 2022, no newer version fixes this) silently never
// wrote to the document at all under React 18.3 here — verified live on
// every route, not just product pages — leaving every page's <head> stuck
// on index.html's static defaults. This app is client-rendered only, so
// there was never a need for Helmet's SSR string-collection machinery in
// the first place; direct DOM manipulation is simpler and has no
// library-compat risk.
//
// Pass `product` (a raw catalog product) on product pages to also emit
// schema.org Product/Offer JSON-LD, making the page eligible for Google's
// price rich snippets. Deliberately omits aggregateRating/review — the site
// has no real review system, and fabricating rating data is the kind of
// structured-data spam Google actively penalizes. Add it for real once
// there's an actual review system to back it.
export function SEO({ title, description = DEFAULT_DESCRIPTION, image, path = '', noindex = false, product = null }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const url = encodeURI(`${SITE_URL}${path}`);
  // Product image paths can contain spaces (e.g. "/Product Photos/...") —
  // fine for an <img src>, but og:image/twitter:image are fetched directly
  // by external crawlers (Facebook, WhatsApp) that won't forgive raw spaces.
  const resolvedImage = encodeURI(
    image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : DEFAULT_IMAGE
  );

  useEffect(() => {
    document.title = fullTitle;

    upsertTag('meta', 'meta[name="description"]', { name: 'description', content: description });
    upsertTag('link', 'link[rel="canonical"]', { rel: 'canonical', href: url });

    const robotsSelector = 'meta[name="robots"]';
    if (noindex) {
      upsertTag('meta', robotsSelector, { name: 'robots', content: 'noindex, nofollow' });
    } else {
      document.head.querySelector(robotsSelector)?.remove();
    }

    upsertTag('meta', 'meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertTag('meta', 'meta[property="og:url"]', { property: 'og:url', content: url });
    upsertTag('meta', 'meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    upsertTag('meta', 'meta[property="og:description"]', { property: 'og:description', content: description });
    upsertTag('meta', 'meta[property="og:image"]', { property: 'og:image', content: resolvedImage });

    upsertTag('meta', 'meta[property="twitter:card"]', { property: 'twitter:card', content: 'summary_large_image' });
    upsertTag('meta', 'meta[property="twitter:url"]', { property: 'twitter:url', content: url });
    upsertTag('meta', 'meta[property="twitter:title"]', { property: 'twitter:title', content: fullTitle });
    upsertTag('meta', 'meta[property="twitter:description"]', { property: 'twitter:description', content: description });
    upsertTag('meta', 'meta[property="twitter:image"]', { property: 'twitter:image', content: resolvedImage });

    const jsonLdId = 'seo-product-jsonld';
    const existingJsonLd = document.getElementById(jsonLdId);
    if (product) {
      const productSchema = {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: product.name,
        image: [resolvedImage],
        description,
        sku: String(product.id),
        brand: { '@type': 'Brand', name: SITE_NAME },
        offers: {
          '@type': 'Offer',
          url,
          priceCurrency: 'INR',
          price: String(product.price),
          availability: product.inStock === false ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      };
      const script = existingJsonLd || document.createElement('script');
      script.type = 'application/ld+json';
      script.id = jsonLdId;
      script.textContent = JSON.stringify(productSchema);
      if (!existingJsonLd) document.head.appendChild(script);
    } else {
      existingJsonLd?.remove();
    }
  }, [fullTitle, description, url, resolvedImage, noindex, product?.id, product?.price, product?.name]);

  return null;
}
