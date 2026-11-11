import type { AstroGlobal } from 'astro';
import type { z } from 'astro/zod';
import { getCollection, render, type CollectionKey } from 'astro:content';
import { COLLECTIONS, I18N, SITE } from 'site-config';
import type { CollectionListEntry, CollectionListPage } from '~/types/collectionlist.types';
import type { MetaData } from '~/types/metadata.types';
import type { CaseStudyLayoutProps } from '~/types/casestudylayout.types';
import type { EventLayoutProps } from '~/types/eventlayout.types';
import type { PostLayoutProps } from '~/types/postlayout.types';
import type { CollectionSettings, PresetName } from '../utils/configBuilder';
import {
  assertNoReservedSlug,
  entryAlternates,
  entryUrl,
  filterDrafts,
  isPast,
  linkEntries,
  listAlternates,
  listUrl,
  paginate,
  sortEntries,
  type LinkedEntry,
} from './paths';
import type { PresetSchemas } from './presets';
import { readingMinutes } from './readingTime';

export type CollectionName = keyof AstroBlocks.CollectionRegistry;
type PresetOf<N extends CollectionName> = AstroBlocks.CollectionRegistry[N] & PresetName;
type PresetData = { [P in PresetName]: z.output<PresetSchemas[P]> };

export interface BlocksEntry<P extends PresetName = PresetName> {
  id: string;
  body?: string;
  data: PresetData[P];
}

interface LayoutByPreset {
  post: PostLayoutProps;
  caseStudy: CaseStudyLayoutProps;
  event: EventLayoutProps;
}

export interface ListProps {
  langCode: string;
  collection: CollectionName;
  pageNumber: number;
}

export interface EntryProps {
  langCode: string;
  collection: CollectionName;
  key: string;
}

type Lang = (typeof I18N.languages)[number];

const langParam = (lang: Lang) =>
  lang.basePath === '/' ? undefined : lang.basePath.replace(/^\//, '');

// One build sees one `now`, so list order and "Past" badges agree across pages.
const BUILD_NOW = new Date();

function settingsOf(name: string): CollectionSettings & { route: string } {
  const settings = COLLECTIONS.entries[name];
  if (!settings) throw new Error(`Collection "${name}" is not declared in config.yaml`);
  return { ...settings, route: settings.route ?? `/${name}` };
}

async function linked(name: string): Promise<LinkedEntry<BlocksEntry>[]> {
  const entries = (await getCollection(name as CollectionKey)) as unknown as BlocksEntry[];
  const all = linkEntries(filterDrafts(entries, import.meta.env.PROD), I18N.default);
  assertNoReservedSlug(all, name);
  return sortEntries(all, settingsOf(name).sort, BUILD_NOW);
}

const inLang = <E extends LinkedEntry<BlocksEntry>>(all: E[], code: string) =>
  all.filter((l) => l.langCode === code);

function pagesFor(name: string, all: LinkedEntry<BlocksEntry>[], lang: Lang) {
  const { route, pageSize } = settingsOf(name);
  return paginate(inLang(all, lang.code), pageSize, (n) =>
    listUrl(lang.basePath, route, n, SITE.trailingSlash ?? false)
  );
}

/** URL of a collection's first list page in `langCode`, from its `route` in config.yaml. */
export function collectionUrl(name: CollectionName, langCode: string): string {
  const lang =
    I18N.languages.find((l: Lang) => l.code === langCode) ??
    I18N.languages.find((l: Lang) => l.code === I18N.default)!;
  return listUrl(lang.basePath, settingsOf(name).route, 1, SITE.trailingSlash ?? false);
}

/** `getStaticPaths` for `[...page].astro`: one path per language per list page. */
export async function collectionPages(name: CollectionName) {
  const all = await linked(name);
  return I18N.languages.flatMap((lang: Lang) =>
    pagesFor(name, all, lang).map(({ param, page }) => ({
      params: { lang: langParam(lang), page: param },
      props: { langCode: lang.code, collection: name, pageNumber: page.currentPage } as ListProps,
    }))
  );
}

/** `getStaticPaths` for `[slug].astro`: one path per entry per language it is written in. */
export async function collectionEntries(name: CollectionName) {
  const all = await linked(name);
  return I18N.languages.flatMap((lang: Lang) =>
    inLang(all, lang.code).map((l) => ({
      params: { lang: langParam(lang), slug: l.slug },
      props: { langCode: lang.code, collection: name, key: l.key } as EntryProps,
    }))
  );
}

const eventZone = (data: PresetData['event']) => data.timezone ?? COLLECTIONS.timezone ?? 'UTC';

function imageOf(cover: { src: string; alt: string } | undefined) {
  return cover ? { src: cover.src, alt: cover.alt } : undefined;
}

function toCardEntry(name: string, l: LinkedEntry<BlocksEntry>): CollectionListEntry {
  const { preset, route } = settingsOf(name);
  const data = l.entry.data;
  const base = {
    headline: { title: data.title },
    href: entryUrl(
      I18N.languages.find((lang: Lang) => lang.code === l.langCode)?.basePath ?? '/',
      route,
      l.slug,
      SITE.trailingSlash ?? false
    ),
    description: data.description,
    image: imageOf(data.cover),
    tags: data.tags,
    langCode: l.langCode,
  };
  switch (preset) {
    case 'post': {
      const post = data as PresetData['post'];
      return { preset, ...base, date: post.date, readingTime: readingMinutes(l.entry.body) };
    }
    case 'caseStudy': {
      const study = data as PresetData['caseStudy'];
      return { preset, ...base, client: study.client };
    }
    case 'event': {
      const event = data as PresetData['event'];
      return {
        preset,
        ...base,
        start: event.start,
        end: event.end,
        timezone: eventZone(event),
        location: event.location,
        past: isPast(l.entry, BUILD_NOW),
      };
    }
  }
}

/** Entries and pager for the current list page; also fills the language toggle's alternates. */
export async function renderList(
  astro: AstroGlobal
): Promise<{ langCode: string; entries: CollectionListEntry[]; page: CollectionListPage }> {
  const { langCode, collection, pageNumber } = astro.props as ListProps;
  const all = await linked(collection);
  const lang = I18N.languages.find((l: Lang) => l.code === langCode)!;
  const pages = pagesFor(collection, all, lang);
  const current = pages[pageNumber - 1];

  const lastPageByLang = Object.fromEntries(
    I18N.languages.map((l: Lang) => [l.code, pagesFor(collection, all, l).length])
  );
  astro.locals.blocksAlternates = listAlternates(
    pageNumber,
    lastPageByLang,
    I18N.languages,
    settingsOf(collection).route,
    SITE.trailingSlash ?? false
  );

  return {
    langCode,
    entries: current.items.map((l) => toCardEntry(collection, l)),
    page: {
      currentPage: current.page.currentPage,
      lastPage: current.page.lastPage,
      url: { prev: current.page.url.prev, next: current.page.url.next },
    },
  };
}

function toLayout(
  name: string,
  l: LinkedEntry<BlocksEntry>,
  readingTime: number
): PostLayoutProps | CaseStudyLayoutProps | EventLayoutProps {
  const { preset } = settingsOf(name);
  const data = l.entry.data;
  const base = {
    headline: { title: data.title },
    image: imageOf(data.cover),
    tags: data.tags,
    langCode: l.langCode,
  };
  switch (preset) {
    case 'post': {
      const post = data as PresetData['post'];
      return {
        ...base,
        date: post.date,
        updated: post.updated,
        author: post.author,
        readingTime,
      } satisfies PostLayoutProps;
    }
    case 'caseStudy': {
      const study = data as PresetData['caseStudy'];
      return {
        ...base,
        client: study.client,
        date: study.date,
        results: study.results,
        location: study.location,
      } satisfies CaseStudyLayoutProps;
    }
    case 'event': {
      const event = data as PresetData['event'];
      return {
        ...base,
        start: event.start,
        end: event.end,
        timezone: eventZone(event),
        location: event.location,
        registrationUrl: event.registrationUrl,
      } satisfies EventLayoutProps;
    }
  }
}

function metadataOf(preset: PresetName, data: BlocksEntry['data']): Partial<MetaData> {
  const image = data.ogImage ?? data.cover;
  const post = preset === 'post' ? (data as PresetData['post']) : undefined;
  return {
    title: { default: data.title },
    description: data.description,
    openGraph: {
      type: post ? 'article' : 'website',
      description: data.description,
      ...(image ? { images: [{ url: image.src, alt: image.alt }] } : {}),
      ...(post
        ? {
            article: {
              publishedTime: post.date.toISOString(),
              modifiedTime: post.updated?.toISOString(),
              authors: post.author ? [post.author] : undefined,
              tags: post.tags,
            },
          }
        : {}),
    },
  };
}

/** The current entry, its rendered body, layout props and metadata; also fills the alternates. */
export async function renderEntry<N extends CollectionName>(astro: AstroGlobal, _name?: N) {
  const { langCode, collection, key } = astro.props as EntryProps;
  const all = await linked(collection);
  const current = all.find((l) => l.key === key && l.langCode === langCode);
  if (!current) throw new Error(`No entry "${key}" in ${langCode} for collection "${collection}"`);

  const { preset, route } = settingsOf(collection);
  const { Content } = await render(current.entry as never);
  const readingTime = readingMinutes(current.entry.body);

  astro.locals.blocksAlternates = entryAlternates(
    key,
    all,
    I18N.languages,
    route,
    SITE.trailingSlash ?? false
  );

  return {
    entry: current.entry as BlocksEntry<PresetOf<N>>,
    Content,
    langCode,
    readingTime,
    layout: toLayout(collection, current, readingTime) as LayoutByPreset[PresetOf<N>],
    metadata: metadataOf(preset, current.entry.data),
  };
}

/** Up to `n` featured entries in `langCode`, as list entries for CollectionList. */
export async function getFeatured(
  name: CollectionName,
  n: number,
  langCode: string
): Promise<CollectionListEntry[]> {
  const all = await linked(name);
  return inLang(all, langCode)
    .filter((l) => l.entry.data.featured)
    .slice(0, n)
    .map((l) => toCardEntry(name, l));
}
