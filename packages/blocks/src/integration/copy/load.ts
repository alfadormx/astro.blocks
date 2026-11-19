import fs from 'node:fs';
import path from 'node:path';
import { load } from 'js-yaml';

export interface CopyWarning {
  file: string;
  /** Dotted key path missing from `file`; empty when the whole file is missing. */
  keyPath: string;
}

const isObject = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v);

/** Deep-merges `lang` over `base`. Arrays and scalars come whole from `lang` when present, else from `base` with a warning. */
export function mergeCopy(
  base: unknown,
  lang: unknown,
  file: string,
  keyPath: string[] = []
): { value: unknown; warnings: CopyWarning[] } {
  if (lang === undefined) {
    return { value: base, warnings: [{ file, keyPath: keyPath.join('.') }] };
  }
  if (!isObject(base)) return { value: lang, warnings: [] };
  if (!isObject(lang)) return { value: base, warnings: [{ file, keyPath: keyPath.join('.') }] };

  const value: Record<string, unknown> = {};
  const warnings: CopyWarning[] = [];
  for (const [key, baseValue] of Object.entries(base)) {
    const merged = mergeCopy(baseValue, lang[key], file, [...keyPath, key]);
    value[key] = merged.value;
    warnings.push(...merged.warnings);
  }
  return { value, warnings };
}

const MD_REF = /^\.\/[\w./-]+\.md$/;

/** Replaces `./name.md` strings with that file's contents, resolved relative to `dir`. */
export function resolveMdRefs(value: unknown, dir: string, read: (p: string) => string): unknown {
  if (typeof value === 'string') return MD_REF.test(value) ? read(path.join(dir, value)) : value;
  if (Array.isArray(value)) return value.map((v) => resolveMdRefs(v, dir, read));
  if (isObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, resolveMdRefs(v, dir, read)])
    );
  }
  return value;
}

/** Copy per page and language from `<root>/<page>/<lang>.yaml`; the default language defines the keys. */
export function loadCopy(
  root: string,
  languages: string[],
  defaultLang: string
): {
  copy: Record<string, Record<string, unknown>>;
  warnings: CopyWarning[];
  files: string[];
} {
  const copy: Record<string, Record<string, unknown>> = {};
  const warnings: CopyWarning[] = [];
  const files: string[] = [];
  if (!fs.existsSync(root)) return { copy, warnings, files };

  const read = (file: string) => {
    files.push(file);
    return fs.readFileSync(file, 'utf8');
  };
  const readYaml = (file: string) =>
    resolveMdRefs(load(read(file)) ?? {}, path.dirname(file), read);

  const pages = fs.readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory());
  for (const { name: page } of pages) {
    const dir = path.join(root, page);
    const baseFile = path.join(dir, `${defaultLang}.yaml`);
    if (!fs.existsSync(baseFile)) {
      throw new Error(`Copy for "${page}" needs ${baseFile}, which defines its keys`);
    }
    const base = readYaml(baseFile);
    copy[page] = { [defaultLang]: base };
    for (const lang of languages.filter((l) => l !== defaultLang)) {
      const file = path.join(dir, `${lang}.yaml`);
      if (!fs.existsSync(file)) {
        copy[page][lang] = base;
        warnings.push({ file, keyPath: '' });
        continue;
      }
      const merged = mergeCopy(base, readYaml(file), file);
      copy[page][lang] = merged.value;
      warnings.push(...merged.warnings);
    }
  }
  return { copy, warnings, files };
}
