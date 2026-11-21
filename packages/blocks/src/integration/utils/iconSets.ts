import fs from 'node:fs';

export const REQUIRED_ICON_SETS = ['@iconify-json/heroicons', '@iconify-json/mdi'];

export interface SitePackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

export function missingIconSets(pkg: SitePackageJson): string[] {
  const listed = { ...pkg.dependencies, ...pkg.devDependencies };
  return REQUIRED_ICON_SETS.filter((name) => !(name in listed));
}

export function readSitePackageJson(root: URL): SitePackageJson | undefined {
  try {
    return JSON.parse(fs.readFileSync(new URL('package.json', root), 'utf8'));
  } catch {
    return undefined;
  }
}
