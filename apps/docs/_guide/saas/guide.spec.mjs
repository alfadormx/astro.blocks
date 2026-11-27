const NIGHT = '#14042A';
const MAUVE = '#7731D2';
const PEACH = '#FAA08F';

export const defs = () => `
<linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0.35" stop-color="${NIGHT}"/><stop offset="0.75" stop-color="${MAUVE}"/><stop offset="1" stop-color="${PEACH}"/>
</linearGradient>
<linearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#E4D6F6"/><stop offset="1" stop-color="#FCD9D2"/>
</linearGradient>
<linearGradient id="photoA" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#D9CFC3"/><stop offset="1" stop-color="#8C7F74"/>
</linearGradient>
<linearGradient id="photoB" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#B8C4CF"/><stop offset="1" stop-color="#55606E"/>
</linearGradient>
<linearGradient id="photoC" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#1B1640"/><stop offset="1" stop-color="#3D2E73"/>
</linearGradient>`;

export default function build(kit) {
  const { P, txt, caps, bars, base, glass, exploded, idea, icon } = kit;
  const LIGHT = P.background;
  const onDusk = (x, y, s, o = {}) =>
    txt(x, y, s, { fill: LIGHT, ...o }).replace(
      '<text ',
      `<text stroke="${NIGHT}" stroke-width="${(o.size ?? 10) < 9 ? (o.size ?? 10) / 6 : (o.size ?? 10) / 4}" stroke-linejoin="round" paint-order="stroke" `
    );

  const wordmark = (x, y, fill = LIGHT) =>
    `<path d="M${x} ${y} c3 -6 6 -6 9 0 s6 6 9 0" fill="none" stroke="${NIGHT}" stroke-width="3.6" stroke-linecap="round"/><path d="M${x} ${y} c3 -6 6 -6 9 0 s6 6 9 0" fill="none" stroke="${fill}" stroke-width="1.8" stroke-linecap="round"/>` +
    (fill === LIGHT ? onDusk : txt)(x + 23, y + 3.5, 'Driftwave', {
      size: 10,
      anchor: 'start',
      fill,
      weight: 500,
    });

  const button = (x, y, w, h, label, { fill = P.ink, color = LIGHT, r = 4, stroke } = {}) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}"` : ''}/>` +
    txt(x + w / 2, y + h / 2 + 2.6, label, { size: 7, fill: color, weight: 600 });

  const photo = (x, y, w, h, grad, r = 8) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${grad})"/>` +
    `<path d="M${x + w * 0.15} ${y + h * 0.75} l${w * 0.2} ${-h * 0.3} l${w * 0.15} ${h * 0.15} l${w * 0.2} ${-h * 0.35}" fill="none" stroke="${LIGHT}" stroke-opacity="0.7" stroke-width="2"/>`;

  const sectionTitle = (x, y, title, sub, size = 13) =>
    txt(x, y, title, { size, anchor: 'start', weight: 400, ls: -0.3 }) +
    (sub ? txt(x, y + size + 2, sub, { size, anchor: 'start', fill: P.muted, ls: -0.3 }) : '');

  const shield = icon(
    (x, y) =>
      `<path d="M${x} ${y - 5} l4.5 2 v3 c0 3 -2 5 -4.5 6 c-2.5 -1 -4.5 -3 -4.5 -6 v-3 z"/><path d="M${x - 2} ${y + 0.5} l1.5 1.5 l3 -3"/>`
  );
  const chevron = icon((x, y) => `<path d="M${x - 3} ${y - 1.5} l3 3 l3 -3"/>`);
  const sun = icon(
    (x, y) =>
      `<circle cx="${x}" cy="${y}" r="2.5"/><path d="M${x} ${y - 5} v1.2 M${x} ${y + 3.8} v1.2 M${x - 5} ${y} h1.2 M${x + 3.8} ${y} h1.2"/>`
  );

  const NAV = ['Product', 'Pricing', 'Customers', 'FAQ', 'Blog'];
  const navLinks = (x, y, fill) =>
    NAV.map((n, i) =>
      (fill === LIGHT ? onDusk : txt)(x + i * 34, y, n, { size: 6.5, anchor: 'start', fill })
    ).join('');

  const SECTIONS = {
    '01-header.svg': {
      title: 'The header, pulled apart into its layers',
      H: 50,
      layers: [
        { title: 'Header bar', note: 'sticky, bg-tertiary', draw: base(NIGHT, NIGHT) },
        {
          title: 'Wordmark and links',
          note: 'logo.vector · navigation tree',
          draw: glass(wordmark(16, 25) + navLinks(110, 27, LIGHT)),
        },
        {
          title: 'Theme toggle and CTA',
          note: 'themeToggle · rightButtons',
          draw: glass(
            sun(250, 25, P.ink) +
              button(262, 18, 46, 14, 'Get started', { fill: LIGHT, color: P.ink, stroke: P.ink })
          ),
        },
        {
          title: 'Phone menu',
          note: 'burger opens a Modal',
          draw: glass(
            `<rect x="0" y="0" width="100" height="50" fill="${LIGHT}" stroke="${P.line}"/>` +
              NAV.slice(0, 4)
                .map((n, i) => txt(12, 13 + i * 11, n, { size: 7, anchor: 'start' }))
                .join(''),
            { stroke: P.muted }
          ),
        },
      ],
    },
    '02-hero.svg': {
      title: 'The hero, pulled apart into its layers',
      H: 180,
      layers: [
        { title: 'Dusk gradient', note: 'container.background', draw: base('url(#dusk)', NIGHT) },
        {
          title: 'Headline, left-aligned',
          note: 'light, tightly tracked title',
          draw: glass(
            onDusk(20, 42, 'Know what your users', { size: 20, anchor: 'start', weight: 300 }) +
              onDusk(20, 64, 'do next', { size: 20, anchor: 'start', weight: 300 }) +
              bars(
                [
                  [20, 76, 190, 4],
                  [20, 84, 150, 4],
                ],
                LIGHT,
                0.8
              )
          ),
        },
        {
          title: 'Get started button',
          note: 'actions · jumps to pricing',
          draw: glass(
            button(20, 96, 60, 16, 'Get started  →', { fill: LIGHT, color: P.ink, stroke: P.ink })
          ),
        },
        {
          title: 'Product photo',
          note: 'Image, pulled up over the hero',
          draw: glass(
            photo(30, 122, 260, 58, 'photoA', 10) +
              `<rect x="30" y="122" width="260" height="58" rx="10" fill="none" stroke="${P.line}"/>`
          ),
        },
      ],
    },
    '03-logos.svg': {
      title: 'The logo strip, pulled apart into its layers',
      H: 50,
      layers: [
        { title: 'Page band', note: 'plain background', draw: base(LIGHT, P.line) },
        {
          title: 'Logo marquee',
          note: 'layout="marquee", grayscale',
          draw: glass(
            ['Northwind', 'Lumen', 'Quanta', 'Bramble', 'Orbital']
              .map(
                (n, i) =>
                  `<circle cx="${14 + i * 64}" cy="25" r="4" fill="${P.muted}"/>` +
                  txt(22 + i * 64, 28, n, { size: 8, anchor: 'start', fill: P.muted, weight: 700 })
              )
              .join('')
          ),
        },
        {
          title: 'Hidden arrows',
          note: 'carousel buttons set to false',
          draw: glass(
            `<circle cx="10" cy="25" r="6" fill="none" stroke="${P.line}" stroke-dasharray="2 2"/><circle cx="310" cy="25" r="6" fill="none" stroke="${P.line}" stroke-dasharray="2 2"/>`,
            { stroke: P.line }
          ),
        },
      ],
    },
    '04-workflow.svg': {
      title: 'The workflow tabs, pulled apart into their layers',
      H: 150,
      layers: [
        { title: 'Container', note: 'plain band', draw: base(LIGHT, P.line) },
        {
          title: 'Headline',
          note: 'anchorId="features"',
          draw: glass(sectionTitle(16, 22, 'From event to answer', 'Five steps from a click…', 11)),
        },
        {
          title: 'Tab list, vertical',
          note: 'active tab shows its subtitle',
          draw: glass(
            `<rect x="12" y="48" width="120" height="30" rx="6" fill="${P.surface}"/>` +
              txt(20, 60, 'Track events', { size: 7.5, anchor: 'start', weight: 600 }) +
              bars([[20, 66, 96, 3]], P.muted, 0.7) +
              ['Build a funnel', 'Spot the drop-off', 'Share the chart', 'Watch it recover']
                .map((n, i) => txt(20, 92 + i * 15, n, { size: 7.5, anchor: 'start' }))
                .join('')
          ),
        },
        {
          title: 'Tab panels',
          note: 'one Image per panel slot',
          draw: glass(
            `<rect x="146" y="44" width="162" height="100" rx="10" fill="${P.surface}"/>` +
              photo(156, 54, 142, 80, 'photoA', 6)
          ),
        },
      ],
    },
    '05-teams.svg': {
      title: 'The teams table, pulled apart into its layers',
      H: 150,
      layers: [
        { title: 'Soft wash', note: 'container.background', draw: base('url(#wash)', '#C9B6E6') },
        {
          title: 'White content card',
          note: 'content.class, rounded',
          draw: glass(
            `<rect x="40" y="14" width="240" height="122" rx="12" fill="${LIGHT}" stroke="${P.line}"/>`,
            { fillOpacity: 0 }
          ),
        },
        {
          title: 'Headline',
          note: 'shared SECTION_HEADLINE',
          draw: glass(sectionTitle(56, 36, 'One source of truth', 'for every team', 10)),
        },
        {
          title: 'Markdown table',
          note: 'rich text in a Container',
          draw: glass(
            [0, 1, 2, 3, 4]
              .map(
                (r) =>
                  `<line x1="56" x2="264" y1="${70 + r * 12}" y2="${70 + r * 12}" stroke="${P.line}"/>` +
                  bars(
                    [
                      [58, 64 + r * 12, 40, 3],
                      [120, 64 + r * 12, 20, 3],
                      [170, 64 + r * 12, 20, 3],
                      [220, 64 + r * 12, 30, 3],
                    ],
                    r ? P.muted : P.ink,
                    r ? 0.6 : 1
                  )
              )
              .join('')
          ),
        },
      ],
    },
    '06-stats.svg': {
      title: 'The stats band, pulled apart into its layers',
      H: 90,
      layers: [
        { title: 'Page band', note: 'ItemsContent container', draw: base(LIGHT, P.line) },
        {
          title: 'Three-column grid',
          note: 'itemsGrid, bottom border',
          draw: glass(`<line x1="16" x2="304" y1="76" y2="76" stroke="${P.line}"/>`),
        },
        {
          title: 'Big figures',
          note: 'defaultItemConfig.titleClass',
          draw: glass(
            ['4.2B', '2,300', '99.99%']
              .map(
                (v, i) =>
                  txt(16 + i * 100, 44, v, { size: 26, anchor: 'start', weight: 300, ls: -1 }) +
                  bars([[17 + i * 100, 56, 70, 3]], P.muted, 0.7)
              )
              .join('')
          ),
        },
      ],
    },
    '07-quote.svg': {
      title: 'The quote, pulled apart into its layers',
      H: 120,
      layers: [
        { title: 'Page band', note: 'Testimonials, one column', draw: base(LIGHT, P.line) },
        {
          title: 'Quote card',
          note: 'defaultTestimonialConfig',
          draw: glass(`<rect x="16" y="12" width="288" height="96" rx="12" fill="${P.surface}"/>`, {
            fillOpacity: 0,
          }),
        },
        {
          title: 'Quote and author',
          note: 'large quoteClass, avatar',
          draw: glass(
            txt(32, 36, '“We found the step losing half', { size: 13, anchor: 'start', ls: -0.3 }) +
              txt(32, 52, 'our sign-ups in an afternoon…”', {
                size: 13,
                anchor: 'start',
                ls: -0.3,
              }) +
              `<circle cx="40" cy="86" r="8" fill="url(#photoB)"/>` +
              txt(54, 84, 'Ana Ruiz', { size: 7, anchor: 'start', weight: 600 }) +
              txt(54, 93, 'Product lead, Northwind', { size: 6, anchor: 'start', fill: P.muted })
          ),
        },
      ],
    },
    '08-features.svg': {
      title: 'The features grid, pulled apart into its layers',
      H: 150,
      layers: [
        { title: 'Page band', note: 'ItemsContent container', draw: base(LIGHT, P.line) },
        {
          title: 'Headline',
          note: 'headline prop',
          draw: glass(sectionTitle(16, 22, 'Everything you need', 'to understand usage', 11)),
        },
        {
          title: 'Hairline cells',
          note: "gap: 'none' plus item borders",
          draw: glass(
            `<rect x="16" y="52" width="288" height="88" rx="10" fill="none" stroke="${P.line}"/>` +
              `<line x1="112" x2="112" y1="52" y2="140" stroke="${P.line}"/><line x1="208" x2="208" y1="52" y2="140" stroke="${P.line}"/><line x1="16" x2="304" y1="96" y2="96" stroke="${P.line}"/>`
          ),
        },
        {
          title: 'Feature items',
          note: 'title and one sentence',
          draw: glass(
            ['Funnels', 'Retention', 'Segments', 'Dashboards', 'Alerts', 'Exports']
              .map((n, i) => {
                const x = 24 + (i % 3) * 96;
                const y = 68 + Math.floor(i / 3) * 44;
                return (
                  txt(x, y, n, { size: 8, anchor: 'start', weight: 600 }) +
                  bars(
                    [
                      [x, y + 7, 70, 3],
                      [x, y + 13, 50, 3],
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
    '09-pricing.svg': {
      title: 'The pricing section, pulled apart into its layers',
      H: 160,
      layers: [
        {
          title: 'Pricing band',
          note: 'headline with anchorId',
          draw: base(LIGHT, P.line, sectionTitle(16, 22, 'Simple pricing', 'Start free.', 11)),
        },
        {
          title: 'Billing toggle',
          note: 'toggleGroup: monthly/yearly',
          draw: glass(
            `<rect x="16" y="48" width="84" height="14" rx="7" fill="${P.surface}" stroke="${P.line}"/><rect x="17" y="49" width="41" height="12" rx="6" fill="${LIGHT}"/>` +
              txt(37.5, 57.5, 'Monthly', { size: 6, weight: 600 }) +
              txt(79, 57.5, 'Yearly', { size: 6, fill: P.muted })
          ),
        },
        {
          title: 'Three tiers',
          note: 'defaultTierConfig',
          draw: glass(
            ['Starter', 'Team', 'Scale']
              .map((n, i) => {
                const x = 16 + i * 98;
                const hi = i === 1;
                return (
                  `<rect x="${x}" y="72" width="90" height="80" rx="10" fill="${hi ? P.surface : LIGHT}" stroke="${hi ? P.ink : P.line}" stroke-width="${hi ? 1.6 : 1}"/>` +
                  txt(x + 8, 86, n, { size: 8, anchor: 'start', weight: 600 }) +
                  txt(x + 8, 104, ['$0', '$49', '$199'][i], {
                    size: 14,
                    anchor: 'start',
                    weight: 300,
                  }) +
                  bars(
                    [
                      [x + 8, 112, 60, 3],
                      [x + 8, 119, 50, 3],
                    ],
                    P.muted,
                    0.6
                  ) +
                  button(x + 8, 132, 74, 12, i === 2 ? 'Contact sales' : 'Get started', { r: 6 })
                );
              })
              .join('')
          ),
        },
        {
          title: 'Highlighted tier',
          note: 'highlightedTierConfig',
          draw: glass(
            `<rect x="114" y="72" width="90" height="80" rx="10" fill="none" stroke="${P.primary}" stroke-width="2"/>`,
            { stroke: P.primary }
          ),
        },
      ],
    },
    '10-stories.svg': {
      title: 'The customer stories, pulled apart into their layers',
      H: 130,
      layers: [
        {
          title: 'Page band',
          note: 'headline, anchorId',
          draw: base(
            LIGHT,
            P.line,
            sectionTitle(16, 22, 'Customer stories', 'Teams that stopped guessing.', 11)
          ),
        },
        {
          title: 'Wide images',
          note: 'mediaClass crops to 16/7',
          draw: glass(
            ['photoA', 'photoB', 'photoC']
              .map((g, i) => photo(16 + i * 98, 50, 90, 40, g, 8))
              .join('')
          ),
        },
        {
          title: 'Figure and caption',
          note: 'vertical items',
          draw: glass(
            ['3×', '40%', '10 min']
              .map(
                (v, i) =>
                  txt(16 + i * 98, 110, v, { size: 16, anchor: 'start', weight: 300 }) +
                  bars([[16 + i * 98, 118, 70, 3]], P.muted, 0.6)
              )
              .join('')
          ),
        },
      ],
    },
    '11-blog.svg': {
      title: 'The blog teaser, pulled apart into its layers',
      H: 150,
      layers: [
        {
          title: 'Container',
          note: 'with a Headline',
          draw: base(
            LIGHT,
            P.line,
            sectionTitle(16, 22, 'From the blog', 'Notes on measuring…', 11)
          ),
        },
        {
          title: 'Post cards',
          note: 'CollectionList, POST_CARD',
          draw: glass(
            [0, 1, 2]
              .map(
                (i) =>
                  `<rect x="${16 + i * 98}" y="48" width="90" height="72" rx="10" fill="${LIGHT}" stroke="${P.line}"/>` +
                  photo(20 + i * 98, 52, 82, 34, ['photoA', 'photoB', 'photoC'][i], 6) +
                  bars(
                    [
                      [22 + i * 98, 94, 70, 4],
                      [22 + i * 98, 102, 50, 4],
                    ],
                    P.ink,
                    0.8
                  )
              )
              .join('')
          ),
        },
        {
          title: 'All posts button',
          note: 'Button, outline, pill',
          draw: glass(
            button(16, 128, 56, 14, 'All posts  →', {
              fill: LIGHT,
              color: P.ink,
              r: 7,
              stroke: P.ink,
            })
          ),
        },
      ],
    },
    '12-faq.svg': {
      title: 'The FAQ, pulled apart into its layers',
      H: 120,
      layers: [
        {
          title: 'Two columns, 2:3',
          note: 'TwoColumnContainer',
          draw: base(
            LIGHT,
            P.line,
            `<line x1="124" x2="124" y1="12" y2="108" stroke="${P.line}" stroke-dasharray="3 3"/>`
          ),
        },
        {
          title: 'Left: Headline',
          note: 'left slot, anchorId="faq"',
          draw: glass(txt(16, 32, 'Questions', { size: 16, anchor: 'start', ls: -0.4 })),
        },
        {
          title: 'Right: Accordion',
          note: 'answers are rich text',
          draw: glass(
            [
              'How does the free trial work?',
              'How do I send events?',
              'Where is my data stored?',
              'Can I cancel any time?',
              'Can I import data?',
            ]
              .map(
                (q, i) =>
                  txt(136, 24 + i * 19, q, { size: 7, anchor: 'start' }) +
                  chevron(296, 22 + i * 19, P.ink) +
                  `<line x1="136" x2="304" y1="${31 + i * 19}" y2="${31 + i * 19}" stroke="${P.line}"/>`
              )
              .join('')
          ),
        },
      ],
    },
    '13-privacy.svg': {
      title: 'The privacy band, pulled apart into its layers',
      H: 110,
      layers: [
        { title: 'Grey band', note: 'container.class bg-surface', draw: base(P.surface, P.line) },
        {
          title: 'Headline',
          note: 'larger muted subtitle',
          draw: glass(
            txt(16, 28, 'Privacy first', { size: 14, anchor: 'start', ls: -0.3 }) +
              bars(
                [
                  [16, 38, 200, 4],
                  [16, 46, 160, 4],
                ],
                P.muted,
                0.7
              )
          ),
        },
        {
          title: 'Icon points',
          note: 'two-column grid with icons',
          draw: glass(
            ['EU hosting', 'No cookies by default', 'One-click export', 'Single sign-on']
              .map((n, i) => {
                const x = 16 + (i % 2) * 110;
                const y = 70 + Math.floor(i / 2) * 18;
                return (
                  shield(x + 5, y, P.primary) +
                  txt(x + 14, y + 3, n, { size: 7.5, anchor: 'start' })
                );
              })
              .join('')
          ),
        },
      ],
    },
    '14-cta.svg': {
      title: 'The closing call to action, pulled apart into its layers',
      H: 130,
      layers: [
        { title: 'Dusk gradient', note: 'container.background', draw: base('url(#dusk)', NIGHT) },
        {
          title: 'Invisible card',
          note: 'bg-transparent shadow-none',
          draw: glass(
            `<rect x="40" y="24" width="240" height="82" rx="12" fill="none" stroke="${P.muted}" stroke-dasharray="4 4"/>`,
            { fillOpacity: 0 }
          ),
        },
        {
          title: 'Centred headline',
          note: 'same ON_DUSK text',
          draw: glass(
            onDusk(160, 56, 'Your next release,', { size: 17, weight: 300 }) +
              onDusk(160, 76, 'already measured', { size: 17, weight: 300 })
          ),
        },
        {
          title: 'Get started button',
          note: 'reuses the hero button',
          draw: glass(
            button(130, 88, 60, 14, 'Get started  →', { fill: LIGHT, color: P.ink, stroke: P.ink })
          ),
        },
      ],
    },
    '15-footer.svg': {
      title: 'The footer, pulled apart into its layers',
      H: 70,
      layers: [
        { title: 'Footer band', note: 'bg-tertiary', draw: base(NIGHT, NIGHT) },
        {
          title: 'Wordmark and links',
          note: 'secondaryButtons as links',
          draw: glass(wordmark(16, 20) + navLinks(16, 46, LIGHT)),
        },
        {
          title: 'Socials and language',
          note: 'socialButtons · languageToggle',
          draw: glass(
            [0, 1, 2]
              .map(
                (i) =>
                  `<rect x="${222 + i * 14}" y="14" width="9" height="9" rx="2" fill="${NIGHT}" stroke="${LIGHT}"/>`
              )
              .join('') + onDusk(276, 50, 'EN · ES', { size: 7, anchor: 'start' })
          ),
        },
        {
          title: 'Footnote',
          note: 'footnote from the copy file',
          draw: glass(
            onDusk(16, 62, '© 2026 Driftwave, a fictional company.', { size: 6, anchor: 'start' })
          ),
        },
      ],
    },
  };

  return {
    ...Object.fromEntries(Object.entries(SECTIONS).map(([name, cfg]) => [name, exploded(cfg)])),
    'idea-contactform.svg': idea({
      title: 'A contact form block, with its fields pulled forward',
      H: 180,
      content:
        sectionTitle(20, 34, 'Talk to sales', 'About the Scale plan', 13) +
        bars(
          [
            [20, 80, 120, 4],
            [20, 88, 100, 4],
          ],
          P.muted,
          0.6
        ),
      pop: {
        x: 170,
        y: 24,
        w: 130,
        h: 136,
        content:
          ['Name', 'Work email', 'Message']
            .map(
              (l, i) =>
                caps(10, 16 + i * 32, l.toUpperCase(), { anchor: 'start' }) +
                `<rect x="10" y="${20 + i * 32}" width="110" height="${i === 2 ? 22 : 14}" rx="4" fill="${LIGHT}" stroke="${P.line}"/>`
            )
            .join('') + button(10, 116, 110, 14, 'Send', { r: 7 }),
      },
      labels: [
        ['ContactForm section', 'a home for "Contact sales"'],
        ['Fields and submit', 'labelled inputs, one button'],
      ],
    }),
    'idea-timeline.svg': idea({
      title: 'A timeline block, with one release pulled forward',
      H: 180,
      content:
        sectionTitle(20, 30, 'Changelog', null, 13) +
        `<line x1="40" x2="40" y1="48" y2="168" stroke="${P.line}" stroke-width="2"/>` +
        [0, 1, 2]
          .map(
            (i) =>
              `<circle cx="40" cy="${60 + i * 44}" r="5" fill="${i === 1 ? P.primary : P.background}" stroke="${P.primary}" stroke-width="1.5"/>` +
              caps(54, 58 + i * 44, ['OCT 2026', 'SEP 2026', 'AUG 2026'][i], { anchor: 'start' }) +
              bars([[54, 64 + i * 44, 140, 4]], P.muted, 0.6)
          )
          .join(''),
      pop: {
        x: 50,
        y: 92,
        w: 180,
        h: 36,
        content:
          caps(10, 14, 'SEP 2026', { anchor: 'start', fill: P.primary }) +
          txt(10, 28, 'Alerts on any metric', { size: 9, anchor: 'start', weight: 600 }),
      },
      labels: [
        ['ItemsTimeline', 'dated entries on a line'],
        ['One release', 'date, title and notes'],
      ],
    }),
  };
}
