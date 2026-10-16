import { describe, expect, it } from 'vitest';
import { intentClass } from '~/utils/buttonStyles';

describe('button intent classes', () => {
  it.each(['solid', 'outline', 'ghost'] as const)(
    'neutral %s uses the emphasis focus ring',
    (variant) => {
      const classes = intentClass(variant, 'neutral').split(' ');

      expect(classes).toContain('focus-visible:ring-emphasis');
      expect(classes).not.toContain('focus-visible:ring-border');
    }
  );
});
