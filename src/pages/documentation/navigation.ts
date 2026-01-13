import type { ButtonProps } from '~/types/button.types';

export const documentationNavigation: ButtonProps[] = [
  {
    label: 'Base',
    children: [
      { label: 'Colors', href: '/documentation/base/Colors' },
      { label: 'Typography', href: '/documentation/base/Typography' },
    ],
  },
  {
    label: 'Composite',
    children: [
      { label: 'CallToAction', href: '/documentation/composite/CallToAction' },
      { label: 'Content', href: '/documentation/composite/Content' },
      { label: 'Header', href: '/documentation/composite/Header' },
      { label: 'ItemsContent', href: '/documentation/composite/ItemsContent' },
      { label: 'ItemsGrid', href: '/documentation/composite/ItemsGrid' },
      { label: 'ItemsTimeline', href: '/documentation/composite/ItemsTimeline' },
      {
        label: 'ItemsTimelineHorizontal',
        href: '/documentation/composite/ItemsTimelineHorizontal',
      },
      { label: 'NavigationTree', href: '/documentation/composite/NavigationTree' },
      {
        label: 'NavigationTreeHorizontal',
        href: '/documentation/composite/NavigationTreeHorizontal',
      },
    ],
  },
  {
    label: 'Layout',
    children: [
      { label: 'Container', href: '/documentation/layout/Container' },
      { label: 'FourColumnContainer', href: '/documentation/layout/FourColumnContainer' },
      { label: 'Modal', href: '/documentation/layout/Modal' },
      { label: 'SidebarLeftContainer', href: '/documentation/layout/SidebarLeftContainer' },
      { label: 'SidebarRightContainer', href: '/documentation/layout/SidebarRightContainer' },
      { label: 'ThreeColumnContainer', href: '/documentation/layout/ThreeColumnContainer' },
      { label: 'TwoColumnContainer', href: '/documentation/layout/TwoColumnContainer' },
    ],
  },
  {
    label: 'Primitives',
    children: [
      { label: 'Button', href: '/documentation/primitives/Button' },
      { label: 'Headline', href: '/documentation/primitives/Headline' },
      { label: 'Image', href: '/documentation/primitives/Image' },
      { label: 'ThemeToggle', href: '/documentation/primitives/ThemeToggle' },
      { label: 'Video', href: '/documentation/primitives/Video' },
    ],
  },
];
