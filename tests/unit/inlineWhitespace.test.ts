import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// Astro's default compressHTML: "jsx" drops a line break next to a tag, so text that
// wraps onto or off an inline element needs an explicit {' '} (ID-0063).
const INLINE = [
  'code',
  'a',
  'strong',
  'em',
  'b',
  'i',
  'kbd',
  'abbr',
  'small',
  'mark',
  'span',
  'time',
];
const TAGS = INLINE.join('|');
const OPENS_INLINE = new RegExp(String.raw`^<(?:${TAGS})[\s>]`);
const CLOSES_INLINE = new RegExp(String.raw`</(?:${TAGS})>$`);
const ENDS_IN_TEXT = /(?:[\p{L}\p{N}.,;:!?)]|&[a-z]+;)$/u;
const STARTS_WITH_TEXT = /^(?:[\p{L}\p{N}]|&[a-z]+;)/u;

const ROOTS = ['components/', 'layouts/', 'pages/[...lang]/'];

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

// Trimmed template lines; null for frontmatter and <script>/<style> blocks.
function templateLines(source: string): (string | null)[] {
  const lines = source.split('\n').map((l) => l.trim());
  const bodyStart = lines[0] === '---' ? lines.indexOf('---', 1) + 1 : 0;
  let raw = false;
  return lines.map((line, n) => {
    if (n < bodyStart) return null;
    if (/^<(?:script|style)[\s>]/.test(line)) raw = true;
    const out = raw ? null : line;
    if (/<\/(?:script|style)>$/.test(line)) raw = false;
    return out;
  });
}

// 1-based line numbers of the second line of each bare break.
function bareBreaks(source: string): number[] {
  const lines = templateLines(source);
  const hits: number[] = [];
  for (let n = 1; n < lines.length; n++) {
    const prev = lines[n - 1];
    const next = lines[n];
    if (prev === null || next === null) continue;
    const before = ENDS_IN_TEXT.test(prev) && OPENS_INLINE.test(next);
    const after = CLOSES_INLINE.test(prev) && STARTS_WITH_TEXT.test(next);
    if (before || after) hits.push(n + 1);
  }
  return hits;
}

describe('bareBreaks', () => {
  it.each([
    ['text before an inline tag', '<p>\n  see\n  <code>x</code>\n</p>', [3]],
    ['an inline closing tag before text', '<p>\n  <code>x</code>\n  then\n</p>', [3]],
    ['an entity before an inline tag', '<small>\n  &copy;\n  <a href="/">OSM</a>\n</small>', [3]],
  ])('flags %s', (_, source, lines) => {
    expect(bareBreaks(source)).toEqual(lines);
  });

  it.each([
    ["explicit {' '}", "<p>\n  see{' '}\n  <code>x</code>{' '}\n  then\n</p>"],
    ['a same-line join', '<p>see <code>x</code> then</p>'],
    ['a block tag', '<p>\n  text\n  <div>x</div>\n</p>'],
    ['frontmatter', "---\nconst a = 'x\n<code>';\n---\n<p>ok</p>"],
    ['a script block', "<script>\n  const s = 'a'\n  <a>\n</script>"],
  ])('passes %s', (_, source) => {
    expect(bareBreaks(source)).toEqual([]);
  });
});

describe('inline whitespace in .astro sources', () => {
  it('has no bare line break next to an inline element', () => {
    const hits = ROOTS.flatMap((dir) => files(dir, '.astro')).flatMap((file) =>
      bareBreaks(read(file)).map((line) => `src/${file}:${line}`)
    );
    expect(hits).toEqual([]);
  });
});
