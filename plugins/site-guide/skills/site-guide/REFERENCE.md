# Site guide reference

## guide.json

The example is the astro.blocks landing page (`apps/docs/src/pages/[...lang]/index.astro`), which keeps the library's default light palette and sets Outfit in `apps/docs/src/styles/global.css`. Its guide lives in `apps/docs/_guide/home/` and publishes as a docs article, so its images render straight into the docs assets.

```json
{
  "site": "Astro Blocks",
  "audience": {
    "profile": "developer",
    "who": "Developers who will build their own sites with the library."
  },
  "language": "en",
  "markdown": "SITE-GUIDE.md",
  "images": "../../src/assets/guides/home",
  "theme": {
    "colors": {
      "background": "#EFF1F5",
      "surface": "#E6E9EF",
      "ink": "#4C4F69",
      "muted": "#5C5F77",
      "primary": "#1E66F5",
      "accent": "#FE640B",
      "highlight": "#04A5E5",
      "line": "#ACB0BE",
      "faint": "#9CA0B0"
    },
    "fonts": {
      "title": "Outfit, 'Helvetica Neue', Arial, sans-serif",
      "body": "Outfit, 'Helvetica Neue', Arial, sans-serif"
    },
    "googleFonts": "https://fonts.googleapis.com/css2?family=Outfit:wght@300..700&family=Instrument+Serif:ital@0;1&display=swap"
  },
  "pdf": {
    "file": "astro-blocks-site-guide.pdf",
    "cover": {
      "kicker": "Astro Blocks · Site guide",
      "title": "How the landing page<br>is <em>put together</em>",
      "footLeft": "For developers",
      "footRight": "Whole sites, built from honest blocks"
    },
    "kickers": {
      "The big picture": "Start here",
      "The sections, from top to bottom": "Section by section",
      "Blocks we are not using yet (ideas for later)": "Ideas for later",
      "Before the site goes live": "Checklist"
    },
    "pagePerSection": ["The sections, from top to bottom"],
    "cards": ["Blocks we are not using yet (ideas for later)"],
    "flow": ["Blocks we are not using yet (ideas for later)"]
  },
  "mdx": {
    "file": "../../src/content/documentation/guides/LandingPage.mdx",
    "importPrefix": "~/assets/guides/home/",
    "frontmatter": {
      "description": "How the Astro Blocks landing page is assembled from blocks, section by section.",
      "section": "guides",
      "order": 10
    }
  }
}
```

**Colours** are roles, mapped from the site's semantic tokens: its `--color-*` overrides, or the library defaults in `@alfadormx/blocks/src/styles/blocks.css` and `colors.css` where it overrides none. Tokens written in OKLCH convert to hex, since the drawings shade from hex. The roles: `background` page, `surface` alternate bands, `ink` headings and strong text, `muted` body text, `primary` brand accent (badges, bullets, links), `accent` decorative, `highlight` text on dark photos, `line` hairlines and panel edges, `faint` page numbers. In the example, `background` is `--color-background` (base), `surface` mantle, `ink` `--color-normal`, `primary` blue, `accent` peach, `highlight` `--color-secondary` (sky), `line` `--color-border`. Fill gaps from the closest token; a site with a dark theme still gets its light palette here.

**Fonts** are full CSS stacks, used both in the SVGs and the PDF; `googleFonts` is the stylesheet URL the site imports. An SVG reaches web fonts only when it is inlined in a page that loads them, which the PDF and MDX exports both do.

**PDF keys** match `##` headings exactly. `kickers` puts a small label above a heading. `pagePerSection` starts every `###` under that heading on a new page. `cards` keeps every `###` under it in one piece. `flow` lets that heading follow the previous chapter instead of starting a page. The cover lead is the text between the `#` title and the first `##`.

**Locations** are relative to the folder holding `guide.json`. `images` is where `render.mjs` writes the SVGs (default `images`); `SITE-GUIDE.md` still links them as `images/<name>.svg` and every export resolves that to this folder. Point it at the place the images are served from, so each SVG exists once.

**MDX** takes its `title` from the `#` heading; `frontmatter` adds the rest. `mdx.file` is the article, `mdx.images` the folder its SVGs are imported from (default: `images`, so no copy when they already live there), `mdx.importPrefix` the import path to them, such as `~/assets/guides/home/`. Command-line flags override all three.

## MDX-only content

A component the article needs and the other formats cannot show (a card grid of links, an example block) goes in `SITE-GUIDE.md` inside an `mdx` comment:

```md
<!-- mdx
import ItemsGrid from '@alfadormx/blocks/composite/ItemsGrid.astro';

<ItemsGrid columns={2} items={[…]} />
-->
```

The MDX export unwraps it in place and hoists its `import` lines to the top; the PDF export drops it, and in plain Markdown it stays a hidden comment. Keep it out of the prose: put only JSX and imports inside.

## Audiences

Record the reader in `guide.json` as `audience.profile` plus a sentence in `audience.who`. Every choice below follows from the profile; for a reader the user describes, start from the nearest profile and adjust.

|               | **owner**                                                                    | **developer**                                                                                                        | **showcase**                                                                             |
| ------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Reader        | runs the site, never touches the code                                        | builds or maintains sites with the blocks                                                                            | visits the docs, weighing the library                                                    |
| Vocabulary    | everyday words; a block name only where they will use it to ask for a change | block names, props, layers (`default…Config`), tokens, file paths, copy keys                                         | block names, linked to their docs pages; props only where they show the point            |
| Per section   | **What you see** / **What we can change** (options as requests)              | **What you see** / **Built from** (blocks and the props this site sets) / **How to change it** (prop, file or token) | **What you see** / **Built from** (blocks, one line on the configuration that shapes it) |
| Layer labels  | what the eye sees: "Soft dark veil"                                          | the block or prop: "`Hero` · `container.background`"                                                                 | the block, plainly: "Hero background"                                                    |
| Shared parts  | colours, fonts, where the words live                                         | tokens overridden, fonts, `config.yaml`, copy files, layout                                                          | theming by tokens, copy by language                                                      |
| Ideas section | blocks to ask for, as benefits                                               | blocks to add, with the props that matter                                                                            | blocks this site could add, linked to their docs                                         |
| Closing       | **Before the site goes live** checklist of content to supply                 | launch checklist: domain, robots, placeholders, assets                                                               | none; end on where to read next                                                          |

Mark invented content (placeholder stats, sample testimonials) as such for every profile.

## Guide structure

```
# Astro Blocks: how the landing page is put together
<one paragraph addressed to the reader: what this guide is for>

## The big picture
<one page or many, languages, what blocks are>
![The whole page, section by section](images/00-overview.svg)
### Things that are shared by the whole page
<colours, fonts, where the words live: src/copy/home/<lang>.yaml>

## The sections, from top to bottom
### 1. Header and menu
![The header, pulled apart into its layers](images/01-header.svg)
**What you see:** …
**What we can change:**
- …
### 2. Hero
### 3. Stats
### 4. Demos
### 5. Component layers
### 6. Guides
### 7. Call to action
### 8. Footer

## What happens when the site is shared
## Blocks we are not using yet (ideas for later)
### Testimonials
![A testimonials block, with one quote pulled forward](images/idea-testimonials.svg)
<one or two sentences>
## Before the site goes live
- [ ] <placeholders still to replace: from the README and the copy>
```

Section headings name what the reader sees, in page order: the landing page runs Header (with its menu Modal), Hero, then four ItemsContent bands (stats, demos, component layers, guides), a CallToAction card and the Footer, so each band gets its own heading even though they share a block.

The skeleton above is the owner's; swap the per-section labels and the closing chapter for the profile's. Images are referenced as `images/<name>.svg` on a line of their own; the exports find them by that pattern. Number section images in page order (`01-`, `02-`, …) so they sort with the guide.

## Exports

- **md**: `SITE-GUIDE.md` plus its images in `images/`, copied as a pair so relative paths hold.
- **mdx**: each image becomes an Astro SVG component import, so the diagram is inlined and uses the page's fonts. With no `mdx.images`, the SVGs are imported from where `images` put them, without a copy. The file is then formatted with the repo's prettier when one is installed, so it passes the repo's checks. The docs page renders the labels in whatever fonts it loads, so a docs article shows the docs fonts unless the page loads the site's.
- **pdf**: A4, page background in the theme colour, page numbers, a cover. SVGs are inlined, never `<img>`: an SVG loaded as an image cannot reach web fonts. Chrome fetches `googleFonts` while printing; offline, it prints in the fallback fonts without warning, so check the preview's type.
