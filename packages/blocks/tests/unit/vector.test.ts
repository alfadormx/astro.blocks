import { describe, expectTypeOf, it } from 'vitest';
import type { VectorProps } from '~/types/vector.types';

describe('vector props', () => {
  it('rejects fit, which the block never reads', () => {
    const props: VectorProps = {
      src: '/icon.svg',
      // @ts-expect-error fit is not a Vector prop
      fit: 'contain',
    };
    expectTypeOf(props).toBeObject();
  });
});
