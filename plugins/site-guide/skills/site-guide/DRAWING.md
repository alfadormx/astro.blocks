# Drawing sections

`guide.spec.mjs` exports a `default` function that receives the kit and returns `{ 'file.svg': svg }`, and optionally `defs(colors)` returning SVG gradients the drawings reference as `url(#id)`:

```js
export const defs = (P) =>
  `<linearGradient id="sunset" x1="0" y1="0" x2="0" y2="1">…</linearGradient>`;

export default function build(kit) {
  const { W, P, F, txt, caps, bars, base, glass, exploded, overview, idea, ICONS, icon } = kit;
  const SECTIONS = {
    '02-hero.svg': {
      title: 'Hero section, pulled apart into its layers',
      H: 180,
      layers: [
        {
          title: 'Photo',
          note: 'any photo, or a short video',
          draw: base('url(#sunset)', '#5A4250', PHOTO),
        },
        {
          title: 'Soft dark veil',
          note: 'keeps the words readable',
          draw: glass('', { fill: 'url(#tint)', fillOpacity: 1 }),
        },
        {
          title: 'Words',
          note: 'tagline, title and sentence',
          draw: glass(WORDS, { fillOpacity: 0.25 }),
        },
        {
          title: 'Arrow button',
          note: 'jumps to the gallery',
          draw: glass(ARROW, { stroke: P.line }),
        },
      ],
    },
  };
  return {
    '00-overview.svg': overview({
      title: 'The page, section by section',
      items: [
        {
          title: 'Hero',
          note: 'full-screen welcome photo',
          H: 180,
          layers: SECTIONS['02-hero.svg'].layers,
        },
      ],
    }),
    ...Object.fromEntries(Object.entries(SECTIONS).map(([name, cfg]) => [name, exploded(cfg)])),
  };
}
```

## The panel

Every panel is `W` = 320 units wide and `H` tall (180 for a full-screen section, 140 for a band, 70 for a footer). Draw in panel coordinates: x right, y down, origin top-left. The kit skews them onto the upright screen. Text sizes run from 5.5 (tracked caps) to 30 (a hero title).

## Kit

| Call                                                                                           | Draws                                                                                                                                                                         |
| ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base(fill, edge, content)`                                                                    | the solid back layer: photo, colour band. `edge` colours its visible thickness                                                                                                |
| `glass(content, { fill, fillOpacity, stroke })`                                                | a see-through layer holding one part (veil, words, buttons). A non-background `fill` makes it a veil                                                                          |
| `exploded({ title, H, layers })`                                                               | one section, its `layers` back to front, 150 units apart, numbered on the right. Four layers fill the frame                                                                   |
| `overview({ title, items, floating })`                                                         | the page as a column; an item takes `layers` (flattened) or `content`. `floating` cards (`{ x, y, w, h, d, content, from: [x, y, d] }`) hover in front, tied by a dashed line |
| `idea({ title, H, fill, content, pop, labels })`                                               | an unused block: one panel and the `pop` card (`{ x, y, w, h, fill, stroke, content }`) pulled forward. `labels` is `[[title, note], [title, note]]`                          |
| `txt(x, y, text, { size, font: 'title' \| 'body', fill, anchor, ls, italic, weight, onDark })` | text; `onDark` adds an outline so light text survives a light page                                                                                                            |
| `caps(x, y, text, opts)`                                                                       | small tracked capitals for labels and kickers                                                                                                                                 |
| `bars([[x, y, w, h]], fill, opacity)`                                                          | rounded bars standing in for body text                                                                                                                                        |
| `ICONS.envelope \| pin \| camera \| phone (x, y, colour)`, `icon((x, y) => paths)`             | line icons; `icon` builds more in the same style                                                                                                                              |

`P` holds the theme colours by role, `F` the font stacks.

## Layers follow the blocks

Split a section where its blocks stack, so each numbered layer is something the reader can ask to change:

- **Background image** (`Hero`, `CallToAction`, `Container` with `background.image`): `base` photo, then a `glass` veil when `overlayClass` darkens it, then the headline, then the actions.
- **Colour band** (`Container` with `bg-surface`): `base` in that colour, then one `glass` per column or group.
- **Grids and lists** (`ItemsGrid`, `ItemsTimeline*`): the media, then any per-item overlay or frame, then titles and text.
- **Carousels**: the background, the slide content, the controls.
- **Floating chrome** (a `Header` with `isFloating`, a `Modal`): the page beneath as a `base`, then the trigger, the panel, its footer.

Word each layer's `title` and `note` for the audience (REFERENCE.md, Audiences): what the eye sees for an owner, the block or prop for a developer. Draw each part as a simplified mock: real headings and button labels as text, body copy as `bars`, photos as gradients with two or three shapes.

## Checklist

Read every preview against this; fix and render again until all hold:

- Every label reads in full. Keep layer titles to about 24 characters; the label column clips longer ones.
- Light panels show an edge: a cream panel on a cream page needs `base(…, P.line)` or a `stroke`.
- Light text on a see-through layer uses `onDark`; small text there uses `P.ink`.
- Arrows and chevrons read correctly on the slant: a `V` reads as a tick, so draw a down arrow as a vertical stem with a head.
- Nothing overlaps: captions inside their tiles, logos apart, labels at least 60 units apart vertically.
- Idea images share the section frame (the kit sizes them); the drawing fills it rather than floating small.
