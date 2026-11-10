import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

// docs/composition-contract.md, rule 5: `show*` stays only for position-derived values and for
// generated parts that have no instance field.
const SHOW_FLAGS = new Set([
  'item.types.ts:showConnector',
  'item.types.ts:showConnectorLeft',
  'item.types.ts:showConnectorRight',
  'contentcarousel.types.ts:showIndicators',
  'textarea.types.ts:showCounter',
  'map.types.ts:showMarker',
]);

const STATE_WORDS = ['default', 'active', 'inactive', 'selected', 'disabled', 'highlighted'];

const root = new URL('../../src/', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');

function files(dir: string, ext: RegExp): string[] {
  return readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? files(`${dir}${e.name}/`, ext) : ext.test(e.name) ? [`${dir}${e.name}`] : []
  );
}

const typeFiles = files('types/', /\.ts$/).map((path) => ({
  name: path.slice('types/'.length),
  source: read(path),
}));

const componentFiles = files('components/', /\.(astro|ts)$/).map((path) => ({
  path,
  source: read(path),
}));

function fields(source: string): { name: string; type: string }[] {
  return [...source.matchAll(/^\s+(\w+)\??:\s*([^;]*);/gm)].map((m) => ({
    name: m[1],
    type: m[2].replace(/\s+/g, ' ').trim(),
  }));
}

const allFields = typeFiles.flatMap((f) =>
  fields(f.source).map((field) => ({ file: f.name, ...field }))
);
const where = ({ file, name }: { file: string; name: string }) => `${file}:${name}`;

describe('composition contract', () => {
  it('types files import only sibling types files or Astro', () => {
    const imports = typeFiles.flatMap((f) =>
      [...f.source.matchAll(/from '([^']+)'/g)].map((m) => `${f.name}: ${m[1]}`)
    );
    expect(imports.filter((i) => !/: (\.\/[\w.]+\.types|astro|astro\/types)$/.test(i))).toEqual([]);
  });

  it('every layer field is named for a state and typed LayerConfig', () => {
    const prefix = new RegExp(`^(${STATE_WORDS.join('|')})[A-Z]\\w*Config$`);
    const layers = allFields.filter((f) => f.name.endsWith('Config'));
    expect(layers.length).toBeGreaterThan(0);
    expect(
      layers.filter((f) => !prefix.test(f.name) || !f.type.startsWith('LayerConfig<')).map(where)
    ).toEqual([]);
  });

  it('only layer fields are typed LayerConfig', () => {
    expect(
      allFields
        .filter((f) => f.type.startsWith('LayerConfig<') && !f.name.endsWith('Config'))
        .map(where)
    ).toEqual([]);
  });

  it('instance types never wrap block props in Partial', () => {
    const hits = typeFiles.flatMap((f) =>
      [...f.source.matchAll(/Partial<\s*(?:Omit<\s*)?\w*Props\b/g)].map(() => f.name)
    );
    expect(hits).toEqual([]);
  });

  it('show flags appear only on the named exception list', () => {
    expect(
      allFields
        .filter((f) => /^show[A-Z]/.test(f.name))
        .map(where)
        .sort()
    ).toEqual([...SHOW_FLAGS].sort());
  });

  it('air is padding inside Container only', () => {
    expect(allFields.filter((f) => f.name === 'air').map((f) => f.file)).toEqual([
      'container.types.ts',
    ]);
  });

  it('flow direction is always named orientation', () => {
    expect(
      allFields
        .filter((f) => /'horizontal' \| 'vertical'/.test(f.type) && f.name !== 'orientation')
        .map(where)
    ).toEqual([]);
  });

  it('component class strings carry no important utilities', () => {
    const hits = componentFiles.flatMap((f) => [
      ...[...f.source.matchAll(/(['"`])((?:(?!\1)[^\n])*)\1/g)]
        .flatMap((m) => m[2].split(/\s+/))
        .filter((token) => /^[a-z][\w:/[\].-]*!$/.test(token))
        .map((token) => `${f.path}: ${token}`),
      ...[...f.source.matchAll(/!important/g)].map(() => `${f.path}: !important`),
    ]);
    expect(hits).toEqual([]);
  });
});
