import { describe, expect, it } from 'vitest';
import type { VideoSource } from '~/types/video.types';
import {
  inferVideoType,
  resolveVideoSources,
  validateBackgroundVideo,
  validateVideoSource,
} from '~/utils/video';

const html5: VideoSource = { provider: 'html5', sources: [{ src: '/videos/flower.mp4' }] };

describe('validateVideoSource', () => {
  const throwCases: Array<{ name: string; input: VideoSource; expected: RegExp }> = [
    { name: 'message prefix', input: { provider: 'youtube', id: '' }, expected: /^video: / },
    {
      name: 'empty sources',
      input: { provider: 'html5', sources: [] },
      expected: /at least one entry/,
    },
    {
      name: 'blank src',
      input: { provider: 'html5', sources: [{ src: ' ' }] },
      expected: /sources\[0\] needs a non-empty src/,
    },
    {
      name: 'empty youtube id',
      input: { provider: 'youtube', id: '' },
      expected: /youtube source needs a non-empty id/,
    },
    {
      name: 'blank vimeo id',
      input: { provider: 'vimeo', id: '  ' },
      expected: /vimeo source needs a non-empty id/,
    },
    {
      name: 'unknown provider',
      input: { provider: 'dailymotion', id: 'x' } as unknown as VideoSource,
      expected: /unknown provider "dailymotion"/,
    },
  ];

  it.each(throwCases)('throws on $name', ({ input, expected }) => {
    expect(() => validateVideoSource(input)).toThrow(expected);
  });

  it.each<VideoSource>([
    html5,
    {
      provider: 'html5',
      sources: [{ src: '/a.webm', type: 'video/webm' }, { src: '/a.mp4' }],
      poster: '/p.jpg',
    },
    { provider: 'youtube', id: 'bTqVqk7FSmY' },
    { provider: 'vimeo', id: '76979871' },
  ])('accepts %j', (input) => {
    expect(() => validateVideoSource(input)).not.toThrow();
  });
});

describe('inferVideoType', () => {
  it.each([
    ['/v/clip.mp4', 'video/mp4'],
    ['/v/clip.m4v', 'video/mp4'],
    ['/v/clip.webm', 'video/webm'],
    ['/v/clip.ogv', 'video/ogg'],
    ['/v/clip.ogg', 'video/ogg'],
    ['/v/clip.mov', 'video/quicktime'],
    ['/v/CLIP.WEBM', 'video/webm'],
    ['https://cdn.test/clip.webm?v=2', 'video/webm'],
    ['https://cdn.test/clip.mp4#t=5', 'video/mp4'],
  ])('maps %s to %s', (src, type) => {
    expect(inferVideoType(src)).toBe(type);
  });

  it.each([
    'https://www.pexels.com/download/video/2646392/',
    '/v/clip.avi',
    'https://cdn.test/v1.2/clip',
    '/v/clip',
  ])('returns undefined for %s', (src) => {
    expect(inferVideoType(src)).toBeUndefined();
  });
});

describe('validateBackgroundVideo', () => {
  it.each([undefined, '', '/v/clip.mp4', [{ src: '/v/clip.mp4' }]])('accepts %j', (video) => {
    expect(() => validateBackgroundVideo(video)).not.toThrow();
  });

  it('throws on an empty list', () => {
    expect(() => validateBackgroundVideo([])).toThrow(
      /^video: background\.video needs at least one source/
    );
  });

  it('throws on a blank src naming its index', () => {
    expect(() => validateBackgroundVideo([{ src: '/a.webm' }, { src: ' ' }])).toThrow(
      /background\.video\[1\] needs a non-empty src/
    );
  });
});

describe('resolveVideoSources', () => {
  it('keeps an explicit type verbatim', () => {
    const type = 'video/webm; codecs="vp9"';
    expect(resolveVideoSources([{ src: '/a.webm', type }])).toEqual([{ src: '/a.webm', type }]);
  });

  it('infers a missing type per entry', () => {
    expect(resolveVideoSources([{ src: '/a.webm' }, { src: '/a.mp4' }])).toEqual([
      { src: '/a.webm', type: 'video/webm' },
      { src: '/a.mp4', type: 'video/mp4' },
    ]);
  });

  it('infers the type of a single URL', () => {
    expect(resolveVideoSources('/a.webm')).toEqual([{ src: '/a.webm', type: 'video/webm' }]);
  });
});
