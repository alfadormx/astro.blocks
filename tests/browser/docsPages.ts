import { readdirSync } from 'node:fs';

const CONTENT_DIR = new URL('../../src/content/documentation/', import.meta.url);
const PAGES_DIR = new URL('../../src/pages/documentation/', import.meta.url);

// Routes under `dir`, skipping `_` helpers and `[` dynamic routes.
function routes(dir: URL, ext: RegExp, prefix = ''): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name.startsWith('_') || entry.name.startsWith('[')) return [];
    if (entry.isDirectory()) {
      return routes(new URL(`${entry.name}/`, dir), ext, `${prefix}/${entry.name}`);
    }
    return ext.test(entry.name) ? [`${prefix}/${entry.name.replace(ext, '')}`] : [];
  });
}

const entries = routes(CONTENT_DIR, /\.mdx?$/);
const pages = routes(PAGES_DIR, /\.astro$/).map((r) => r.replace(/\/index$/, ''));

export const docsPages = [...new Set([...entries, ...pages])]
  .map((r) => `/documentation${r}`)
  .sort();
