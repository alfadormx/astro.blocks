import { describe, expect, it } from 'vitest';
import type { VideoSource } from '~/types/video.types';
import { validateVideoSource } from '~/utils/video';

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
