export const configExample = `collections:
  timezone: 'Europe/Madrid'
  posts:  { preset: post,      route: /blog, pageSize: 9 }
  cases:  { preset: caseStudy, route: /work }
  events: { preset: event,     route: /events }`;

export const stubExample = `import { defineBlocksCollections } from '../vendor/integration/collections/define';

export const collections = defineBlocksCollections();`;

export const folderExample = `src/content/posts/
  en/hello-world.md
  es/hello-world.md     ← same file name: the Spanish translation
  en/english-only.md    ← no es file: hidden in Spanish`;

export const frontMatterExample = `---
title: Hola, mundo
description: Por qué la librería incluye colecciones Markdown.
date: 2026-10-01
slug: hola-mundo        # optional: the URL segment in this language
tags: [anuncio]
draft: true             # optional: left out of production builds
cover:
  src: ~/assets/images/cover.webp
  alt: Describe the image
---`;

export const listPage = `---
import Layout from '~/layouts/Layout.astro';
import Header from '~/components/blocks/composite/Header.astro';
import Footer from '~/components/blocks/composite/Footer.astro';
import Container from '~/components/blocks/layout/Container.astro';
import CollectionList from '~/components/blocks/composite/CollectionList.astro';
import { collectionPages, renderList } from '…/vendor/integration/collections/pages';

export const getStaticPaths = () => collectionPages('posts');
const { langCode, entries, page } = await renderList(Astro);
---

<Layout langCode={langCode} metadata={{ title: { default: 'Blog' } }}>
  <Header themeToggle={{}} />
  <Container>
    <CollectionList entries={entries} page={page} langCode={langCode} />
  </Container>
  <Footer languageToggle={{}} />
</Layout>`;

export const entryPage = `---
import Layout from '~/layouts/Layout.astro';
import Header from '~/components/blocks/composite/Header.astro';
import Footer from '~/components/blocks/composite/Footer.astro';
import Container from '~/components/blocks/layout/Container.astro';
import PostLayout from '~/components/blocks/composite/PostLayout.astro';
import { collectionEntries, renderEntry } from '…/vendor/integration/collections/pages';

export const getStaticPaths = () => collectionEntries('posts');
const { Content, langCode, layout, metadata } = await renderEntry(Astro, 'posts');
---

<Layout langCode={langCode} metadata={metadata}>
  <Header themeToggle={{}} />
  <Container>
    <PostLayout {...layout}><Content /></PostLayout>
  </Container>
  <Footer languageToggle={{}} />
</Layout>`;

export const copyFolder = `src/copy/home/
  en.yaml           ← the default language defines the keys and their types
  es.yaml           ← missing keys fall back to en, with a build warning
  intro.md          ← referenced from a YAML value as ./intro.md`;

export const copyPage = `---
import { localizedPaths, useCopy } from '…/vendor/integration/copy/pages';

export const getStaticPaths = () => localizedPaths();
const { langCode, copy } = useCopy(Astro, 'home');
---

<Layout langCode={langCode} metadata={{ title: { default: copy.pageTitle } }}>
  <Hero headline={{ title: copy.hero.title }} />
  <Footer disclaimer={copy.footerDisclaimer} />
</Layout>`;

export const nativeExample = `import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { defineBlocksCollections } from '../vendor/integration/collections/define';

export const collections = {
  ...defineBlocksCollections(),
  notes: defineCollection({
    loader: glob({ base: 'src/content/notes', pattern: '**/*.{md,mdx}' }),
    schema: z.object({ title: z.string() }),
  }),
};`;
