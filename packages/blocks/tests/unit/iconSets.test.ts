import { describe, expect, it } from 'vitest';
import { missingIconSets } from '../../src/integration/utils/iconSets';

describe('missingIconSets', () => {
  it('reports nothing when both sets are in dependencies', () => {
    expect(
      missingIconSets({
        dependencies: { '@iconify-json/heroicons': '^1.2.3', '@iconify-json/mdi': '^1.2.3' },
      })
    ).toEqual([]);
  });

  it('reports nothing when the sets are only in devDependencies', () => {
    expect(
      missingIconSets({
        devDependencies: { '@iconify-json/heroicons': '^1.2.3', '@iconify-json/mdi': '^1.2.3' },
      })
    ).toEqual([]);
  });

  it('reports the one missing set', () => {
    expect(missingIconSets({ dependencies: { '@iconify-json/heroicons': '^1.2.3' } })).toEqual([
      '@iconify-json/mdi',
    ]);
  });

  it('reports both sets for a package.json without dependencies', () => {
    expect(missingIconSets({})).toEqual(['@iconify-json/heroicons', '@iconify-json/mdi']);
  });
});
