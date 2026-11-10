# astro.blocks

Astro component library: blocks in `src/components/blocks/{primitives,layout,composite}`, their props in `src/types/*.types.ts`, a docs page per block under `src/pages/documentation/`.

## Composition contract

Read `docs/composition-contract.md` before designing or changing a block's props, types, child merging, wrappers or script/CSS hooks. It is the single source of truth; when a design bends a rule, update the contract in the same commit and say why.

The rules most often missed:

- **Instance vs layer.** A child field is named after the block with no suffix (`closeButton`, `languageToggle`). `…Config` is only a layer: `default<Noun>Config`, or `<state><Noun>Config` with state `active | inactive | selected | disabled | highlighted`.
- **Merge order.** `mergeConfigs({}, internal, internalState, default…Config, <state>…Config, structural, instance)`. The instance is last and applies in every state. After the spread, write only `data-*` hooks and position- or parent-derived values; fallback defaults go in the internal layer.
- **Types.** Instances use `XProps` or `Omit<XProps, …>`; layers use `LayerConfig<…>` from `src/types/config.types.ts`. Every advertised field has an effect. Public props use our own types, not a library's.
- **Presence renders.** An optional child renders when its field is set; a default-on child is `XProps | false`. Wrapper styling is flat: `<role>Class`, `<role>Gap`, `<role>Align`.
- **Vocabulary.** `gap` (enum) between children, `air` only inside Container, `orientation` for flow direction.
- **Hooks are `data-*`.** Defaults use cancellable utilities with no `!important`. `tests/unit/classHooks.test.ts` holds the only class-hook exceptions.
- **Headings** render through Headline (`h2` default, Hero `h1`).

## Workflow

- Trunk-based: commit on `main`.
- Use `pnpm`. Work is done when `pnpm check` is green.
- Tickets live in `thoughts/shared/tasks/ID-NNNN-<Name>/`, with QRSPI stage files `-00-ticket` through `-06-outcome`. Epics and their review history live beside them as `EPIC-*`.
