import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { entryId, languageLayout } from '../../src/integration/collections/define';

function folder(files: string[]): string {
  const dir = mkdtempSync(join(tmpdir(), 'collection-'));
  for (const file of files) {
    mkdirSync(join(dir, file, '..'), { recursive: true });
    writeFileSync(join(dir, file), '---\ntitle: x\n---\n');
  }
  return dir;
}

describe('languageLayout', () => {
  it('reads language folders as a multi-language collection', () => {
    expect(languageLayout('posts', folder(['en/a.md', 'es/a.md']), ['en', 'es'])).toBe('multi');
  });

  it('reads loose files as a single-language collection', () => {
    expect(languageLayout('posts', folder(['a.md', 'b.mdx']), ['en', 'es'])).toBe('single');
  });

  it('rejects language folders mixed with loose files', () => {
    const dir = folder(['en/a.md', 'b.md']);
    expect(() => languageLayout('posts', dir, ['en', 'es'])).toThrow(
      `Collection "posts" mixes language folders with other files or folders in ${dir}`
    );
  });

  it('reads non-language folders as a single-language collection', () => {
    expect(languageLayout('docs', folder(['guides/a.md', 'b.md']), ['en', 'es'])).toBe('single');
  });

  it('rejects language folders mixed with other folders', () => {
    expect(() => languageLayout('posts', folder(['en/a.md', 'guides/b.md']), ['en', 'es'])).toThrow(
      /mixes language folders with other files or folders/
    );
  });
});

describe('entryId', () => {
  it('strips .md from a markdown entry path', () => {
    expect(entryId('en/a.md')).toBe('en/a');
  });

  it('strips .mdx from an mdx entry path', () => {
    expect(entryId('guides/b.mdx')).toBe('guides/b');
  });

  it('strips only the final extension', () => {
    expect(entryId('en/x.mdx.md')).toBe('en/x.mdx');
  });
});
