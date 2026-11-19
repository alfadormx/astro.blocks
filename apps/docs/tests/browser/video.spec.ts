import { expect, test, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/primitives/Video';
const THIRD_PARTY = /^https?:\/\/(?!localhost[:/])/;
const YOUTUBE = /\/\/www\.youtube(-nocookie)?\.com\//;
const VIMEO = /\/\/player\.vimeo\.com\//;

const section = (page: Page, name: string) => page.locator(`[data-doc-section="${name}"]`);
const media = (page: Page, name: string) => section(page, name).locator('[data-video-provider]');

let requested: string[];

test.beforeEach(async ({ page }) => {
  requested = [];
  await page.route(THIRD_PARTY, (route) => {
    requested.push(route.request().url());
    return route.fulfill({ status: 200, body: '' });
  });
});

test('a consumer pipButton id keeps the floating player closable', async ({ page }) => {
  await page.goto(PAGE_URL, { waitUntil: 'load' });
  const root = page.locator('[data-doc-section="floating"]');
  const group = root.locator('[data-video-group]');
  const close = page.locator('#doc-video-pip');

  await root.scrollIntoViewIfNeeded();
  const sectionBottom = await root.evaluate((el) => el.getBoundingClientRect().bottom + scrollY);
  await page.evaluate((y) => window.scrollTo(0, y), sectionBottom + 800);

  await expect(group).toHaveClass(/floating-player/);
  await expect(close).toBeVisible();
  await close.click();
  await expect(group).not.toHaveClass(/floating-player/);
  await expect(close).toBeHidden();
});

test('html5 video loads a locally hosted clip', async ({ page }) => {
  await page.goto(PAGE_URL, { waitUntil: 'load' });
  const video = media(page, 'html5').locator('video');
  await expect
    .poll(() => video.evaluate((el: HTMLVideoElement) => el.currentSrc))
    .toMatch(/\/videos\/flower\.(mp4|webm)$/);
  expect(requested.filter((url) => /\.(mp4|webm)(\?|$)/.test(url))).toEqual([]);
});

for (const [name, host] of [
  ['youtube', YOUTUBE],
  ['vimeo', VIMEO],
] as const) {
  test(`${name} embed requests its provider`, async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'load' });
    await expect(media(page, name)).toHaveAttribute('data-video-provider', name);
    await expect.poll(() => requested.some((url) => host.test(url))).toBe(true);
  });
}

for (const [name, ratio] of [
  ['html5', 16 / 9],
  ['ratio-square', 1],
  ['ratio-portrait', 9 / 16],
  ['ratio-cinema', 21 / 9],
] as const) {
  test(`${name} keeps its aspect ratio`, async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'load' });
    const box = (await media(page, name).boundingBox())!;
    expect(box.width / box.height).toBeCloseTo(ratio, 1);
  });
}

test('default controls show a play button', async ({ page }) => {
  await page.goto(PAGE_URL, { waitUntil: 'load' });
  const play = section(page, 'html5').getByRole('button', { name: /^play$/i });
  await expect(play.filter({ visible: true }).first()).toBeVisible();
});

test('hideControls shows no playback controls', async ({ page }) => {
  await page.goto(PAGE_URL, { waitUntil: 'load' });
  const controls = section(page, 'autoplay').getByRole('button', { name: /play|pause/i });
  await expect(controls.filter({ visible: true })).toHaveCount(0);
});

test('autoplay starts muted and looping once in view', async ({ page }) => {
  await page.goto(PAGE_URL, { waitUntil: 'load' });
  const video = media(page, 'autoplay').locator('video');
  await video.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      video.evaluate((el: HTMLVideoElement) => ({
        muted: el.muted,
        loop: el.loop,
        paused: el.paused,
      }))
    )
    .toEqual({ muted: true, loop: true, paused: false });
});

test('floating players dock and close independently', async ({ page }) => {
  await page.goto(PAGE_URL, { waitUntil: 'load' });
  const first = section(page, 'floating').locator('[data-video-group]');
  const second = section(page, 'floating-2').locator('[data-video-group]');

  await section(page, 'floating-2').scrollIntoViewIfNeeded();
  await expect(first).toHaveClass(/floating-player/);
  await expect(second).not.toHaveClass(/floating-player/);

  const bottom = await section(page, 'floating-2').evaluate(
    (el) => el.getBoundingClientRect().bottom + scrollY
  );
  await page.evaluate((y) => window.scrollTo(0, y), bottom + 400);
  await expect(second).toHaveClass(/floating-player/);

  await page.locator('#doc-video-pip-2').click();
  await expect(second).not.toHaveClass(/floating-player/);
  await expect(first).toHaveClass(/floating-player/);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('html5 video is server-rendered with its sources', async ({ page }) => {
    await page.goto(PAGE_URL);
    const sources = media(page, 'html5').locator('video source');
    await expect(sources).toHaveCount(2);
    await expect(sources.first()).toHaveAttribute('src', /^\/videos\//);
  });

  test('unmuted embeds render without a muted attribute', async ({ page }) => {
    await page.goto(PAGE_URL);
    for (const name of ['youtube', 'vimeo']) {
      await expect(media(page, name).locator(`${name}-video`)).not.toHaveAttribute('muted');
    }
  });
});
