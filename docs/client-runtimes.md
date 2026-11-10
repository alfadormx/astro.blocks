# Client runtimes

Most of `src/utils/` runs at build time, in frontmatter. The two modules here run in the browser only: import them from a block's client `<script>`, never from frontmatter.

## Selection (`src/utils/selection.ts`)

Shared selection state between blocks that don't know about each other: a Configurator reads what a ToggleGroup and an ItemsGrid picked. It initialises itself on import.

- **Declare** a group on the block's root: `data-selection-group="<name>"` plus `data-selection-mode="single" | "multiple" | "text"`. Groups start empty. A group declared twice with different modes throws.
- **Write** with `publish(element, [{ code }])`. The group comes from the element's nearest `[data-selection-group]` ancestor. Last write wins; duplicate codes are dropped. In `text` mode the single entry's `code` is the raw field text.
- **Read** with `getSelection(group)`.
- **Listen** with `subscribe(group, listener)`, which returns an unsubscribe function and doesn't replay the current value, or with `document.addEventListener('selection:change', …)`. The event is typed through `DocumentEventMap`; its detail is `{ group, mode, selection }` (`SelectionChangeDetail` in `src/types/selection.types.ts`).
- **Participants** publish their initial value on connect:
  - selectable ItemsGrid (`SelectableItemsGrid`), `single` or `multiple`;
  - ToggleGroup, always `single`; it skips the initial publish when nothing is checked, so it never clears another block's initial selection;
  - TextArea, `text`, when given a `group`; it skips the initial publish when the field is empty.
- **Readers** include Configurator, Pricing, ModelViewer and the participants themselves.
- **View transitions.** All groups and subscriptions are cleared on `astro:after-swap`. Consumers re-subscribe in their own after-swap init.
- Misconfigured markup and publishes to undeclared groups throw.

## URL state (`src/utils/urlState.ts`)

Keeps selection groups in the URL, so a configuration can be shared as a link.

- `connectUrlState({ spec, param = 'code' })` returns a disconnect function.
- It seeds the groups named in a `CombinationSpec` from `?code=` on `DOMContentLoaded`. Module scripts, including every block's initial publish, run before that, so the URL seed always wins.
- It writes the code back on every change, and restores it on `popstate` and `astro:after-swap`.
- The codec, `src/utils/combinationCode.ts` (`encode`, `decode`, `validateCombinationSpec`), is pure and safe anywhere, including frontmatter.
- **Spec groups may only be appended.** Codes are positional, so reordering or removing a group breaks every link already shared.

Used by Configurator, and demonstrated on the CombinationCode docs page.
