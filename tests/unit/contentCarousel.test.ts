import { describe, expect, it } from 'vitest';
import { resolveAutoplay } from '~/utils/contentCarousel';

describe('resolveAutoplay', () => {
  it('resolveAutoplay treats a number as a step delay', () => {
    expect(resolveAutoplay(2500, false)).toMatchObject({
      enabled: true,
      mode: 'step',
      delay: 2500,
    });
  });

  it('resolveAutoplay treats true as step autoplay with the default delay', () => {
    expect(resolveAutoplay(true, false)).toMatchObject({
      enabled: true,
      mode: 'step',
      delay: 4000,
      pauseOnHover: true,
      pauseOnInteraction: true,
    });
  });

  it('resolveAutoplay leaves autoplay off for false and undefined', () => {
    expect(resolveAutoplay(false, false).enabled).toBe(false);
    expect(resolveAutoplay(undefined, false).enabled).toBe(false);
  });

  it('resolveAutoplay defaults an object without mode to step', () => {
    expect(resolveAutoplay({ delay: 3000, pauseOnHover: false }, false)).toMatchObject({
      enabled: true,
      mode: 'step',
      delay: 3000,
      pauseOnHover: false,
    });
  });

  it('resolveAutoplay keeps continuous mode and fills the default speed', () => {
    expect(resolveAutoplay({ mode: 'continuous' }, true)).toMatchObject({
      enabled: true,
      mode: 'continuous',
      speed: 40,
    });
  });

  it('resolveAutoplay keeps enabled false from an object', () => {
    expect(resolveAutoplay({ enabled: false, delay: 3000 }, false).enabled).toBe(false);
  });

  it('resolveAutoplay throws on continuous autoplay without loop', () => {
    expect(() => resolveAutoplay({ mode: 'continuous' }, false)).toThrow(
      /^ContentCarousel: continuous autoplay requires loop/
    );
  });

  it('resolveAutoplay allows continuous config with enabled false and no loop', () => {
    expect(() => resolveAutoplay({ mode: 'continuous', enabled: false }, false)).not.toThrow();
  });
});
