import { describe, expect, it } from 'vitest';
import { ariaInvalid, describedBy, fieldControlClass, fieldId } from '~/utils/field';

describe('describedBy', () => {
  it.each([
    ['nothing set', {}, undefined],
    ['help only', { helpId: 'a-help' }, 'a-help'],
    ['help then error', { helpId: 'a-help', errorId: 'a-error' }, 'a-help a-error'],
    ['generated before consumer', { helpId: 'a-help', consumer: 'note' }, 'a-help note'],
    ['consumer duplicate kept once', { helpId: 'a-help', consumer: 'a-help note' }, 'a-help note'],
    ['blank consumer ignored', { consumer: '   ' }, undefined],
  ])('%s', (_name, input, expected) => {
    expect(describedBy(input)).toBe(expected);
  });
});

describe('ariaInvalid', () => {
  it('forces true when an error is set', () => expect(ariaInvalid('Bad', 'false')).toBe('true'));
  it('keeps the consumer value without an error', () =>
    expect(ariaInvalid(undefined, 'false')).toBe('false'));
});

describe('fieldControlClass', () => {
  const base = { size: 'md', variant: 'outline', shape: 'rounded', intent: 'primary' } as const;

  it('reproduces the TextArea field classes for its defaults', () => {
    expect(fieldControlClass({ ...base, base: 'resize-y', disabledClass: 'resize-none' })).toBe(
      'block w-full border-2 text-normal placeholder:text-muted outline-none resize-y transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-offset-2 px-4 py-2 text-[1rem] border-border bg-background rounded-md focus-visible:ring-primary focus:border-primary'
    );
  });

  it('an error switches ring and border to error', () => {
    const cls = fieldControlClass({ ...base, error: 'Bad' });
    expect(cls).toContain('focus-visible:ring-error');
    expect(cls).toContain('border-error');
    expect(cls).not.toContain('ring-primary');
  });

  it('read-only drops the focus border', () =>
    expect(fieldControlClass({ ...base, readOnly: true })).not.toContain('focus:border'));

  it('consumer fieldClass wins conflicts', () =>
    expect(fieldControlClass({ ...base, fieldClass: 'rounded-none' })).not.toContain('rounded-md'));

  it('afterSize survives the size padding', () =>
    expect(fieldControlClass({ ...base, afterSize: 'pe-10' })).toContain('pe-10'));
});

describe('fieldId', () => {
  it('numbers each prefix independently', () => {
    const a = fieldId('probe-a');
    fieldId('probe-b');
    expect(fieldId('probe-a')).not.toBe(a);
    expect(fieldId('probe-c')).toBe('probe-c-0');
  });
});
