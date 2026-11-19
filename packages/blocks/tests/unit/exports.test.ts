import { existsSync, readFileSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const pkgUrl = new URL('../../package.json', import.meta.url);
const pkg = JSON.parse(readFileSync(pkgUrl, 'utf8')) as {
  name: string;
  exports: Record<string, string>;
};
const require = createRequire(pkgUrl);
const entries = Object.entries(pkg.exports);

describe('package exports', () => {
  it('every non-wildcard export target exists', () => {
    const missing = entries
      .filter(([key]) => !key.includes('*'))
      .filter(([, target]) => !existsSync(new URL(target, pkgUrl)));
    expect(missing).toEqual([]);
  });

  it('every wildcard export target directory exists', () => {
    const missing = entries
      .filter(([key]) => key.includes('*'))
      .map(([, target]) => target.slice(0, target.lastIndexOf('/') + 1))
      .filter((dir) => {
        const url = new URL(dir, pkgUrl);
        return !existsSync(url) || !statSync(url).isDirectory();
      });
    expect(missing).toEqual([]);
  });

  it.each([
    'utils/field',
    'integration/utils/configBuilder',
    'src/utils/styles.ts',
    'components/blocks/primitives/Button.astro',
    'colors.css',
  ])('does not resolve the unlisted subpath %s', (subpath) => {
    expect(() => require.resolve(`${pkg.name}/${subpath}`)).toThrow(/not defined by "exports"/);
  });

  it.each([
    ['utils/styles', /src\/utils\/styles\.ts$/],
    ['primitives/Button.astro', /src\/components\/blocks\/primitives\/Button\.astro$/],
    ['types/button', /src\/types\/button\.types\.ts$/],
    ['blocks.css', /src\/styles\/blocks\.css$/],
  ])('resolves the listed subpath %s', (subpath, target) => {
    expect(require.resolve(`${pkg.name}/${subpath}`)).toMatch(target);
  });
});
