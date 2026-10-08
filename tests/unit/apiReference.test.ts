import { describe, expect, it } from 'vitest';
import { stripWrapper } from '~/utils/apiReference';

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
