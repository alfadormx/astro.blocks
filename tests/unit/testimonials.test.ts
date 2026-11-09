import { describe, expect, it } from 'vitest';
import { ratingText, splitQuote, validateTestimonials } from '~/utils/testimonials';

describe('splitQuote', () => {
  it('splitQuote returns one paragraph for a quote without blank lines', () => {
    expect(splitQuote('One line.\nSame paragraph.')).toEqual(['One line.\nSame paragraph.']);
  });

  it('splitQuote splits on blank lines, including whitespace-only lines', () => {
    expect(splitQuote('First.\n\nSecond.\n  \nThird.')).toEqual(['First.', 'Second.', 'Third.']);
  });

  it('splitQuote drops empty paragraphs from leading and trailing blank lines', () => {
    expect(splitQuote('\n\nOnly.\n\n')).toEqual(['Only.']);
  });
});

describe('validateTestimonials', () => {
  const entry = { quote: 'Q', author: { name: 'A' } };

  it('validateTestimonials throws on an empty list', () => {
    expect(() => validateTestimonials([])).toThrow(/^Testimonials: expected at least one/);
  });

  const throwCases = [
    { name: 'rating 0', input: [{ ...entry, rating: 0 }], expected: /rating 0/ },
    { name: 'rating 6', input: [{ ...entry, rating: 6 }], expected: /rating 6/ },
    { name: 'rating 3.5', input: [{ ...entry, rating: 3.5 }], expected: /rating 3.5/ },
    {
      name: 'source without href',
      input: [{ ...entry, source: { label: 'G2' } }],
      expected: /source/,
    },
    {
      name: 'source without label',
      input: [{ ...entry, source: { href: '#' } }],
      expected: /source/,
    },
  ];
  for (const { name, input, expected } of throwCases) {
    it(`validateTestimonials throws on ${name}`, () => {
      expect(() => validateTestimonials(input as never)).toThrow(expected);
    });
  }

  it('validateTestimonials accepts ratings 1 to 5 and a full source', () => {
    const input = [1, 2, 3, 4, 5].map((rating) => ({
      ...entry,
      rating,
      source: { label: 'G2', href: '#' },
    }));
    expect(() => validateTestimonials(input as never)).not.toThrow();
  });
});

describe('ratingText', () => {
  it('ratingText replaces every {rating} placeholder', () => {
    expect(ratingText('{rating} out of 5', 4)).toBe('4 out of 5');
  });
});
