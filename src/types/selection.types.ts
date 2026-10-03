/**
 * Whether a selection group holds at most one option code, any number of option codes,
 * or at most one free-text value.
 */
export type SelectionMode = 'single' | 'multiple' | 'text';

/** One selected entry: an option code, or the raw field text in `text` mode. */
export type Selection = {
  readonly code: string;
};

/** Payload of the `selection:change` event and of `subscribe` listeners. */
export type SelectionChangeDetail = {
  group: string;
  mode: SelectionMode;
  selection: readonly Selection[];
};
