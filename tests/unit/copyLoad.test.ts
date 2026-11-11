import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadCopy, mergeCopy, resolveMdRefs } from '../../vendor/integration/copy/load';

function copyRoot(files: Record<string, string>): string {
  const root = mkdtempSync(join(tmpdir(), 'copy-'));
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(join(root, file, '..'), { recursive: true });
    writeFileSync(join(root, file), content);
  }
  return root;
}

describe('mergeCopy', () => {
  it('deep-merges the language over the default', () => {
    const { value, warnings } = mergeCopy(
      { a: 'A', nested: { b: 'B', c: 'C' } },
      { a: 'a', nested: { b: 'b', c: 'c' } },
      'es.yaml'
    );
    expect(value).toEqual({ a: 'a', nested: { b: 'b', c: 'c' } });
    expect(warnings).toEqual([]);
  });

  it('falls back to the default for a missing key and names its dotted path', () => {
    const { value, warnings } = mergeCopy(
      { hero: { title: 'T', label: 'L' } },
      { hero: { title: 't' } },
      'es.yaml'
    );
    expect(value).toEqual({ hero: { title: 't', label: 'L' } });
    expect(warnings).toEqual([{ file: 'es.yaml', keyPath: 'hero.label' }]);
  });

  it('replaces arrays wholesale instead of merging by index', () => {
    const { value } = mergeCopy({ list: ['a', 'b', 'c'] }, { list: ['x'] }, 'es.yaml');
    expect(value).toEqual({ list: ['x'] });
  });

  it('falls back to the whole default array when the language has none', () => {
    const { value, warnings } = mergeCopy({ list: ['a', 'b'] }, {}, 'es.yaml');
    expect(value).toEqual({ list: ['a', 'b'] });
    expect(warnings.map((w) => w.keyPath)).toEqual(['list']);
  });
});

describe('resolveMdRefs', () => {
  const read = (p: string) => `contents of ${p}`;

  it('replaces a ./file.md string with the file contents, relative to the YAML', () => {
    expect(resolveMdRefs({ body: './intro.md' }, '/copy/about', read)).toEqual({
      body: 'contents of /copy/about/intro.md',
    });
  });

  it('leaves other strings untouched', () => {
    const value = { a: 'intro.md', b: './intro.txt', c: 'See ./intro.md' };
    expect(resolveMdRefs(value, '/x', read)).toEqual(value);
  });

  it('resolves references inside arrays', () => {
    expect(resolveMdRefs(['./a.md'], '/x', read)).toEqual(['contents of /x/a.md']);
  });
});

describe('loadCopy', () => {
  it('loads every page and language, with fallbacks and warnings', () => {
    const root = copyRoot({
      'home/en.yaml': 'title: Hello\nbody: ./body.md\n',
      'home/body.md': 'English body',
      'home/es.yaml': 'body: ./body.es.md\n',
      'home/body.es.md': 'Cuerpo',
    });
    const { copy, warnings, files } = loadCopy(root, ['en', 'es'], 'en');
    expect(copy.home).toEqual({
      en: { title: 'Hello', body: 'English body' },
      es: { title: 'Hello', body: 'Cuerpo' },
    });
    expect(warnings).toEqual([{ file: join(root, 'home/es.yaml'), keyPath: 'title' }]);
    expect(files).toContain(join(root, 'home/body.es.md'));
  });

  it('falls back to the default language when a language file is missing', () => {
    const root = copyRoot({ 'about/en.yaml': 'title: About\n' });
    const { copy, warnings } = loadCopy(root, ['en', 'es'], 'en');
    expect(copy.about.es).toEqual({ title: 'About' });
    expect(warnings).toEqual([{ file: join(root, 'about/es.yaml'), keyPath: '' }]);
  });

  it('requires the default-language file', () => {
    const root = copyRoot({ 'about/es.yaml': 'title: Acerca\n' });
    expect(() => loadCopy(root, ['en', 'es'], 'en')).toThrow(/needs .*about\/en\.yaml/);
  });

  it('returns nothing when there is no copy folder', () => {
    expect(loadCopy('/does/not/exist', ['en'], 'en').copy).toEqual({});
  });
});
