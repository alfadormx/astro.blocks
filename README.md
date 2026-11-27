# Astro Blocks

Composable UI blocks for building sites quickly with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com). Every block is configured through typed props, so a page is assembled by passing data rather than writing markup.

```astro
---
import Layout from '@alfadormx/blocks/Layout.astro';
import Header from '@alfadormx/blocks/composite/Header.astro';
import CallToAction from '@alfadormx/blocks/composite/CallToAction.astro';
import Footer from '@alfadormx/blocks/composite/Footer.astro';
---

<Layout metadata={{ title: { default: 'My site' } }}>
  <Header themeToggle={{}} />
  <CallToAction
    headline={{ title: 'Ship faster', htmlTag: 'h1', align: 'center' }}
    actions={[{ label: 'Get started', href: '/start', intent: 'primary', shape: 'pill' }]}
  />
  <Footer languageToggle={{}} />
</Layout>
```

## Workspace

This repository is a pnpm workspace:

```text
/                  workspace root: lint, prettier and check orchestration, docs/, thoughts/
packages/blocks/   @alfadormx/blocks, the library
├── src/           components/, layouts/, types/, utils/, styles/, integration/
└── tests/         unit/, astro/ (container tests), fixture/ (minimal site for them)
apps/docs/         the showcase site: docs, demos and home page
├── src/           pages/, examples/, content/, copy/, assets/, config.yaml, styles/global.css
├── public/
├── scripts/       ring model and still generators, browser test runner
└── tests/         unit/ (site rules), browser/ (Playwright)
```

The package ships source (`.astro`, `.ts`, CSS). Its `"exports"` map is the public surface: a subpath not listed there does not resolve.

## Using the package in a site

The package is installed from a tagged release on GitHub, not from a registry:

```sh
pnpm add "github:alfadormx/astro.blocks#v0.1.0&path:packages/blocks" @iconify-json/heroicons @iconify-json/mdi
```

astro-icon loads only the icon sets named in the site's own `package.json`, so list `heroicons` and `mdi` (used by the blocks) next to any sets the site uses itself.

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import blocks from '@alfadormx/blocks/integration';

export default defineConfig({
  integrations: [blocks({ config: './src/config.yaml', css: './src/styles/global.css' })],
});
```

```css
/* src/styles/global.css */
@import '@alfadormx/blocks/blocks.css';
```

`blocks.css` tells Tailwind to scan the package, so the site CSS needs no `@source` for it. Import blocks by section, for example `import Hero from '@alfadormx/blocks/composite/Hero.astro'`, and prop types as `import type { HeroProps } from '@alfadormx/blocks/types/hero'`.

The Installing guide in the docs site (`/documentation`) covers upgrading to a new tag and cutting a release.

## Block catalogue

Blocks live in `packages/blocks/src/components/blocks/`, with prop types in `packages/blocks/src/types/*.types.ts`. Live examples and API tables are served at `/documentation`.

### Primitives

| Block                           | Purpose                                                           |
| :------------------------------ | :---------------------------------------------------------------- |
| `Headline`                      | Tagline, title and subtitle with alignment and heading tag        |
| `Button`                        | Link or button with size, variant, intent, shape, icon or image   |
| `CodeBlock`                     | Shiki-highlighted code with copy button and title                 |
| `Image`, `Vector`, `Logo`       | Optimized images, inline SVG and site logo                        |
| `TextArea`                      | Labelled multi-line field with help, error and character limit    |
| `Input`                         | Labelled single-line field with help, error and native validation |
| `Select`                        | Labelled native single-choice dropdown with placeholder           |
| `Checkbox`                      | Labelled checkbox with help and error                             |
| `CheckboxGroup`                 | Fieldset of checkboxes sharing one name                           |
| `Background`                    | Image or video background with overlay                            |
| `Video`                         | Video.js player, including YouTube and Vimeo sources              |
| `Map`                           | Leaflet map                                                       |
| `ModelViewer`                   | Three.js 3D model viewer with materials and bloom                 |
| `ThemeToggle`, `LanguageToggle` | Light/dark switch and language switcher                           |
| `ToggleGroup`                   | Single or multiple choice option group                            |
| `ContentCarouselItem`           | Slide used by `ContentCarousel`                                   |

### Layout

| Block                                                               | Purpose                                                           |
| :------------------------------------------------------------------ | :---------------------------------------------------------------- |
| `Container`                                                         | Section wrapper: background, spacing, border, width, flex or grid |
| `TwoColumnContainer`, `ThreeColumnContainer`, `FourColumnContainer` | Column layouts                                                    |
| `SidebarLeftContainer`, `SidebarRightContainer`                     | Sidebar plus main content                                         |
| `Modal`                                                             | Dialog overlay                                                    |

### Composite

| Block                                          | Purpose                                                                   |
| :--------------------------------------------- | :------------------------------------------------------------------------ |
| `Header`                                       | Sticky or floating header with logo, navigation, buttons and theme toggle |
| `Footer`                                       | Logo, disclaimer, social and secondary links, language toggle             |
| `NavigationTree`, `NavigationTreeHorizontal`   | Vertical and horizontal nested navigation                                 |
| `CallToAction`                                 | Headline plus actions; doubles as a hero                                  |
| `Hero`                                         | Opening section: copy centered or beside an image or video                |
| `Content`                                      | Text and image side by side with an action                                |
| `ItemsContent`                                 | Headline above an items grid                                              |
| `ItemsGrid`, `Item`                            | 1–4 column grid of items, optionally selectable                           |
| `ItemsTimeline`, `ItemsTimelineHorizontal`     | Vertical and horizontal timelines                                         |
| `ContentCarousel`                              | Carousel with autoplay, drag, indicators and loop                         |
| `Tabs`                                         | Horizontal or vertical tabbed panels                                      |
| `Configurator`                                 | Product configurator with shareable URL state                             |
| `CollectionList`                               | Grid or list of collection entries with a pager                           |
| `Pager`                                        | Labelled previous / next links                                            |
| `PostCard`, `CaseStudyCard`, `EventCard`       | One card per collection preset; the title is the card's link              |
| `PostLayout`, `CaseStudyLayout`, `EventLayout` | Entry page body: meta line, Markdown in `prose`, tags, map or Register    |

### Meta

`Metadata`, `CommonMeta`, `Favicons`, `Analytics` and `SiteVerification` are wired into `@alfadormx/blocks/Layout.astro` and read from the site config.

`metadata.structuredData` takes one schema.org object or an array of them, and `Metadata` emits each as its own `<script type="application/ld+json">` in `<head>`. It is page-only: it is not read from `config.yaml` or `metadata.localized`, where arrays would merge by index.

```astro
<Layout metadata={{ structuredData: { '@context': 'https://schema.org', '@type': 'CafeOrCoffeeShop', name: 'Olmo' } }}>
```

## Conventions

- **Props, not markup.** Composites take the props of the blocks they contain, for example `headline: HeadlineProps` or `actions: ButtonProps[]`.
- **Layered defaults.** `default*Config` props set shared config for repeated children, and `selected*Config` or `active*Config` props layer state on top.
- **Rich text.** Fields typed `RichText` (Item, Accordion, Footer and Container content) take Markdown; one line renders inline, and HTML passes through.
- **Whitespace.** Write prose as Markdown (MDX pages, copy YAML, `RichText`). Astro's default `compressHTML: "jsx"` drops a line break next to a tag in `.astro` templates, so end that line with `{' '}`.
- **Style tokens.** Buttons and items share an `intent`, `variant`, `size` and `shape` vocabulary. Colors come from `packages/blocks/src/styles/colors.css`.
- **Internal sub-components stay internal.** Files that open with `// Internal to <Parent>` (or a list of parents) declare `Props` inline, have no docs page and are imported only by the parents they list; use a parent instead.

## Site configuration

`src/config.yaml` holds the site name and URL, i18n languages, default metadata, theme color, favicons and analytics. It is exposed to components through the `site-config` virtual module from the integration (`@alfadormx/blocks/integration`).

`astro.config.mjs` registers the library with one integration, `blocks({ config: './src/config.yaml', css: './src/styles/global.css' })`. It serves the `site-config` virtual module, hands the site stylesheet to layouts through `site-styles`, and registers Tailwind, MDX, astro-icon (every `@iconify-json/*` set in the site's `package.json`), the Shiki config and the `three` pre-bundling. Add an icon set by installing `@iconify-json/<set>`.

### Collections and copy

`collections:` in `config.yaml` declares Markdown collections by preset (`post`, `caseStudy`, `event`). Content goes in `src/content/<name>/<lang>/*.md`, and `src/content.config.ts` is a one-line stub, so `getCollection('<name>')` is typed with no schema to write. Each collection needs two short pages, a list and an entry, built with the helpers from `@alfadormx/blocks/collections`.

Static-page copy lives in `src/copy/<page>/<lang>.yaml`, read with the helpers from `@alfadormx/blocks/copy`. The default-language file defines the typed keys, and a key missing in another language falls back with a build warning. The guide at `/documentation/guides/Collections` covers both.

## Demos

- `/` builds the landing page from `Header`, `Hero`, `ItemsContent`, `CallToAction` and `Footer`.
- `/demos/saas` is a one-page SaaS product site with a blog, themed by token overrides on `[data-demo='saas']`, in English and Spanish.
- `/demos/portfolio` is an agency site with home, work, about and contact pages, themed by token overrides on `[data-demo='portfolio']`, in English and Spanish.
- `/demos/local` is a café and bakery site with a lazy map, a contact form, `LocalBusiness` JSON-LD and an events collection, themed by token overrides on `[data-demo='local']`, in English and Spanish.
- `/demos/saas/blog`, `/demos/portfolio/work` and `/demos/local/events` are collection demos in English and Spanish, one per preset.
- `/demos/jewellery` is a jewellery store with collections, about and contact pages and a ring configurator built on `Configurator` and `ModelViewer`, themed by token overrides on `[data-demo='jewellery']`, in English and Spanish.

## Site guides

`plugins/site-guide` is a Claude Code plugin that writes a guide to a site built with these blocks: every section explained for the reader you choose (the site owner, developers, or docs visitors), an isometric diagram of how its blocks are layered, exported as Markdown, MDX or PDF in the site's own colours and fonts. Install it once and it works in any project:

```sh
claude plugin marketplace add alfadormx/astro.blocks
claude plugin install site-guide@astro-blocks
```

Then ask for a site guide from the site's repository. The skill writes everything to `_guide/` there.

## Commands

Run from the repository root.

| Command                                 | Action                                                           |
| :-------------------------------------- | :--------------------------------------------------------------- |
| `pnpm install`                          | Install dependencies for every workspace                         |
| `pnpm dev`                              | Start the docs dev server at `localhost:4321`                    |
| `pnpm build`                            | Build the docs site to `apps/docs/dist/`                         |
| `pnpm check`                            | Lint, prettier, then each workspace's type check and test suites |
| `pnpm check:quick`                      | Checks scoped to files changed since `HEAD`                      |
| `pnpm fix`                              | Apply ESLint and Prettier fixes                                  |
| `pnpm --filter @alfadormx/blocks check` | Package type check, unit and container tests                     |
| `pnpm --filter docs check`              | Docs type check, unit and Playwright browser tests               |
| `pnpm --filter docs models:generate`    | Regenerate ring models for the configurator demo                 |
| `pnpm --filter docs stills:generate`    | Regenerate ring still images for the configurator demo           |
