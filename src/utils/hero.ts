import type { HeroProps } from '~/types/hero.types';

function fail(message: string): never {
  throw new Error(`Hero: ${message}`);
}

/** Throws on a Hero config whose media cannot render in its layout. */
export function validateHero(props: Pick<HeroProps, 'layout' | 'image' | 'video'>): void {
  const { layout = 'centered', image, video } = props;
  if (image && video) fail('set image or video, not both');
  if (layout === 'centered' && (image || video)) {
    fail("image and video need layout 'split'; use container.background behind centered copy");
  }
}
