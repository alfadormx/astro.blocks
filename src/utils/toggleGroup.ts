import type { ToggleGroupProps } from '~/types/togglegroup.types';

function fail(message: string): never {
  throw new Error(`toggleGroup: ${message}`);
}

/** Throws on a ToggleGroup config that cannot render a valid radio group. */
export function validateToggleGroup(
  props: Pick<ToggleGroupProps, 'group' | 'label' | 'labelledBy' | 'options' | 'disabled'>
): void {
  const { group, label, labelledBy, options, disabled } = props;
  if (!group) fail('a group is required');
  if (!label && !labelledBy) fail(`group "${group}" needs a label or labelledBy`);
  if (!options || options.length === 0) fail(`group "${group}" has no options`);

  const codes = new Set<string>();
  options.forEach((option, i) => {
    if (!option.code) fail(`option ${i} in group "${group}" has no code`);
    if (codes.has(option.code)) fail(`code "${option.code}" is used twice in group "${group}"`);
    codes.add(option.code);
    if (option.selected && (option.disabled || disabled)) {
      fail(`option "${option.code}" in group "${group}" is both selected and disabled`);
    }
  });

  const selectedCount = options.filter((option) => option.selected).length;
  if (selectedCount > 1) fail(`${selectedCount} options selected in group "${group}"`);
}

// Module scope survives across renders within a build; frontmatter does not.
let instanceCount = 0;

/** A native radio `name` unique per rendered instance, so two blocks on one group stay separate. */
export function toggleGroupName(group: string): string {
  return `${group}-${instanceCount++}`;
}
