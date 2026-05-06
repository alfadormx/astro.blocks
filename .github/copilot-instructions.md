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
const { label, variant = 'solid', intent = 'primary', ... } = Astro.props;
---
```

### Styling: `cn()` and `mergeConfigs()`

- Use `cn(...classes)` (from `~/utils/styles`) for conditional Tailwind class composition — it wraps `clsx` + `tailwind-merge`.
- Use `mergeConfigs(...configs)` (from `~/utils/mergeConfigs`) to deep-merge component config objects. It is class-aware: all keys named `class`, `*Class`, or `*class` are merged with `cn()` rather than overwritten.

### Semantic Color Tokens

Do **not** use raw Tailwind colors (e.g., `text-blue-500`). Use semantic tokens defined in `src/styles/global.css`:

| Token | Usage |
|---|---|
| `bg-background`, `bg-surface`, `bg-elevated` | Page/card/raised surfaces |
| `text-normal`, `text-muted`, `text-emphasis` | Body text hierarchy |
| `bg-primary`, `text-primary`, `border-primary` | Primary brand color |
| `bg-secondary`, `bg-tertiary`, `bg-accent` | Secondary/tertiary/accent |
| `bg-success`, `bg-warning`, `bg-error`, `bg-info` | Status colors |
| `border-border`, `border-border-emphasis` | Borders |

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
