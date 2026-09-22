import type { ItemsGridItem, ItemsGridSelection } from '~/types/itemsgrid.types';

type SelectableSelection = Exclude<ItemsGridSelection, { mode: 'none' }>;

function fail(message: string): never {
  throw new Error(`itemsGrid: ${message}`);
}

/**
 * Throws on a selectable ItemsGrid config that cannot render a valid option set.
 * `items` must be fully merged (defaults, selected config, item) so leaked `actions` are caught.
 */
export function validateItemsGridSelection(
  selection: SelectableSelection,
  items: readonly ItemsGridItem[]
): void {
  if (!selection.group) fail(`selection mode "${selection.mode}" requires a group`);
  const { group } = selection;

  if (!selection.label && !selection.labelledBy) {
    fail(`group "${group}" needs a label or labelledBy`);
  }

  const codes = new Set<string>();
  items.forEach((item, i) => {
    if (!item.code) fail(`item ${i} in group "${group}" has no code`);
    if (codes.has(item.code)) fail(`code "${item.code}" is used twice in group "${group}"`);
    codes.add(item.code);
    if (item.actions && item.actions.length > 0) {
      fail(`item "${item.code}" in group "${group}" has actions; options cannot contain buttons`);
    }
  });

  const selectedCount = items.filter((item) => item.selected).length;
  if (selection.mode === 'single') {
    if (selectedCount > 1) fail(`${selectedCount} items selected in single group "${group}"`);
    return;
  }

  const { min, max } = selection;
  if (min !== undefined && min < 0) fail(`min is negative in group "${group}"`);
  if (max !== undefined && max < 0) fail(`max is negative in group "${group}"`);
  if (min !== undefined && max !== undefined && min > max) {
    fail(`min (${min}) is greater than max (${max}) in group "${group}"`);
  }
  if (max !== undefined && selectedCount > max) {
    fail(`${selectedCount} items selected in group "${group}" with max ${max}`);
  }
}
