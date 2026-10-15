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
