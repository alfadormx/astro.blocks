type LanguageLike = { basePath: string };

export function applyTrailingSlash(path: string, trailingSlash: boolean): string {
  if (trailingSlash) {
    return path.endsWith('/') || path.includes('.') ? path : `${path}/`;
  }
  return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

/** `currentPath` moved from the `current` language's prefix to the `target` language's. */
export function languageUrl(
  currentPath: string,
  current: LanguageLike,
  target: LanguageLike,
  trailingSlash: boolean
): string {
  const pathWithoutLang =
    current.basePath === '/' ? currentPath : currentPath.slice(current.basePath.length) || '/';
  return applyTrailingSlash(
    target.basePath === '/'
      ? pathWithoutLang
      : `${target.basePath}${pathWithoutLang === '/' ? '' : pathWithoutLang}`,
    trailingSlash
  );
}
