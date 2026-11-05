import { readFileSync } from 'node:fs';
import { load } from 'js-yaml';
import { homeCopy } from '../../src/data/home';

interface Language {
  code: string;
  basePath: string;
  direction: 'ltr' | 'rtl';
}

const config = load(readFileSync(new URL('../../src/config.yaml', import.meta.url), 'utf8')) as {
  i18n: { languages: Language[] };
};

export const locales = config.i18n.languages.filter((lang) => homeCopy[lang.code]);
export const localePaths = locales.map((lang) => lang.basePath);
