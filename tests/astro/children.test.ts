import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';
import ContentCarousel from '~/components/blocks/composite/ContentCarousel.astro';
import Header from '~/components/blocks/composite/Header.astro';
import NavigationTreeHorizontal from '~/components/blocks/composite/NavigationTreeHorizontal.astro';
import Modal from '~/components/blocks/layout/Modal.astro';
import Image from '~/components/blocks/primitives/Image.astro';
import LanguageToggle from '~/components/blocks/primitives/LanguageToggle.astro';
import TextArea from '~/components/blocks/primitives/TextArea.astro';
import Vector from '~/components/blocks/primitives/Vector.astro';

const blocks = [
  ['TextArea', TextArea, { label: 'Message' }],
  ['Vector', Vector, { src: '<svg xmlns="http://www.w3.org/2000/svg"></svg>' }],
  [
    'Image',
    Image,
    { src: 'https://images.unsplash.com/photo-1?w=10', alt: 'a', width: 10, height: 10 },
  ],
  ['LanguageToggle', LanguageToggle, {}],
  ['Header', Header, {}],
  ['ContentCarousel', ContentCarousel, { items: [] }],
  ['Modal', Modal, {}],
  ['NavigationTreeHorizontal', NavigationTreeHorizontal, { items: [{ label: 'A', href: '/a' }] }],
] as const;

describe('children prop', () => {
  it.each(blocks)('%s renders no children attribute', async (_name, component, props) => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(component, {
      props: { ...props, children: 'XYZ' },
      request: new Request('http://localhost/'),
    });

    expect(html).not.toMatch(/\schildren="/);
  });
});
