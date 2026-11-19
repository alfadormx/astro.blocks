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

const siteFiles = [...files('', /\.(astro|ts|mdx|mjs)$/), '../astro.config.mjs'].map((path) => ({
  path,
  source: read(path),
}));

const snippetFiles = files('examples/', /^snippets\.ts$/).map((path) => ({
  path,
  source: read(path),
}));

const LIBRARY_THROUGH_SITE = /^~\/(components|utils|types|layouts|styles|integration)\//;
const INTO_PACKAGES = /(^|\/)packages\//;
const PACKAGE_INTERNAL = /^#(components|utils|types|styles|blocks)\//;
const LIBRARY_PATH_TEXT = /#blocks\/|~\/(components|utils|types|layouts)\//g;

const offending = (s: string) =>
  LIBRARY_THROUGH_SITE.test(s) || INTO_PACKAGES.test(s) || PACKAGE_INTERNAL.test(s);

describe('site imports', () => {
  it('scans every source file of the docs app', () => {
    expect(siteFiles.map((f) => f.path)).toEqual(
      expect.arrayContaining([
        'content.config.ts',
        '../astro.config.mjs',
        expect.stringMatching(/^pages\/.+\.astro$/),
        expect.stringMatching(/^examples\/.+\.astro$/),
        expect.stringMatching(/^content\/.+\.mdx$/),
      ])
    );
  });

  it('flags library paths that bypass the package', () => {
    expect(
      [
        '~/components/blocks/primitives/Button.astro',
        '~/utils/styles',
        '../../../packages/blocks/src/utils/styles',
        '#utils/styles',
        '#blocks/collections',
        '@alfadormx/blocks/primitives/Button.astro',
        '~/examples/primitives/Button/basic.astro?raw',
      ].filter(offending)
    ).toEqual([
      '~/components/blocks/primitives/Button.astro',
      '~/utils/styles',
      '../../../packages/blocks/src/utils/styles',
      '#utils/styles',
      '#blocks/collections',
    ]);
  });

  it('docs code reaches the library only through @alfadormx/blocks', () => {
    const bad = siteFiles.flatMap((f) =>
      specifiers(f.source)
        .filter(offending)
        .map((s) => `${f.path}: ${s}`)
    );
    expect(bad).toEqual([]);
  });

  it('displayed snippets import the library by package name', () => {
    expect(snippetFiles.length).toBeGreaterThan(0);
    const bad = snippetFiles.flatMap((f) =>
      [...f.source.matchAll(LIBRARY_PATH_TEXT)].map((m) => `${f.path}: ${m[0]}`)
    );
    expect(bad).toEqual([]);
  });
});
