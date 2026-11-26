import fs from 'node:fs';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import TwoColumnContainer from '~/components/blocks/layout/TwoColumnContainer.astro';
import ThreeColumnContainer from '~/components/blocks/layout/ThreeColumnContainer.astro';
import FourColumnContainer from '~/components/blocks/layout/FourColumnContainer.astro';
import SidebarLeftContainer from '~/components/blocks/layout/SidebarLeftContainer.astro';
import SidebarRightContainer from '~/components/blocks/layout/SidebarRightContainer.astro';

type Component = Parameters<AstroContainer['renderToString']>[0];

const expand = (pattern: string): string[] => {
  const match = pattern.match(/\{([^{}]*)\}/);
  if (!match) return [pattern];
  const [whole, options] = match;
  return options.split(',').flatMap((option) => expand(pattern.replace(whole, option)));
};

const css = fs.readFileSync(new URL('../../src/styles/blocks.css', import.meta.url), 'utf8');
const safelist = new Set(
  [...css.matchAll(/@source inline\('([^']+)'\)/g)].flatMap(([, pattern]) => expand(pattern))
);

const breakpoints = ['sm:', 'md:', 'lg:', 'xl:'];

const cases: [string, Component, Record<string, unknown>][] = [
  ['SidebarLeftContainer', SidebarLeftContainer, {}],
  ['SidebarRightContainer', SidebarRightContainer, {}],
  ['ThreeColumnContainer', ThreeColumnContainer, {}],
  ['FourColumnContainer', FourColumnContainer, {}],
  ...['1:1', '2:1', '3:2', '2:3'].map(
    (ratio) =>
      [`TwoColumnContainer ${ratio}`, TwoColumnContainer, { ratio, reverseOnMobile: true }] as [
        string,
        Component,
        Record<string, unknown>,
      ]
  ),
];

const breakpointClasses = (html: string, breakpoint: string) =>
  [...html.matchAll(/class="([^"]*)"/g)]
    .flatMap(([, classes]) => classes.split(/\s+/))
    .filter((c) => c.startsWith(breakpoint) && /^[a-z]+:(grid-cols|order)-/.test(c));

describe('layout containers at every breakpoint', () => {
  for (const [name, component, props] of cases) {
    for (const breakpoint of breakpoints) {
      it(`${name} with breakpoint="${breakpoint}" builds only safelisted classes`, async () => {
        const container = await AstroContainer.create();
        const html = await container.renderToString(component, {
          props: { responsive: true, breakpoint, ...props },
        });
        const classes = breakpointClasses(html, breakpoint);

        expect(classes.length).toBeGreaterThan(0);
        expect(classes.filter((c) => !safelist.has(c))).toEqual([]);
      });
    }
  }
});
