import { describe, expect, it } from 'vitest';
import { dedent, isBlockRichText, renderRichText } from '~/utils/richText';

describe('renderRichText', () => {
  it('renders a single line inline, without a paragraph', () => {
    expect(renderRichText('Hello **bold** world')).toBe('Hello <strong>bold</strong> world');
  });

  it('renders blank-line-separated text as paragraphs', () => {
    expect(renderRichText('One\n\nTwo')).toBe('<p>One</p>\n<p>Two</p>\n');
  });

  it('renders a list as a block', () => {
    expect(renderRichText('- a\n- b')).toMatch(/^<ul>\s*<li>a<\/li>\s*<li>b<\/li>\s*<\/ul>/);
  });

  it('passes inline HTML through unchanged', () => {
    expect(renderRichText('<strong>x</strong> y')).toBe('<strong>x</strong> y');
  });

  it('passes an indented multi-line HTML block through unchanged', () => {
    const html = `
      <p class="a">One</p>
      <p>Two</p>`;
    expect(renderRichText(html)).toBe('<p class="a">One</p>\n<p>Two</p>');
  });

  it('renders nothing for an empty value', () => {
    expect(renderRichText(undefined)).toBe('');
    expect(renderRichText('')).toBe('');
  });

  it('renders links inline', () => {
    expect(renderRichText('[Docs](/documentation)')).toBe('<a href="/documentation">Docs</a>');
  });
});

describe('isBlockRichText', () => {
  it.each([
    ['# Title', true],
    ['1. first', true],
    ['> quote', true],
    ['<div>x</div>', true],
    ['plain line', false],
    ['<em>x</em>', false],
  ])('%s → %s', (input, expected) => {
    expect(isBlockRichText(input)).toBe(expected);
  });
});

describe('dedent', () => {
  it('removes the indentation shared by every non-blank line', () => {
    expect(dedent('    a\n\n      b')).toBe('a\n\n  b');
  });
});
