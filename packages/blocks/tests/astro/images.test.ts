import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it, vi } from 'vitest';
import Image from '~/components/blocks/primitives/Image.astro';
import { findImage } from '~/utils/images';

describe('findImage', () => {
  it('resolves a site image under ~/assets/images to ImageMetadata', async () => {
    const image = await findImage('~/assets/images/hero.jpg');
    expect(image).toMatchObject({ format: 'jpg', width: expect.any(Number) });
  });

  it('returns null for a missing site image', async () => {
    expect(await findImage('~/assets/images/nope.jpg')).toBeNull();
  });

  it('passes URLs and root paths through unchanged', async () => {
    expect(await findImage('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
    expect(await findImage('/x.png')).toBe('/x.png');
  });
});

describe('Image', () => {
  it('renders an optimised src for a local site image', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(Image, {
      props: { src: '~/assets/images/hero.jpg', alt: 'Hero' },
    });
    expect(html).toMatch(/<img[^>]*\ssrc="(?!~)[^"]+"/);
  });

  it('sizes a responsive remote image from aspectRatio alone without logging an error', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const container = await AstroContainer.create();
      const html = await container.renderToString(Image, {
        props: {
          src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600',
          alt: 'Mountains',
          layout: 'responsive',
          aspectRatio: 16 / 9,
        },
      });
      expect(html).toContain(`aspect-ratio: ${16 / 9}`);
      expect(error).not.toHaveBeenCalled();
    } finally {
      error.mockRestore();
    }
  });
});
