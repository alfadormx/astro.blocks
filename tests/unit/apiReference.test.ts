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
});

describe('inherited props', () => {
  it('links an interface that extends an Omit of another block to that block', () => {
    expect(getPropRows('ThemeToggle', 'primitives').inheritsFrom?.label).toBe('Button');
  });
});
