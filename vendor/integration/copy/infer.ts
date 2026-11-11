const pad = (n: number) => ' '.repeat(n);

/** A TypeScript type literal for a YAML value; arrays of mixed items become unions. */
export function toTypeLiteral(value: unknown, indent = 0): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) {
    const items = [...new Set(value.map((v) => toTypeLiteral(v, indent)))];
    if (items.length === 0) return 'unknown[]';
    return items.length === 1 && !items[0].includes('|')
      ? `${items[0]}[]`
      : `(${items.join(' | ')})[]`;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return 'Record<string, never>';
    const members = entries.map(
      ([k, v]) => `${pad(indent + 2)}${JSON.stringify(k)}: ${toTypeLiteral(v, indent + 2)};`
    );
    return `{\n${members.join('\n')}\n${pad(indent)}}`;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return typeof value;
  }
  return 'unknown';
}

export function copyRegistryDts(
  copy: Record<string, Record<string, unknown>>,
  defaultLang: string
): string {
  const members = Object.entries(copy)
    .map(
      ([page, langs]) => `      ${JSON.stringify(page)}: ${toTypeLiteral(langs[defaultLang], 6)};`
    )
    .join('\n');
  return [
    'declare global {',
    '  namespace AstroBlocks {',
    '    interface CopyRegistry {',
    members,
    '    }',
    '  }',
    '}',
    'export {};',
    '',
  ].join('\n');
}
