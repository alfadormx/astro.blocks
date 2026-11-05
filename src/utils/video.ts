import type { VideoSource } from '~/types/video.types';

const PROVIDERS = new Set(['html5', 'youtube', 'vimeo']);

function fail(message: string): never {
  throw new Error(`video: ${message}`);
}

const blank = (value: unknown) => typeof value !== 'string' || !value.trim();

export function validateVideoSource(source: VideoSource): void {
  if (!source || !PROVIDERS.has(source.provider)) {
    fail(`unknown provider ${JSON.stringify(source?.provider)}; expected html5, youtube or vimeo`);
  }
  if (source.provider === 'html5') {
    if (!Array.isArray(source.sources) || source.sources.length === 0) {
      fail('html5 source needs at least one entry in sources');
    }
    source.sources.forEach((file, i) => {
      if (blank(file?.src)) fail(`sources[${i}] needs a non-empty src`);
    });
    return;
  }
  if (blank(source.id)) fail(`${source.provider} source needs a non-empty id`);
}
