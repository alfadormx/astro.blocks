import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const BASE_URL = 'http://localhost:4321';
const PAGE_PATH = '/demos/jewellery-configurator';
const GROUP = 'ring-model';
const OUT_DIR = new URL('../src/assets/images/configurator/', import.meta.url);
const CAPTURE_SIZE = 640;
const OUTPUT_SIZE = 480;
const READY_TIMEOUT = 60_000;
// Mid-grey reads on both the light and the dark theme.
const LINE_RGB = [124, 127, 147];
const LAPLACE = { width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] };

// Capture-only: a fixed square viewer and no backgrounds, so every still shares one framing
// and an alpha channel regardless of the page layout around the viewer.
const CAPTURE_STYLE = `
  model-viewer-block { width: ${CAPTURE_SIZE}px !important; height: ${CAPTURE_SIZE}px !important; }
  *, *::before, *::after { background: transparent !important; }
  astro-dev-toolbar { display: none !important; }
`;

async function isUp() {
  try {
    return (await fetch(BASE_URL)).ok;
  } catch {
    return false;
  }
}

async function ensureServer() {
  if (await isUp()) return undefined;
  // Same opt-out as playwright.config.ts: without it `astro dev` daemonises in agent shells.
  const server = spawn('pnpm', ['dev'], {
    env: { ...process.env, ASTRO_DEV_BACKGROUND: '1' },
    stdio: 'ignore',
    detached: true,
  });
  const deadline = Date.now() + 120_000;
  while (!(await isUp())) {
    if (Date.now() > deadline) {
      process.kill(-server.pid);
      throw new Error('dev server did not start within 120 s');
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return server;
}

async function settledShot(viewer, page) {
  let previous = await viewer.screenshot({ omitBackground: true });
  for (let i = 0; i < 50; i++) {
    await page.waitForTimeout(200);
    const next = await viewer.screenshot({ omitBackground: true });
    if (next.equals(previous)) return next;
    previous = next;
  }
  throw new Error('viewer did not settle');
}

function viewerReady(page) {
  return page.waitForFunction(
    () => {
      const el = document.querySelector('[data-configurator] model-viewer-block');
      return (
        el?.dataset.modelViewerState === 'ready' && !el.hasAttribute('data-model-viewer-loading')
      );
    },
    undefined,
    { timeout: READY_TIMEOUT }
  );
}

async function edges(image) {
  return sharp(image)
    .blur(0.6)
    .convolve(LAPLACE)
    .extractChannel(0)
    .raw()
    .toBuffer({ resolveWithObject: true });
}

// Outline drawing of the capture: edges of the silhouette plus shading edges, in one flat
// colour, so a still shows the model's shape and never its metal.
async function lineArt(png) {
  const base = sharp(png).ensureAlpha();
  const alpha = await base.clone().extractChannel(3).png().toBuffer();
  const shade = await base.clone().flatten({ background: '#808080' }).greyscale().png().toBuffer();
  const [{ data: silhouette, info }, { data: shading }] = await Promise.all([
    edges(alpha),
    edges(shade),
  ]);
  const pixels = info.width * info.height;
  const mask = Buffer.alloc(pixels);
  for (let i = 0; i < pixels; i++) {
    const strength = Math.max(silhouette[i], shading[i] * 1.5);
    mask[i] = strength < 24 ? 0 : Math.min(255, strength * 2);
  }
  const out = Buffer.alloc(pixels * 4);
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      // 3 × 3 max thickens the lines so they survive the resize to OUTPUT_SIZE.
      let alpha = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && ny >= 0 && nx < info.width && ny < info.height) {
            alpha = Math.max(alpha, mask[ny * info.width + nx]);
          }
        }
      }
      const i = (y * info.width + x) * 4;
      out.set(LINE_RGB, i);
      out[i + 3] = alpha;
    }
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

const server = await ensureServer();
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  await page.goto(`${BASE_URL}${PAGE_PATH}`);
  await page.addStyleTag({ content: CAPTURE_STYLE });
  const viewer = page.locator('[data-configurator] model-viewer-block');
  await viewerReady(page);
  await viewer.scrollIntoViewIfNeeded();

  const options = page.locator(`[data-selection-group="${GROUP}"] [data-option-code]`);
  const codes = await options.evaluateAll((els) => els.map((el) => el.dataset.optionCode));
  await mkdir(OUT_DIR, { recursive: true });

  // Writing into src/ makes the dev server reload the page, so every option is captured first.
  const shots = [];
  for (const code of codes) {
    await page.locator(`[data-selection-group="${GROUP}"] [data-option-code="${code}"]`).click();
    await viewerReady(page);
    shots.push({ code, shot: await settledShot(viewer, page) });
  }
  for (const { code, shot } of shots) {
    const webp = await sharp(await lineArt(shot))
      .resize(OUTPUT_SIZE, OUTPUT_SIZE)
      .webp({ quality: 82 })
      .toBuffer();
    await writeFile(new URL(`${code}.webp`, OUT_DIR), webp);
    console.log(`wrote src/assets/images/configurator/${code}.webp`);
  }
} finally {
  await browser.close();
  if (server) process.kill(-server.pid);
}
