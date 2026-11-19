import { expect, type Locator, type Page } from '@playwright/test';

function colours(value: string): string[] {
  return value.match(/(?:rgba?|oklch|oklab|lab|lch|color)\([^)]*\)/g) ?? [];
}

// The toggle shell and textarea transition their ring in, and the page's model viewers can
// starve frames enough to stall that transition, so it is finished before reading.
export async function expectFocusRing(target: Locator, colour: string): Promise<void> {
  await expect
    .poll(async () =>
      colours(
        await target.evaluate((el) => {
          el.getAnimations().forEach((animation) => animation.finish());
          return getComputedStyle(el).boxShadow;
        })
      )
    )
    .toContain(colour);
}

export function tokenColour(page: Page, className: string): Promise<string> {
  return page.evaluate((cls) => {
    const probe = document.createElement('div');
    probe.className = cls;
    document.body.append(probe);
    const colour = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return colour;
  }, className);
}

export function emphasisColour(page: Page): Promise<string> {
  return tokenColour(page, 'bg-emphasis');
}

export function primaryColour(page: Page): Promise<string> {
  return tokenColour(page, 'bg-primary');
}
