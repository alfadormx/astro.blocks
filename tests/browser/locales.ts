import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';

interface Language {
  code: string;
  basePath: string;
  direction: 'ltr' | 'rtl';
}

const config = load(readFileSync(new URL('../../src/config.yaml', import.meta.url), 'utf8')) as {
  i18n: { languages: Language[] };
};

export const locales = config.i18n.languages;
export const localePaths = locales.map((lang) => lang.basePath);
