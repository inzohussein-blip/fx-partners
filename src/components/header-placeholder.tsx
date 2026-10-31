/**
 * The header's footprint for loading skeletons. loading.tsx files get no
 * route params, so the real SiteHeader (which translates its links) would
 * have to read the locale from request headers — which made /compare dynamic
 * and broke the cached broker pages. A same-height bar avoids that.
 */
export function HeaderPlaceholder() {
  return <div className="sticky top-0 z-50 h-16 border-b border-fg/5 bg-ink-900/80 backdrop-blur" aria-hidden />;
}
