import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Hero from '~/components/blocks/composite/Hero.astro';

const VIDEO = '/videos/flower.mp4';
const GRADIENT = 'bg-linear-to-t from-black/70 to-transparent';

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(Hero, { props });
};

describe('Hero media overlay', () => {
  it('keeps the default wash when no overlayClass is given', async () => {
    const html = await render({ container: { background: { video: VIDEO } } });
    expect(html).toContain('bg-base/60');
  });

  it('drops the default wash when a gradient overlayClass is given', async () => {
    const html = await render({
      container: { background: { video: VIDEO, overlayClass: GRADIENT } },
    });
    expect(html).not.toContain('bg-base/60');
    expect(html).toContain('bg-linear-to-t');
  });

  it('drops the default wash when overlayClass is empty', async () => {
    const html = await render({ container: { background: { video: VIDEO, overlayClass: '' } } });
    expect(html).not.toContain('bg-base/60');
  });
});
