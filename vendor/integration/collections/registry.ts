import type { CollectionsConfig } from '../utils/configBuilder';

export function collectionRegistryDts({ entries }: CollectionsConfig): string {
  const members = Object.entries(entries)
    .map(([name, { preset }]) => `      ${JSON.stringify(name)}: ${JSON.stringify(preset)};`)
    .join('\n');
  return [
    'declare global {',
    '  namespace AstroBlocks {',
    '    interface CollectionRegistry {',
    members,
    '    }',
    '  }',
    '}',
    'export {};',
    '',
  ].join('\n');
}
