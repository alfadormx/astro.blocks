export const fileTree = `my-site/
  astro.config.mjs
  package.json
  tsconfig.json
  src/
    config.yaml
    site.ts
    assets/images/studio.jpg
    copy/home/fr.yaml
    copy/home/en.yaml
    icons/.gitkeep
    layouts/Layout.astro
    pages/[...lang]/index.astro
    styles/global.css`;

export const packageJson = `{
  "name": "my-site",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check"
  },
  "dependencies": {
    "@alfadormx/blocks": "github:alfadormx/astro.blocks#v0.2.0&path:packages/blocks",
    "@iconify-json/heroicons": "^1.2.3",
    "@iconify-json/mdi": "^1.2.3",
    "astro": "^7.4.5",
    "sharp": "^0.35.5",
    "tailwindcss": "^4.3.4"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.12",
    "typescript": "^6.0.3"
  }
}`;

export const tsconfig = `{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "paths": {
      "~/*": ["./src/*"]
    }
  },
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}`;

export const astroConfig = `// @ts-check
import { defineConfig } from 'astro/config';
import blocks from '@alfadormx/blocks/integration';

export default defineConfig({
  integrations: [blocks({ config: './src/config.yaml', css: './src/styles/global.css' })],
});`;

export const configYaml = `site:
  name: 'Atelier Lune'
  site: 'https://example.com'
  base: '/'
  trailingSlash: false

i18n:
  default: 'fr'
  languages:
    - code: 'fr'
      locale: 'fr-FR'
      basePath: '/'
      direction: 'ltr'
      label: 'Français'
    - code: 'en'
      locale: 'en-US'
      basePath: '/en'
      direction: 'ltr'
      label: 'English'

metadata:
  title:
    default: 'Atelier Lune'
    template: '%s | Atelier Lune'
  description: 'Céramiques faites main à Lyon.'
  theme:
    color: '#F6F1EA'
    colorScheme: 'only light'
  localized:
    en:
      description: 'Handmade ceramics in Lyon.'`;

export const copyFr = `pageTitle: 'Accueil'

nav:
  home: 'Atelier Lune, accueil'
  about: 'L’atelier'
  contact: 'Contact'

hero:
  tagline: 'Céramiques · Lyon'
  title: 'Des pièces faites main, une à une'
  subtitle: 'Bols, tasses et vases tournés dans notre atelier de la Croix-Rousse.'
  action: 'Nous écrire'

about:
  title: 'L’atelier'
  imageAlt: 'L’atelier, tour et étagères de pièces'
  content: |
    Nous tournons chaque pièce **à la main**, en grès local.

    Les émaux sont préparés sur place.

footer:
  footnote: '© Atelier Lune'`;

export const layout = `---
import BaseLayout from '@alfadormx/blocks/Layout.astro';
import Header from '@alfadormx/blocks/composite/Header.astro';
import Footer from '@alfadormx/blocks/composite/Footer.astro';
import type { MetaData } from '@alfadormx/blocks/types/metadata';
import { useCopy } from '@alfadormx/blocks/copy';
import { homeUrl, mainNav } from '~/site';

interface Props {
  langCode: string;
  metadata?: Partial<MetaData>;
}

const { langCode, metadata } = Astro.props;
const { copy } = useCopy(Astro, 'home');
---

<BaseLayout langCode={langCode} metadata={metadata}>
  <Header
    isSticky
    logo={{ href: homeUrl(langCode), 'aria-label': copy.nav.home }}
    rightNavigationTreeHorizontal={{ items: mainNav(copy.nav) }}
  />
  <main>
    <slot />
  </main>
  <Footer footnote={copy.footer.footnote} languageToggle={{}} />
</BaseLayout>`;

export const page = `---
import Layout from '../../layouts/Layout.astro';
import Hero from '@alfadormx/blocks/composite/Hero.astro';
import Content from '@alfadormx/blocks/composite/Content.astro';
import { localizedPaths, useCopy } from '@alfadormx/blocks/copy';
import { EMAIL, SECTION } from '~/site';

export const getStaticPaths = () => localizedPaths();

const { langCode, copy } = useCopy(Astro, 'home');
---

<Layout langCode={langCode} metadata={{ title: { default: copy.pageTitle } }}>
  <Hero
    headline={{ tagline: copy.hero.tagline, title: copy.hero.title, subtitle: copy.hero.subtitle }}
    actions={[{ label: copy.hero.action, href: EMAIL, variant: 'solid' }]}
  />
  <Content
    container={SECTION}
    image={{ src: '~/assets/images/studio.jpg', alt: copy.about.imageAlt }}
    headline={{ title: copy.about.title, anchorId: 'about' }}
    itemsGrid={{ items: [{ content: copy.about.content }] }}
  />
</Layout>`;

export const siteTs = `import { I18N } from 'site-config';
import type { ContainerProps } from '@alfadormx/blocks/types/container';
import type { NavigationTreeItem } from '@alfadormx/blocks/types/navigationtree';

type Language = (typeof I18N.languages)[number];
type HomeCopy = AstroBlocks.CopyRegistry['home'];

export const EMAIL = 'mailto:hello@example.com';

export const SECTION: ContainerProps = {
  spacing: { padding: 'py-20 px-6' },
  border: { width: 'border-t', color: 'border-border' },
};

export function homeUrl(langCode: string): string {
  const lang = I18N.languages.find((l: Language) => l.code === langCode);
  return lang && lang.basePath !== '/' ? lang.basePath : '/';
}

export function mainNav(nav: HomeCopy['nav']): NavigationTreeItem[] {
  return [
    { label: nav.about, href: '#about' },
    { label: nav.contact, href: EMAIL },
  ];
}`;

export const themeCss = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300..600&family=Inter:wght@300..600&display=swap');

@import '@alfadormx/blocks/blocks.css';

@theme static {
  --font-title: 'Fraunces', Georgia, serif;
  --font-subtitle: 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;

  --color-text: oklch(28% 0.03 60);
  --color-subtext0: oklch(45% 0.03 60);
  --color-subtext1: oklch(52% 0.03 60);
  --color-overlay0: oklch(68% 0.02 60);
  --color-overlay1: oklch(73% 0.02 60);
  --color-overlay2: oklch(78% 0.02 60);
  --color-surface0: oklch(84% 0.015 60);
  --color-surface1: oklch(87% 0.013 60);
  --color-surface2: oklch(89% 0.012 60);
  --color-base: oklch(96% 0.008 70);
  --color-mantle: oklch(93% 0.01 70);
  --color-crust: oklch(98% 0.005 70);

  --color-clay: oklch(58% 0.13 40);
  --color-clay-50: oklch(95% 0.02 40);
  --color-clay-100: oklch(91% 0.035 40);
  --color-clay-200: oklch(85% 0.055 40);
  --color-clay-300: oklch(77% 0.08 40);
  --color-clay-400: oklch(67% 0.11 40);
  --color-clay-500: oklch(58% 0.13 40);
  --color-clay-600: oklch(51% 0.12 40);
  --color-clay-700: oklch(44% 0.1 40);
  --color-clay-800: oklch(37% 0.085 40);
  --color-clay-900: oklch(30% 0.07 40);
  --color-clay-950: oklch(22% 0.05 40);

  --color-primary: var(--color-clay);
  --color-primary-hover: var(--color-clay-600);
  --color-secondary: var(--color-clay-300);
  --color-secondary-hover: var(--color-clay-400);
  --color-accent: var(--color-clay-700);
  --color-accent-hover: var(--color-clay-800);
  --color-interactive-hover: var(--color-clay-600);
}`;
