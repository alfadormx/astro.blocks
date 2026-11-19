# astro.blocks

Astro component library: blocks in `packages/blocks/src/components/blocks/{primitives,layout,composite}`, their props in `packages/blocks/src/types/*.types.ts`, a docs page per block as an MDX entry under `apps/docs/src/content/documentation/<section>/`.

## Workspace

- `packages/blocks` is `@alfadormx/blocks`, the library. It ships source (`.astro`, `.ts`, CSS); its `"exports"` map is the public surface.
- `apps/docs` is the showcase site (docs, demos, home). It depends on the package through `workspace:*`.
- Run app commands from the root (`pnpm dev`, `pnpm build`) or with `pnpm --filter docs …`; package commands with `pnpm --filter @alfadormx/blocks …`.

## Composition contract

Read `docs/composition-contract.md` before designing or changing a block's props, types, child merging, wrappers or script/CSS hooks. It is the single source of truth; when a design bends a rule, update the contract in the same commit and say why.

The rules most often missed:

- **Instance vs layer.** A child field is named after the block with no suffix (`closeButton`, `languageToggle`). `…Config` is only a layer: `default<Noun>Config`, or `<state><Noun>Config` with state `active | inactive | selected | disabled | highlighted`.
- **Merge order.** `mergeConfigs({}, internal, internalState, default…Config, <state>…Config, structural, instance)`. The instance is last and applies in every state. After the spread, write only `data-*` hooks and position- or parent-derived values; fallback defaults go in the internal layer.
- **Types.** Instances use `XProps` or `Omit<XProps, …>`; layers use `LayerConfig<…>` from `packages/blocks/src/types/config.types.ts`. Every advertised field has an effect. Public props use our own types, not a library's.
- **Presence renders.** An optional child renders when its field is set; a default-on child is `XProps | false`. Wrapper styling is flat: `<role>Class`, `<role>Gap`, `<role>Align`.
- **Vocabulary.** `gap` (enum) between children, `air` only inside Container, `orientation` for flow direction.
- **Hooks are `data-*`.** Defaults use cancellable utilities with no `!important`. `packages/blocks/tests/unit/classHooks.test.ts` holds the only class-hook exceptions.
- **Headings** render through Headline (`h2` default, Hero `h1`).

## Conventions

- **Imports.** Library code (`packages/blocks/src/{components,utils,layouts,integration}`) imports across directories through `#components/`, `#utils/`, `#types/` or `#styles/` (declared under `imports` in `packages/blocks/package.json`), and imports siblings with `./`. It never uses `~/`, and only `src/integration` uses `../`. Files in `packages/blocks/src/types/` import relative `./x.types` only. Package tests may use `~/`, aliased to the package `src/`. Site code (pages, examples, MDX, docs tests) imports the library only by package name: `@alfadormx/blocks/<primitives|layout|composite|meta>/X.astro`, `/types/<name>`, `/Layout.astro`, `/utils/<richText|styles|mergeConfigs|images|combinationCode>`, `/integration`, `/collections`, `/content`, `/copy`, `/selection`, `/url-state`, `/blocks.css`. In `apps/docs`, `~/` is the app's own `src/` (`~/examples`, `~/assets`, `~/pages/…`). `packages/blocks/tests/unit/compositionContract.test.ts`, `apps/docs/tests/unit/siteImports.test.ts` and `packages/blocks/tests/unit/exports.test.ts` enforce this; a new public module is added to `"exports"` and to the table in `docs/composition-contract.md`.
- **Site config.** Read site settings from the virtual module: `import { SITE, I18N, METADATA, ANALYTICS } from 'site-config'`, never from `config.yaml`. From the integration, pages import only `@alfadormx/blocks/collections` and `@alfadormx/blocks/copy`, and `src/content.config.ts` only `@alfadormx/blocks/content`; the rest is the integration's internals.
- **Colour.** Semantic tokens only (`bg-surface`, `text-muted`, `border-border`, `bg-primary`, …, defined in `packages/blocks/src/styles/blocks.css`), never raw Tailwind colours.
- **Dark mode.** `dark:` resolves to `[data-theme=dark]` via a custom variant, not to the system preference.
- **Tailwind v4.** Library CSS is `packages/blocks/src/styles/blocks.css` (`@theme`, base, block styles, dark variant); there is no `tailwind.config`. It declares `@source '../'`, so any site importing it scans the package with no extra line. The site's stylesheet (`apps/docs/src/styles/global.css` here) is the one Tailwind root: it imports `@alfadormx/blocks/blocks.css`, adds fonts and brand token overrides, and reaches layouts through `blocks({ css })` and the `site-styles` virtual module. Brand theming is overriding semantic tokens. Classes library code builds at runtime need an `@source inline(...)` entry in `blocks.css`; site-only ones go in the site CSS.
- **Images.** Resolve sources with `findImage()` (`#utils/images` in library code). It reads the site's `src/assets/images/**` from the integration's `site-images` virtual module.
- **Pages.** Pass `langCode` to `<Layout>` so `<html lang dir>` is right. `metadata.localized` applies in `@alfadormx/blocks/Layout.astro` only, not in the docs layout.
- **Collections and copy.** Markdown collections are declared by preset under `collections:` in `config.yaml`; their pages call the collection page helpers. Static-page copy lives in `src/copy/<page>/<lang>.yaml`, read with `useCopy`. Read `apps/docs/src/content/documentation/guides/Collections.mdx` before adding either.
- **Rich text.** A prop that renders formatted text is typed `RichText` and rendered with `renderRichText()` from `#utils/richText` (sites: `@alfadormx/blocks/utils/richText`); plain props stay plain text.
- **Whitespace.** Write prose as Markdown (MDX pages, copy YAML, `RichText`). Astro's default `compressHTML: "jsx"` drops a line break next to a tag in `.astro` templates, so end that line with `{' '}`.
- **Browser-only runtimes.** `packages/blocks/src/utils/selection.ts` and `packages/blocks/src/utils/urlState.ts` run in the browser: import them only from a block's client `<script>`. Read `docs/client-runtimes.md` before using or changing either. Doc example files under `apps/docs/src/examples/` may import them from their client `<script>` too. Library code imports them as `#utils/selection` / `#utils/urlState`; doc examples as `@alfadormx/blocks/selection` / `@alfadormx/blocks/url-state`.

## Tests

- `packages/blocks/tests/unit/`: Vitest in `node`. A spec that needs a DOM starts with `// @vitest-environment happy-dom`.
- `packages/blocks/tests/astro/`: blocks rendered to HTML with the Astro container API, against the minimal site in `packages/blocks/tests/fixture/`.
- `apps/docs/tests/unit/`: site rules (docs nav, page endpoints, API reference, site imports).
- `apps/docs/tests/browser/`: Playwright against the dev server; self-skips when Chromium isn't installed (`pnpm exec playwright install chromium`). Scope specs by `[data-doc-section]`, select by `data-*` and ARIA, assert ARIA and `hidden` over class strings, and wait for the block's post-init signal. `tabs.spec.ts` is the worked example.
- A new spec for a fix fails before the fix.

## Workflow

- Trunk-based: commit on `main`.
- Use `pnpm`. Work is done when `pnpm check` is green at the root (lint, prettier, then each workspace's `check`).
- Tickets live in `thoughts/shared/tasks/ID-NNNN-<Name>/`, with QRSPI stage files `-00-ticket` through `-06-outcome`. Epics and their review history live beside them as `EPIC-*`.
