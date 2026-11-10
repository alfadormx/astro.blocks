import type { LogoCloudLogo, LogoCloudProps } from '~/types/logocloud.types';

// One clone set per side covers the widest view (basis-1/6); fewer logos leave a gap.
export const MARQUEE_MIN_LOGOS = 6;

function fail(message: string): never {
  throw new Error(`LogoCloud: ${message}`);
}

/** Throws on a LogoCloud config that cannot render as designed. */
export function validateLogoCloud(
  logos: LogoCloudLogo[],
  layout: NonNullable<LogoCloudProps['layout']>
): void {
  if (logos.length === 0) fail('expected at least one logo');
  logos.forEach(({ name, image, vector }, index) => {
    if (!name) fail(`logo ${index} has no name`);
    if (Boolean(image) === Boolean(vector)) {
      fail(`logo ${index} ("${name}") needs exactly one of image or vector`);
    }
  });
  if (layout === 'marquee' && logos.length < MARQUEE_MIN_LOGOS) {
    fail(`layout "marquee" needs at least ${MARQUEE_MIN_LOGOS} logos; got ${logos.length}`);
  }
}
