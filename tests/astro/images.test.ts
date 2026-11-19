import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Image from '~/components/blocks/primitives/Image.astro';
import { findImage } from '~/utils/images';

describe('findImage', () => {
  it('resolves a site image under ~/assets/images to ImageMetadata', async () => {
    const image = await findImage('~/assets/images/demos/local/hero.jpg');
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
      props: { src: '~/assets/images/demos/local/hero.jpg', alt: 'Hero' },
    });
    expect(html).toMatch(/<img[^>]*\ssrc="(?!~)[^"]+"/);
  });
});
