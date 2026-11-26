import type { HeroProps } from '#types/hero.types';

function fail(message: string): never {
  throw new Error(`Hero: ${message}`);
}

/** Throws on a Hero config whose media or content position cannot render in its layout. */
export function validateHero(
  props: Pick<HeroProps, 'layout' | 'contentPosition' | 'image' | 'video'>
): void {
  const { layout = 'centered', contentPosition, image, video } = props;
  if (image && video) fail('set image or video, not both');
  if (layout === 'centered' && (image || video)) {
    fail("image and video need layout 'split'; use container.background behind centered copy");
  }
  if (layout === 'split' && contentPosition === 'end') {
    fail("contentPosition 'end' needs layout 'centered'");
  }
}
