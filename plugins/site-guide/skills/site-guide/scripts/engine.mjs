// Isometric drawing kit for site guides: upright panels seen from the front-left,
// pulled apart towards the viewer. Every drawing is plain SVG text.

const C = Math.cos(Math.PI / 6);
const S = 0.5;
const W = 320;
const STEP = 150;
const SECTION_H = 180;
const SECTION_DEPTH = STEP * 3;
const POP = STEP * 2;
const IDEA_ZOOM = 1.2;

const f = (n) => n.toFixed(1);
const pts = (list) => list.map((q) => q.map(f).join(',')).join(' ');

export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) =>
    Math.round(Math.max(0, Math.min(255, c * (1 + amount))))
  );
  return `#${ch.map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

export const bars = (list, fill, opacity = 1) =>
  list
    .map(
      ([x, y, w, h = 4]) =>
        `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" fill-opacity="${opacity}"/>`
    )
    .join('');

/**
 * x runs along the screen (up-right on paper), y runs down it,
 * d is depth towards the viewer (down-right on paper).
 */
function wall({ ox, oy }, P) {
  const p = (x, y, d = 0) => [ox + (x + d) * C, oy + y + (d - x) * S];
  const poly = (list, attrs) =>
    `<polygon points="${pts(list.map(([x, y, d]) => p(x, y, d)))}" ${attrs}/>`;
  const face = (d, inner, x = 0, y = 0) => {
    const [fx, fy] = p(x, y, d);
    return `<g transform="matrix(${C} ${-S} 0 1 ${f(fx)} ${f(fy)})">${inner}</g>`;
  };

  const panel = ({
    d,
    W: w,
    H: h,
    t = 6,
    fill,
    fillOpacity = 1,
    edge,
    stroke,
    dashed = false,
    content = '',
  }) => {
    const sides = edge
      ? poly(
          [
            [0, 0, d],
            [w, 0, d],
            [w, 0, d - t],
            [0, 0, d - t],
          ],
          `fill="${shade(edge, 0.12)}"`
        ) +
        poly(
          [
            [0, 0, d],
            [0, h, d],
            [0, h, d - t],
            [0, 0, d - t],
          ],
          `fill="${shade(edge, -0.1)}"`
        )
      : '';
    const border = stroke
      ? `<rect width="${w}" height="${h}" fill="none" stroke="${stroke}" stroke-width="1.2" vector-effect="non-scaling-stroke"${dashed ? ' stroke-dasharray="6 5"' : ''}/>`
      : '';
    return `<g>${sides}${face(d, `<rect width="${w}" height="${h}" fill="${fill}" fill-opacity="${fillOpacity}"/>${content}${border}`)}</g>`;
  };

  const card = ({
    x = 0,
    y = 0,
    d,
    w,
    h,
    fill = P.background,
    content = '',
    t = 6,
    stroke = P.line,
  }) => {
    const top = [p(x, y, d), p(x + w, y, d), p(x + w, y, d - t), p(x, y, d - t)];
    const left = [p(x, y, d), p(x, y + h, d), p(x, y + h, d - t), p(x, y, d - t)];
    return `<polygon points="${pts(top)}" fill="${shade(P.line, 0.11)}"/><polygon points="${pts(left)}" fill="${shade(P.line, 0.03)}"/>
${face(d, `<rect width="${w}" height="${h}" fill="${fill}"/>${content}<rect width="${w}" height="${h}" fill="none" stroke="${stroke}"/>`, x, y)}`;
  };

  const shadow = ({ d, W: w, x = 0, floorY, spread = 18, opacity = 0.14 }) =>
    poly(
      [
        [x, floorY, d - spread],
        [x + w, floorY, d - spread],
        [x + w, floorY, d + spread],
        [x, floorY, d + spread],
      ],
      `fill="${P.ink}" opacity="${opacity}" filter="url(#soft)"`
    );

  const guides = (corners, dFrom, dTo) =>
    corners
      .map(([x, y]) => {
        const [x1, y1] = p(x, y, dFrom);
        const [x2, y2] = p(x, y, dTo);
        return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${P.line}" stroke-width="1" stroke-dasharray="2 4"/>`;
      })
      .join('');

  const corners = (x, y, w, h) => [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];

  return { p, face, panel, card, shadow, guides, corners };
}

/**
 * @param {{ colors: Record<string, string>, fonts: { title: string, body: string } }} theme
 * @param {{ defs?: string }} [options] extra SVG <defs> (gradients) every drawing can reference
 */
export function createKit(theme, { defs = '' } = {}) {
  const missing = ['background', 'surface', 'ink', 'muted', 'primary', 'accent', 'line'].filter(
    (role) => !theme.colors?.[role]
  );
  if (missing.length) throw new Error(`guide.json theme.colors is missing: ${missing.join(', ')}`);
  const P = theme.colors;
  const F = theme.fonts;

  const label = ({ x, y, anchorX, anchorY, num, title, note }) => `<g>
  <line x1="${f(anchorX)}" y1="${f(anchorY)}" x2="${f(x)}" y2="${f(y)}" stroke="${P.muted}" stroke-width="1"/>
  <circle cx="${f(anchorX)}" cy="${f(anchorY)}" r="3" fill="${P.primary}"/>
  <circle cx="${f(x + 14)}" cy="${f(y)}" r="13" fill="${P.primary}"/>
  <text x="${f(x + 14)}" y="${f(y + 5)}" text-anchor="middle" font-family="${F.body}" font-size="13" font-weight="600" fill="${P.background}">${num}</text>
  <text x="${f(x + 36)}" y="${f(y)}" font-family="${F.title}" font-size="22" font-weight="600" fill="${P.ink}">${title}</text>
  <text x="${f(x + 36)}" y="${f(y + 18)}" font-family="${F.body}" font-size="12" letter-spacing="0.5" fill="${P.muted}">${note}</text>
</g>`;

  const svgDoc = ({ width, height, body, title }) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${title}">
<title>${title}</title>
<defs><filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>${defs}</defs>
<rect width="${width}" height="${height}" fill="${P.background}"/>
${body}
</svg>
`;

  function txt(
    x,
    y,
    s,
    {
      size = 10,
      font = 'body',
      fill = P.ink,
      anchor = 'middle',
      ls = 0,
      italic = false,
      weight,
      onDark = false,
    } = {}
  ) {
    const attrs = [
      `x="${x}"`,
      `y="${y}"`,
      `text-anchor="${anchor}"`,
      `font-family="${F[font]}"`,
      `font-size="${size}"`,
      `fill="${fill}"`,
      ls ? `letter-spacing="${ls}"` : '',
      italic ? 'font-style="italic"' : '',
      weight ? `font-weight="${weight}"` : '',
      onDark
        ? `stroke="${P.ink}" stroke-opacity="0.55" stroke-width="${size / 14}" paint-order="stroke"`
        : '',
    ];
    return `<text ${attrs.filter(Boolean).join(' ')}>${s}</text>`;
  }

  const caps = (x, y, s, opts = {}) => txt(x, y, s, { size: 6, ls: 1.8, fill: P.muted, ...opts });

  const base = (fill, edge, content = '') => ({ solid: true, fill, edge, content });

  const glass = (content, { fill = P.background, fillOpacity = 0.15, stroke = P.muted } = {}) => ({
    fill,
    fillOpacity,
    stroke,
    content,
    veil: fill !== P.background,
  });

  const renderLayer = (sc, l, d, H) =>
    l.solid
      ? sc.panel({ d, W, H, fill: l.fill, edge: l.edge, stroke: P.line, content: l.content })
      : sc.panel({
          d,
          W,
          H,
          fill: l.fill,
          fillOpacity: l.fillOpacity,
          stroke: l.stroke,
          dashed: true,
          content: l.content,
        });

  const flatten = (layers) =>
    layers
      .map((l) =>
        l.solid
          ? `<rect width="${W}" height="100%" fill="${l.fill}"/>${l.content}`
          : `${l.veil ? `<rect width="${W}" height="100%" fill="${l.fill}" fill-opacity="${l.fillOpacity}"/>` : ''}${l.content}`
      )
      .join('');

  /** One section pulled apart into its layers, back to front, numbered on the right. */
  function exploded({ title, H, layers }) {
    const back = STEP * (layers.length - 1);
    const floor = H + 70;
    const ox = 60;
    const oy = 70 + W * S;
    const sc = wall({ ox, oy }, P);

    const shadows = layers.map((l, i) =>
      sc.shadow({ d: i * STEP, W, floorY: floor, opacity: l.draw.solid ? 0.16 : 0.08 })
    );
    const body = [];
    layers.forEach((l, i) => {
      if (i > 0) body.push(sc.guides(sc.corners(0, 0, W, H), (i - 1) * STEP, i * STEP));
      body.push(renderLayer(sc, l.draw, i * STEP, H));
    });

    const labelX = sc.p(W, 0, back)[0] + 60;
    const labels = layers.map((l, i) => {
      const [ax, ay] = sc.p(W, 16, i * STEP);
      return label({
        anchorX: ax,
        anchorY: ay,
        x: labelX,
        y: ay,
        num: i + 1,
        title: l.title,
        note: l.note,
      });
    });

    return svgDoc({
      width: Math.ceil(labelX + 310),
      height: Math.ceil(oy + floor + (back + 20) * S + 50),
      title,
      body: shadows.join('') + body.join('\n') + labels.join('\n'),
    });
  }

  /**
   * The whole page as a column of sections, each a step closer to the viewer.
   * An item takes `layers` (flattened from its exploded drawing) or ready `content`.
   * `floating` cards hover in front, optionally tied to a point by a dashed line.
   */
  function overview({ title, items, floating = [], gap = 18, depthStep = 26 }) {
    let y = 0;
    const placed = items.map((it, i) => {
      const item = {
        ...it,
        y,
        d: i * depthStep,
        content: it.content ?? flatten(it.layers.map((l) => l.draw)),
      };
      y += it.H + gap;
      return item;
    });
    const totalY = y - gap;
    const maxD = placed.at(-1).d;
    const ox = 60;
    const oy = 70 + W * S;
    const sc = wall({ ox, oy }, P);

    const panelAt = (it) => {
      const t = 6;
      const top = [
        sc.p(0, it.y, it.d),
        sc.p(W, it.y, it.d),
        sc.p(W, it.y, it.d - t),
        sc.p(0, it.y, it.d - t),
      ];
      const left = [
        sc.p(0, it.y, it.d),
        sc.p(0, it.y + it.H, it.d),
        sc.p(0, it.y + it.H, it.d - t),
        sc.p(0, it.y, it.d - t),
      ];
      return `<polygon points="${pts(top)}" fill="${shade(P.line, 0.11)}"/><polygon points="${pts(left)}" fill="${shade(P.line, 0.03)}"/>
${sc.face(it.d, `<svg width="${W}" height="${it.H}" overflow="hidden">${it.content}</svg><rect width="${W}" height="${it.H}" fill="none" stroke="${P.line}"/>`, 0, it.y)}`;
    };

    const cards = floating.map((c) => {
      const link = c.from
        ? (() => {
            const [x1, y1] = sc.p(c.from[0], c.from[1], c.from[2] ?? 0);
            const [x2, y2] = sc.p(c.x + c.w, c.y, c.d);
            return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="${P.primary}" stroke-width="1" stroke-dasharray="3 4"/>`;
          })()
        : '';
      return `${link}
${sc.face(c.d, `<rect width="${c.w}" height="${c.h}" fill="${c.fill ?? P.background}"/>${c.content}<rect width="${c.w}" height="${c.h}" fill="none" stroke="${P.line}"/>`, c.x, c.y)}`;
    });

    const labelX = sc.p(W, 0, maxD)[0] + 70;
    const labels = placed.map((it, i) => {
      const [ax] = sc.p(W, Math.min(14, it.H / 2), it.d);
      const [, ly] = sc.p(W, it.y + Math.min(14, it.H / 2), it.d);
      return label({
        anchorX: ax,
        anchorY: ly,
        x: labelX,
        y: ly,
        num: i + 1,
        title: it.title,
        note: it.note,
      });
    });

    return svgDoc({
      width: Math.ceil(labelX + 260),
      height: Math.ceil(oy + totalY + maxD * S + 50),
      title,
      body: placed.map(panelAt).join('\n') + labels.join('\n') + cards.join('\n'),
    });
  }

  /** A block the site does not use yet: one panel plus the detail that makes it special. */
  function idea({
    title,
    H = 180,
    fill = P.background,
    content,
    pop,
    labels: [baseLabel, popLabel],
  }) {
    const ox = 60;
    const oy = 70 + W * S;
    const sc = wall({ ox, oy }, P);
    const floor = H + 70;

    const zoom = ([x, y]) => [ox + (x - ox) * IDEA_ZOOM, 70 + (y - 70) * IDEA_ZOOM];
    const labelX = sc.p(W, 0, SECTION_DEPTH)[0] + 60;
    const [bx, by] = zoom(sc.p(W, 16, 0));
    const [px, py] = zoom(sc.p(pop.x + pop.w, pop.y + Math.min(10, pop.h / 2), POP));

    const drawing = [
      sc.shadow({ d: 0, W, floorY: floor, opacity: 0.16 }),
      sc.shadow({ d: POP, W: pop.w, x: pop.x, floorY: floor, opacity: 0.08 }),
      sc.card({ d: 0, w: W, h: H, fill, content }),
      sc.guides(sc.corners(pop.x, pop.y, pop.w, pop.h), 0, POP),
      sc.card({ ...pop, d: POP }),
    ];
    const body = [
      `<g transform="translate(${ox} 70) scale(${IDEA_ZOOM}) translate(${-ox} -70)">${drawing.join('\n')}</g>`,
      label({
        anchorX: bx,
        anchorY: by,
        x: labelX,
        y: by,
        num: 1,
        title: baseLabel[0],
        note: baseLabel[1],
      }),
      label({
        anchorX: px,
        anchorY: py,
        x: labelX,
        y: Math.max(py, by + 60),
        num: 2,
        title: popLabel[0],
        note: popLabel[1],
      }),
    ];
    return svgDoc({
      width: Math.ceil(labelX + 310),
      height: Math.ceil(oy + SECTION_H + 70 + (SECTION_DEPTH + 20) * S + 50),
      title,
      body: body.join('\n'),
    });
  }

  const icon = (inner) => (x, y, c) =>
    `<g fill="none" stroke="${c}" stroke-width="1.3">${inner(x, y)}</g>`;
  const ICONS = {
    envelope: icon(
      (x, y) =>
        `<rect x="${x - 6}" y="${y - 4}" width="12" height="8"/><path d="M${x - 6} ${y - 4} l6 5 l6 -5"/>`
    ),
    pin: icon(
      (x, y) =>
        `<path d="M${x} ${y + 6} C${x - 6} ${y} ${x - 5} ${y - 6} ${x} ${y - 6} C${x + 5} ${y - 6} ${x + 6} ${y} ${x} ${y + 6} Z"/><circle cx="${x}" cy="${y - 1.5}" r="1.8"/>`
    ),
    camera: icon(
      (x, y) =>
        `<rect x="${x - 7}" y="${y - 4}" width="14" height="10" rx="2"/><circle cx="${x}" cy="${y + 1}" r="3"/><path d="M${x - 3} ${y - 4} l1.5 -2.5 h3 l1.5 2.5"/>`
    ),
    phone: icon(
      (x, y) =>
        `<rect x="${x - 4.5}" y="${y - 7}" width="9" height="14" rx="1.8"/><path d="M${x - 1.5} ${y + 4.5} h3"/>`
    ),
  };

  return {
    W,
    STEP,
    P,
    F,
    bars,
    shade,
    txt,
    caps,
    icon,
    ICONS,
    base,
    glass,
    flatten,
    exploded,
    overview,
    idea,
  };
}
