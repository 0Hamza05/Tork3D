import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Tork3D';
const SITE_URL = 'https://tork3d.in';
const DEFAULT_TITLE = 'Tork3D - Custom 3D Printing & Engineering Solutions';
const DEFAULT_DESCRIPTION = 'Tork3D offers premium custom 3D printing and engineering solutions. Rapid prototyping, fast turnaround, and high-quality materials including PLA, PETG, and TPU.';
const DEFAULT_IMAGE = `${SITE_URL}/favicon.png`;

// Sets the per-route <title>, meta description, canonical URL, and Open
// Graph/Twitter tags. Without this every route shared the exact same static
// tags from index.html, so Google (and link previews) couldn't tell a
// product page apart from the homepage.
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

  const productSchema = product ? {
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
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  } : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedImage} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={resolvedImage} />

      {productSchema && (
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      )}
    </Helmet>
  );
}
