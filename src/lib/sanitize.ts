import sanitizeHtml from "sanitize-html";

/**
 * Sanitise rich HTML before it is rendered with dangerouslySetInnerHTML.
 *
 * Blog and forum bodies are stored as HTML produced by the TipTap editor.
 * Blog posts are admin-only, but forum posts are authored by channel owners —
 * so their HTML reaches every visitor's browser and, unsanitised, a crafted
 * body could run script in the reader's session (including an admin's). This
 * strips anything that is not formatting: no <script>, no event handlers, no
 * inline styles, no javascript: URLs.
 *
 * The allow-list matches what the editor can actually produce, so legitimate
 * posts render unchanged.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "b", "em", "i", "u", "s", "strike", "mark", "sub", "sup",
    "ul", "ol", "li",
    "blockquote", "code", "pre",
    "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
    "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title"],
    // Table structure and code-block language, so merged cells and syntax
    // highlighting survive. class is allow-listed only on code/pre.
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan"],
    code: ["class"],
    pre: ["class"],
  },
  // Only safe URL schemes; blocks javascript:, vbscript:, and bare data: on links.
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["http", "https"] },
  // Drop everything else silently (unknown tags keep their text, not markup).
  disallowedTagsMode: "discard",
  transformTags: {
    // Any link opening a new tab gets noopener/noreferrer so it cannot reach
    // window.opener. Existing rel is replaced rather than appended to.
    a: (tagName, attribs) => {
      const out = { ...attribs };
      if (out.target === "_blank") out.rel = "noopener noreferrer";
      return { tagName, attribs: out };
    },
  },
};

export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS);
}
