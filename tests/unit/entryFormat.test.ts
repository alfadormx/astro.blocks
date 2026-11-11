import { describe, expect, it } from 'vitest';
import { formatDate, formatEventRange, localeFor } from '~/utils/entryFormat';

const i18n = {
  default: 'en',
  languages: [
    { code: 'en', locale: 'en-US' },
    { code: 'es', locale: 'es-ES' },
  ],
};

describe('localeFor', () => {
  it('returns the configured locale', () => {
    expect(localeFor('es', i18n)).toBe('es-ES');
  });

  it('falls back to the default language', () => {
    expect(localeFor('fr', i18n)).toBe('en-US');
    expect(localeFor(undefined, i18n)).toBe('en-US');
  });
});

describe('formatDate', () => {
  it('formats in the given locale', () => {
    expect(formatDate(new Date('2026-10-01T12:00:00Z'), 'en-US')).toBe('Oct 1, 2026');
  });
});

describe('formatEventRange', () => {
  const start = new Date('2030-05-20T17:00:00Z');
  const end = new Date('2030-05-20T21:00:00Z');

  it('shows a same-day event as one date and a time range', () => {
    expect(formatEventRange(start, end, 'en-US', 'America/New_York')).toMatch(
      /^May 20, 2030, 1:00\s?PM–5:00\s?PM EDT$/
    );
  });

  it('follows the given zone rather than a site default', () => {
    expect(formatEventRange(start, end, 'en-US', 'Europe/Madrid')).toMatch(
      /7:00\s?PM–11:00\s?PM GMT\+2$/
    );
  });

  it('shows both date-times for a multi-day event', () => {
    expect(
      formatEventRange(start, new Date('2030-05-21T21:00:00Z'), 'en-US', 'America/New_York')
    ).toMatch(/May 20, 2030.* – May 21, 2030.*EDT$/);
  });

  it('shows the start alone without an end', () => {
    expect(formatEventRange(start, undefined, 'en-US', 'UTC')).toMatch(/5:00\s?PM UTC$/);
  });
});
