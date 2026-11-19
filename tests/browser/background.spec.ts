import { expect, test, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/Hero';
const PEXELS = /^https:\/\/www\.pexels\.com\/download\/video\//;

const root = (page: Page) =>
  page.locator('[data-doc-section="background-video"] [data-background-video]');
const video = (page: Page) => root(page).locator('video');
const paused = (page: Page) => video(page).evaluate((el: HTMLVideoElement) => el.paused);

async function open(page: Page) {
  await page.goto(PAGE_URL, { waitUntil: 'load' });
  const bg = root(page);
  await bg.scrollIntoViewIfNeeded();
  await expect(bg).toHaveAttribute('data-background-ready', '');
  return bg;
}

test.beforeEach(async ({ page }) => {
  await page.route(PEXELS, (route) =>
    route.fulfill({ path: 'public/videos/flower.mp4', contentType: 'video/mp4' })
  );
});

test('the controls have accessible names', async ({ page }) => {
  const bg = await open(page);
  const pause = bg.locator('[data-background-pause]');
  await expect(pause).toHaveAccessibleName('Pause background video');
  await pause.click();
  await expect(bg.locator('[data-background-play]')).toHaveAccessibleName('Play background video');
});

test('a background video can be paused and resumed by keyboard', async ({ page }) => {
  const bg = await open(page);
  const pause = bg.locator('[data-background-pause]');
  const play = bg.locator('[data-background-play]');

  await expect.poll(() => paused(page)).toBe(false);
  await expect(pause).toBeVisible();
  await expect(play).toBeHidden();

  await pause.focus();
  await page.keyboard.press('Enter');
  await expect.poll(() => paused(page)).toBe(true);
  await expect(play).toBeVisible();
  await expect(play).toBeFocused();
  await expect(pause).toBeHidden();

  await page.keyboard.press('Enter');
  await expect.poll(() => paused(page)).toBe(false);
  await expect(pause).toBeVisible();
  await expect(pause).toBeFocused();
});

test('the control paints above the hero content', async ({ page }) => {
  const bg = await open(page);
  await bg.locator('[data-background-pause]').click();
  await expect.poll(() => paused(page)).toBe(true);
});

test.describe('with reduced motion', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  test('the video is paused on load', async ({ page }) => {
    const bg = await open(page);
    await expect(bg.locator('[data-background-play]')).toBeVisible();
    await expect(bg.locator('[data-background-pause]')).toBeHidden();
    await page.waitForTimeout(500);
    expect(await paused(page)).toBe(true);
  });

  test('play still starts the video', async ({ page }) => {
    const bg = await open(page);
    await bg.locator('[data-background-play]').click();
    await expect.poll(() => paused(page)).toBe(false);
    await expect(bg.locator('[data-background-pause]')).toBeVisible();
  });
});

test.describe('off-screen', () => {
  const scrollAway = (page: Page) =>
    page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));

  test('the video pauses off-screen and resumes on return', async ({ page }) => {
    const bg = await open(page);
    await expect.poll(() => paused(page)).toBe(false);

    await scrollAway(page);
    await expect.poll(() => paused(page)).toBe(true);
    await expect(bg.locator('[data-background-pause]')).not.toHaveAttribute('hidden');

    await bg.scrollIntoViewIfNeeded();
    await expect.poll(() => paused(page)).toBe(false);
  });

  test('a user pause survives scrolling away and back', async ({ page }) => {
    const bg = await open(page);
    await bg.locator('[data-background-pause]').click();
    await scrollAway(page);
    await bg.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    expect(await paused(page)).toBe(true);
    await expect(bg.locator('[data-background-play]')).toBeVisible();
  });
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the video does not play and both controls stay hidden', async ({ page }) => {
    await page.goto(PAGE_URL, { waitUntil: 'load' });
    const bg = root(page);
    await expect(bg.locator('[data-background-pause]')).toBeHidden();
    await expect(bg.locator('[data-background-play]')).toBeHidden();
    await expect(bg.locator('video')).not.toHaveAttribute('autoplay');
  });
});
