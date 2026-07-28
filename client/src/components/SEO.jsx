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
export function SEO({ title, description = DEFAULT_DESCRIPTION, image, path = '', noindex = false }) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const url = encodeURI(`${SITE_URL}${path}`);
  // Product image paths can contain spaces (e.g. "/Product Photos/...") —
  // fine for an <img src>, but og:image/twitter:image are fetched directly
  // by external crawlers (Facebook, WhatsApp) that won't forgive raw spaces.
  const resolvedImage = encodeURI(
    image ? (image.startsWith('http') ? image : `${SITE_URL}${image}`) : DEFAULT_IMAGE
  );

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
    </Helmet>
  );
}
