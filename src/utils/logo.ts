import type { LogoProps } from '~/types/logo.types';

type LogoInput = LogoProps & { anchorId?: string };

function withoutId<T extends { id?: string | null }>(media: T): Omit<T, 'id'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...rest } = media;
  return rest;
}

/** Copy of a logo config that can render a second time without repeating per-instance fields. */
export function stripLogoInstanceFields(logo: LogoInput = {}): LogoProps {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, name: _name, anchorId: _anchorId, vector, image, ...rest } = logo;
  return {
    ...rest,
    ...(vector && { vector: withoutId(vector) }),
    ...(image && { image: withoutId(image) }),
  };
}
