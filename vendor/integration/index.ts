import fs from 'node:fs';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import type { AstroConfig, AstroIntegration } from 'astro';

import configBuilder, { type CollectionsConfig, type Config } from './utils/configBuilder';
import loadConfig from './utils/loadConfig';
import { collectionRegistryDts } from './collections/registry';
import { collectionsWithoutEntryPages } from './collections/routes';
import { copyRegistryDts } from './copy/infer';
import { loadCopy } from './copy/load';

export default ({ config: _themeConfig = 'src/config.yaml' } = {}): AstroIntegration => {
  let cfg: AstroConfig;
  let collections: CollectionsConfig = { entries: {} };
  let languageBasePaths: string[] = ['/'];
  let copyDts = copyRegistryDts({}, 'en');
  return {
    name: 'site-config',

    hooks: {
      'astro:config:setup': async ({ config, logger, updateConfig, addWatchFile }) => {
        const buildLogger = logger.fork('site-config');

        const virtualModuleId = 'site-config';
        const resolvedVirtualModuleId = '\0' + virtualModuleId;
        const copyModuleId = 'site-copy';
        const resolvedCopyModuleId = '\0' + copyModuleId;

        const rawJsonConfig = (await loadConfig(_themeConfig)) as Config;
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
          buildLogger.warn(
            keyPath
              ? `Copy key "${keyPath}" missing in ${relative(file)}; using ${I18N.default}`
              : `Copy file ${relative(file)} missing; using ${I18N.default}`
          );
        }
        for (const file of files) addWatchFile(file);
        copyDts = copyRegistryDts(copy, I18N.default);

        updateConfig({
          site: SITE.site,
          base: SITE.base,

          trailingSlash: SITE.trailingSlash ? 'always' : 'never',

          vite: {
            plugins: [
              {
                name: 'vite-plugin-site-config',
                resolveId(id) {
                  if (id === virtualModuleId) {
                    return resolvedVirtualModuleId;
                  }
                  if (id === copyModuleId) {
                    return resolvedCopyModuleId;
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
                  return null;
                },
              },
            ],
          },
        });

        if (typeof _themeConfig === 'string') {
          addWatchFile(new URL(_themeConfig, config.root));

          buildLogger.info(`Site config \`${_themeConfig}\` has been loaded.`);
        } else {
          buildLogger.info(`Site config has been loaded.`);
        }
      },
      'astro:config:done': async ({ config, injectTypes }) => {
        cfg = config;
        injectTypes({ filename: 'collections.d.ts', content: collectionRegistryDts(collections) });
        injectTypes({ filename: 'copy.d.ts', content: copyDts });
      },
      'astro:build:done': async ({ logger, pages }) => {
        const buildLogger = logger.fork('site-config');
        for (const [name, route] of collectionsWithoutEntryPages(
          collections,
          languageBasePaths,
          pages.map((p) => p.pathname)
        )) {
          buildLogger.warn(
            `Collection "${name}" has route "${route}" but no page generated its entry URLs`
          );
        }
        buildLogger.info('Updating `robots.txt` with `sitemap-index.xml` ...');

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
};
