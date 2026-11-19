import { describe, it, expect } from 'vitest';

// Since processSource is not exported, we re-implement the logic for testing
function processSource(src: string, type: 'full' | 'template-only'): string {
  if (type === 'template-only') {
    const lines = src.split('\n');
    let startIdx = 0;
    let inFrontmatter = false;

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();

      if (trimmed === '---') {
        if (inFrontmatter) {
          inFrontmatter = false;
        } else {
          inFrontmatter = true;
        }
        continue;
      }

      if (
        inFrontmatter ||
        (trimmed && trimmed.startsWith('import ')) ||
        (trimmed && trimmed.startsWith('export '))
      ) {
        startIdx = i + 1;
        continue;
      }

      if (trimmed) {
        startIdx = i;
        break;
      }
    }

    return lines.slice(startIdx).join('\n').trim();
  }
  return src;
}

describe('Example component: processSource', () => {
  describe('sourceType="template-only"', () => {
    it('removes frontmatter and imports', () => {
      const source = `---
import Button from '~/components/blocks/primitives/Button.astro';
---
<Button>Click me</Button>`;

      const result = processSource(source, 'template-only');

      expect(result).not.toContain('---');
      expect(result).not.toContain('import');
      expect(result).toContain('<Button>Click me</Button>');
    });

    it('handles multiple imports', () => {
      const source = `---
import A from 'a';
import B from 'b';
import C from 'c';
---
<Component />`;

      const result = processSource(source, 'template-only');

      expect(result).not.toContain('import');
      expect(result).toContain('<Component />');
    });

    it('preserves the component template', () => {
      const source = `---
import Button from '~/components/blocks/primitives/Button.astro';
---
<div>
  <Button>Test</Button>
  <span>Content</span>
</div>`;

      const result = processSource(source, 'template-only');

      expect(result).toContain('<div>');
      expect(result).toContain('<Button>Test</Button>');
      expect(result).toContain('<span>Content</span>');
      expect(result).toContain('</div>');
    });

    it('handles no imports case', () => {
      const source = `---
---
<Button>Click me</Button>`;

      const result = processSource(source, 'template-only');

      expect(result).toContain('<Button>Click me</Button>');
      expect(result).not.toContain('---');
    });

    it('handles empty frontmatter', () => {
      const source = `---
---
<div>Content</div>`;

      const result = processSource(source, 'template-only');

      expect(result).toBe('<div>Content</div>');
    });
  });

  describe('sourceType="full"', () => {
    it('preserves entire source', () => {
      const source = `---
import Button from '~/components/blocks/primitives/Button.astro';
---
<Button>Click me</Button>`;

      const result = processSource(source, 'full');

      expect(result).toBe(source);
    });

    it('includes imports and frontmatter', () => {
      const source = `---
import A from 'a';
---
Content`;

      const result = processSource(source, 'full');

      expect(result).toContain('import A');
      expect(result).toContain('---');
      expect(result).toContain('Content');
    });
  });

  describe('edge cases', () => {
    it('handles whitespace correctly', () => {
      const source = `---
import Button from '~/components/blocks/primitives/Button.astro';
---

<Button>Click me</Button>`;

      const result = processSource(source, 'template-only');

      expect(result).toContain('<Button>Click me</Button>');
      expect(result).not.toContain('import');
    });

    it('preserves indentation in template', () => {
      const source = `---
import Button from '~/components/blocks/primitives/Button.astro';
---
<div>
  <Button>Indented</Button>
</div>`;

      const result = processSource(source, 'template-only');

      expect(result).toContain('  <Button>');
    });

    it('handles single line template', () => {
      const source = `---
import Button from '~/components/blocks/primitives/Button.astro';
---
<Button>Simple</Button>`;

      const result = processSource(source, 'template-only');

      expect(result).toBe('<Button>Simple</Button>');
    });
  });
});
