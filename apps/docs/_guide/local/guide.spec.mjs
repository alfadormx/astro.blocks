const ESPRESSO = '#1E1208';
const RUST = '#8D4200';
const AMBER = '#F17900';

export const defs = () => `
<linearGradient id="bakery" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#C79A6B"/><stop offset="1" stop-color="#6B4325"/>
</linearGradient>
<linearGradient id="veil" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${ESPRESSO}" stop-opacity="1"/><stop offset="0.5" stop-color="${ESPRESSO}" stop-opacity="0.85"/><stop offset="1" stop-color="${ESPRESSO}" stop-opacity="0.4"/>
</linearGradient>
<linearGradient id="pill" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#A34E08"/><stop offset="1" stop-color="${RUST}"/>
</linearGradient>
<radialGradient id="glow" cx="0.5" cy="1.3" r="1">
  <stop offset="0" stop-color="${RUST}" stop-opacity="0.8"/><stop offset="0.6" stop-color="${ESPRESSO}" stop-opacity="0"/>
</radialGradient>
<linearGradient id="crumb" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#E7CBA6"/><stop offset="1" stop-color="#A87545"/>
</linearGradient>
<linearGradient id="cup" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#D9C3AE"/><stop offset="1" stop-color="#7A5539"/>
</linearGradient>`;

export default function build(kit) {
  const { P, txt, bars, base, glass, exploded, idea, icon } = kit;
  const LIGHT = P.background;
  const WHITE = P.surface;

  const serif = (x, y, s, o = {}) =>
    txt(x, y, s, { font: 'title', anchor: 'start', weight: 700, ...o });

  const tagline = (x, y, s, fill = P.primary) =>
    `<line x1="${x}" x2="${x + 8}" y1="${y - 2}" y2="${y - 2}" stroke="${fill}"/>` +
    txt(x + 11, y, s.toUpperCase(), { size: 5, anchor: 'start', fill, ls: 1.2, weight: 600 });

  const heading = (x, y, tag, title, size = 13) =>
    tagline(x, y, tag) + serif(x, y + size + 3, title, { size });

  const pill = (x, y, w, h, label, { outline = false } = {}) =>
    (outline
      ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${LIGHT}" stroke="${P.ink}"/>`
      : `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="url(#pill)"/>`) +
    txt(x + w / 2, y + h / 2 + 2.5, label, {
      size: 6.5,
      weight: 600,
      fill: outline ? P.ink : LIGHT,
    });

  const card = (x, y, w, h, inner = '') =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="${WHITE}" stroke="${P.line}"/>` +
    inner;

  const photo = (x, y, w, h, grad = 'bakery', r = 6) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${grad})"/>` +
    `<ellipse cx="${x + w * 0.5}" cy="${y + h * 0.6}" rx="${w * 0.25}" ry="${h * 0.16}" fill="${LIGHT}" fill-opacity="0.35"/>`;

  const star = (x, y, fill = AMBER) =>
    `<path d="M${x} ${y - 3} l0.9 1.9 2.1 0.3 -1.5 1.5 0.35 2.1 -1.85 -1 -1.85 1 0.35 -2.1 -1.5 -1.5 2.1 -0.3z" fill="${fill}"/>`;
  const stars = (x, y, n) =>
    [0, 1, 2, 3, 4].map((i) => star(x + i * 7, y, i < n ? AMBER : P.line)).join('');

  const plus = icon((x, y) => `<path d="M${x - 3} ${y} h6 M${x} ${y - 3} v6"/>`);
  const burger = icon(
    (x, y) => `<path d="M${x - 5} ${y - 3} h10 M${x - 5} ${y} h10 M${x - 5} ${y + 3} h10"/>`
  );
  const sun = icon(
    (x, y) =>
      `<circle cx="${x}" cy="${y}" r="2.5"/><path d="M${x} ${y - 5} v1.2 M${x} ${y + 3.8} v1.2 M${x - 5} ${y} h1.2 M${x + 3.8} ${y} h1.2"/>`
  );
  const pin = icon(
    (x, y) =>
      `<path d="M${x} ${y + 6} C${x - 6} ${y} ${x - 5} ${y - 6} ${x} ${y - 6} C${x + 5} ${y - 6} ${x + 6} ${y} ${x} ${y + 6} Z"/><circle cx="${x}" cy="${y - 1.5}" r="1.8"/>`
  );

  const iconTile = (x, y) =>
    `<rect x="${x}" y="${y}" width="16" height="16" rx="4" fill="url(#pill)"/>`;

  const NAV = ['What we bake', 'Our story', 'Gallery', 'Reviews', 'Visit us', 'Events'];

  const SECTIONS = {
    '01-header.svg': {
      title: 'The header, pulled apart into its layers',
      H: 50,
      layers: [
        {
          title: 'Espresso bar',
          note: 'sticky, bg-tertiary/90 + blur',
          draw: base(ESPRESSO, ESPRESSO),
        },
        {
          title: 'Text logo',
          note: 'logo.label in the serif',
          draw: glass(serif(16, 29, 'Olmo Café &amp; Bakery', { size: 10 })),
        },
        {
          title: 'Links and theme toggle',
          note: 'right navigation tree',
          draw: glass(
            NAV.map((n, i) => txt(112 + i * 31, 28, n, { size: 5.8, anchor: 'start' })).join('') +
              sun(306, 25, P.ink)
          ),
        },
        {
          title: 'Phone menu',
          note: 'burger opens a right Modal',
          draw: glass(
            `<rect x="210" y="0" width="110" height="50" fill="${LIGHT}" stroke="${P.line}"/>` +
              NAV.slice(0, 4)
                .map((n, i) => txt(222, 12 + i * 11, n, { size: 7, anchor: 'start' }))
                .join('') +
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
          title: 'Bakery photo',
          note: 'container.background.image',
          draw: base('url(#bakery)', '#6B4325', photo(150, 20, 150, 120, 'crumb', 60)),
        },
        {
          title: 'Espresso veil',
          note: 'overlayClass, dark on the left',
          draw: glass('', { fill: 'url(#veil)', fillOpacity: 1 }),
        },
        {
          title: 'Headline',
          note: 'tagline, serif title, subtitle',
          draw: glass(
            tagline(16, 36, 'Bakery and café in Malasaña', AMBER) +
              serif(16, 60, 'Fresh bread and good', { size: 18 }) +
              serif(16, 80, 'coffee, since 1998', { size: 18 }) +
              bars(
                [
                  [16, 90, 170, 3.5],
                  [16, 97, 130, 3.5],
                ],
                P.muted,
                0.7
              )
          ),
        },
        {
          title: 'Pills, chips and ridge',
          note: 'actions + a Vector below',
          draw: glass(
            pill(16, 110, 70, 15, 'See what we bake') +
              pill(90, 110, 44, 15, 'Find us', { outline: true }) +
              ['★ 4.8 on Google', 'Family-run', 'Fresh from 7:30']
                .map(
                  (c, i) =>
                    `<rect x="${16 + i * 58}" y="132" width="54" height="10" rx="5" fill="none" stroke="${P.ink}" stroke-opacity="0.6"/>` +
                    txt(43 + i * 58, 139, c, { size: 5 })
                )
                .join('') +
              `<path d="M0 170 V160 L40 152 L70 164 L110 150 L145 162 L185 149 L222 165 L262 153 L300 163 L320 157 V170 Z" fill="${LIGHT}" stroke="${P.line}"/>`
          ),
        },
      ],
    },
    '03-services.svg': {
      title: 'The services, pulled apart into their layers',
      H: 140,
      layers: [
        {
          title: 'Section heading',
          note: 'SECTION_HEADLINE + anchorId',
          draw: base(
            LIGHT,
            P.line,
            heading(16, 20, 'What we bake', 'From the oven and the bar', 12)
          ),
        },
        {
          title: 'White cards',
          note: 'defaultItemConfig.class = CARD',
          draw: glass([0, 1, 2, 3].map((i) => card(16 + i * 74, 50, 66, 80)).join('')),
        },
        {
          title: 'Gradient icon tiles',
          note: 'the icon layer',
          draw: glass([0, 1, 2, 3].map((i) => iconTile(24 + i * 74, 58)).join('')),
        },
        {
          title: 'Serif title and text',
          note: 'title and content per item',
          draw: glass(
            ['Sourdough', 'Pastries', 'Coffee', 'Breakfast']
              .map(
                (t, i) =>
                  serif(24 + i * 74, 92, t, { size: 8 }) +
                  bars(
                    [
                      [24 + i * 74, 100, 48, 3],
                      [24 + i * 74, 106, 40, 3],
                      [24 + i * 74, 112, 44, 3],
                    ],
                    P.muted,
                    0.6
                  )
              )
              .join('')
          ),
        },
      ],
    },
    '04-story.svg': {
      title: 'The story, pulled apart into its layers',
      H: 140,
      layers: [
        { title: 'White band', note: 'Content, container bg-surface', draw: base(WHITE, P.line) },
        {
          title: 'Photo on the left',
          note: 'imagePosition="left"',
          draw: glass(photo(16, 16, 130, 108, 'bakery', 8)),
        },
        {
          title: 'Headline in the slot',
          note: 'built-in headline hidden',
          draw: glass(heading(166, 40, 'Since 1998', 'Our story', 14)),
        },
        {
          title: 'Rich text body',
          note: 'renderRichText in the slot',
          draw: glass(
            bars(
              [
                [166, 74, 138, 3],
                [166, 81, 130, 3],
                [166, 88, 120, 3],
                [166, 100, 138, 3],
                [166, 107, 100, 3],
              ],
              P.ink,
              0.55
            )
          ),
        },
      ],
    },
    '05-gallery.svg': {
      title: 'The gallery, pulled apart into its layers',
      H: 150,
      layers: [
        {
          title: 'Container + heading',
          note: 'SECTION_HEADLINE',
          draw: base(LIGHT, P.line, heading(16, 20, 'Behind the counter', 'In pictures', 12)),
        },
        {
          title: 'Grid layout',
          note: 'nested Container, 4 columns',
          draw: glass(
            [0, 1, 2, 3]
              .map((c) =>
                [0, 1]
                  .map(
                    (r) =>
                      `<rect x="${16 + c * 73}" y="${48 + r * 49}" width="69" height="45" fill="none" stroke="${P.muted}" stroke-dasharray="3 3"/>`
                  )
                  .join('')
              )
              .join('')
          ),
        },
        {
          title: 'Lead image, 2 × 2',
          note: 'col-span-2 row-span-2',
          draw: glass(photo(16, 48, 142, 94, 'crumb', 8)),
        },
        {
          title: 'Four small images',
          note: 'Image, 4:3, rounded',
          draw: glass(
            [
              [162, 48, 'bakery'],
              [235, 48, 'cup'],
              [162, 97, 'cup'],
              [235, 97, 'crumb'],
            ]
              .map(([x, y, g]) => photo(x, y, 69, 45, g, 6))
              .join('')
          ),
        },
      ],
    },
    '06-reviews.svg': {
      title: 'The reviews, pulled apart into their layers',
      H: 150,
      layers: [
        {
          title: 'Heading and score',
          note: 'Headline + an Item, one row',
          draw: base(
            WHITE,
            P.line,
            heading(16, 20, 'Reviews', 'In their words', 12) +
              serif(304, 36, '4.8', { size: 22, anchor: 'end', fill: P.primary }) +
              stars(268, 46, 5)
          ),
        },
        {
          title: 'Review cards',
          note: 'Testimonials, 3 columns',
          draw: glass([0, 1, 2].map((i) => card(16 + i * 98, 58, 90, 68)).join('')),
        },
        {
          title: 'Stars, quote, source',
          note: 'rating and source per review',
          draw: glass(
            ['Lucía M.', 'Tom R.', 'Andrea G.']
              .map(
                (n, i) =>
                  stars(26 + i * 98, 70, i === 2 ? 4 : 5) +
                  bars(
                    [
                      [24 + i * 98, 80, 72, 3],
                      [24 + i * 98, 86, 66, 3],
                      [24 + i * 98, 92, 60, 3],
                    ],
                    P.ink,
                    0.5
                  ) +
                  txt(24 + i * 98, 108, n, { size: 6, anchor: 'start', weight: 600 }) +
                  txt(24 + i * 98, 117, 'Google', { size: 5, anchor: 'start', fill: P.primary })
              )
              .join('')
          ),
        },
        {
          title: 'All reviews link',
          note: 'link Button',
          draw: glass(
            txt(16, 142, 'Read all reviews on Google →', {
              size: 7,
              anchor: 'start',
              fill: P.primary,
              weight: 600,
            })
          ),
        },
      ],
    },
    '07-events.svg': {
      title: 'The upcoming events, pulled apart into their layers',
      H: 150,
      layers: [
        {
          title: 'Container + heading',
          note: 'anchorId="events"',
          draw: base(LIGHT, P.line, heading(16, 20, 'Coming up', 'Events at Olmo', 12)),
        },
        {
          title: 'Event cards',
          note: 'CollectionList + EVENT_CARD',
          draw: glass(
            [0, 1, 2]
              .map((i) =>
                card(
                  16 + i * 98,
                  46,
                  90,
                  86,
                  photo(16 + i * 98, 46, 90, 40, ['crumb', 'cup', 'bakery'][i], 7) +
                    txt(22 + i * 98, 96, ['7 JUN 2030', '12 JUL 2030', '3 SEP 2030'][i], {
                      size: 5.5,
                      anchor: 'start',
                      fill: P.primary,
                      weight: 600,
                    }) +
                    serif(
                      22 + i * 98,
                      108,
                      ['Breakfast with', 'Sourdough class', 'Coffee tasting'][i],
                      { size: 7.5 }
                    ) +
                    bars([[22 + i * 98, 116, 66, 3]], P.muted, 0.6)
                )
              )
              .join('')
          ),
        },
        {
          title: 'See all events link',
          note: 'link Button',
          draw: glass(
            txt(16, 144, 'See all events →', {
              size: 7,
              anchor: 'start',
              fill: P.primary,
              weight: 600,
            })
          ),
        },
      ],
    },
    '08-banner.svg': {
      title: 'The event banner, pulled apart into its layers',
      H: 90,
      layers: [
        {
          title: 'Espresso band',
          note: 'container class bg-tertiary',
          draw: base(ESPRESSO, ESPRESSO),
        },
        {
          title: 'Warm glow',
          note: 'radial gradient background',
          draw: glass('', { fill: 'url(#glow)', fillOpacity: 1 }),
        },
        {
          title: 'Card turned into a row',
          note: 'container.content.class',
          draw: glass(
            serif(16, 38, 'Planning a celebration?', { size: 15 }) +
              bars(
                [
                  [16, 48, 180, 3.5],
                  [16, 55, 140, 3.5],
                ],
                P.muted,
                0.7
              )
          ),
        },
        {
          title: 'Request a quote',
          note: 'actions, PILL',
          draw: glass(pill(226, 36, 78, 16, 'Request a quote')),
        },
      ],
    },
    '09-faq.svg': {
      title: 'The FAQ, pulled apart into its layers',
      H: 140,
      layers: [
        {
          title: 'Container + heading',
          note: 'SECTION_HEADLINE',
          draw: base(
            LIGHT,
            P.line,
            heading(16, 20, 'Good to know', 'Frequently asked questions', 12)
          ),
        },
        {
          title: 'One card per item',
          note: 'itemClass = CARD',
          draw: glass([0, 1, 2, 3].map((i) => card(16, 46 + i * 23, 200, 19)).join('')),
        },
        {
          title: 'Questions and plus',
          note: 'plus icon, iconClass primary',
          draw: glass(
            [
              'Can I order bread or cakes in advance?',
              'Do you have gluten-free options?',
              'Can I work from the café?',
              'Where can I park nearby?',
            ]
              .map(
                (q, i) =>
                  txt(24, 58 + i * 23, q, { size: 6.5, anchor: 'start', weight: 500 }) +
                  plus(206, 56 + i * 23, P.primary)
              )
              .join('')
          ),
        },
      ],
    },
    '10-visit.svg': {
      title: 'The visit section, pulled apart into its layers',
      H: 170,
      layers: [
        {
          title: 'Two card columns',
          note: 'leftColumn / rightColumn = CARD',
          draw: base(
            WHITE,
            P.line,
            heading(16, 18, 'Practical', 'Visit us', 12) +
              card(16, 40, 138, 122) +
              card(162, 40, 142, 122)
          ),
        },
        {
          title: 'Opening hours',
          note: 'ItemsGrid, one row per day',
          draw: glass(
            serif(26, 56, 'Opening hours', { size: 8 }) +
              ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                .map(
                  (d, i) =>
                    txt(26, 72 + i * 12, d, { size: 5.5, anchor: 'start', weight: 600 }) +
                    txt(
                      144,
                      72 + i * 12,
                      i === 6 ? 'Closed' : i === 5 ? '08:30 – 14:00' : '07:30 – 19:00',
                      {
                        size: 5.5,
                        anchor: 'end',
                        fill: P.muted,
                      }
                    ) +
                    (i < 6
                      ? `<line x1="26" x2="144" y1="${75 + i * 12}" y2="${75 + i * 12}" stroke="${P.line}"/>`
                      : '')
                )
                .join('')
          ),
        },
        {
          title: 'Address and buttons',
          note: 'Item with two actions',
          draw: glass(
            serif(172, 56, 'Find us', { size: 8 }) +
              txt(172, 68, 'Calle del Pez 12', { size: 5.5, anchor: 'start' }) +
              txt(172, 76, '28004 Madrid', { size: 5.5, anchor: 'start' }) +
              pill(172, 82, 50, 12, 'Directions') +
              pill(226, 82, 42, 12, 'Call us', { outline: true })
          ),
        },
        {
          title: 'Map',
          note: 'Map, loads when in view',
          draw: glass(
            `<rect x="172" y="102" width="122" height="52" rx="5" fill="#EDE3D6" stroke="${P.line}"/>` +
              `<path d="M172 122 L294 112 M200 102 L215 154 M250 102 L240 154" stroke="${WHITE}" stroke-width="3"/>` +
              pin(232, 128, P.primary)
          ),
        },
      ],
    },
    '11-contact.svg': {
      title: 'The contact form, pulled apart into its layers',
      H: 150,
      layers: [
        {
          title: 'ContactForm heading',
          note: 'anchorId="contact"',
          draw: base(LIGHT, P.line, heading(16, 20, 'Get in touch', 'Write to us', 12)),
        },
        {
          title: 'Four fields',
          note: 'inputs and a textarea',
          draw: glass(
            [
              ['Name', 48, 14],
              ['Email', 72, 14],
              ['Phone', 96, 14],
              ['Message', 120, 22],
            ]
              .map(
                ([l, y, h]) =>
                  txt(16, y - 2, l, { size: 5.5, anchor: 'start', weight: 600 }) +
                  `<rect x="16" y="${y}" width="200" height="${h - 4}" rx="4" fill="${WHITE}" stroke="${P.line}"/>`
              )
              .join('')
          ),
        },
        {
          title: 'Send pill',
          note: 'submitButton spreads PILL',
          draw: glass(pill(16, 140, 44, 10, 'Send')),
        },
      ],
    },
    '12-footer.svg': {
      title: 'The footer, pulled apart into its layers',
      H: 80,
      layers: [
        { title: 'Espresso footer', note: 'Footer, bg-tertiary', draw: base(ESPRESSO, ESPRESSO) },
        {
          title: 'Logo and contact',
          note: 'logo + disclaimer rich text',
          draw: glass(
            serif(16, 22, 'Olmo Café &amp; Bakery', { size: 9 }) +
              ['Calle del Pez 12', '28004 Madrid', '+34 910 000 000', 'hola@example.com']
                .map((l, i) => txt(16, 36 + i * 8, l, { size: 5.5, anchor: 'start' }))
                .join('')
          ),
        },
        {
          title: 'Socials and language',
          note: 'secondaryButtons, languageToggle',
          draw: glass(
            txt(220, 22, 'Instagram', { size: 6, anchor: 'start' }) +
              txt(262, 22, 'Facebook', { size: 6, anchor: 'start' }) +
              txt(220, 44, 'EN · ES', { size: 6.5, anchor: 'start', weight: 600 })
          ),
        },
        {
          title: 'Credit line',
          note: 'footnote',
          draw: glass(
            txt(16, 72, '© Olmo Café &amp; Bakery. A fictional business. Photos from Pexels.', {
              size: 5.5,
              anchor: 'start',
            })
          ),
        },
      ],
    },
    '13-events-index.svg': {
      title: 'The events index, pulled apart into its layers',
      H: 150,
      layers: [
        {
          title: 'Container + h1',
          note: 'Headline "Events"',
          draw: base(LIGHT, P.line, serif(16, 28, 'Events', { size: 16 })),
        },
        {
          title: 'Default event cards',
          note: 'CollectionList, no EVENT_CARD',
          draw: glass(
            [0, 1, 2]
              .map(
                (i) =>
                  `<rect x="${16 + i * 98}" y="40" width="90" height="84" rx="4" fill="${WHITE}" stroke="${P.line}"/>` +
                  photo(20 + i * 98, 44, 82, 34, ['crumb', 'cup', 'bakery'][i], 3) +
                  bars(
                    [
                      [22 + i * 98, 86, 40, 3],
                      [22 + i * 98, 94, 70, 4],
                      [22 + i * 98, 102, 56, 3],
                    ],
                    P.ink,
                    0.6
                  )
              )
              .join('')
          ),
        },
        {
          title: 'Pager',
          note: 'page from the list helpers',
          draw: glass(
            [0, 1, 2]
              .map(
                (i) =>
                  `<rect x="${130 + i * 20}" y="132" width="14" height="12" rx="3" fill="${i === 0 ? P.primary : WHITE}" stroke="${P.line}"/>` +
                  txt(137 + i * 20, 140.5, String(i + 1), {
                    size: 6.5,
                    fill: i === 0 ? WHITE : P.ink,
                  })
              )
              .join('')
          ),
        },
      ],
    },
    '14-event.svg': {
      title: 'An event page, pulled apart into its layers',
      H: 170,
      layers: [
        {
          title: 'EventLayout',
          note: 'title, when and where',
          draw: base(
            LIGHT,
            P.line,
            serif(16, 26, 'Breakfast with the bakers', { size: 13 }) +
              txt(16, 40, 'Sat 7 June 2030 · 07:00 – 09:00', {
                size: 6,
                anchor: 'start',
                fill: P.primary,
                weight: 600,
              }) +
              txt(16, 50, 'Olmo Café & Bakery, Calle del Pez 12'.replace('&', '&amp;'), {
                size: 6,
                anchor: 'start',
                fill: P.muted,
              })
          ),
        },
        {
          title: 'Register button',
          note: 'from registrationUrl',
          draw: glass(pill(16, 60, 54, 14, 'Register')),
        },
        {
          title: 'Markdown body',
          note: 'the entry content, in the slot',
          draw: glass(
            bars(
              [
                [16, 90, 200, 3],
                [16, 97, 180, 3],
                [16, 104, 190, 3],
              ],
              P.ink,
              0.55
            )
          ),
        },
        {
          title: 'Venue map',
          note: 'added when the place has lat/lon',
          draw: glass(
            `<rect x="16" y="116" width="288" height="46" rx="5" fill="#EDE3D6" stroke="${P.line}"/>` +
              `<path d="M16 138 L304 128 M90 116 L110 162 M220 116 L200 162" stroke="${WHITE}" stroke-width="3"/>` +
              pin(158, 140, P.primary)
          ),
        },
      ],
    },
  };

  return {
    ...Object.fromEntries(Object.entries(SECTIONS).map(([name, cfg]) => [name, exploded(cfg)])),
    'idea-carousel.svg': idea({
      title: 'A content carousel, with one slide pulled forward',
      H: 180,
      content:
        heading(20, 28, 'This week', 'Seasonal tart', 13) +
        photo(20, 60, 200, 100, 'crumb', 10) +
        photo(228, 60, 72, 100, 'bakery', 10) +
        [0, 1, 2, 3]
          .map(
            (i) =>
              `<circle cx="${100 + i * 10}" cy="170" r="2.5" fill="${i ? P.line : P.primary}"/>`
          )
          .join(''),
      pop: {
        x: 20,
        y: 60,
        w: 200,
        h: 100,
        fill: WHITE,
        content:
          photo(0, 0, 200, 70, 'crumb', 0) +
          serif(10, 84, 'Apricot and almond tart', { size: 9 }) +
          bars([[10, 90, 120, 3]], P.muted, 0.6),
      },
      labels: [
        ['ContentCarousel', 'one slide per week'],
        ['One slide', 'image, title and line'],
      ],
    }),
    'idea-tabs.svg': idea({
      title: 'A tabs block, with one panel pulled forward',
      H: 180,
      content:
        heading(20, 28, 'Menu', 'Prices', 13) +
        ['Bread', 'Pastries', 'Coffee', 'Breakfast']
          .map(
            (t, i) =>
              `<rect x="${20 + i * 62}" y="56" width="58" height="16" rx="8" fill="${i === 2 ? P.primary : WHITE}" stroke="${P.line}"/>` +
              txt(49 + i * 62, 66.5, t, { size: 6.5, fill: i === 2 ? WHITE : P.ink, weight: 600 })
          )
          .join('') +
        card(20, 82, 280, 86),
      pop: {
        x: 30,
        y: 90,
        w: 180,
        h: 70,
        fill: WHITE,
        content: [
          ['Espresso', '1.60'],
          ['Flat white', '2.80'],
          ['Pour-over', '3.20'],
          ['Hot chocolate', '2.90'],
        ]
          .map(
            ([n, p], i) =>
              txt(10, 16 + i * 15, n, { size: 7, anchor: 'start' }) +
              txt(170, 16 + i * 15, `€${p}`, { size: 7, anchor: 'end', weight: 600 })
          )
          .join(''),
      },
      labels: [
        ['Tabs', 'one tab per part of the menu'],
        ['One panel', 'items and prices'],
      ],
    }),
  };
}
