import type { CombinationState, ConnectUrlStateOptions } from '~/types/combinationcode.types';
import type { Selection, SelectionChangeDetail } from '~/types/selection.types';
import { decode, encode, validateCombinationSpec } from '~/utils/combinationCode';
import { getSelection, publish, subscribe } from '~/utils/selection';

const PARAM_PATTERN = /^[A-Za-z0-9_]+$/;

function fail(message: string): never {
  throw new Error(`urlState: ${message}`);
}

// Call sites check import.meta.env.DEV themselves, so production builds drop the message text too.
function warn(message: string): void {
  console.warn(`[urlState] ${message}`);
}

// Raw on purpose: URLSearchParams would decode the codec's own escapes and re-encode `%`.
function readParam(search: string, param: string): string | null {
  for (const pair of search.replace(/^\?/, '').split('&')) {
    const eq = pair.indexOf('=');
    const key = eq === -1 ? pair : pair.slice(0, eq);
    if (key === param) return eq === -1 ? '' : pair.slice(eq + 1);
  }
  return null;
}

function withParam(search: string, param: string, value: string): string {
  const pairs = search.replace(/^\?/, '').split('&').filter(Boolean);
  const entry = `${param}=${value}`;
  const i = pairs.findIndex((pair) => pair.split('=')[0] === param);
  if (i === -1) pairs.push(entry);
  else pairs[i] = entry;
  return `?${pairs.join('&')}`;
}

// Module scripts, including every block's initial publish, run before DOMContentLoaded, so a seed applied
// here always wins. `load` covers a connect that happens after DOMContentLoaded already fired.
function whenParsed(run: () => void): () => void {
  let done = false;
  const once = (): void => {
    if (done) return;
    done = true;
    run();
  };
  if (document.readyState === 'complete') {
    once();
    return () => {};
  }
  document.addEventListener('DOMContentLoaded', once);
  window.addEventListener('load', once);
  return () => {
    document.removeEventListener('DOMContentLoaded', once);
    window.removeEventListener('load', once);
  };
}

/**
 * Keeps the selection groups named in `spec` in sync with a combination code in the page URL.
 * Browser-only; import from a client `<script>`. Returns a disconnect function.
 */
export function connectUrlState({ spec, param = 'code' }: ConnectUrlStateOptions): () => void {
  validateCombinationSpec(spec);
  if (!PARAM_PATTERN.test(param)) fail(`param "${param}" must match [A-Za-z0-9_]+`);

  let roots = new Map<string, Element>();
  let defaults = new Map<string, readonly Selection[]>();
  let unsubscribes: Array<() => void> = [];
  // Dispatch is synchronous, so this brackets exactly the events our own publishes cause.
  let applying = false;
  let lastGroup: string | null = null;
  // TextArea republishes a truncated value from a microtask queued inside apply(); FIFO runs it before
  // ours clears this, so the rewrite replaces the entry instead of pushing one back would re-truncate.
  let settling = false;

  function findRoots(): Map<string, Element> {
    const found = new Map<string, Element>();
    for (const { name } of spec.groups) {
      const root = document.querySelector(`[data-selection-group="${CSS.escape(name)}"]`);
      if (root) found.set(name, root);
      else if (import.meta.env.DEV) {
        warn(`spec names group "${name}", which is not declared on this page`);
      }
    }
    return found;
  }

  function currentState(): CombinationState {
    return Object.fromEntries(
      spec.groups.map(({ name }) => [name, roots.has(name) ? getSelection(name) : []])
    );
  }

  function writeUrl(code: string, mode: 'push' | 'replace'): void {
    const url = `${location.pathname}${withParam(location.search, param, code)}${location.hash}`;
    if (mode === 'push') history.pushState(null, '', url);
    else history.replaceState(null, '', url);
  }

  function apply(): void {
    const code = readParam(location.search, param);
    const result = code === null ? null : decode(spec, code);
    if (import.meta.env.DEV && result) {
      if (!result.ok) warn(`ignoring ${param}="${code}": ${result.reason}`);
      else result.dropped.forEach((note) => warn(`${param}="${code}": ${note}`));
    }
    const selections = result?.ok ? result.selections : new Map<string, readonly Selection[]>();
    applying = true;
    try {
      for (const [name, root] of roots) {
        publish(root, selections.get(name) ?? defaults.get(name)!);
      }
    } finally {
      applying = false;
    }
    lastGroup = null;
    settling = true;
    queueMicrotask(() => (settling = false));
  }

  function onChange({ group, mode }: SelectionChangeDetail): void {
    if (applying) return;
    const code = encode(spec, currentState());
    if (code === readParam(location.search, param)) return;
    // One typing burst is one history entry; the first keystroke after anything else pushes.
    writeUrl(code, settling || (mode === 'text' && lastGroup === group) ? 'replace' : 'push');
    lastGroup = group;
  }

  function start(): void {
    roots = findRoots();
    defaults = new Map([...roots.keys()].map((name) => [name, getSelection(name)]));
    apply();
    unsubscribes = [...roots.keys()].map((name) => subscribe(name, onChange));
    document.documentElement.setAttribute('data-url-state-ready', '');
  }

  function stop(): void {
    unsubscribes.forEach((unsubscribe) => unsubscribe());
    unsubscribes = [];
  }

  // The runtime's own after-swap listener is registered at import, so by now it has rescanned and every
  // block's after-swap init has republished its DOM state.
  function onSwap(): void {
    stop();
    start();
  }

  const cancelStart = whenParsed(start);
  window.addEventListener('popstate', apply);
  document.addEventListener('astro:after-swap', onSwap);
  return () => {
    cancelStart();
    window.removeEventListener('popstate', apply);
    document.removeEventListener('astro:after-swap', onSwap);
    stop();
  };
}
