import { describe, expect, it } from 'vitest';
import { currentLanguage } from '~/utils/currentLanguage';

const i18n = {
  default: 'en',
  languages: [
    { code: 'en', basePath: '/' },
    { code: 'es', basePath: '/es' },
  ],
};

describe('currentLanguage', () => {
  it('returns the language whose basePath prefixes the path', () => {
    expect(currentLanguage('/es/docs', i18n).code).toBe('es');
  });

  it('matches the root basePath only on the exact root', () => {
    expect(currentLanguage('/', i18n).code).toBe('en');
  });

  it('does not match a basePath that is only a string prefix', () => {
    expect(currentLanguage('/estate', i18n).code).toBe('en');
  });

  it('falls back to the default language when nothing matches', () => {
    const spanishDefault = { ...i18n, default: 'es' };
    expect(currentLanguage('/documentation', spanishDefault).code).toBe('es');
  });
});
