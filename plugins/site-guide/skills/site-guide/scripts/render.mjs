#!/usr/bin/env node
// Usage: node render.mjs <guide-dir> [--preview <sheet.png>] [--only <prefix,prefix>]
// Reads <guide-dir>/guide.json and <guide-dir>/guide.spec.mjs, writes the SVGs to guide.json `images`
// (default <guide-dir>/images).
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createKit } from './engine.mjs';

const args = process.argv.slice(2);
const guideDir = resolve(args[0] ?? '_guide');
const flag = (name) => {
  const i = args.indexOf(name);
  return i === -1 ? undefined : args[i + 1];
};

const guide = JSON.parse(readFileSync(join(guideDir, 'guide.json'), 'utf8'));
const spec = await import(pathToFileURL(join(guideDir, 'guide.spec.mjs')).href);
const defs = spec.defs ? spec.defs(guide.theme.colors) : '';
const kit = createKit(guide.theme, { defs });
const images = await spec.default(kit);

const out = resolve(guideDir, guide.images ?? 'images');
mkdirSync(out, { recursive: true });
for (const [name, svg] of Object.entries(images)) writeFileSync(join(out, name), svg);
console.log(`${Object.keys(images).length} images → ${out}`);

const sheet = flag('--preview');
if (sheet) {
  let sharp;
  try {
    sharp = createRequire(join(process.cwd(), 'package.json'))('sharp');
  } catch {
    console.error(
      'Preview needs `sharp` resolvable from the current directory (run from the site root).'
    );
    process.exit(1);
  }
  const only = flag('--only')?.split(',');
  const files = readdirSync(out)
    .filter((f) => f.endsWith('.svg'))
    .filter((f) => !only || only.some((p) => f.startsWith(p)))
    .sort();
  const cw = 760;
  const ch = 560;
  const cols = files.length > 4 ? 3 : 2;
  const tiles = await Promise.all(
    files.map((f) =>
      sharp(join(out, f), { density: 96 })
        .resize(cw, ch, { fit: 'contain', background: '#ffffff' })
        .png()
        .toBuffer()
    )
  );
  await sharp({
    create: {
      width: cols * cw,
      height: Math.ceil(files.length / cols) * ch,
      channels: 3,
      background: '#ffffff',
    },
  })
    .composite(
      tiles.map((input, i) => ({
        input,
        left: (i % cols) * cw,
        top: Math.floor(i / cols) * ch,
      }))
    )
    .png()
    .toFile(sheet);
  console.log(`preview → ${sheet} (${files.join(', ')})`);
}
