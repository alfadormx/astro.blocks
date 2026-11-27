const INK = '#1A1A1A';
const MONO = "'IBM Plex Mono', ui-monospace, monospace";

export const defs = () => `
<linearGradient id="desk" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#E9E4DC"/><stop offset="1" stop-color="#B9B1A6"/>
</linearGradient>
<linearGradient id="cover" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="#CFCAC4"/><stop offset="1" stop-color="#6E6A66"/>
</linearGradient>
<linearGradient id="coverDark" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#4A4744"/><stop offset="1" stop-color="#1E1C1B"/>
</linearGradient>
<linearGradient id="face" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#D8CEC4"/><stop offset="1" stop-color="#8F857C"/>
</linearGradient>`;

export default function build(kit) {
  const { P, txt, bars, base, glass, exploded, idea, icon } = kit;
  const LIGHT = P.background;

  const mono = (x, y, s, o = {}) =>
    txt(x, y, s.toUpperCase().replace(/&/g, '&amp;'), {
      size: 5.5,
      anchor: 'start',
      fill: P.muted,
      ls: 0.4,
      ...o,
    }).replace(/font-family="[^"]*"/, `font-family="${MONO}"`);

  const onInk = (x, y, s, o = {}) => txt(x, y, s, { anchor: 'start', ...o });

  const wordmark = (x, y, fill = P.ink) =>
    `<rect x="${x}" y="${y - 6}" width="6" height="6" fill="${fill}"/>` +
    txt(x + 9, y, 'ATELIER NORTH', { size: 7.5, anchor: 'start', fill, weight: 700, ls: 0.6 });

  const arrowLink = (x, y, label, size = 11) => {
    const w = label.length * size * 0.52;
    return (
      txt(x, y, label, { size, anchor: 'start', ls: -0.2 }) +
      `<rect x="${x + w + 4}" y="${y - size * 0.8}" width="${size * 0.9}" height="${size * 0.9}" fill="${P.ink}"/>` +
      `<path d="M${x + w + 6} ${y - size * 0.35} h${size * 0.5} m-2 -2 l2 2 l-2 2" stroke="${LIGHT}" stroke-width="1" fill="none"/>` +
      `<line x1="${x}" x2="${x + w + 4 + size * 0.9}" y1="${y + 4}" y2="${y + 4}" stroke="${P.ink}"/>`
    );
  };

  const photo = (x, y, w, h, grad) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${grad})"/>` +
    `<rect x="${x + w * 0.2}" y="${y + h * 0.35}" width="${w * 0.6}" height="${h * 0.35}" fill="${LIGHT}" fill-opacity="0.35"/>`;

  const portrait = (x, y, s) =>
    `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="url(#face)"/>` +
    `<circle cx="${x + s / 2}" cy="${y + s * 0.42}" r="${s * 0.18}" fill="${LIGHT}" fill-opacity="0.45"/>` +
    `<path d="M${x + s * 0.2} ${y + s} q${s * 0.3} ${-s * 0.4} ${s * 0.6} 0" fill="${LIGHT}" fill-opacity="0.45"/>`;

  const field = (x, y, w, h, label) =>
    mono(x, y - 3, label) +
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${P.surface}" stroke="${P.line}"/>`;

  const burger = icon(
    (x, y) => `<path d="M${x - 5} ${y - 3} h10 M${x - 5} ${y} h10 M${x - 5} ${y + 3} h10"/>`
  );

  const NAV = ['Home', 'About', 'Work', 'Contact'];
  const statement = (x, y, size, lines) =>
    lines
      .map((l, i) =>
        txt(x, y + i * size * 1.1, l, { size, anchor: 'start', weight: 500, ls: -0.4 })
      )
      .join('');

  const SECTIONS = {
    '01-header.svg': {
      title: 'The header, pulled apart into its layers',
      H: 50,
      layers: [
        {
          title: 'Frosted bar',
          note: 'sticky, bg-background/80 + blur',
          draw: base(LIGHT, P.line, `<line x1="0" x2="320" y1="49" y2="49" stroke="${P.line}"/>`),
        },
        { title: 'Wordmark', note: 'logo.vector from the name', draw: glass(wordmark(16, 28)) },
        {
          title: 'Page links',
          note: 'right navigation tree',
          draw: glass(
            NAV.map((n, i) =>
              txt(186 + i * 32, 28, n, {
                size: 8,
                anchor: 'start',
                fill: i === 0 ? P.ink : P.muted,
                weight: i === 0 ? 600 : 400,
              })
            ).join('')
          ),
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
      H: 150,
      layers: [
        { title: 'Full-screen band', note: 'container.minHeight', draw: base(LIGHT, P.line) },
        {
          title: 'Mono tagline',
          note: 'tagline with MONO_LABEL',
          draw: glass(mono(16, 40, 'Design & engineering studio', { size: 7 })),
        },
        {
          title: 'Statement title',
          note: 'one long, left-aligned title',
          draw: glass(
            statement(16, 62, 15, [
              'Atelier North is an independent',
              'studio for brand, product and web',
              'design, building calm, careful',
              'work for teams…',
            ])
          ),
        },
      ],
    },
    '03-projects.svg': {
      title: 'The selected projects, pulled apart into their layers',
      H: 170,
      layers: [
        {
          title: 'Container + label',
          note: 'Headline with MONO_LABEL',
          draw: base(LIGHT, P.line, mono(16, 20, 'Selected projects', { size: 6.5 })),
        },
        {
          title: '4:5 covers',
          note: 'PROJECT_CARD image config',
          draw: glass(
            [0, 1, 2]
              .map(
                (i) =>
                  photo(16 + i * 98, 30, 90, 92, ['cover', 'coverDark', 'desk'][i]) +
                  `<rect x="${16 + i * 98}" y="30" width="90" height="92" fill="none" stroke="${P.line}"/>`
              )
              .join('')
          ),
        },
        {
          title: 'Title and disciplines',
          note: 'tags read as one line',
          draw: glass(
            ['Brand refresh', 'Docs site', 'Ring configurator']
              .map(
                (t, i) =>
                  txt(16 + i * 98, 133, t, { size: 7.5, anchor: 'start', weight: 600 }) +
                  mono(
                    16 + i * 98,
                    142,
                    ['Branding + Design system', 'Docs + Code', 'Product + 3D'][i],
                    {
                      size: 4.5,
                    }
                  )
              )
              .join('')
          ),
        },
        {
          title: 'All projects link',
          note: 'ARROW_LINK Button',
          draw: glass(arrowLink(226, 160, 'All projects', 10)),
        },
      ],
    },
    '04-impact.svg': {
      title: 'The numbers, pulled apart into their layers',
      H: 150,
      layers: [
        {
          title: 'Two columns, 1:1',
          note: 'TwoColumnContainer',
          draw: base(
            LIGHT,
            P.line,
            `<line x1="160" x2="160" y1="12" y2="138" stroke="${P.line}" stroke-dasharray="3 3"/>`
          ),
        },
        {
          title: 'Left: mono label',
          note: 'Headline in the left slot',
          draw: glass(mono(16, 22, 'Impact in numbers', { size: 6.5 })),
        },
        {
          title: 'Right: stacked stats',
          note: 'ItemsGrid, one column',
          draw: glass(
            ['60+', '30+', '12']
              .map(
                (v, i) =>
                  txt(176, 40 + i * 44, v, { size: 26, anchor: 'start', weight: 300, ls: -1 }) +
                  mono(
                    176,
                    50 + i * 44,
                    ['Projects shipped', 'Brands built or rebuilt', 'Years working together'][i],
                    {
                      fill: P.ink,
                    }
                  ) +
                  `<line x1="176" x2="304" y1="${56 + i * 44}" y2="${56 + i * 44}" stroke="${P.accent}"/>`
              )
              .join('')
          ),
        },
      ],
    },
    '05-testimonial.svg': {
      title: 'The testimonial, pulled apart into its layers',
      H: 130,
      layers: [
        {
          title: 'Narrow container',
          note: 'content.boxWidth max-w-4xl',
          draw: base(LIGHT, P.line, mono(40, 18, 'Client testimonials', { size: 6.5 })),
        },
        {
          title: 'Outlined card',
          note: 'transparent, emphasis border',
          draw: glass(
            `<rect x="40" y="28" width="240" height="92" fill="none" stroke="${P.accent}" stroke-width="1.2"/>`,
            { fillOpacity: 0 }
          ),
        },
        {
          title: 'Quote and author',
          note: 'larger quoteClass, avatar',
          draw: glass(
            txt(52, 48, 'They turned a vague brief into a site', {
              size: 11,
              anchor: 'start',
              ls: -0.3,
            }) +
              txt(52, 62, 'our customers actually use…', { size: 11, anchor: 'start', ls: -0.3 }) +
              portrait(52, 92, 16) +
              txt(74, 99, 'Maya Okafor', { size: 7, anchor: 'start', weight: 600 }) +
              txt(74, 108, 'Founder, Example Jewellers', {
                size: 6,
                anchor: 'start',
                fill: P.muted,
              })
          ),
        },
      ],
    },
    '06-closing.svg': {
      title: 'The closing statement, pulled apart into its layers',
      H: 120,
      layers: [
        { title: 'Container', note: 'plain band', draw: base(LIGHT, P.line) },
        {
          title: 'Subtitle-only Headline',
          note: 'no title, large subtitle',
          draw: glass(
            statement(16, 34, 12, [
              'We design brands and build sites to order:',
              'shops, portfolios, publications, products',
              'and documentation…',
            ])
          ),
        },
        {
          title: 'Learn more link',
          note: 'ARROW_LINK to the about page',
          draw: glass(arrowLink(16, 100, 'Learn more', 12)),
        },
      ],
    },
    '07-newsletter.svg': {
      title: 'The ink band, pulled apart into its layers',
      H: 120,
      layers: [
        { title: 'Ink band', note: 'Container, bg-tertiary', draw: base(INK, INK) },
        {
          title: 'Newsletter form',
          note: 'ContactForm, one email field',
          draw: glass(
            onInk(16, 24, 'Subscribe to our newsletter', { size: 9 }) +
              `<rect x="16" y="36" width="90" height="14" fill="${P.surface}" stroke="${P.line}"/>` +
              txt(21, 45.5, 'Your email', { size: 6, anchor: 'start', fill: P.muted }) +
              `<rect x="106" y="36" width="14" height="14" fill="${LIGHT}" stroke="${P.ink}"/>` +
              `<path d="M109 43 h8 m-2.5 -2.5 l2.5 2.5 l-2.5 2.5" stroke="${P.ink}" fill="none"/>`
          ),
        },
        {
          title: 'Four footer columns',
          note: 'ItemsGrid of rich text',
          draw: glass(
            ['Address', 'Contact us', 'Sitemap', 'Socials']
              .map(
                (t, i) =>
                  onInk(140 + i * 45, 24, t, { size: 6, weight: 600 }) +
                  [0, 1, 2]
                    .map(
                      (r) =>
                        `<rect x="${140 + i * 45}" y="${32 + r * 9}" width="${30 - r * 4}" height="3.5" rx="1.75" fill="${P.accent}"/>`
                    )
                    .join('')
              )
              .join('')
          ),
        },
      ],
    },
    '08-footer.svg': {
      title: 'The footer, pulled apart into its layers',
      H: 50,
      layers: [
        { title: 'Footer strip', note: 'same bg-tertiary', draw: base(INK, INK) },
        {
          title: 'Language switch',
          note: 'languageToggle, aligned left',
          draw: glass(onInk(16, 22, 'EN · ES', { size: 8, weight: 600 })),
        },
        {
          title: 'Credit line',
          note: 'footnote, rich text',
          draw: glass(
            onInk(16, 40, 'Atelier North is a fictional studio. Photos from Pexels.', { size: 6.5 })
          ),
        },
      ],
    },
    '09-about.svg': {
      title: 'The about intro, pulled apart into its layers',
      H: 150,
      layers: [
        { title: 'Content block', note: 'two columns, centred', draw: base(LIGHT, P.line) },
        {
          title: 'Headline as h1',
          note: 'title and subtitle',
          draw: glass(
            txt(16, 44, 'A small studio, on purpose', {
              size: 13,
              anchor: 'start',
              weight: 600,
              ls: -0.3,
            }) + bars([[16, 54, 130, 4]], P.muted, 0.7)
          ),
        },
        {
          title: 'Body in the slot',
          note: 'rendered rich text',
          draw: glass(
            bars(
              [
                [16, 74, 140, 3],
                [16, 81, 130, 3],
                [16, 88, 136, 3],
                [16, 102, 140, 3],
                [16, 109, 110, 3],
              ],
              P.ink,
              0.55
            )
          ),
        },
        {
          title: 'Studio photo',
          note: 'image prop',
          draw: glass(photo(176, 24, 128, 102, 'desk')),
        },
      ],
    },
    '10-team.svg': {
      title: 'The team, pulled apart into its layers',
      H: 130,
      layers: [
        {
          title: 'Team block',
          note: 'headline, four columns',
          draw: base(
            LIGHT,
            P.line,
            txt(16, 24, 'The team', { size: 13, anchor: 'start', weight: 600 })
          ),
        },
        {
          title: 'Square portraits',
          note: 'imageShape="square"',
          draw: glass([0, 1, 2, 3].map((i) => portrait(16 + i * 74, 36, 66)).join('')),
        },
        {
          title: 'Name and role',
          note: 'title and content per member',
          draw: glass(
            [
              ['Ana Ortega', 'Creative director'],
              ['Ben Hollis', 'Lead engineer'],
              ['Chloe Varga', 'Product designer'],
              ['Dan Moreno', 'Front-end developer'],
            ]
              .map(
                ([n, r], i) =>
                  txt(16 + i * 74, 114, n, { size: 7, anchor: 'start', weight: 600 }) +
                  txt(16 + i * 74, 123, r, { size: 5.5, anchor: 'start', fill: P.muted })
              )
              .join('')
          ),
        },
      ],
    },
    '11-contact.svg': {
      title: 'The contact page, pulled apart into its layers',
      H: 170,
      layers: [
        {
          title: 'ContactForm headline',
          note: 'huge uppercase h1',
          draw: base(
            LIGHT,
            P.line,
            txt(16, 34, 'CONTACT US', { size: 24, anchor: 'start', weight: 600, ls: -1 }) +
              bars([[16, 46, 200, 4]], P.ink, 0.6)
          ),
        },
        {
          title: 'Aside on the left',
          note: 'ItemsGrid in the aside slot',
          draw: glass(
            ['Mail us', 'Address', 'Call']
              .map(
                (t, i) => mono(16, 74 + i * 26, t) + bars([[16, 79 + i * 26, 80, 3.5]], P.ink, 0.7)
              )
              .join('')
          ),
        },
        {
          title: 'Square fields',
          note: 'fields + defaultFieldConfig',
          draw: glass(
            field(130, 70, 84, 13, 'Name') +
              field(220, 70, 84, 13, 'Email') +
              field(130, 96, 174, 13, 'Company') +
              field(130, 122, 174, 28, 'Tell us about the project')
          ),
        },
        {
          title: 'Send link',
          note: 'link-style submitButton',
          draw: glass(
            txt(130, 163, 'Send', { size: 8, anchor: 'start', weight: 600 }) +
              `<path d="M152 160.5 h8 m-2.5 -2.5 l2.5 2.5 l-2.5 2.5" stroke="${P.ink}" fill="none"/>`
          ),
        },
      ],
    },
    '12-work.svg': {
      title: 'The work index, pulled apart into its layers',
      H: 150,
      layers: [
        {
          title: 'Container + h1',
          note: 'Headline "Work"',
          draw: base(
            LIGHT,
            P.line,
            txt(16, 26, 'Work', { size: 15, anchor: 'start', weight: 600 })
          ),
        },
        {
          title: 'Default case cards',
          note: 'CollectionList, no PROJECT_CARD',
          draw: glass(
            [0, 1, 2]
              .map(
                (i) =>
                  `<rect x="${16 + i * 98}" y="38" width="90" height="86" fill="${P.surface}" stroke="${P.line}"/>` +
                  photo(20 + i * 98, 42, 82, 42, ['cover', 'coverDark', 'desk'][i]) +
                  bars(
                    [
                      [22 + i * 98, 92, 60, 4],
                      [22 + i * 98, 100, 74, 3],
                      [22 + i * 98, 106, 50, 3],
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
                  `<rect x="${130 + i * 20}" y="132" width="14" height="12" fill="${i === 0 ? P.ink : LIGHT}" stroke="${P.line}"/>` +
                  txt(137 + i * 20, 140.5, String(i + 1), {
                    size: 6.5,
                    fill: i === 0 ? LIGHT : P.ink,
                  })
              )
              .join('')
          ),
        },
      ],
    },
    '13-case.svg': {
      title: 'A case study page, pulled apart into its layers',
      H: 170,
      layers: [
        {
          title: 'CaseStudyLayout',
          note: 'title, client and date',
          draw: base(
            LIGHT,
            P.line,
            txt(16, 24, 'Brand refresh', { size: 14, anchor: 'start', weight: 600 }) +
              mono(16, 34, 'Example Co. · Nov 2025')
          ),
        },
        {
          title: 'Results',
          note: 'results from front matter',
          draw: glass(
            [
              ['42', 'Components reused'],
              ['17', 'Contrast fixes'],
            ]
              .map(
                ([v, l], i) =>
                  txt(16 + i * 80, 62, v, { size: 20, anchor: 'start', weight: 300 }) +
                  mono(16 + i * 80, 72, l)
              )
              .join('')
          ),
        },
        {
          title: 'Markdown body',
          note: 'the entry content, in the slot',
          draw: glass(
            bars(
              [
                [16, 88, 200, 3],
                [16, 95, 180, 3],
                [16, 102, 190, 3],
              ],
              P.ink,
              0.55
            )
          ),
        },
        {
          title: 'Gallery carousel',
          note: 'gallery → ContentCarousel',
          draw: glass(
            photo(16, 114, 130, 50, 'cover') +
              photo(152, 114, 130, 50, 'coverDark') +
              `<rect x="288" y="114" width="16" height="50" fill="url(#desk)"/>` +
              [0, 1, 2]
                .map(
                  (i) =>
                    `<rect x="${142 + i * 8}" y="167" width="5" height="2" fill="${i ? P.line : P.ink}"/>`
                )
                .join('')
          ),
        },
      ],
    },
  };

  return {
    ...Object.fromEntries(Object.entries(SECTIONS).map(([name, cfg]) => [name, exploded(cfg)])),
    'idea-logocloud.svg': idea({
      title: 'A logo cloud block, with one logo pulled forward',
      H: 180,
      content:
        mono(20, 30, 'Clients', { size: 7 }) +
        [0, 1, 2, 3, 4, 5]
          .map((i) => {
            const x = 20 + (i % 3) * 96;
            const y = 60 + Math.floor(i / 3) * 56;
            return (
              `<rect x="${x}" y="${y}" width="84" height="40" fill="none" stroke="${P.line}"/>` +
              `<rect x="${x + 14}" y="${y + 17}" width="6" height="6" fill="${P.muted}"/>` +
              bars([[x + 24, y + 18, 44, 4]], P.muted, 0.7)
            );
          })
          .join(''),
      pop: {
        x: 116,
        y: 60,
        w: 84,
        h: 40,
        content:
          `<rect x="14" y="17" width="6" height="6" fill="${P.ink}"/>` +
          txt(24, 23, 'EXAMPLE CO.', { size: 7, anchor: 'start', weight: 700 }),
      },
      labels: [
        ['LogoCloud', 'clients in grayscale'],
        ['One client logo', 'any SVG or image'],
      ],
    }),
    'idea-timeline.svg': idea({
      title: 'A timeline block, with one year pulled forward',
      H: 180,
      content:
        mono(20, 30, 'Twelve years', { size: 7 }) +
        `<line x1="40" x2="40" y1="48" y2="168" stroke="${P.line}" stroke-width="2"/>` +
        [0, 1, 2]
          .map(
            (i) =>
              `<rect x="35" y="${55 + i * 44}" width="10" height="10" fill="${i === 1 ? P.ink : P.background}" stroke="${P.ink}" stroke-width="1.5"/>` +
              mono(54, 58 + i * 44, ['2014', '2019', '2025'][i]) +
              bars([[54, 64 + i * 44, 140, 4]], P.muted, 0.6)
          )
          .join(''),
      pop: {
        x: 50,
        y: 92,
        w: 180,
        h: 36,
        content:
          mono(10, 14, '2019', { fill: P.ink }) +
          txt(10, 28, 'First product team hired', { size: 9, anchor: 'start', weight: 600 }),
      },
      labels: [
        ['ItemsTimeline', 'one entry per milestone'],
        ['One milestone', 'year, title and notes'],
      ],
    }),
  };
}
