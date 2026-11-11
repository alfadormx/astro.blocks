# Astro Blocks

Composable UI blocks for building sites quickly with [Astro](https://astro.build) and [Tailwind CSS](https://tailwindcss.com). Every block is configured through typed props, so a page is assembled by passing data rather than writing markup.

```astro
---
import Layout from '~/layouts/Layout.astro';
import Header from '~/components/blocks/composite/Header.astro';
import CallToAction from '~/components/blocks/composite/CallToAction.astro';
import Footer from '~/components/blocks/composite/Footer.astro';
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

## Block catalogue

Blocks live in `src/components/blocks/`, with prop types in `src/types/*.types.ts`. Live examples and API tables are served at `/documentation`.

### Primitives

| Block                           | Purpose                                                           |
| :------------------------------ | :---------------------------------------------------------------- |
| `Headline`                      | Tagline, title and subtitle with alignment and heading tag        |
| `Button`                        | Link or button with size, variant, intent, shape, icon or image   |
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
| `PostCard`, `CaseStudyCard`, `EventCard`       | One card per collection preset; the title is the card's link              |
| `PostLayout`, `CaseStudyLayout`, `EventLayout` | Entry page body: meta line, Markdown in `prose`, tags, map or Register    |

### Meta

`Metadata`, `CommonMeta`, `Favicons`, `Analytics` and `SiteVerification` are wired into `src/layouts/Layout.astro` and read from the site config.

## Conventions

- **Props, not markup.** Composites take the props of the blocks they contain, for example `headline: HeadlineProps` or `actions: ButtonProps[]`.
- **Layered defaults.** `default*Config` props set shared config for repeated children, and `selected*Config` or `active*Config` props layer state on top.
- **Rich text.** Fields typed `RichText` (Item, Accordion, Footer and Container content) take Markdown; one line renders inline, and HTML passes through.
- **Style tokens.** Buttons and items share an `intent`, `variant`, `size` and `shape` vocabulary. Colors come from `src/styles/colors.css`.
- **Internal sub-components stay internal.** Files that open with `// Internal to <Parent>` (or a list of parents) declare `Props` inline, have no docs page and are imported only by the parents they list; use a parent instead.

## Site configuration

`src/config.yaml` holds the site name and URL, i18n languages, default metadata, theme color, favicons and analytics. It is exposed to components through the `site-config` virtual module from `vendor/integration`.

### Collections and copy

`collections:` in `config.yaml` declares Markdown collections by preset (`post`, `caseStudy`, `event`). Content goes in `src/content/<name>/<lang>/*.md`, and `src/content.config.ts` is a one-line stub, so `getCollection('<name>')` is typed with no schema to write. Each collection needs two short pages, a list and an entry, built with the helpers in `vendor/integration/collections/pages.ts`.

Static-page copy lives in `src/copy/<page>/<lang>.yaml`. The default-language file defines the typed keys, and a key missing in another language falls back with a build warning. The guide at `/documentation/Collections` covers both.

## Project structure

```text
src/
├── components/
│   ├── blocks/        primitives/, layout/, composite/
│   └── meta/          head and SEO components
├── config.yaml        site configuration
├── content.config.ts  collections stub (reads config.yaml)
├── content/           Markdown collections, one folder per language
├── copy/              static-page copy, one YAML per language
├── layouts/           page layout
├── pages/
│   ├── [...lang]/     landing page and demos, one route for all locales
│   └── documentation/ block reference
├── styles/            global styles and color tokens
├── types/             prop types per block
└── utils/             shared helpers
vendor/integration/    site-config integration, collection and copy helpers
tests/                 unit/, astro/, browser/
```

## Demos

- `/` builds the landing page from `Header`, `Hero`, `ItemsContent`, `CallToAction` and `Footer`.
- `/demos/blog`, `/demos/work` and `/demos/events` are collection demos in English and Spanish, one per preset.
- `/demos/jewellery-configurator` is a ring configurator built on `Configurator` and `ModelViewer`, in English and Spanish.

## Commands

| Command                | Action                                                 |
| :--------------------- | :----------------------------------------------------- |
| `pnpm install`         | Install dependencies                                   |
| `pnpm dev`             | Start the dev server at `localhost:4321`               |
| `pnpm build`           | Build the site to `./dist/`                            |
| `pnpm preview`         | Preview the build                                      |
| `pnpm check`           | Run type check, lint, prettier and all test suites     |
| `pnpm test:unit`       | Vitest unit tests                                      |
| `pnpm test:astro`      | Vitest component tests                                 |
| `pnpm test:browser`    | Playwright browser tests                               |
| `pnpm fix`             | Apply ESLint and Prettier fixes                        |
| `pnpm models:generate` | Regenerate ring models for the configurator demo       |
| `pnpm stills:generate` | Regenerate ring still images for the configurator demo |
