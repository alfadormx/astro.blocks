import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import type { AstroConfig, AstroIntegration } from 'astro';
import icon from 'astro-icon';

import { shikiConfig } from '#utils/codeHighlight';

import configBuilder, { type CollectionsConfig, type Config } from './utils/configBuilder';
import loadConfig from './utils/loadConfig';
import { collectionRegistryDts } from './collections/registry';
import { collectionsWithoutEntryPages } from './collections/routes';
import { copyRegistryDts } from './copy/infer';
import { loadCopy } from './copy/load';

// Deps reached only via dynamic import are discovered late; Vite then reloads the page mid-test.
const THREE_DEPS = [
  'three',
  'three/addons/controls/OrbitControls.js',
  'three/addons/loaders/GLTFLoader.js',
  'three/addons/loaders/HDRLoader.js',
  'three/addons/environments/RoomEnvironment.js',
  'three/addons/postprocessing/EffectComposer.js',
  'three/addons/postprocessing/RenderPass.js',
  'three/addons/postprocessing/UnrealBloomPass.js',
  'three/addons/postprocessing/OutputPass.js',
  'three/addons/postprocessing/ShaderPass.js',
];

export interface BlocksOptions {
  /** Site config YAML, relative to the project root. */
  config?: string;
  /** The site's Tailwind root stylesheet, relative to the project root. It must `@import` the library CSS. Defaults to the library CSS alone. */
  css?: string;
}

const LIBRARY_CSS = fileURLToPath(new URL('../styles/blocks.css', import.meta.url));
const VIRTUAL_MODULE_TYPES = fileURLToPath(new URL('./types.d.ts', import.meta.url));

export default function blocks({
  config: configPath = 'src/config.yaml',
  css,
}: BlocksOptions = {}): AstroIntegration {
  let cfg: AstroConfig;
  let collections: CollectionsConfig = { entries: {} };
  let languageBasePaths: string[] = ['/'];
  let copyDts = copyRegistryDts({}, 'en');
  return {
    name: 'astro-blocks',

    hooks: {
      'astro:config:setup': async ({ config, logger, updateConfig, addWatchFile }) => {
        const virtualModuleId = 'site-config';
        const resolvedVirtualModuleId = '\0' + virtualModuleId;
        const copyModuleId = 'site-copy';
        const resolvedCopyModuleId = '\0' + copyModuleId;
        const imagesModuleId = 'site-images';
        const resolvedImagesModuleId = '\0' + imagesModuleId;
        const stylesModuleId = 'site-styles';
        const resolvedStylesModuleId = '\0' + stylesModuleId;
        const cssFile = css ? fileURLToPath(new URL(css, config.root)) : LIBRARY_CSS;

        const configFile = fileURLToPath(new URL(configPath, config.root));
        const rawJsonConfig = (await loadConfig(configFile)) as Config;
        const { SITE, I18N, METADATA, ANALYTICS, COLLECTIONS } = configBuilder(rawJsonConfig);
        collections = COLLECTIONS;
        languageBasePaths = I18N.languages.map((l) => l.basePath);

        const copyRoot = fileURLToPath(new URL('src/copy/', config.root));
        const { copy, warnings, files } = loadCopy(
          copyRoot,
          I18N.languages.map((l) => l.code),
          I18N.default
        );
        const relative = (file: string) => file.replace(fileURLToPath(config.root), '');
        for (const { file, keyPath } of warnings) {
          logger.warn(
            keyPath
              ? `Copy key "${keyPath}" missing in ${relative(file)}; using ${I18N.default}`
              : `Copy file ${relative(file)} missing; using ${I18N.default}`
          );
        }
        for (const file of files) addWatchFile(file);
        copyDts = copyRegistryDts(copy, I18N.default);

        const registered = (name: string) => config.integrations.some((i) => i.name === name);
        const hasTailwind = ((config.vite.plugins ?? []) as unknown[])
          .flat(Infinity)
          .some(
            (p) =>
              !!p &&
              typeof p === 'object' &&
              'name' in p &&
              String(p.name).startsWith('@tailwindcss/vite')
          );

        updateConfig({
          site: SITE.site,
          base: SITE.base,

          trailingSlash: SITE.trailingSlash ? 'always' : 'never',

          integrations: [
            ...(registered('@astrojs/mdx') ? [] : [mdx()]),
            ...(registered('astro-icon') ? [] : [icon()]),
          ],
          markdown: { shikiConfig },

          vite: {
            optimizeDeps: { include: THREE_DEPS },
            plugins: [
              ...(hasTailwind ? [] : [tailwindcss()]),
              {
                name: 'vite-plugin-site-config',
                resolveId(id) {
                  if (id === virtualModuleId) {
                    return resolvedVirtualModuleId;
                  }
                  if (id === copyModuleId) {
                    return resolvedCopyModuleId;
                  }
                  if (id === imagesModuleId) {
                    return resolvedImagesModuleId;
                  }
                  if (id === stylesModuleId) {
                    return resolvedStylesModuleId;
                  }
                  return null;
                },
                load(id) {
                  if (id === resolvedVirtualModuleId) {
                    return (
                      `export const SITE = ${JSON.stringify(SITE)};` +
                      `export const I18N = ${JSON.stringify(I18N)};` +
                      `export const METADATA = ${JSON.stringify(METADATA)};` +
                      `export const ANALYTICS = ${JSON.stringify(ANALYTICS)};` +
                      `export const COLLECTIONS = ${JSON.stringify(COLLECTIONS)};`
                    );
                  }
                  if (id === resolvedCopyModuleId) {
                    return `export const COPY = ${JSON.stringify(copy)};`;
                  }
                  if (id === resolvedImagesModuleId) {
                    return `export default import.meta.glob('/src/assets/images/**/*.{jpeg,jpg,png,tiff,webp,gif,svg,JPEG,JPG,PNG,TIFF,WEBP,GIF,SVG}');`;
                  }
                  if (id === resolvedStylesModuleId) {
                    return `import ${JSON.stringify(cssFile)};`;
                  }
                  return null;
                },
              },
            ],
          },
        });

        addWatchFile(configFile);
        logger.info(`Site config \`${configPath}\` has been loaded.`);
      },
      'astro:config:done': async ({ config, injectTypes }) => {
        cfg = config;
        injectTypes({
          filename: 'virtual.d.ts',
          content: `/// <reference path=${JSON.stringify(VIRTUAL_MODULE_TYPES)} />`,
        });
        injectTypes({ filename: 'collections.d.ts', content: collectionRegistryDts(collections) });
        injectTypes({ filename: 'copy.d.ts', content: copyDts });
      },
      'astro:build:done': async ({ logger, pages }) => {
        for (const [name, route] of collectionsWithoutEntryPages(
          collections,
          languageBasePaths,
          pages.map((p) => p.pathname)
        )) {
          logger.warn(
            `Collection "${name}" has route "${route}" but no page generated its entry URLs`
          );
        }
        logger.info('Updating `robots.txt` with `sitemap-index.xml` ...');

        try {
          const outDir = cfg.outDir;
          const publicDir = cfg.publicDir;
          const sitemapName = 'sitemap-index.xml';
          const sitemapFile = new URL(`client/${sitemapName}`, outDir);
          const robotsTxtFile = new URL('robots.txt', publicDir);
          const robotsTxtFileInOut = new URL('client/robots.txt', outDir);

          const hasIntegration =
            Array.isArray(cfg?.integrations) &&
            cfg.integrations?.find((e) => e?.name === '@astrojs/sitemap') !== undefined;
          const sitemapExists = fs.existsSync(sitemapFile);

          if (hasIntegration && sitemapExists) {
            const robotsTxt = fs.readFileSync(robotsTxtFile, { encoding: 'utf8', flag: 'a+' });
            const sitemapUrl = new URL(sitemapName, String(new URL(cfg.base, cfg.site)));
            const pattern = /^Sitemap:(.*)$/m;

            if (!pattern.test(robotsTxt)) {
              fs.writeFileSync(
                robotsTxtFileInOut,
                `${robotsTxt}${os.EOL}${os.EOL}Sitemap: ${sitemapUrl}`,
                {
                  encoding: 'utf8',
                  flag: 'w',
                }
              );
            } else {
              fs.writeFileSync(
                robotsTxtFileInOut,
                robotsTxt.replace(pattern, `Sitemap: ${sitemapUrl}`),
                {
                  encoding: 'utf8',
                  flag: 'w',
                }
              );
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          /* empty */
        }
      },
    },
  };
}
