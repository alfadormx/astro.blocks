import type { VideoFileSource, VideoSource } from '~/types/video.types';

const PROVIDERS = new Set(['html5', 'youtube', 'vimeo']);

const VIDEO_TYPES: Record<string, string> = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  webm: 'video/webm',
  ogv: 'video/ogg',
  ogg: 'video/ogg',
  mov: 'video/quicktime',
};

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

export function inferVideoType(src: string): string | undefined {
  const path = src.split(/[?#]/, 1)[0];
  // Last path segment only, so a dotted directory (`/v1.2/clip`) is not read as an extension.
  const file = path.slice(path.lastIndexOf('/') + 1);
  const dot = file.lastIndexOf('.');
  if (dot < 0) return undefined;
  return VIDEO_TYPES[file.slice(dot + 1).toLowerCase()];
}

export function validateBackgroundVideo(video: string | VideoFileSource[] | undefined): void {
  if (!Array.isArray(video)) return;
  if (video.length === 0) fail('background.video needs at least one source');
  video.forEach((file, i) => {
    if (blank(file?.src)) fail(`background.video[${i}] needs a non-empty src`);
  });
}

export function resolveVideoSources(video: string | VideoFileSource[]): VideoFileSource[] {
  const list: VideoFileSource[] = typeof video === 'string' ? [{ src: video }] : video;
  return list.map(({ src, type }) => ({ src, type: type ?? inferVideoType(src) }));
}
