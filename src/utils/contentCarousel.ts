import type { ContentCarouselProps } from '~/types/contentcarousel.types';

export interface ResolvedAutoplay {
  enabled: boolean;
  mode: 'step' | 'continuous';
  delay: number;
  speed: number;
  pauseOnHover: boolean;
  pauseOnInteraction: boolean;
}

const DEFAULTS = { delay: 4000, speed: 40, pauseOnHover: true, pauseOnInteraction: true };

/** Normalises the `autoplay` prop; throws when continuous autoplay is set without `loop`. */
export function resolveAutoplay(
  autoplay: ContentCarouselProps['autoplay'],
  loop: boolean
): ResolvedAutoplay {
  const resolved: ResolvedAutoplay =
    typeof autoplay === 'number'
      ? { ...DEFAULTS, enabled: true, mode: 'step', delay: autoplay }
      : typeof autoplay === 'object' && autoplay
        ? { ...DEFAULTS, enabled: true, ...autoplay, mode: autoplay.mode ?? 'step' }
        : { ...DEFAULTS, enabled: Boolean(autoplay), mode: 'step' };
  if (resolved.enabled && resolved.mode === 'continuous' && !loop) {
    throw new Error('ContentCarousel: continuous autoplay requires loop');
  }
  return resolved;
}
