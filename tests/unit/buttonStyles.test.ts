import { describe, expect, it } from 'vitest';
import { intentClass } from '~/utils/buttonStyles';
import { focusRingClass, type Intent } from '~/utils/intentStyles';

const INTENTS: Intent[] = [
  'primary',
  'secondary',
  'tertiary',
  'accent',
  'success',
  'warning',
  'error',
  'neutral',
];

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

describe.each(['solid', 'outline', 'ghost'] as const)('%s button rings', (variant) => {
  it.each(INTENTS)('%s ring comes from focusRingClass', (intent) => {
    expect(intentClass(variant, intent).split(' ')).toContain(focusRingClass(intent));
  });
});

it.each(INTENTS)('link %s adds no intent ring', (intent) => {
  expect(intentClass('link', intent)).not.toMatch(/\bring-/);
});
