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

const sourceTags = (html: string) => html.match(/<source[^>]*>/g) ?? [];

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

describe('Background video sources', () => {
  it('announces an mp4 URL as video/mp4', async () => {
    const [tag] = sourceTags(await render({ video: '/v/clip.mp4' }));
    expect(tag).toContain('type="video/mp4"');
  });

  it('announces a webm URL as video/webm', async () => {
    const [tag] = sourceTags(await render({ video: '/v/clip.webm' }));
    expect(tag).toContain('type="video/webm"');
  });

  it('infers the type of a URL with a query string', async () => {
    const [tag] = sourceTags(await render({ video: '/v/clip.webm?v=2' }));
    expect(tag).toContain('src="/v/clip.webm?v=2"');
    expect(tag).toContain('type="video/webm"');
  });

  it('leaves type off an extensionless URL', async () => {
    const tags = sourceTags(
      await render({ video: 'https://www.pexels.com/download/video/2646392/' })
    );
    expect(tags).toHaveLength(1);
    expect(tags[0]).not.toContain('type=');
  });

  it('renders a list as one source per entry in order', async () => {
    const tags = sourceTags(
      await render({
        video: [
          { src: '/v/clip.webm', type: 'video/webm' },
          { src: '/v/clip.mp4', type: 'video/mp4' },
        ],
      })
    );
    expect(tags).toHaveLength(2);
    expect(tags[0]).toMatch(/src="\/v\/clip\.webm"[^>]*type="video\/webm"/);
    expect(tags[1]).toMatch(/src="\/v\/clip\.mp4"[^>]*type="video\/mp4"/);
  });

  it('infers the type of a list entry without one', async () => {
    const [tag] = sourceTags(await render({ video: [{ src: '/v/clip.webm' }] }));
    expect(tag).toContain('type="video/webm"');
  });

  it('keeps an explicit codecs type verbatim', async () => {
    const [tag] = sourceTags(
      await render({ video: [{ src: '/v/clip.webm', type: 'video/webm; codecs="vp9"' }] })
    );
    expect(tag).toContain('type="video/webm; codecs=&quot;vp9&quot;"');
  });

  it('rejects an empty list', async () => {
    await expect(render({ video: [] })).rejects.toThrow(
      /background\.video needs at least one source/
    );
  });

  it('rejects a blank src naming its index', async () => {
    await expect(render({ video: [{ src: ' ' }] })).rejects.toThrow(/background\.video\[0\]/);
  });
});
