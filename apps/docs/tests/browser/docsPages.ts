import { readdirSync } from 'node:fs';

const CONTENT_DIR = new URL('../../src/content/documentation/', import.meta.url);

function routes(dir: URL, prefix = ''): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory())
      return routes(new URL(`${entry.name}/`, dir), `${prefix}/${entry.name}`);
    return /\.mdx?$/.test(entry.name) ? [`${prefix}/${entry.name.replace(/\.mdx?$/, '')}`] : [];
  });
}

export const docsPages = [
  '/documentation',
  ...routes(CONTENT_DIR).map((r) => `/documentation${r}`),
].sort();
