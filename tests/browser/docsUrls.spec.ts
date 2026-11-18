import { expect, test } from '@playwright/test';

const OLD_DOCS_URLS = [
  '/documentation',
  '/documentation/Collections',
  '/documentation/Composing',
  '/documentation/base/Colors',
  '/documentation/base/Typography',
  '/documentation/composite/CallToAction',
  '/documentation/composite/CaseStudyCard',
  '/documentation/composite/CaseStudyLayout',
  '/documentation/composite/CollectionList',
  '/documentation/composite/Configurator',
  '/documentation/composite/ContactForm',
  '/documentation/composite/Content',
  '/documentation/composite/ContentCarousel',
  '/documentation/composite/EventCard',
  '/documentation/composite/EventLayout',
  '/documentation/composite/Example',
  '/documentation/composite/Footer',
  '/documentation/composite/Header',
  '/documentation/composite/Hero',
  '/documentation/composite/Item',
  '/documentation/composite/ItemsContent',
  '/documentation/composite/ItemsGrid',
  '/documentation/composite/ItemsTimeline',
  '/documentation/composite/ItemsTimelineHorizontal',
  '/documentation/composite/LogoCloud',
  '/documentation/composite/NavigationTree',
  '/documentation/composite/NavigationTreeHorizontal',
  '/documentation/composite/Pager',
  '/documentation/composite/PostCard',
  '/documentation/composite/PostLayout',
  '/documentation/composite/Pricing',
  '/documentation/composite/Tabs',
  '/documentation/composite/Team',
  '/documentation/composite/Testimonials',
  '/documentation/layout/Container',
  '/documentation/layout/FourColumnContainer',
  '/documentation/layout/Modal',
  '/documentation/layout/SidebarLeftContainer',
  '/documentation/layout/SidebarRightContainer',
  '/documentation/layout/ThreeColumnContainer',
  '/documentation/layout/TwoColumnContainer',
  '/documentation/primitives/Accordion',
  '/documentation/primitives/Background',
  '/documentation/primitives/Button',
  '/documentation/primitives/Checkbox',
  '/documentation/primitives/CheckboxGroup',
  '/documentation/primitives/CodeBlock',
  '/documentation/primitives/ContentCarouselItem',
  '/documentation/primitives/Headline',
  '/documentation/primitives/Image',
  '/documentation/primitives/Input',
  '/documentation/primitives/LanguageToggle',
  '/documentation/primitives/Logo',
  '/documentation/primitives/Map',
  '/documentation/primitives/ModelViewer',
  '/documentation/primitives/Select',
  '/documentation/primitives/TextArea',
  '/documentation/primitives/ThemeToggle',
  '/documentation/primitives/ToggleGroup',
  '/documentation/primitives/Vector',
  '/documentation/primitives/Video',
  '/documentation/utilities/CombinationCode',
];

test('the list holds every pre-0066 docs URL', () => {
  expect(OLD_DOCS_URLS).toHaveLength(62);
});

for (const url of OLD_DOCS_URLS) {
  test(`${url} still answers after redirects`, async ({ request }) => {
    const response = await request.get(url);
    expect(response.ok()).toBe(true);
  });
}

for (const guide of ['Composing', 'Collections']) {
  test(`the old ${guide} URL lands on the guide`, async ({ page }) => {
    await page.goto(`/documentation/${guide}`);
    await expect(page).toHaveURL(new RegExp(`/documentation/guides/${guide}$`));
  });
}
