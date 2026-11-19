type LanguageLike = { code: string; locale: string };
type I18nLike = { default: string; languages: readonly LanguageLike[] };

export function formatDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/** The configured locale for `langCode`, else the default language's. */
export function localeFor(langCode: string | undefined, i18n: I18nLike): string {
  const find = (code: string | undefined) => i18n.languages.find((l) => l.code === code);
  return (find(langCode) ?? find(i18n.default) ?? i18n.languages[0])?.locale ?? 'en-US';
}

const dayKey = (date: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone, dateStyle: 'short' }).format(date);

/** Same day: `date, start–end time zone`; otherwise both date-times. Times show the zone name. */
export function formatEventRange(
  start: Date,
  end: Date | undefined,
  locale: string,
  timeZone: string
): string {
  const dateTime = new Intl.DateTimeFormat(locale, {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  if (!end) return `${dateTime.format(start)} ${zoneName(start, locale, timeZone)}`;
  if (dayKey(start, timeZone) === dayKey(end, timeZone)) {
    const time = new Intl.DateTimeFormat(locale, { timeZone, timeStyle: 'short' });
    const date = new Intl.DateTimeFormat(locale, { timeZone, dateStyle: 'medium' });
    return `${date.format(start)}, ${time.format(start)}–${time.format(end)} ${zoneName(end, locale, timeZone)}`;
  }
  return `${dateTime.format(start)} – ${dateTime.format(end)} ${zoneName(end, locale, timeZone)}`;
}

function zoneName(date: Date, locale: string, timeZone: string): string {
  return (
    new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'short' })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value ?? timeZone
  );
}
