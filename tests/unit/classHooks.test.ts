import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Contract A15: class hooks that may stay classes.
const ALLOWED = new Set([
  'carousel-item',
  'nav-tree-icon',
  'nav-tree-icon-expanded',
  'floating-player',
  'plyr',
  'color-btn',
]);

const root = new URL('../../src/', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');

function astroFiles(dir: string): string[] {
  return readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? astroFiles(`${dir}${e.name}/`)
      : e.name.endsWith('.astro')
        ? [`${dir}${e.name}`]
        : []
  );
}

function selectorClasses(css: string): string[] {
  const selectors = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/url\([^)]*\)|'[^']*'|"[^"]*"/g, '')
    .replace(/\{[^{}]*\}/g, '{}');
  return [...selectors.matchAll(/(?<![\d-])\.(-?[a-z][\w-]*)/gi)].map((m) => m[1]);
}

function scriptClasses(source: string): string[] {
  const scripts = [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  return scripts.flatMap((s) =>
    [
      ...s.matchAll(/querySelector(?:All)?(?:<[^>]+>)?\(\s*['"`]([^'"`]+)['"`]/g),
      ...s.matchAll(/classList\.(?:add|remove|toggle|contains)\(\s*['"`]([^'"`]+)['"`]/g),
    ].flatMap((m) => (m[0].startsWith('classList') ? [m[1]] : selectorClasses(m[1])))
  );
}

function styleClasses(source: string): string[] {
  return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].flatMap((m) =>
    selectorClasses(m[1])
  );
}

describe('class hooks', () => {
  it('global.css selects only allowed classes', () => {
    const css = read('styles/global.css').replace(/@(?:source|custom-variant)[^;]*;/g, '');
    expect(selectorClasses(css).filter((c) => !ALLOWED.has(c))).toEqual([]);
  });

  it.each(astroFiles('components/'))(
    '%s scripts and styles select only allowed classes',
    (file) => {
      const source = read(file);
      expect(
        [...scriptClasses(source), ...styleClasses(source)].filter((c) => !ALLOWED.has(c))
      ).toEqual([]);
    }
  );
});
