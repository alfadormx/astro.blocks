import { describe, expect, it } from 'vitest';
import { cn } from '~/utils/styles';

describe('cn', () => {
  it('returns an empty string with no inputs', () => {
    expect(cn()).toBe('');
  });

  it('drops falsy inputs', () => {
    expect(cn(undefined, null, false)).toBe('');
  });

  it('resolves conflicting tailwind utilities last-wins', () => {
    expect(cn('p-1', 'p-2')).toBe('p-2');
    expect(cn('text-sm text-lg')).toBe('text-lg');
  });

  it('flattens arrays and truthy object keys', () => {
    expect(cn(['a', 'b'], { c: true, d: false })).toBe('a b c');
  });

  // mergeConfigs does its own first-wins dedupe precisely because cn does not:
  // twMerge only collapses tokens it recognises as conflicting Tailwind utilities.
  it('does not de-duplicate identical non-tailwind tokens', () => {
    expect(cn('[&>*]:p-1 unknown-class unknown-class')).toBe(
      '[&>*]:p-1 unknown-class unknown-class'
    );
  });
});
