import type { Selection, SelectionMode } from '~/types/selection.types';

type GroupState = {
  readonly mode: SelectionMode;
  selection: readonly Selection[];
};

const GROUP_SELECTOR = '[data-selection-group]';

const groups = new Map<string, GroupState>();
let roots = new WeakSet<Element>();

function isSelectionMode(value: string | null): value is SelectionMode {
  return value === 'single' || value === 'multiple';
}

function requireGroup(group: string): GroupState {
  const state = groups.get(group);
  if (!state) throw new Error(`selection: group "${group}" is not declared on this page`);
  return state;
}

function scan(): void {
  document.querySelectorAll(GROUP_SELECTOR).forEach((root) => {
    const group = root.getAttribute('data-selection-group')!;
    const mode = root.getAttribute('data-selection-mode');
    if (!isSelectionMode(mode)) {
      throw new Error(
        `selection: group "${group}" has data-selection-mode "${mode}"; expected "single" or "multiple"`
      );
    }
    const existing = groups.get(group);
    if (existing && existing.mode !== mode) {
      throw new Error(
        `selection: group "${group}" is declared as both "${existing.mode}" and "${mode}"`
      );
    }
    if (!existing) groups.set(group, { mode, selection: [] });
    roots.add(root);
  });
}

function reset(): void {
  groups.clear();
  roots = new WeakSet();
}

export function getSelection(group: string): readonly Selection[] {
  return requireGroup(group).selection;
}

document.addEventListener('astro:after-swap', () => {
  reset();
  scan();
});
scan();
