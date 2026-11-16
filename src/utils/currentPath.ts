/** Trims one trailing slash; an empty result is the root. */
export const normalizePath = (path: string): string => path.replace(/\/$/, '') || '/';

/**
 * Whether `href` points at `currentPath`. Exact match after trimming one trailing slash;
 * an href with a hash or query never matches, so in-page anchors are never the current page.
 */
export function isCurrentPath(href: string | undefined, currentPath: string): boolean {
  if (!href || /[#?]/.test(href)) return false;
  return normalizePath(href) === normalizePath(currentPath);
}
