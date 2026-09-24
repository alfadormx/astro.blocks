import type { Selection } from './selection.types';

/** One positional segment of a combination code. */
export type CombinationGroupSpec =
  | {
      /** Selection group name (`data-selection-group`). */
      name: string;
      mode: 'single' | 'multiple';
      /** Every option code the group accepts, in canonical encode order; each matches `[A-Za-z0-9]+`. */
      options: readonly string[];
    }
  | {
      /** Selection group name (`data-selection-group`). */
      name: string;
      /** Free text, escaped so it never contains a delimiter. */
      mode: 'text';
    };

/** Ordered description of a combination code. Groups may only be appended, never removed or reordered. */
export type CombinationSpec = {
  /** Leading product segment, matching `[A-Za-z0-9]+`. */
  product?: string;
  groups: readonly CombinationGroupSpec[];
};

/** Current selection of every spec group, keyed by group name. */
export type CombinationState = Readonly<Record<string, readonly Selection[]>>;

/** A group absent from `selections` keeps its default. */
export type DecodeResult =
  | { ok: false; reason: string }
  | {
      ok: true;
      selections: ReadonlyMap<string, readonly Selection[]>;
      /** Human-readable notes on what was ignored while decoding. */
      dropped: readonly string[];
    };

export type ConnectUrlStateOptions = {
  spec: CombinationSpec;
  /** Query parameter holding the code, matching `[A-Za-z0-9_]+` (default: `'code'`). */
  param?: string;
};
