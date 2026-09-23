import type { Selection, SelectionChangeDetail, SelectionMode } from '~/types/selection.types';

type GroupState = {
  readonly mode: SelectionMode;
  selection: readonly Selection[];
};

const GROUP_SELECTOR = '[data-selection-group]';

const groups = new Map<string, GroupState>();
let roots = new WeakSet<Element>();
let controller = new AbortController();

function isSelectionMode(value: string | null): value is SelectionMode {
  return value === 'single' || value === 'multiple' || value === 'text';
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
        `selection: group "${group}" has data-selection-mode "${mode}"; expected "single", "multiple" or "text"`
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
  controller.abort();
  controller = new AbortController();
  groups.clear();
  roots = new WeakSet();
}

export function getSelection(group: string): readonly Selection[] {
  return requireGroup(group).selection;
}

function sameCodes(a: readonly Selection[], b: readonly Selection[]): boolean {
  return a.length === b.length && a.every((entry, i) => entry.code === b[i].code);
}

export function publish(element: Element, selection: readonly Selection[]): void {
  const root = element.closest(GROUP_SELECTOR);
  if (!root) {
    throw new Error('selection: publish called from an element outside any selection group');
  }
  if (!roots.has(root)) {
    throw new Error('selection: publish called from an element that is no longer on the page');
  }
  const group = root.getAttribute('data-selection-group')!;
  const state = requireGroup(group);

  const seen = new Set<string>();
  const next: Selection[] = [];
  for (const { code } of selection) {
    if (code === '') throw new Error(`selection: empty code published to group "${group}"`);
    if (seen.has(code)) continue;
    seen.add(code);
    next.push(Object.freeze({ code }));
  }
  if (state.mode !== 'multiple' && next.length > 1) {
    throw new Error(
      `selection: ${next.length} entries published to ${state.mode} group "${group}"`
    );
  }

  if (sameCodes(state.selection, next)) return;
  state.selection = Object.freeze(next);
  document.dispatchEvent(
    new CustomEvent<SelectionChangeDetail>('selection:change', {
      detail: { group, mode: state.mode, selection: state.selection },
    })
  );
}

export function subscribe(
  group: string,
  listener: (detail: SelectionChangeDetail) => void
): () => void {
  requireGroup(group);
  const handler = (event: CustomEvent<SelectionChangeDetail>): void => {
    if (event.detail.group === group) listener(event.detail);
  };
  document.addEventListener('selection:change', handler, { signal: controller.signal });
  return () => document.removeEventListener('selection:change', handler);
}

document.addEventListener('astro:after-swap', () => {
  reset();
  scan();
});
scan();
