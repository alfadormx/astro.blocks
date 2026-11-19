import { describe, expect, it } from 'vitest';
import {
  checkedFillClass,
  focusBorderClass,
  focusRingClass,
  selectedBorderClass,
  selectedFillClass,
  type Intent,
} from '~/utils/intentStyles';

const colourIntents: Intent[] = [
  'primary',
  'secondary',
  'tertiary',
  'accent',
  'success',
  'warning',
  'error',
];

describe('intent styles', () => {
  it.each(colourIntents)('%s maps to its own colour token in every class', (intent) => {
    expect(selectedBorderClass(intent)).toBe(`border-${intent}`);
    expect(selectedFillClass(intent)).toBe(`bg-${intent}`);
    expect(focusBorderClass(intent)).toBe(`focus:border-${intent}`);
    expect(focusRingClass(intent)).toBe(`focus-visible:ring-${intent}`);
    expect(focusRingClass(intent, 'has-focus-visible')).toBe(`has-focus-visible:ring-${intent}`);
  });

  it('neutral resolves to the emphasis token for selected, focus border and focus ring', () => {
    expect(selectedBorderClass('neutral')).toBe('border-emphasis');
    expect(selectedFillClass('neutral')).toBe('bg-emphasis');
    expect(focusBorderClass('neutral')).toBe('focus:border-emphasis');
    expect(focusRingClass('neutral')).toBe('focus-visible:ring-emphasis');
    expect(focusRingClass('neutral', 'has-focus-visible')).toBe('has-focus-visible:ring-emphasis');
  });

  it.each(colourIntents)('%s fills and borders a checked box with its own colour', (intent) => {
    expect(checkedFillClass(intent)).toBe(`checked:bg-${intent} checked:border-${intent}`);
  });

  it('neutral fills a checked box with the emphasis token', () => {
    expect(checkedFillClass('neutral')).toBe('checked:bg-emphasis checked:border-emphasis');
  });
});
