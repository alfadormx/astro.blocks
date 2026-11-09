import type { Testimonial } from '~/types/testimonials.types';

function fail(message: string): never {
  throw new Error(`Testimonials: ${message}`);
}

/** Throws on a Testimonials config that cannot render as designed. */
export function validateTestimonials(testimonials: Testimonial[]): void {
  if (testimonials.length === 0) fail('expected at least one testimonial');
  testimonials.forEach(({ rating, source }, index) => {
    if (rating !== undefined && !(Number.isInteger(rating) && rating >= 1 && rating <= 5)) {
      fail(`testimonial ${index} has rating ${rating}; expected a whole number from 1 to 5`);
    }
    if (source && (!source.label || !source.href)) {
      fail(`testimonial ${index} has a source without both label and href`);
    }
  });
}

/** Splits a plain-text quote into paragraphs on blank lines. */
export function splitQuote(quote: string): string[] {
  return quote
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Fills `{rating}` in the rating label. */
export function ratingText(label: string, rating: number): string {
  return label.replaceAll('{rating}', String(rating));
}
