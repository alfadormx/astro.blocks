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

  it('lets a named text size cancel a length-hinted arbitrary clamp size', () => {
    expect(cn('text-[length:clamp(2rem,1.5rem+2vw,3rem)]', 'text-2xl')).toBe('text-2xl');
  });

  it('keeps an explicit leading that follows an arbitrary font size', () => {
    expect(cn('text-[length:clamp(2rem,1.5rem+2vw,3rem)] leading-[1.2]')).toBe(
      'text-[length:clamp(2rem,1.5rem+2vw,3rem)] leading-[1.2]'
    );
  });

  it('drops an explicit leading when a later text size sets its own line-height', () => {
    expect(cn('leading-[1.2] font-bold', 'text-2xl font-semibold')).toBe('text-2xl font-semibold');
  });

  // mergeConfigs does its own first-wins dedupe precisely because cn does not:
  // twMerge only collapses tokens it recognises as conflicting Tailwind utilities.
  it('does not de-duplicate identical non-tailwind tokens', () => {
    expect(cn('[&>*]:p-1 unknown-class unknown-class')).toBe(
      '[&>*]:p-1 unknown-class unknown-class'
    );
  });
});
