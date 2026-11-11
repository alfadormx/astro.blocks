const en = {
  readMore: 'Read more',
  minRead: (n: number) => `${n} min read`,
  updated: 'Updated',
  by: 'By',
  register: 'Register',
  past: 'Past',
  next: 'Next',
  prev: 'Previous',
  pagination: 'Pagination',
  pageOf: 'Page {current} of {last}',
  tags: 'Tags',
  results: 'Results',
};

export type EntryStrings = typeof en;

const STRINGS: Record<string, EntryStrings> = {
  en,
  es: {
    readMore: 'Leer más',
    minRead: (n: number) => `${n} min de lectura`,
    updated: 'Actualizado',
    by: 'Por',
    register: 'Inscribirse',
    past: 'Pasado',
    next: 'Siguiente',
    prev: 'Anterior',
    pagination: 'Paginación',
    pageOf: 'Página {current} de {last}',
    tags: 'Etiquetas',
    results: 'Resultados',
  },
};

/** Block UI strings for `langCode`, falling back to English. */
export function entryStrings(langCode?: string): EntryStrings {
  return (langCode && STRINGS[langCode]) || en;
}

/** Replaces `{current}` and `{last}` in a pager status template. */
export function pageStatus(template: string, current: number, last: number): string {
  return template.replace('{current}', String(current)).replace('{last}', String(last));
}
