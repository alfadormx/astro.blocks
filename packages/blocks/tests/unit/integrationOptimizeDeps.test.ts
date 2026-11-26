import type { AstroConfig } from 'astro';
import { describe, expect, it, vi } from 'vitest';
import blocks from '~/integration';

const optimizeDepsInclude = async () => {
  const updateConfig = vi.fn();
  const setup = blocks().hooks['astro:config:setup'] as unknown as (
    options: Record<string, unknown>
  ) => Promise<void>;
  await setup({
    config: {
      root: new URL('../fixture/', import.meta.url),
      integrations: [],
      vite: { plugins: [] },
    } as unknown as AstroConfig,
    logger: { warn: vi.fn(), info: vi.fn() },
    updateConfig,
    addWatchFile: vi.fn(),
  });
  return updateConfig.mock.calls[0][0].vite.optimizeDeps.include as string[];
};

describe('integration optimizeDeps', () => {
  it('pre-bundles leaflet through the package so an installed site can load the UMD build', async () => {
    expect(await optimizeDepsInclude()).toContain('@alfadormx/blocks > leaflet');
  });

  it('pre-bundles three through the package', async () => {
    expect(await optimizeDepsInclude()).toContain('@alfadormx/blocks > three');
  });
});
