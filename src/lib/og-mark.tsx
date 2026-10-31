/**
 * The brand mark (two overlapping rings, see components/logo.tsx) for images
 * drawn on the server: share cards, banners and the SVG fallback card. These
 * are always on the dark brand background, so the second ring is silver.
 */
export const MARK_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">` +
  `<defs><linearGradient id="a" x1="8" y1="16" x2="40" y2="48" gradientUnits="userSpaceOnUse">` +
  `<stop stop-color="#7BE6F7"/><stop offset=".55" stop-color="#22B8F0"/><stop offset="1" stop-color="#0077E6"/></linearGradient>` +
  `<linearGradient id="b" x1="24" y1="16" x2="56" y2="48" gradientUnits="userSpaceOnUse">` +
  `<stop stop-color="#F1F5F9"/><stop offset="1" stop-color="#94A3B8"/></linearGradient></defs>` +
  `<circle cx="24" cy="32" r="16" fill="none" stroke="url(#a)" stroke-width="5.5"/>` +
  `<circle cx="40" cy="32" r="16" fill="none" stroke="url(#b)" stroke-width="5.5"/>` +
  `<path d="M32 18.14A16 16 0 0 1 32 45.86A16 16 0 0 1 32 18.14Z" fill="url(#a)" opacity=".9"/></svg>`;

const MARK_SRC = `data:image/svg+xml;base64,${Buffer.from(MARK_SVG).toString("base64")}`;

/** The mark as an <img> for next/og (Satori renders data-URI images). */
export function OgMark({ size }: { size: number }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={MARK_SRC} width={size} height={size} alt="" />;
}
