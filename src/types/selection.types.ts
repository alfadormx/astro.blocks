/** Whether a selection group holds at most one entry or any number of entries. */
export type SelectionMode = 'single' | 'multiple';

/** One selected option, identified by its option code. */
export type Selection = {
  readonly code: string;
};

/** Payload of the `selection:change` event and of `subscribe` listeners. */
export type SelectionChangeDetail = {
  group: string;
  mode: SelectionMode;
  selection: readonly Selection[];
};
