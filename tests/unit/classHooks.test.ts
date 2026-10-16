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

function files(dir: string, ext: string): string[] {
  return readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? files(`${dir}${e.name}/`, ext)
      : e.name.endsWith(ext)
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

const ARG = String.raw`\(\s*(?:(['"\`])(?<literal>(?:(?!\1).)*)\1|(?<ident>[A-Za-z_$][\w$]*)\s*[,)])`;
const SELECTOR_CALL = new RegExp(
  String.raw`\.(?:querySelector(?:All)?|closest|matches)(?:<[^>]+>)?` + ARG,
  'g'
);
const CLASS_CALL = new RegExp(
  String.raw`\.(?:classList\.(?:add|remove|toggle|contains)|getElementsByClassName)` + ARG,
  'g'
);

// Only string constants used as a call argument or `${IDENT}` resolve, so unrelated constants
// such as a '.' separator never reach selectorClasses.
function constants(code: string): Map<string, string> {
  return new Map(
    [...code.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(['"`])((?:(?!\2).)*)\2/g)].map((m) => [
      m[1],
      m[3],
    ])
  );
}

function codeClasses(code: string): string[] {
  const consts = constants(code);
  const arg = (m: RegExpMatchArray) =>
    (m.groups!.literal ?? consts.get(m.groups!.ident) ?? '').replace(
      /\$\{\s*([A-Za-z_$][\w$]*)\s*\}/g,
      (_, id: string) => consts.get(id) ?? ''
    );
  return [
    ...[...code.matchAll(SELECTOR_CALL)].flatMap((m) => selectorClasses(arg(m))),
    ...[...code.matchAll(CLASS_CALL)].flatMap((m) => arg(m).split(/\s+/).filter(Boolean)),
  ];
}

function scriptClasses(source: string): string[] {
  return [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].flatMap((m) =>
    codeClasses(m[1])
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

  it.each([
    ...files('components/', '.astro'),
    ...files('layouts/', '.astro'),
    ...files('pages/', '.astro'),
  ])('%s scripts and styles select only allowed classes', (file) => {
    const source = read(file);
    expect(
      [...scriptClasses(source), ...styleClasses(source)].filter((c) => !ALLOWED.has(c))
    ).toEqual([]);
  });

  it.each([...files('utils/', '.ts'), ...files('layouts/', '.ts'), ...files('pages/', '.ts')])(
    '%s selects only allowed classes',
    (file) => {
      expect(codeClasses(read(file)).filter((c) => !ALLOWED.has(c))).toEqual([]);
    }
  );
});
