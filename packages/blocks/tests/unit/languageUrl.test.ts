import { describe, expect, it } from 'vitest';
import { applyTrailingSlash, languageUrl } from '~/utils/languageUrl';

const en = { basePath: '/' };
const es = { basePath: '/es' };

describe('languageUrl', () => {
  it('prefixes a default-language path', () => {
    expect(languageUrl('/pricing', en, es, false)).toBe('/es/pricing');
  });

  it('strips the current prefix for the default language', () => {
    expect(languageUrl('/es/pricing', es, en, false)).toBe('/pricing');
  });

  it('maps the root to the language base path', () => {
    expect(languageUrl('/', en, es, false)).toBe('/es');
    expect(languageUrl('/es', es, en, false)).toBe('/');
  });

  it('applies the trailing-slash setting', () => {
    expect(languageUrl('/pricing', en, es, true)).toBe('/es/pricing/');
  });
});

describe('applyTrailingSlash', () => {
  it('leaves file paths alone', () => {
    expect(applyTrailingSlash('/feed.xml', true)).toBe('/feed.xml');
  });

  it('drops a trailing slash except on the root', () => {
    expect(applyTrailingSlash('/a/', false)).toBe('/a');
    expect(applyTrailingSlash('/', false)).toBe('/');
  });
});
