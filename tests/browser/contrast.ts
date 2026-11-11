import type { Locator } from '@playwright/test';

/** WCAG contrast ratio of an element's text colour against the first opaque background behind it. */
export function contrastRatio(target: Locator): Promise<number> {
  return target.evaluate((el) => {
    document.getAnimations().forEach((animation) => animation.finish());
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
    const rgba = (colour: string): [number, number, number, number] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = colour;
      ctx.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };
    const luminance = ([r, g, b]: number[]) => {
      const [R, G, B] = [r, g, b].map((v) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    };

    let background: [number, number, number, number] = [255, 255, 255, 1];
    for (let node: Element | null = el; node; node = node.parentElement) {
      const colour = rgba(getComputedStyle(node).backgroundColor);
      if (colour[3] > 0.99) {
        background = colour;
        break;
      }
    }
    const text = rgba(getComputedStyle(el).color);
    const blended = text.slice(0, 3).map((v, i) => v * text[3] + background[i] * (1 - text[3]));
    const [hi, lo] = [luminance(blended), luminance(background)].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
  });
}
