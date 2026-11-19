import { describe, expect, it } from 'vitest';
import { isCurrentPath, normalizePath } from '~/utils/currentPath';

describe('normalizePath', () => {
  it('trims one trailing slash and keeps the root', () => {
    expect(normalizePath('/demos/saas/')).toBe('/demos/saas');
    expect(normalizePath('/')).toBe('/');
    expect(normalizePath('')).toBe('/');
  });
});

describe('isCurrentPath', () => {
  it.each([
    ['/demos/saas/blog', '/demos/saas/blog'],
    ['/demos/saas/blog/', '/demos/saas/blog'],
    ['/demos/saas/blog', '/demos/saas/blog/'],
    ['/', '/'],
    ['/', ''],
    ['/es/demos/saas/blog', '/es/demos/saas/blog'],
  ])('matches %s on %s', (href, current) => {
    expect(isCurrentPath(href, current)).toBe(true);
  });

  it.each([
    ['/demos/saas#pricing', '/demos/saas'],
    ['/demos/saas?plan=pro', '/demos/saas'],
    ['/demos/saas/blog', '/demos/saas/blog/hello-world'],
    ['/demos/saas/blog', '/es/demos/saas/blog'],
    [undefined, '/'],
    ['', '/'],
  ])('does not match %s on %s', (href, current) => {
    expect(isCurrentPath(href, current)).toBe(false);
  });
});
