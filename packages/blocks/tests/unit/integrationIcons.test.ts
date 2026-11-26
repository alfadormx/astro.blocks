import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { AstroConfig } from 'astro';
import icon from 'astro-icon';
import { afterEach, describe, expect, it, vi } from 'vitest';
import blocks from '~/integration';

vi.mock('astro-icon', () => ({
  default: vi.fn(() => ({ name: 'astro-icon', hooks: {} })),
}));

const fixtureConfig = new URL('../fixture/src/config.yaml', import.meta.url);
const roots: string[] = [];

const siteRoot = (withIcons: boolean) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'blocks-icons-'));
  roots.push(root);
  fs.mkdirSync(path.join(root, 'src'));
  fs.copyFileSync(fixtureConfig, path.join(root, 'src/config.yaml'));
  if (withIcons) {
    fs.mkdirSync(path.join(root, 'src/icons'));
    fs.writeFileSync(path.join(root, 'src/icons/foo.svg'), '<svg viewBox="0 0 1 1"></svg>');
  }
  return pathToFileURL(`${root}/`);
};

const iconOptions = async (root: URL) => {
  vi.mocked(icon).mockClear();
  const setup = blocks().hooks['astro:config:setup'] as unknown as (
    options: Record<string, unknown>
  ) => Promise<void>;
  await setup({
    config: { root, integrations: [], vite: { plugins: [] } } as unknown as AstroConfig,
    logger: { warn: vi.fn(), info: vi.fn() },
    updateConfig: vi.fn(),
    addWatchFile: vi.fn(),
  });
  return vi.mocked(icon).mock.calls[0][0];
};

afterEach(() => {
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

describe('integration astro-icon registration', () => {
  it('points astro-icon at an existing folder with no SVGs when the site has no src/icons', async () => {
    const iconDir = (await iconOptions(siteRoot(false)))?.iconDir;

    expect(iconDir).toBeDefined();
    expect(fs.statSync(iconDir!).isDirectory()).toBe(true);
    expect(fs.readdirSync(iconDir!).filter((f) => f.endsWith('.svg'))).toEqual([]);
  });

  it("keeps astro-icon's default src/icons when the site has the folder", async () => {
    expect((await iconOptions(siteRoot(true)))?.iconDir).toBeUndefined();
  });
});
