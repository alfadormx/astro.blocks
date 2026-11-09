type LanguageLike = { code: string; basePath: string };
type I18nLike = { default: string; languages: readonly LanguageLike[] };

/** The language whose basePath matches the pathname; the default language otherwise. */
export function currentLanguage<C extends I18nLike>(
  pathname: string,
  i18n: C
): C['languages'][number] {
  const matches = (basePath: string) =>
    basePath === '/'
      ? pathname === '/'
      : pathname === basePath || pathname.startsWith(`${basePath}/`);
  return (
    i18n.languages.find((lang) => matches(lang.basePath)) ??
    i18n.languages.find((lang) => lang.code === i18n.default) ??
    i18n.languages[0]
  );
}
