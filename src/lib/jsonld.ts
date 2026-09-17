/**
 * Serialise a JSON-LD object for safe embedding in an inline
 * <script type="application/ld+json"> tag.
 *
 * JSON.stringify does not escape '<', '>' or '&', so a value that contains
 * "</script>" would break out of the script tag and inject markup. Any field
 * that reaches these blocks is admin- or user-authored (broker names, post
 * titles, forum content), so escaping these three characters is the boundary
 * that keeps structured data from becoming a script-injection vector. (The
 * content is parsed as JSON, not JavaScript, so U+2028/U+2029 need no special
 * handling here.)
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
}
