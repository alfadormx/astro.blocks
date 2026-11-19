import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import Background from '~/components/blocks/primitives/Background.astro';

const VIDEO = '/videos/flower.mp4';

const render = async (props: Record<string, unknown>) => {
  const container = await AstroContainer.create();
  return container.renderToString(Background, { props });
};

const buttonTag = (html: string, hook: string) =>
  html.match(new RegExp(`<button[^>]*${hook}[^>]*>`))?.[0] ?? '';

describe('Background video', () => {
  it('renders the poster on the video', async () => {
    const html = await render({ video: VIDEO, poster: '/poster.jpg' });
    expect(html).toMatch(/<video[^>]*poster="\/poster\.jpg"/);
  });

  it('does not autoplay from markup', async () => {
    expect(await render({ video: VIDEO })).not.toMatch(/<video[^>]*autoplay/);
  });

  it('renders both controls hidden with their hooks', async () => {
    const html = await render({ video: VIDEO });
    expect(buttonTag(html, 'data-background-pause')).toMatch(/\shidden[\s>=]/);
    expect(buttonTag(html, 'data-background-play')).toMatch(/\shidden[\s>=]/);
  });

  it('is not ready on the server', async () => {
    expect(await render({ video: VIDEO })).not.toContain('data-background-ready');
  });

  it('lets a pauseButton instance override the internal label', async () => {
    const html = await render({ video: VIDEO, pauseButton: { 'aria-label': 'Stop' } });
    expect(buttonTag(html, 'data-background-pause')).toContain('aria-label="Stop"');
    expect(html).not.toContain('aria-label="Pause background video"');
  });

  it('ignores poster without a video', async () => {
    expect(await render({ poster: '/poster.jpg' })).not.toContain('poster');
  });

  it('renders no controls without a video', async () => {
    expect(await render({ image: '/poster.jpg' })).not.toContain('data-background-pause');
  });
});
