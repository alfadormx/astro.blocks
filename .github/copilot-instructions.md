# Copilot Instructions

## Commands

```bash
pnpm dev          # dev server at localhost:4321
pnpm build        # production build to ./dist/
pnpm preview      # preview production build

pnpm check        # astro check + eslint + prettier (full validation)
pnpm check:astro  # astro type-check only
pnpm check:lint   # eslint only
pnpm check:prettier # prettier check only

pnpm fix          # auto-fix eslint + prettier
```

No test suite exists. Use `pnpm check` to validate changes.

## Architecture

This is an **Astro component library** — a collection of reusable UI blocks with a documentation site.

### Component Layers (`src/components/blocks/`)

- **`primitives/`** — atomic components: `Button`, `Headline`, `Image`, `Logo`, `Map`, `Video`, `Vector`, `Background`, `ThemeToggle`, `LanguageToggle`
- **`composite/`** — composed from primitives: `Header`, `Footer`, `Content`, `CallToAction`, `ItemsGrid`, `ItemsTimeline`, `NavigationTree`, etc.
- **`layout/`** — structural wrappers: `Container`, `TwoColumnContainer`, `ThreeColumnContainer`, `FourColumnContainer`, `SidebarLeftContainer`, `SidebarRightContainer`, `Modal`

Every component has a corresponding TypeScript type in `src/types/<name>.types.ts`.

### Site Configuration (`src/config.yaml`)

The single source of truth for site-wide settings. The custom Astro integration at `vendor/integration/` reads this YAML file and exposes it as the virtual module `site-config`, available anywhere via:

```ts
import { SITE, I18N, METADATA, ANALYTICS } from 'site-config';
```

The integration also auto-updates `robots.txt` with the sitemap URL on build.

### Documentation Pages (`src/pages/documentation/`)

Mirrors the component structure (`primitives/`, `composite/`, `layout/`). Each page demonstrates its corresponding component.

## Key Conventions

### Path Alias

`~/` maps to `src/`. Always use `~/` for imports within `src/`.

### Component Props Pattern

Every component imports its type from `~/types/` and uses `type Props = <Name>Props`:

```astro
---
import type { ButtonProps } from '~/types/button.types';
type Props = ButtonProps;
const { label, variant = 'solid', intent = 'primary' } = Astro.props;
---
```

### Styling: `cn()` and `mergeConfigs()`

- Use `cn(...classes)` (from `~/utils/styles`) for conditional Tailwind class composition — it wraps `clsx` + `tailwind-merge`.
- Use `mergeConfigs(...configs)` (from `~/utils/mergeConfigs`) to deep-merge component config objects. It is class-aware: all keys named `class`, `*Class`, or `*class` are merged with `cn()` rather than overwritten.

### Semantic Color Tokens

Do **not** use raw Tailwind colors (e.g., `text-blue-500`). Use semantic tokens defined in `src/styles/global.css`:

| Token                                             | Usage                     |
| ------------------------------------------------- | ------------------------- |
| `bg-background`, `bg-surface`, `bg-elevated`      | Page/card/raised surfaces |
| `text-normal`, `text-muted`, `text-emphasis`      | Body text hierarchy       |
| `bg-primary`, `text-primary`, `border-primary`    | Primary brand color       |
| `bg-secondary`, `bg-tertiary`, `bg-accent`        | Secondary/tertiary/accent |
| `bg-success`, `bg-warning`, `bg-error`, `bg-info` | Status colors             |
| `border-border`, `border-border-emphasis`         | Borders                   |

The palette is Catppuccin-inspired using oklch values (defined in `src/styles/colors.css`).

### Dark Mode

Dark mode is toggled via `data-theme="dark"` on `<html>` — **not** via the Tailwind `dark:` class mechanism. A custom variant is defined in `global.css`:

```css
@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
```

Use `dark:` prefix in Tailwind classes as normal — it resolves to the `data-theme` selector.

### Tailwind v4 (CSS-first)

Tailwind is configured in `src/styles/global.css` via `@theme` blocks — there is no `tailwind.config.*` file. Add new design tokens to `global.css`. Dynamic class safelist entries use `@source inline(...)`.

### Fonts

Four CSS font variables are defined in `global.css`:

- `font-title` → Kodchasan
- `font-subtitle` / `font-body` → Quicksand
- `font-quote` → Sacramento

### Images

Use `findImage()` from `~/utils/images` to resolve image paths. It handles:

- `~/assets/images/...` paths (Astro-optimized assets)
- `/public/...` absolute paths
- External URLs (with unpic optimization for supported CDNs)

### Container Component

`Container` is the fundamental layout block. Key props:

- `htmlTag` — rendered HTML element (default `section`)
- `containerWidthType` — `'full'` | `'boxed'` | `'custom'` (outer wrapper)
- `content.widthType` — `'full'` | `'boxed'` (inner content wrapper)
- `content.air` — `'none'` | `'tight'` | `'normal'` | `'loose'` (responsive padding preset)
- `spacing`, `border`, `background`, `layout` — granular overrides

### Icons

Icons come from `astro-icon` with Iconify icon sets: `heroicons`, `mdi`, `lucide`, `tabler`, `flat-color-icons`. Use the `<Icon name="heroicons:..." />` component.

### Code Style

Prettier config: single quotes, semicolons, 2-space indent, 100-char print width. ESLint enforces TypeScript strict rules; unused variables prefixed with `_` are allowed.

## Composite Component Patterns

Composite components follow a consistent composition model:

**`defaultXConfig` prop** — every composite that renders child components exposes a `defaultXConfig` prop (e.g., `defaultItemConfig`, `defaultActionsConfig`, `defaultButtonConfig`) that provides a base config merged with each child's own props via `mergeConfigs()`. This lets callers style all children at once without touching each one individually.

```astro
<!-- ItemsGrid: defaultItemConfig applies to every Item -->
<ItemsGrid
  items={itemsArray}
  defaultItemConfig={{ layout: 'horizontal', border: { width: 'border' } }}
/>
```

**Internal defaults + caller overrides** — components define their own `defaultXConfig` object internally, then merge in the order: `internal defaults → defaultXConfig prop → per-item config`. Later values win for scalar fields; class keys are merged via `cn()`.

**`container` prop** — most composite components (Header, Footer, Content, ItemsContent, CallToAction, etc.) accept a `container?: Partial<ContainerProps>` prop that is merged with their internal default container config, allowing full layout customisation without wrapper elements.

**Composite component quick reference:**

| Component                  | Key props                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| `Header`                   | `logo`, `navigationLeft/Right`, `actionsLeft/Right`, `isSticky`, `isFloating`, `showThemeToggle` |
| `Footer`                   | `logo`, `disclaimer`, `footnote`, `socialActions`, `secondaryActions`, `showLanguageToggle`      |
| `Content`                  | `headline`, `image`, `action`, `items`, `imageOnLeft`, `reverseOnMobile`                         |
| `CallToAction`             | `headline`, `actions`                                                                            |
| `ItemsContent`             | `headline`, `itemsGrid`                                                                          |
| `ItemsGrid`                | `items`, `columns` (1-4), `air`, `defaultItemConfig`                                             |
| `ItemsTimeline`            | `items`, `defaultItemConfig` — vertical timeline with connectors                                 |
| `ItemsTimelineHorizontal`  | `items`, `defaultItemConfig` — horizontal timeline                                               |
| `NavigationTree`           | `items` (nested `ButtonProps[]`), `expansionStrategy`, `toggleMode`, `maxDepth`                  |
| `NavigationTreeHorizontal` | same as `NavigationTree` but horizontal, used inside `Header`                                    |

**`Item`** is the shared leaf for all `Items*` components. It supports `icon`, `title`, `content`, `actions`, `layout` (`vertical`/`horizontal`), and connector props (`showConnector`, `connectorStyle`).

**`Headline`** is the standard section header primitive with `tagline`, `title`, `subtitle`, and `align`. Always use it instead of raw headings inside blocks.

## i18n / Multi-Language Setup

Languages are configured in `src/config.yaml` under `i18n`:

```yaml
i18n:
  default: 'en'
  languages:
    - code: 'en'
      locale: 'en-US'
      basePath: '/'
      direction: 'ltr'
      label: 'English'
    - code: 'es'
      locale: 'es-ES'
      basePath: '/es'
      direction: 'ltr'
      label: 'Español'
```

- `basePath` is the URL prefix for that language (`/` for default, `/es` for Spanish, etc.)
- The `I18N` object from `site-config` exposes `I18N.default` and `I18N.languages[]`
- `Layout.astro` resolves `lang` and `dir` on `<html>` from the `langCode` prop matched against `I18N.languages`
- **`LanguageToggle`** reads `Astro.url.pathname` at runtime to detect the current language by `basePath` matching and rewrites URLs by swapping `basePath` prefixes. It respects `SITE.trailingSlash`.
- Per-language metadata overrides live under `metadata.localized.<code>` in `config.yaml` and are merged in `configBuilder.ts`
- Pass `langCode` to `<Layout>` on every page to set the correct `<html lang>` attribute

## vendor/integration Internals

`vendor/integration/` is a local custom Astro integration (not an npm package). It runs at build/dev time and:

1. **`loadConfig.ts`** — reads `src/config.yaml` (or a custom path) using `js-yaml`
2. **`configBuilder.ts`** — normalises the raw YAML into typed `SITE`, `I18N`, `METADATA`, `ANALYTICS` objects with defaults applied via `lodash.merge`
3. **`index.ts` (integration)** — registers a Vite virtual module `site-config` that exports those four objects as JSON, making them importable anywhere without filesystem access. Also watches `config.yaml` for HMR and injects the sitemap URL into `robots.txt` on build (only when `@astrojs/sitemap` is present).

The virtual module ID is `site-config` (no `@` prefix). Always import from it — never import `config.yaml` or `configBuilder.ts` directly in components:

```ts
import { SITE, I18N, METADATA, ANALYTICS } from 'site-config';
```

Types for the virtual module are declared in `vendor/integration/types.d.ts`.
