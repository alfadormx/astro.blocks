const DEEP = '#470F14';
const GOLD = '#C9A15A';

export const defs = () => `
<linearGradient id="film" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#8A6B4E"/><stop offset="1" stop-color="#2E211A"/>
</linearGradient>
<linearGradient id="linen" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#EFE6DC"/><stop offset="1" stop-color="#B9A894"/>
</linearGradient>
<linearGradient id="skin" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#E2C6AE"/><stop offset="1" stop-color="#9C7860"/>
</linearGradient>
<linearGradient id="bench" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#9A8574"/><stop offset="1" stop-color="#4A3B31"/>
</linearGradient>
<radialGradient id="metal" cx="0.35" cy="0.3" r="0.8">
  <stop offset="0" stop-color="#FFF1C9"/><stop offset="0.5" stop-color="${GOLD}"/><stop offset="1" stop-color="#7A5A23"/>
</radialGradient>`;

export default function build(kit) {
  const { P, txt, bars, base, glass, exploded, idea, icon } = kit;
  const LIGHT = P.background;
  const WHITE = P.surface;

  const serif = (x, y, s, o = {}) =>
    txt(x, y, s, { font: 'title', anchor: 'start', weight: 500, ...o });
  const label = (x, y, s, o = {}) =>
    txt(x, y, s.toUpperCase(), {
      size: 5,
      anchor: 'start',
      ls: 1.4,
      weight: 600,
      fill: P.muted,
      ...o,
    });
  const centred = (y, tag, title, size = 14) =>
    label(160, y, tag, { anchor: 'middle' }) +
    serif(160, y + size + 2, title, { size, anchor: 'middle' });

  const square = (x, y, w, h, l, { solid = true } = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${solid ? P.primary : LIGHT}" stroke="${solid ? P.primary : P.ink}"/>` +
    txt(x + w / 2, y + h / 2 + 2.4, l, { size: 6, weight: 600, fill: solid ? WHITE : P.ink });

  const photo = (x, y, w, h, grad) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${grad})"/>` +
    `<circle cx="${x + w / 2}" cy="${y + h * 0.55}" r="${Math.min(w, h) * 0.16}" fill="none" stroke="${GOLD}" stroke-width="2"/>`;

  const ring = (cx, cy, r) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.55}" fill="none" stroke="url(#metal)" stroke-width="${r * 0.22}"/>` +
    `<path d="M${cx - r * 0.18} ${cy - r * 0.55} l${r * 0.18} ${-r * 0.3} l${r * 0.18} ${r * 0.3} z" fill="#E9F2F7" stroke="#9FB4C2"/>`;

  const star = (x, y) =>
    `<path d="M${x} ${y - 3} l0.9 1.9 2.1 0.3 -1.5 1.5 0.35 2.1 -1.85 -1 -1.85 1 0.35 -2.1 -1.5 -1.5 2.1 -0.3z" fill="${P.ink}"/>`;

  const burger = icon(
    (x, y) => `<path d="M${x - 5} ${y - 3} h10 M${x - 5} ${y} h10 M${x - 5} ${y + 3} h10"/>`
  );
  const play = icon(
    (x, y) => `<circle cx="${x}" cy="${y}" r="6"/><path d="M${x - 2} ${y - 3} l5 3 l-5 3 z"/>`
  );
  const pin = icon(
    (x, y) =>
      `<path d="M${x} ${y + 6} C${x - 6} ${y} ${x - 5} ${y - 6} ${x} ${y - 6} C${x + 5} ${y - 6} ${x + 6} ${y} ${x} ${y + 6} Z"/><circle cx="${x}" cy="${y - 1.5}" r="1.8"/>`
  );
  const chevron = icon(
    (x, y) => `<path d="M${x} ${y - 3.5} v6 M${x - 2.5} ${y} l2.5 2.5 l2.5 -2.5"/>`
  );

  const NAV = ['Design', 'Collections', 'About', 'Contact'];

  const SECTIONS = {
    '01-header.svg': {
      title: 'The header, pulled apart into its layers',
      H: 50,
      layers: [
        {
          title: 'Light sticky bar',
          note: 'bg-background/95, hairline',
          draw: base(LIGHT, P.line, `<line x1="0" x2="320" y1="49" y2="49" stroke="${P.line}"/>`),
        },
        {
          title: 'Left and right links',
          note: 'two navigation trees',
          draw: glass(
            label(16, 27, NAV[0], { fill: P.ink }) +
              label(56, 27, NAV[1], { fill: P.ink }) +
              label(222, 27, NAV[2], { fill: P.ink }) +
              label(256, 27, NAV[3], { fill: P.ink })
          ),
        },
        {
          title: 'Brand in the middle',
          note: 'logo.label, centred by default',
          draw: glass(serif(160, 30, 'Atelier Halden', { size: 13, anchor: 'middle' })),
        },
        {
          title: 'Phone menu',
          note: 'burger opens a right Modal',
          draw: glass(
            `<rect x="210" y="0" width="110" height="50" fill="${LIGHT}" stroke="${P.line}"/>` +
              NAV.map((n, i) => txt(222, 12 + i * 11, n, { size: 7, anchor: 'start' })).join('') +
              burger(196, 25, P.ink)
          ),
        },
      ],
    },
    '02-hero.svg': {
      title: 'The hero, pulled apart into its layers',
      H: 170,
      layers: [
        {
          title: 'Background video',
          note: 'WebM + MP4, muted, looping',
          draw: base(
            'url(#film)',
            '#2E211A',
            photo(110, 40, 100, 90, 'film') + play(290, 150, '#FFFFFF')
          ),
        },
        {
          title: 'Burgundy veil',
          note: 'overlayClass bg-tertiary/60',
          draw: glass('', { fill: DEEP, fillOpacity: 0.6 }),
        },
        {
          title: 'Centred headline',
          note: 'layout="centered"',
          draw: glass(
            label(160, 58, 'Antwerp, since 1962', { anchor: 'middle', fill: P.ink }) +
              serif(160, 84, 'Made to be worn every day', { size: 20, anchor: 'middle' }) +
              bars([[100, 94, 120, 3.5]], P.muted, 0.7)
          ),
        },
        {
          title: 'Two square buttons',
          note: 'defaultActionConfig, square',
          draw: glass(
            square(86, 110, 72, 16, 'Design your ring') +
              square(164, 110, 72, 16, 'See the collections', { solid: false })
          ),
        },
      ],
    },
    '03-collections.svg': {
      title: 'The collections, pulled apart into their layers',
      H: 170,
      layers: [
        {
          title: 'Centred heading',
          note: 'SECTION_HEADLINE',
          draw: base(LIGHT, P.line, centred(18, 'The collections', 'Three ways to wear it', 13)),
        },
        {
          title: '3:4 photos',
          note: 'mediaClass, aspect-3/4',
          draw: glass(
            ['linen', 'skin', 'skin'].map((g, i) => photo(28 + i * 92, 44, 80, 92, g)).join('')
          ),
        },
        {
          title: 'Name and line',
          note: 'title and content per item',
          draw: glass(
            ['Rings', 'Necklaces', 'Earrings']
              .map(
                (t, i) =>
                  serif(28 + i * 92, 148, t, { size: 10 }) +
                  bars([[28 + i * 92, 153, 64, 3]], P.muted, 0.6)
              )
              .join('')
          ),
        },
        {
          title: 'Explore links',
          note: 'nested defaultActionConfig',
          draw: glass(
            [0, 1, 2].map((i) => label(28 + i * 92, 166, 'Explore', { fill: P.primary })).join('')
          ),
        },
      ],
    },
    '04-craft.svg': {
      title: 'The craft section, pulled apart into its layers',
      H: 140,
      layers: [
        { title: 'White band', note: 'Content, bg-surface', draw: base(WHITE, P.line) },
        {
          title: 'Goldsmith photo',
          note: 'imagePosition="left"',
          draw: glass(photo(16, 16, 130, 108, 'bench')),
        },
        {
          title: 'Headline and body',
          note: 'left-aligned, rich text slot',
          draw: glass(
            label(166, 40, 'Craftsmanship') +
              serif(166, 56, 'Every stone set by hand', { size: 12 }) +
              bars(
                [
                  [166, 66, 138, 3],
                  [166, 73, 128, 3],
                  [166, 80, 120, 3],
                  [166, 90, 100, 3],
                ],
                P.ink,
                0.5
              )
          ),
        },
        {
          title: 'Meet the workshop',
          note: 'action, outline, square',
          draw: glass(square(166, 102, 72, 14, 'Meet the workshop', { solid: false })),
        },
      ],
    },
    '05-testimonials.svg': {
      title: 'The customer quotes, pulled apart into their layers',
      H: 140,
      layers: [
        {
          title: 'Centred heading',
          note: 'Testimonials headline',
          draw: base(LIGHT, P.line, centred(18, 'Worn, not staged', 'From our customers', 13)),
        },
        {
          title: 'Hairline cards',
          note: 'defaultTestimonialConfig',
          draw: glass(
            [0, 1, 2]
              .map(
                (i) =>
                  `<rect x="${16 + i * 98}" y="44" width="90" height="86" fill="${WHITE}" stroke="${P.line}"/>`
              )
              .join('')
          ),
        },
        {
          title: 'Stars, quote, name',
          note: 'rating: 5, serif italic quote',
          draw: glass(
            [
              ['Sofie V.', 'Antwerp'],
              ['Marc D.', 'Ghent'],
              ['Lea K.', 'Brussels'],
            ]
              .map(
                ([n, c], i) =>
                  [0, 1, 2, 3, 4].map((s) => star(26 + i * 98 + s * 7, 58)).join('') +
                  serif(24 + i * 98, 76, '“I designed my', { size: 8, italic: true }) +
                  serif(24 + i * 98, 86, 'ring online…”', { size: 8, italic: true }) +
                  txt(24 + i * 98, 112, n, { size: 6, anchor: 'start', weight: 600 }) +
                  txt(24 + i * 98, 120, c, { size: 5, anchor: 'start', fill: P.muted })
              )
              .join('')
          ),
        },
      ],
    },
    '06-cta.svg': {
      title: 'The call to action, pulled apart into its layers',
      H: 100,
      layers: [
        { title: 'Burgundy band', note: 'container class bg-tertiary', draw: base(DEEP, DEEP) },
        {
          title: 'Transparent card',
          note: 'container.content.class',
          draw: glass(
            `<rect x="60" y="14" width="200" height="72" fill="none" stroke="${P.muted}" stroke-dasharray="4 4"/>`,
            { fillOpacity: 0 }
          ),
        },
        {
          title: 'Centred headline',
          note: 'title and subtitle',
          draw: glass(
            serif(160, 40, 'Design your own ring', { size: 16, anchor: 'middle' }) +
              bars([[95, 50, 130, 3.5]], P.muted, 0.7)
          ),
        },
        {
          title: 'Start designing',
          note: 'outline, links to the configurator',
          draw: glass(square(124, 62, 72, 14, 'Start designing', { solid: false })),
        },
      ],
    },
    '07-footer.svg': {
      title: 'The footer, pulled apart into its layers',
      H: 70,
      layers: [
        {
          title: 'Footer',
          note: 'top hairline',
          draw: base(LIGHT, P.line, `<line x1="0" x2="320" y1="1" y2="1" stroke="${P.line}"/>`),
        },
        {
          title: 'Brand and disclaimer',
          note: 'logo + disclaimer',
          draw: glass(
            serif(16, 24, 'Atelier Halden', { size: 11 }) + bars([[16, 32, 150, 3]], P.muted, 0.7)
          ),
        },
        {
          title: 'Socials and language',
          note: 'socialButtons, languageToggle',
          draw: glass(
            [0, 1]
              .map(
                (i) =>
                  `<rect x="${250 + i * 14}" y="16" width="9" height="9" rx="2" fill="none" stroke="${P.ink}"/>`
              )
              .join('') + txt(250, 42, 'EN · ES', { size: 6.5, anchor: 'start', weight: 600 })
          ),
        },
        {
          title: 'Credit line',
          note: 'footnote',
          draw: glass(
            txt(16, 60, '© Atelier Halden. A demo built with astro.blocks.', {
              size: 5.5,
              anchor: 'start',
              fill: P.muted,
            })
          ),
        },
      ],
    },
    '08-collections-page.svg': {
      title: 'The collections page, pulled apart into its layers',
      H: 170,
      layers: [
        {
          title: 'Container + h1',
          note: 'centred SECTION_HEADLINE',
          draw: base(LIGHT, P.line, centred(18, 'The collections', 'Collections', 14)),
        },
        {
          title: 'Tab list, 3-column grid',
          note: 'tabList layout grid, no gap',
          draw: glass(
            ['Rings', 'Necklaces', 'Earrings']
              .map(
                (t, i) =>
                  label(68 + i * 96, 52, t, { anchor: 'middle', fill: P.ink }) +
                  `<line x1="${20 + i * 96}" x2="${116 + i * 96}" y1="58" y2="58" stroke="${i === 0 ? P.ink : P.line}" stroke-width="${i === 0 ? 2 : 1}"/>`
              )
              .join('')
          ),
        },
        {
          title: 'Panel: ItemsGrid',
          note: 'one per panel slot',
          draw: glass(
            ['linen', 'skin', 'linen']
              .map(
                (g, i) =>
                  photo(28 + i * 92, 66, 80, 78, g) +
                  serif(28 + i * 92, 154, ['Classic', 'Bold', 'Pavé'][i], { size: 9 })
              )
              .join('')
          ),
        },
        {
          title: 'Design this ring',
          note: 'link with a RING_PRESETS code',
          draw: glass(
            [0, 1, 2]
              .map((i) => label(28 + i * 92, 165, 'Design this ring', { fill: P.primary }))
              .join('')
          ),
        },
      ],
    },
    '09-configurator.svg': {
      title: 'The configurator, pulled apart into its layers',
      H: 170,
      layers: [
        {
          title: 'Two columns, 3:2',
          note: 'twoColumnContainer',
          draw: base(LIGHT, P.line, `<line x1="192" x2="192" y1="0" y2="170" stroke="${P.line}"/>`),
        },
        {
          title: 'Title and summary',
          note: 'headline + summary',
          draw: glass(
            serif(96, 22, 'Design your ring', { size: 13, anchor: 'middle' }) +
              label(96, 32, 'Yellow gold 0.5 ct IF', { anchor: 'middle' }) +
              square(70, 150, 52, 12, 'Save', { solid: false })
          ),
        },
        {
          title: '3D ring',
          note: 'ModelViewer: GLB, HDR, bloom',
          draw: glass(
            `<rect x="12" y="40" width="168" height="102" fill="${WHITE}" stroke="${P.line}"/>` +
              ring(96, 96, 34)
          ),
        },
        {
          title: 'Category tabs',
          note: 'sticky tab grid with icons',
          draw: glass(
            ['Model', 'Carat', 'Metal', 'Clarity', 'Extras', 'Engrave']
              .map((t, i) => {
                const x = 192 + (i % 3) * 42.7;
                const y = 0 + Math.floor(i / 3) * 24;
                return (
                  `<rect x="${x}" y="${y}" width="42.7" height="24" fill="${LIGHT}" stroke="${P.line}"/>` +
                  `<circle cx="${x + 21}" cy="${y + 9}" r="3" fill="none" stroke="${P.ink}"/>` +
                  txt(x + 21, y + 20, t.toUpperCase(), { size: 4.2, ls: 0.6 }) +
                  (i === 2
                    ? `<line x1="${x}" x2="${x + 42.7}" y1="${y + 23}" y2="${y + 23}" stroke="${P.ink}" stroke-width="2"/>`
                    : '')
                );
              })
              .join('')
          ),
        },
        {
          title: 'Option tiles',
          note: 'options with mutations',
          draw: glass(
            label(256, 62, 'Choose a metal', { anchor: 'middle', fill: P.ink }) +
              [
                ['#E6B422', 'Yellow'],
                ['#E5E4E2', 'White'],
                ['#D8A49A', 'Rose'],
              ]
                .map(
                  ([c, t], i) =>
                    `<rect x="${192 + i * 42.7}" y="70" width="42.7" height="40" fill="${WHITE}" stroke="${P.line}"/>` +
                    `<circle cx="${213 + i * 42.7}" cy="84" r="6" fill="${c}" stroke="${P.line}"/>` +
                    txt(213 + i * 42.7, 101, t.toUpperCase(), { size: 4.5, ls: 0.6 }) +
                    (i === 0
                      ? `<line x1="192" x2="234.7" y1="109" y2="109" stroke="${P.ink}" stroke-width="2"/>`
                      : '')
                )
                .join('')
          ),
        },
      ],
    },
    '10-about.svg': {
      title: 'The about intro, pulled apart into its layers',
      H: 140,
      layers: [
        { title: 'Content block', note: 'two columns, centred', draw: base(LIGHT, P.line) },
        {
          title: 'Headline as h1',
          note: 'left-aligned title and subtitle',
          draw: glass(
            serif(16, 44, 'A workshop, not a factory', { size: 14 }) +
              bars([[16, 54, 130, 3.5]], P.muted, 0.7)
          ),
        },
        {
          title: 'Body in the slot',
          note: 'rendered rich text',
          draw: glass(
            bars(
              [
                [16, 72, 140, 3],
                [16, 79, 130, 3],
                [16, 86, 136, 3],
                [16, 98, 120, 3],
              ],
              P.ink,
              0.5
            )
          ),
        },
        {
          title: 'Bench photo',
          note: 'image, right by default',
          draw: glass(photo(176, 16, 128, 108, 'bench')),
        },
      ],
    },
    '11-history.svg': {
      title: 'The history timeline, pulled apart into its layers',
      H: 150,
      layers: [
        {
          title: 'White band + heading',
          note: 'Container, centred Headline',
          draw: base(WHITE, P.line, centred(18, 'Since 1962', 'Our story', 13)),
        },
        {
          title: 'Timeline line and dots',
          note: 'ItemsTimeline',
          draw: glass(
            `<line x1="90" x2="90" y1="46" y2="142" stroke="${P.line}" stroke-width="1.5"/>` +
              [0, 1, 2, 3]
                .map((i) => `<circle cx="90" cy="${52 + i * 26}" r="3.5" fill="${P.primary}"/>`)
                .join('')
          ),
        },
        {
          title: 'Dated entries',
          note: 'serif titles, muted text',
          draw: glass(
            [
              '1962 · A repair counter',
              '1978 · The first setter',
              '1996 · A second generation',
              '2024 · Design online',
            ]
              .map(
                (t, i) =>
                  serif(100, 55 + i * 26, t, { size: 8.5 }) +
                  bars([[100, 61 + i * 26, 130, 3]], P.muted, 0.6)
              )
              .join('')
          ),
        },
      ],
    },
    '12-stats.svg': {
      title: 'The numbers, pulled apart into their layers',
      H: 110,
      layers: [
        {
          title: 'Centred heading',
          note: 'ItemsContent headline',
          draw: base(LIGHT, P.line, centred(18, 'In numbers', 'Small, on purpose', 13)),
        },
        {
          title: 'Hairline cells',
          note: "gap: 'none' plus item borders",
          draw: glass(
            `<rect x="16" y="46" width="288" height="54" fill="none" stroke="${P.line}"/>` +
              [1, 2, 3]
                .map(
                  (i) =>
                    `<line x1="${16 + i * 72}" x2="${16 + i * 72}" y1="46" y2="100" stroke="${P.line}"/>`
                )
                .join('')
          ),
        },
        {
          title: 'Figures and labels',
          note: 'serif title, LABEL text',
          draw: glass(
            [
              ['60+', 'years at the bench'],
              ['12,000', 'pieces made'],
              ['9', 'setters'],
              ['100%', 'recycled gold'],
            ]
              .map(
                ([v, l], i) => serif(24 + i * 72, 76, v, { size: 18 }) + label(24 + i * 72, 90, l)
              )
              .join('')
          ),
        },
      ],
    },
    '13-team.svg': {
      title: 'The team, pulled apart into its layers',
      H: 130,
      layers: [
        {
          title: 'Team block',
          note: 'centred headline, 4 columns',
          draw: base(LIGHT, P.line, serif(160, 22, 'The workshop', { size: 13, anchor: 'middle' })),
        },
        {
          title: 'Square portraits',
          note: 'imageShape="square"',
          draw: glass(
            [0, 1, 2, 3]
              .map(
                (i) =>
                  `<rect x="${16 + i * 74}" y="34" width="66" height="66" fill="url(#skin)"/>` +
                  `<circle cx="${49 + i * 74}" cy="60" r="11" fill="${LIGHT}" fill-opacity="0.4"/>` +
                  `<path d="M${30 + i * 74} 100 q19 -26 38 0" fill="${LIGHT}" fill-opacity="0.4"/>`
              )
              .join('')
          ),
        },
        {
          title: 'Name and role',
          note: 'defaultMemberConfig',
          draw: glass(
            [
              ['Lotte Halden', 'Designer'],
              ['Bram Peeters', 'Stone setter'],
              ['Ines Moreau', 'Goldsmith'],
              ['Wout Janssens', 'Polisher'],
            ]
              .map(
                ([n, r], i) =>
                  serif(16 + i * 74, 113, n, { size: 8.5 }) + label(16 + i * 74, 122, r)
              )
              .join('')
          ),
        },
      ],
    },
    '14-contact.svg': {
      title: 'The contact page, pulled apart into its layers',
      H: 170,
      layers: [
        {
          title: 'ContactForm heading',
          note: 'left-aligned h1',
          draw: base(
            LIGHT,
            P.line,
            serif(16, 28, 'Visit the atelier', { size: 16 }) +
              bars([[16, 38, 180, 3.5]], P.muted, 0.7)
          ),
        },
        {
          title: 'Square fields',
          note: 'fields + defaultFieldConfig',
          draw: glass(
            [
              ['Name', 58, 12],
              ['Email', 82, 12],
              ['Topic', 106, 12],
              ['Message', 130, 22],
            ]
              .map(
                ([l, y, h]) =>
                  label(16, y - 3, l, { fill: P.ink }) +
                  `<rect x="16" y="${y}" width="136" height="${h}" fill="${WHITE}" stroke="${P.line}"/>`
              )
              .join('') + square(16, 156, 40, 11, 'Send')
          ),
        },
        {
          title: 'Aside: details',
          note: 'ItemsGrid, aside on the right',
          draw: glass(
            ['Address', 'Call', 'Mail']
              .map(
                (t, i) =>
                  label(168, 58 + i * 18, t) + bars([[168, 62 + i * 18, 80, 3.5]], P.ink, 0.6)
              )
              .join('')
          ),
        },
        {
          title: 'Aside: map',
          note: 'Map in the same slot',
          draw: glass(
            `<rect x="168" y="112" width="136" height="54" fill="#EEE6DD" stroke="${P.line}"/>` +
              `<path d="M168 136 L304 126 M200 112 L214 166 M262 112 L250 166" stroke="${WHITE}" stroke-width="3"/>` +
              pin(234, 140, P.primary)
          ),
        },
      ],
    },
    '15-faq.svg': {
      title: 'The contact FAQ, pulled apart into its layers',
      H: 130,
      layers: [
        {
          title: 'White band + heading',
          note: 'ItemsContent, bg-surface',
          draw: base(WHITE, P.line, centred(18, 'Questions', 'Before you visit', 13)),
        },
        {
          title: 'Two-column grid',
          note: 'copy entries passed as items',
          draw: glass(
            [
              'How do I find my ring size?',
              'Can you resize a ring?',
              'How should I clean my jewellery?',
              'What can you engrave?',
            ]
              .map((q, i) => {
                const x = 16 + (i % 2) * 150;
                const y = 56 + Math.floor(i / 2) * 36;
                return (
                  serif(x, y, q, { size: 8.5 }) +
                  bars(
                    [
                      [x, y + 7, 130, 3],
                      [x, y + 13, 100, 3],
                    ],
                    P.muted,
                    0.6
                  )
                );
              })
              .join('')
          ),
        },
      ],
    },
  };

  return {
    ...Object.fromEntries(Object.entries(SECTIONS).map(([name, cfg]) => [name, exploded(cfg)])),
    'idea-accordion.svg': idea({
      title: 'An accordion, with one answer pulled forward',
      H: 180,
      content:
        serif(20, 30, 'Before you visit', { size: 14 }) +
        [0, 1, 2, 3]
          .map(
            (i) =>
              `<line x1="20" x2="300" y1="${60 + i * 28}" y2="${60 + i * 28}" stroke="${P.line}"/>` +
              bars([[20, 50 + i * 28, 140, 4]], P.ink, 0.7) +
              chevron(292, 50 + i * 28, P.ink)
          )
          .join(''),
      pop: {
        x: 20,
        y: 64,
        w: 220,
        h: 44,
        fill: WHITE,
        content:
          serif(10, 16, 'Can you resize a ring?', { size: 9 }) +
          bars(
            [
              [10, 24, 190, 3],
              [10, 31, 150, 3],
            ],
            P.muted,
            0.7
          ),
      },
      labels: [
        ['Accordion', 'one question per row'],
        ['One answer', 'opens on demand'],
      ],
    }),
    'idea-carousel.svg': idea({
      title: 'A content carousel, with one commission pulled forward',
      H: 180,
      content:
        centred(24, 'Commissions', 'Made from the configurator', 12) +
        photo(20, 58, 170, 104, 'linen') +
        photo(198, 58, 102, 104, 'skin') +
        [0, 1, 2, 3]
          .map(
            (i) =>
              `<rect x="${140 + i * 10}" y="170" width="6" height="2" fill="${i ? P.line : P.ink}"/>`
          )
          .join(''),
      pop: {
        x: 20,
        y: 58,
        w: 170,
        h: 104,
        fill: WHITE,
        content:
          `<rect width="170" height="76" fill="url(#linen)"/>` +
          ring(85, 40, 24) +
          serif(10, 92, 'Classic, rose gold, 1 ct', { size: 9 }),
      },
      labels: [
        ['ContentCarousel', 'one ring per slide'],
        ['One commission', 'photo and its configuration'],
      ],
    }),
  };
}
