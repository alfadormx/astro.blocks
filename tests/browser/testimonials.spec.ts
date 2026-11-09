import { expect, test, type Locator, type Page } from '@playwright/test';

const PAGE_URL = '/documentation/composite/Testimonials';
const SECTIONS = ['grid', 'rating', 'avatar-source', 'layer', 'carousel', 'single'] as const;

function section(page: Page, name: string): Locator {
  return page.locator(`[data-doc-section="${name}"]`);
}

test.describe('rendering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('each card is a figure holding a blockquote and a figcaption', async ({ page }) => {
    const cards = section(page, 'grid').locator('figure[data-testimonial]');
    await expect(cards).toHaveCount(3);
    for (const card of await cards.all()) {
      await expect(card.locator(':scope > blockquote')).toHaveCount(1);
      await expect(card.locator(':scope > figcaption')).toHaveCount(1);
    }
  });

  test('blank lines in the quote become separate paragraphs', async ({ page }) => {
    const quote = section(page, 'grid')
      .locator('[data-testimonial]')
      .nth(1)
      .locator('blockquote p');
    await expect(quote).toHaveCount(2);
  });

  test('the quote reads at body size in the body font, not as a pull quote', async ({ page }) => {
    const quote = section(page, 'grid').locator('blockquote').first();
    await expect(quote).toHaveCSS('font-size', '16px');
    await expect(quote).toHaveCSS('font-style', 'normal');
    await expect(quote).toHaveCSS('border-left-width', '0px');
    const card = section(page, 'grid').locator('[data-testimonial]').first();
    const surface = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
    const text = await quote.evaluate((el) => getComputedStyle(el).color);
    expect(text).not.toBe(surface);
  });

  test('the caption shows the author name and role', async ({ page }) => {
    const caption = section(page, 'grid').locator('[data-testimonial] figcaption').first();
    await expect(caption).toContainText('Ana Ruiz');
    await expect(caption).toContainText('Marketing lead, Northwind');
  });

  test('the headline renders as h2', async ({ page }) => {
    await expect(section(page, 'grid').locator('[data-headline] h2')).toHaveText(
      'What our customers say'
    );
  });

  test('a rating reads as text while its stars are hidden', async ({ page }) => {
    const rating = section(page, 'rating').locator('[data-testimonial-rating="4"]');
    await expect(rating.locator('.sr-only')).toHaveText('4 out of 5');
    await expect(rating.locator('[aria-hidden="true"]')).toHaveCount(1);
    await expect(rating.locator('[data-star-filled="true"]')).toHaveCount(4);
    await expect(rating.locator('[data-star-filled="false"]')).toHaveCount(1);
  });

  test('a card without rating renders no rating', async ({ page }) => {
    await expect(section(page, 'grid').locator('[data-testimonial-rating]')).toHaveCount(0);
  });

  test('the avatar is decorative', async ({ page }) => {
    const avatar = section(page, 'avatar-source').locator('figcaption img').first();
    await expect(avatar).toHaveAttribute('alt', '');
  });

  test('the source is a cited link', async ({ page }) => {
    const link = section(page, 'avatar-source')
      .locator('figcaption cite')
      .getByRole('link', { name: 'G2' });
    await expect(link).toHaveAttribute('href', 'https://www.g2.com/');
    await expect(link).not.toHaveAttribute('target', '_blank');
  });

  test('the shared config relabels every rating', async ({ page }) => {
    const labels = section(page, 'layer').locator('[data-testimonial-rating] .sr-only');
    await expect(labels).toHaveText(['5 de 5 estrellas', '4 de 5 estrellas', '3 de 5 estrellas']);
  });

  test('a single testimonial renders one card with one paragraph and no rating', async ({
    page,
  }) => {
    const single = section(page, 'single');
    await expect(single.locator('figure[data-testimonial]')).toHaveCount(1);
    await expect(single.locator('blockquote p')).toHaveCount(1);
    await expect(single.locator('[data-testimonial-rating]')).toHaveCount(0);
  });
});

test.describe('desktop viewport', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('three cards share one row', async ({ page }) => {
    await page.goto(PAGE_URL);
    const cards = section(page, 'grid').locator('[data-testimonial]');
    const tops = await Promise.all(
      (await cards.all()).map(async (c) => (await c.boundingBox())!.y)
    );
    expect(new Set(tops).size).toBe(1);
  });
});

test.describe('narrow container', () => {
  test('cards stack in one column when the section is phone-width', async ({ page }) => {
    await page.goto(PAGE_URL);
    // The docs layout does not collapse its sidebar column on phones, so a phone viewport
    // still leaves the section wider than @lg; constrain the container itself.
    await section(page, 'grid').evaluate((el) => {
      (el as HTMLElement).style.width = '358px';
    });
    const cards = section(page, 'grid').locator('[data-testimonial]');
    const lefts = await Promise.all(
      (await cards.all()).map(async (c) => (await c.boundingBox())!.x)
    );
    expect(new Set(lefts).size).toBe(1);
  });
});

test.describe('carousel', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('the carousel region is labelled Testimonials', async ({ page }) => {
    await expect(
      section(page, 'carousel').getByRole('region', { name: 'Testimonials' })
    ).toBeVisible();
  });

  test('every real slide is announced as Slide N of 5', async ({ page }) => {
    const slides = section(page, 'carousel').locator('.carousel-item:not([data-carousel-clone])');
    await expect(slides).toHaveCount(5);
    await expect(slides.nth(2)).toHaveAttribute('aria-label', 'Slide 3 of 5');
    await expect(slides.locator('figure[data-testimonial]')).toHaveCount(5);
  });

  test('three cards show at desktop width', async ({ page }) => {
    const viewport = section(page, 'carousel').locator('[data-carousel-viewport]');
    const card = section(page, 'carousel')
      .locator('.carousel-item:not([data-carousel-clone])')
      .first();
    const ratio = (await viewport.boundingBox())!.width / (await card.boundingBox())!.width;
    expect(Math.round(ratio)).toBe(3);
  });
});

test.describe('keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE_URL);
  });

  test('Enter on the next button advances one card', async ({ page }) => {
    const carousel = section(page, 'carousel');
    const announcer = carousel.locator('[data-carousel-announcer]');
    await expect(announcer).toHaveText('Slide 1 of 5');
    const next = carousel.locator('[data-carousel-next]');
    await next.focus();
    await expect(next).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(announcer).toHaveText('Slide 2 of 5');
  });

  test('Enter on an indicator jumps to its slide', async ({ page }) => {
    const carousel = section(page, 'carousel');
    const third = carousel.locator('[data-carousel-indicator]').nth(2);
    await third.focus();
    await page.keyboard.press('Enter');
    await expect(third).toHaveAttribute('aria-selected', 'true');
    await expect(carousel.locator('[data-carousel-announcer]')).toHaveText('Slide 3 of 5');
  });

  test('the source link in a visible card takes focus', async ({ page }) => {
    const link = section(page, 'avatar-source').getByRole('link', { name: 'G2' });
    await link.focus();
    await expect(link).toBeFocused();
  });
});

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.beforeEach(async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(PAGE_URL);
    });

    test('html carries the theme', async ({ page }) => {
      await expect(page.locator('html')).toHaveAttribute('data-theme', colorScheme);
    });

    for (const name of SECTIONS) {
      test(`${name} shows its first card`, async ({ page }) => {
        const card = section(page, name)
          .locator('figure[data-testimonial]:not([data-carousel-clone] *)')
          .first();
        await expect(card).toBeVisible();
        await expect(card.locator('blockquote')).toBeVisible();
      });
    }

    test('filled stars differ in colour from the card surface', async ({ page }) => {
      const star = section(page, 'rating').locator('[data-star-filled="true"]').first();
      const card = section(page, 'rating').locator('[data-testimonial]').first();
      const starColour = await star.evaluate((el) => getComputedStyle(el).color);
      const surface = await card.evaluate((el) => getComputedStyle(el).backgroundColor);
      expect(starColour).not.toBe(surface);
    });
  });
}
