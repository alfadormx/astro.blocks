import fs from 'node:fs';
import path from 'node:path';
import { defineCollection, type CollectionConfig } from 'astro/content/config';
import { glob } from 'astro/loaders';
import { loadConfigSync } from '../utils/loadConfig';
import { getCollections, getI18N, type Config } from '../utils/configBuilder';
import { presetSchemas, type PresetSchemas } from './presets';

type Registry = AstroBlocks.CollectionRegistry;

export type BlocksCollections = {
  [K in keyof Registry]: CollectionConfig<PresetSchemas[Registry[K]]>;
};

export type LanguageLayout = 'multi' | 'single';

/** Language folders only → `multi`; loose Markdown files only → `single`; anything else throws. */
export function languageLayout(name: string, dir: string, languageCodes: string[]): LanguageLayout {
  if (!fs.existsSync(dir)) return 'single';
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const folders = entries.filter((e) => e.isDirectory());
  const files = entries.filter((e) => e.isFile() && /\.mdx?$/.test(e.name));
  const foreignFolder = folders.some((f) => !languageCodes.includes(f.name));
  if ((folders.length > 0 && files.length > 0) || foreignFolder) {
    throw new Error(`Collection "${name}" mixes language folders and loose files in ${dir}`);
  }
  return folders.length > 0 ? 'multi' : 'single';
}

export function defineBlocksCollections({
  config = 'src/config.yaml',
  root = process.cwd(),
}: { config?: string; root?: string } = {}): BlocksCollections {
  const raw = loadConfigSync(path.resolve(root, config)) as Config;
  const { entries } = getCollections(raw);
  const languageCodes = getI18N(raw).languages.map((l) => l.code);

  const collections: Record<string, unknown> = {};
  for (const [name, settings] of Object.entries(entries)) {
    const dir = path.resolve(root, settings.path);
    languageLayout(name, dir, languageCodes);
    collections[name] = defineCollection({
      loader: glob({
        base: dir,
        pattern: '**/*.{md,mdx}',
        // Astro's default id uses front-matter `slug`; translations link by file path instead.
        generateId: ({ entry }) => entry.replace(/\.mdx?$/, ''),
      }),
      schema: presetSchemas[settings.preset],
    });
  }
  return collections as BlocksCollections;
}
