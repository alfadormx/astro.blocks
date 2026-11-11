import { Marked } from 'marked';
import type { RichText } from '~/types/richtext.types';

const marked = new Marked({ gfm: true, breaks: false, async: false });

const BLOCK_START =
  /^\s*(?:[-*+]\s|\d+\.\s|#{1,6}\s|>|```|<(?:p|div|ul|ol|h[1-6]|table|blockquote|section|figure)\b)/;

/** Strips the indentation every non-blank line shares, so indented template literals don't read as code blocks. */
export function dedent(text: string): string {
  const lines = text.split('\n');
  const indents = lines.filter((l) => l.trim()).map((l) => l.match(/^[ \t]*/)![0].length);
  const common = indents.length ? Math.min(...indents) : 0;
  return common ? lines.map((l) => l.slice(common)).join('\n') : text;
}

export function isBlockRichText(md: RichText): boolean {
  const text = md.trim();
  return /\n\s*\n/.test(text) || BLOCK_START.test(text);
}

/** Renders Markdown to HTML: one line inline (no `<p>`), several paragraphs or a list as blocks. */
export function renderRichText(md: RichText | undefined | null): string {
  if (!md) return '';
  const text = dedent(md).trim();
  return isBlockRichText(text)
    ? (marked.parse(text) as string)
    : (marked.parseInline(text) as string);
}
