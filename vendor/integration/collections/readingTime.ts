import getReadingTime from 'reading-time';

/** Whole minutes to read a Markdown body, at least 1. */
export function readingMinutes(body: string | undefined): number {
  const { minutes } = getReadingTime(body ?? '');
  return Math.max(1, Math.ceil(minutes));
}
