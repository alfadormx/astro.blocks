import type { SelectionState, Selections } from '~/utils/modelViewerMutations';

// Kept free of three.js so the element's eager script can import it.
export function effectiveSrc(src: string, selections: Selections, state: SelectionState): string {
  let result = src;
  for (const [group, { options = {} }] of Object.entries(selections)) {
    for (const code of state[group] ?? []) {
      for (const mutation of options[code] ?? [])
        if (mutation.type === 'model') result = mutation.src;
    }
  }
  return result;
}
