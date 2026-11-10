import { describe, expect, it } from 'vitest';
import { getPropRows, stripWrapper } from '~/utils/apiReference';

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
