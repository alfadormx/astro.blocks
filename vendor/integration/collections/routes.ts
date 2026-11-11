import type { CollectionsConfig } from '../utils/configBuilder';

const trim = (path: string) => path.replace(/^\/+|\/+$/g, '');

/** Collections with a `route` whose entry URLs (`<lang><route>/<slug>`) no built page produced. */
export function collectionsWithoutEntryPages(
  { entries }: CollectionsConfig,
  languageBasePaths: string[],
  pathnames: string[]
): [name: string, route: string][] {
  const built = pathnames.map(trim);
  return Object.entries(entries).flatMap(([name, { route }]) => {
    if (!route) return [];
    const prefixes = languageBasePaths.map((base) =>
      [trim(base), trim(route)].filter(Boolean).join('/')
    );
    const hasEntry = built.some((p) =>
      prefixes.some((prefix) => p.startsWith(`${prefix}/`) && !p.startsWith(`${prefix}/page/`))
    );
    return hasEntry ? [] : [[name, route] as [string, string]];
  });
}
