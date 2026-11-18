import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const root = new URL('../../src/examples/layout/', import.meta.url);

function files(dir = ''): string[] {
  return readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory()
      ? files(`${dir}${e.name}/`)
      : e.name.endsWith('.astro')
        ? [`${dir}${e.name}`]
        : []
  );
}

const examples = files();
const read = (file: string) => readFileSync(new URL(file, root), 'utf8');

// colors.css palette (base names + families), Tailwind defaults it does not redefine, fixed colours.
const PALETTE = [
  'text',
  'subtext0',
  'subtext1',
  'overlay0',
  'overlay1',
  'overlay2',
  'surface0',
  'surface1',
  'surface2',
  'base',
  'mantle',
  'crust',
  'red',
  'maroon',
  'peach',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'sapphire',
  'blue',
  'lavender',
  'mauve',
  'pink',
  'flamingo',
  'rosewater',
  'slate',
  'gray',
  'zinc',
  'neutral',
  'stone',
];
const TAILWIND = [
  'orange',
  'amber',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'rose',
  'olive',
  'mist',
  'taupe',
];
const FIXED = ['white', 'black'];

const UTILITY =
  'bg|text|border(?:-[trblxyse])?|from|via|to|ring|ring-offset|outline|divide|fill|stroke|decoration|placeholder|shadow|caret|accent';
const RAW_COLOUR = new RegExp(
  String.raw`(?<![\w-])(?:${UTILITY})-(?:${[...PALETTE, ...TAILWIND, ...FIXED].join('|')})(?:-\d{2,3})?(?:/\d+)?(?![\w-])`,
  'g'
);
// `text-base` is a font size, not the `base` palette colour.
const NOT_COLOUR = new Set(['text-base']);

const rawColours = (source: string) =>
  [...source.matchAll(RAW_COLOUR)].map((m) => m[0]).filter((c) => !NOT_COLOUR.has(c));

const BARE_ELEMENT = /<(img|button|h[1-6])\b/g;
const bareElements = (source: string) => [...source.matchAll(BARE_ELEMENT)].map((m) => m[0]);

describe('raw colour matcher', () => {
  it.each([
    'bg-blue',
    'text-white',
    'hover:bg-gray-300',
    'from-purple-400',
    'to-purple-500/20',
    'border-gray-300',
    'bg-white/90',
    'text-green-600',
    'bg-mauve-600',
  ])('flags %s', (token) => {
    expect(rawColours(`class="${token}"`)).toEqual([token.replace(/^hover:/, '')]);
  });

  it.each([
    'bg-surface',
    'bg-surface/80',
    'text-normal',
    'text-muted',
    'border-border',
    'border-border-emphasis',
    'bg-info',
    'text-background',
    'bg-linear-to-br',
    'from-primary/20',
    'text-base',
    'text-lg',
    'shadow-lg',
    'to-surface',
  ])('accepts %s', (token) => {
    expect(rawColours(`class="${token}"`)).toEqual([]);
  });
});

describe('layout examples', () => {
  it.each(examples)('%s uses semantic colour tokens only', (file) => {
    expect(rawColours(read(file))).toEqual([]);
  });

  it.each(examples)('%s renders images, buttons and headings through blocks', (file) => {
    expect(bareElements(read(file))).toEqual([]);
  });
});
