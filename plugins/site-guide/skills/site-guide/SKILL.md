---
name: site-guide
description: Site guide for a site built with @alfadormx/blocks, a section-by-section tour written for a chosen audience (owner, developer or docs reader) with isometric diagrams of how its blocks are layered, exported as md, mdx or pdf. Use when asked to write, update or export a site guide, site overview or handbook.
---

# Site guide

A site guide explains a site section by section to one **audience**: what each section is, how it is assembled from blocks, and what can be changed in it, in the words and depth that reader needs. Every section gets an **exploded** diagram: the section pulled apart into its layers, back to front.

`<skill>` below is the folder holding this file. `<guide>` is the **working folder**: `_guide/` at the site root, unless the user names another. A repo holding several sites (a docs app with demos) gets one per site, `<guide>/<site>/`.

```
<guide>/
  guide.json        theme, cover, where outputs go  (REFERENCE.md)
  SITE-GUIDE.md     the guide text, the one source  (REFERENCE.md)
  guide.spec.mjs    how each section is drawn       (DRAWING.md)
  images/*.svg      rendered here, or where guide.json `images` points
```

`SITE-GUIDE.md` is the single source of the text: every export is generated from it, so an edit made in an exported file is lost on the next export. Content only one format needs lives in `SITE-GUIDE.md` too (REFERENCE.md, MDX-only content).

## Steps

1. **Survey the site.** Check `package.json` depends on `@alfadormx/blocks`. Read the pages (`src/pages/**`), layouts, copy (`src/copy/**`), `src/config.yaml`, the site stylesheet and the README. Walk the rendered page top to bottom and, for each section, note the blocks it is built from, the props, layers and classes the site sets, and the assets it uses. Offer a change only when the block's type supports it (`node_modules/@alfadormx/blocks/src/types/<block>.types.ts`). Done when every section, in page order, has its blocks and the props this site sets, and every option you plan to offer points at a real prop.
2. **Agree the brief.** Audience: one of the profiles in [REFERENCE.md](REFERENCE.md) (owner, developer, showcase) or a reader the user describes; when the request does not name one, ask, offering the profiles. Then language, formats (`md`, `mdx`, `pdf`) and where each output goes: the working folder, and for `mdx` the target file, the folder its images are imported from, and the frontmatter its collection needs (astro.blocks docs: `title`, `description`, `section`, `order`). Take every location the prompt gives; ask for the rest.
3. **Theme.** Write `<guide>/guide.json` from the site's token overrides and fonts, with the output locations from the brief, following [REFERENCE.md](REFERENCE.md).
4. **Write** `<guide>/SITE-GUIDE.md` in the structure of [REFERENCE.md](REFERENCE.md), following its audience profile for vocabulary, depth and which parts to include.
5. **Draw** `<guide>/guide.spec.mjs` with [DRAWING.md](DRAWING.md): an overview, one exploded image per section, one idea image per unused block the guide suggests. Layer labels speak the audience's language too.
6. **Render and look.** From the site root: `node <skill>/scripts/render.mjs <guide> --preview <scratch>/sheet.png` (`--only 03,idea-` narrows the sheet). Read the PNG. Done when every image passes the checklist in [DRAWING.md](DRAWING.md).
7. **Export** each requested format. Paths come from `guide.json`; flags override them.
   - `python3 <skill>/scripts/export.py <guide> --format md [--out DIR]`: the Markdown with its images.
   - `python3 <skill>/scripts/export.py <guide> --format mdx [--out FILE.mdx] [--images DIR] [--import-prefix PREFIX]`: formatted with the repo's prettier when it has one.
   - `python3 <skill>/scripts/export.py <guide> --format pdf [--out FILE.pdf] [--preview <scratch>/pages.png]`: read the preview. Done when headings sit with their content and at most one page is mostly empty.
8. **Report** the files written, and what the target site still needs to show the guide (a docs section, a nav entry) without making those changes unless asked. Nothing is committed unless the user asks.

## Requirements

Node 18+. The preview resolves `sharp` from the site, so run it from the site root. PDF export needs Python 3 with `markdown` and Google Chrome or Chromium (`CHROME_PATH` overrides the lookup). The PDF preview needs `pypdfium2` and `pillow`: install them outside the project with `pip3 install --target <scratch>/py pypdfium2 pillow` and run with `PYTHONPATH=<scratch>/py`.
