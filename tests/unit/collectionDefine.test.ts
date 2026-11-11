import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { languageLayout } from '../../vendor/integration/collections/define';

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
      `Collection "posts" mixes language folders and loose files in ${dir}`
    );
  });

  it('rejects a folder that is not a configured language', () => {
    expect(() => languageLayout('posts', folder(['drafts/a.md']), ['en', 'es'])).toThrow(
      /mixes language folders and loose files/
    );
  });
});
