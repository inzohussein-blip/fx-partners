/**
 * Load the site font (Cairo) for Satori-rendered OG images.
 *
 * next/og has no Arabic glyphs built in, so Arabic text — broker names, blog
 * titles, the tagline — renders as empty boxes unless a font is supplied.
 *
 * Best-effort by design: Google Fonts is asked for a Satori-compatible
 * TrueType/woff file (via a User-Agent that does not advertise woff2, since
 * Satori cannot read woff2), and any failure returns an empty list so the
 * caller renders without the custom font — the unchanged behaviour — instead
 * of the route erroring.
 */
type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
};

export async function loadArabicFont(
  text: string,
  weight: 400 | 700 = 700
): Promise<OgFont[]> {
  try {
    const family = "Cairo";
    // The font is requested as a subset holding only the characters asked
    // for. Satori throws (rather than drawing a box) on a character the font
    // lacks, so the separators and digits every card uses are always added —
    // a "·" in a tagline crashed the whole broker card.
    const subset = `${text} ·•—–-.,:;/%$+()0123456789 `;
    const cssUrl =
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}` +
      `&text=${encodeURIComponent(subset)}`;
    const css = await (
      await fetch(cssUrl, {
        headers: {
          // An old UA with no woff2 support makes Google serve TrueType/woff,
          // which Satori can actually parse.
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Version/5.0 Safari/534.30",
        },
        // Never let a slow Google Fonts hang the OG render — degrade instead.
        signal: AbortSignal.timeout(2500),
      })
    ).text();
    const match = css.match(
      /src:\s*url\((https:[^)]+)\)\s*format\('(?:truetype|woff|opentype)'\)/
    );
    if (!match) return [];
    const data = await (
      await fetch(match[1], { signal: AbortSignal.timeout(2500) })
    ).arrayBuffer();
    return [{ name: family, data, weight, style: "normal" }];
  } catch {
    return [];
  }
}

/**
 * Cache headers for generated share images. Every input is in the URL (name,
 * rating, title, size…), so a URL always draws the same picture and can be
 * kept: a day in browsers, a week on Vercel's CDN, then refreshed in the
 * background. Without this each share preview re-ran the image function.
 */
export const OG_HEADERS = {
  "cache-control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
};

/**
 * A plain SVG card, for when the font could not be loaded.
 *
 * On Cloudflare Workers next/og has no built-in fallback font (on Vercel it
 * does), so an ImageResponse rendered without a loaded font throws instead of
 * degrading to boxes. Callers check for an empty font list and return this
 * instead — Latin brand text only, which needs no font file.
 */
export function fallbackCard(width: number, height: number, label?: string): Response {
  const text = label
    ? label.replace(/[<>&"']/g, "")
    : `Partners <tspan fill="#54D8F0">FX</tspan>`;
  const size = Math.round(Math.min(width, height) * 0.14);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="#0A0F14"/>` +
    `<text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" ` +
    `font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="${size}" fill="#ffffff">` +
    `${text}</text></svg>`;
  return new Response(svg, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      // Short cache: this is the degraded path, retry the font soon.
      "cache-control": "public, max-age=300",
    },
  });
}
