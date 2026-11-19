import { describe, expect, it } from 'vitest';
import {
  buildBlockRegistry,
  getPropRows,
  parseDefaults,
  stripWrapper,
} from '~/pages/documentation/_api/apiReference';

describe('stripWrapper', () => {
  it.each([
    ['ButtonProps[]', 'ButtonProps'],
    ['Partial<ItemsGridProps>', 'ItemsGridProps'],
    ['LayerConfig<ButtonProps>', 'ButtonProps'],
    ["LayerConfig<Omit<NavigationTreeHorizontalProps, 'items'>>", 'NavigationTreeHorizontalProps'],
    ["Partial<Omit<ButtonProps, 'id'>>", 'ButtonProps'],
    ['ContainerProps', 'ContainerProps'],
    ['ButtonProps | false', 'ButtonProps'],
    ['ButtonProps[] | false', 'ButtonProps'],
    ['false | ButtonProps', 'ButtonProps'],
    ['ButtonProps | null | undefined', 'ButtonProps'],
    ["LayerConfig<\n  Omit<ButtonProps, 'id'>\n>", 'ButtonProps'],
    ["Omit<\n  TextAreaAttributes,\n  'group' | 'label'\n>", 'TextAreaAttributes'],
  ])('unwraps %s to %s', (input, expected) => {
    expect(stripWrapper(input)).toBe(expected);
  });
});

describe('getPropRows', () => {
  it.each([
    ['defaultToggleGroupConfig', 'ToggleGroup'],
    ['defaultItemsGridConfig', 'ItemsGrid'],
    ['defaultTextAreaConfig', 'TextArea'],
  ])('links the Configurator %s row to %s', (name, label) => {
    const row = getPropRows('Configurator', 'composite').rows.find((r) => r.name === name);

    expect(row?.link?.label).toBe(label);
  });

  it.each(['defaultButtonConfig', 'activeButtonConfig', 'inactiveButtonConfig'])(
    'links the LanguageToggle %s row to Button',
    (name) => {
      const row = getPropRows('LanguageToggle', 'primitives').rows.find((r) => r.name === name);

      expect(row?.link?.label).toBe('Button');
    }
  );
});

describe('inherited props', () => {
  it('links an interface that extends an Omit of another block to that block', () => {
    expect(getPropRows('ThemeToggle', 'primitives').inheritsFrom?.label).toBe('Button');
  });
});

describe('shared field props', () => {
  it('flattens FieldBaseProps from its own file into the Input table', () => {
    const names = getPropRows('Input', 'primitives').rows.map((r) => r.name);

    expect(names).toEqual(expect.arrayContaining(['label', 'errorClass', 'type']));
  });

  it('reads the Input defaults for shared fields', () => {
    const row = getPropRows('Input', 'primitives').rows.find((r) => r.name === 'size');

    expect(row?.default).toBe("'md'");
  });
});

describe('Omit of shared field props', () => {
  it('drops the Omit keys from the CheckboxGroup table and keeps its own name', () => {
    const rows = getPropRows('CheckboxGroup', 'primitives').rows;
    const names = rows.map((r) => r.name);

    expect(names).toEqual(
      expect.arrayContaining(['label', 'name', 'options', 'defaultOptionConfig'])
    );
    expect(names).not.toContain('fieldClass');
    expect(names.filter((n) => n === 'name')).toHaveLength(1);
  });

  it('links the CheckboxGroup options row to Checkbox', () => {
    const row = getPropRows('CheckboxGroup', 'primitives').rows.find((r) => r.name === 'options');

    expect(row?.link?.label).toBe('Checkbox');
  });
});

describe('buildBlockRegistry', () => {
  it('maps each docs entry file to a Props link at its file path', () => {
    expect(buildBlockRegistry().ContainerProps).toEqual({
      label: 'Container',
      href: '/documentation/layout/Container',
    });
  });

  it('covers every section folder', () => {
    const hrefs = Object.values(buildBlockRegistry()).map((l) => l.href);
    for (const section of ['base', 'primitives', 'layout', 'composite']) {
      expect(hrefs.some((h) => h.startsWith(`/documentation/${section}/`))).toBe(true);
    }
  });
});

describe('API reference defaults', () => {
  it('shows the @default tag of the Modal id instead of its initializer', () => {
    const row = getPropRows('Modal', 'layout').rows.find((r) => r.name === 'id');

    expect(row?.default).toBe('generated');
  });

  it('keeps @default tag text out of the Modal id description', () => {
    const row = getPropRows('Modal', 'layout').rows.find((r) => r.name === 'id');

    expect(row?.description).not.toBe('');
    expect(row?.description).not.toContain('@default');
    expect(row?.description).not.toContain('generated\n');
  });

  it.each([
    ['template with substitutions', 'id = `x-${n}`', 'computed'],
    ['call expression', 'id = makeId()', 'computed'],
    ['string literal', "size = 'md'", "'md'"],
    ['number', 'delay = 300', '300'],
    ['negative number', 'offset = -1', '-1'],
    ['boolean', 'open = false', 'false'],
    ['null', 'value = null', 'null'],
    ['plain template', 'tag = `h2`', '`h2`'],
    ['identifier', 'items = EMPTY', 'EMPTY'],
    ['property access', 'currentPath = Astro.url.pathname', 'Astro.url.pathname'],
    ['object literal', 'layout = { type: "grid" }', '{ type: "grid" }'],
    ['array literal', 'items = []', '[]'],
  ])('renders a %s default as %s', (_kind, binding, expected) => {
    const defaults = parseDefaults(`---\nconst { ${binding} } = Astro.props;\n---`);

    expect(Object.values(defaults)[0]).toBe(expected);
  });
});
