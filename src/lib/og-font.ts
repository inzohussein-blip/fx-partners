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
    const cssUrl =
      `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}` +
      `&text=${encodeURIComponent(text)}`;
    const css = await (
      await fetch(cssUrl, {
        headers: {
          // An old UA with no woff2 support makes Google serve TrueType/woff,
          // which Satori can actually parse.
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/534.30 (KHTML, like Gecko) Version/5.0 Safari/534.30",
        },
      })
    ).text();
    const match = css.match(
      /src:\s*url\((https:[^)]+)\)\s*format\('(?:truetype|woff|opentype)'\)/
    );
    if (!match) return [];
    const data = await (await fetch(match[1])).arrayBuffer();
    return [{ name: family, data, weight, style: "normal" }];
  } catch {
    return [];
  }
}
