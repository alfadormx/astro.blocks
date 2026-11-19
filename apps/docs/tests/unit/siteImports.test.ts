import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../../src/', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');

function files(dir: string, ext: RegExp): string[] {
  return readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(`${dir}${e.name}/`, ext) : ext.test(e.name) ? [`${dir}${e.name}`] : []
  );
}

const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(?\s*|\bimport\.meta\.glob\(\s*)(['"])([^'"]+)\1/g;
const specifiers = (source: string) => [...source.matchAll(SPECIFIER)].map((m) => m[2]);

const siteEntryFiles = [
  ...files('pages/', /\.(astro|ts)$/),
  ...files('examples/', /\.(astro|ts)$/),
  'content.config.ts',
  '../astro.config.mjs',
].map((path) => ({ path, source: read(path) }));

const DEEP_LIBRARY_PATH = /src\/integration|^#blocks\//;

describe('site imports', () => {
  it('site code reaches the library through @alfadormx/blocks', () => {
    const bad = siteEntryFiles.flatMap((f) =>
      specifiers(f.source)
        .filter((s) => DEEP_LIBRARY_PATH.test(s))
        .map((s) => `${f.path}: ${s}`)
    );
    expect(bad).toEqual([]);
  });
});
