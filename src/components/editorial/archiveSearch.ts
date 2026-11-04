/**
 * The blog archive's search, in one place. The archive (BlogArchive) filters
 * its rows with it, and the 404 (NotFoundHint) counts with it before it offers
 * a blog search, so the search the 404 offers finds exactly what /blog then
 * shows. No imports: the 404's hint ships with every page, so this stays tiny.
 *
 * - Text and queries are lower-cased and accent-free.
 * - A word matches where a word of the text starts ("ai" finds "AI agents",
 *   not "maintain"; "access" still finds "accessibility" as you type).
 * - A query matches a text when every one of its words does.
 */

/** Lower-cased, accent-free text, as the archive searches it. */
export function searchable(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** A query's words, normalised like the text they are matched against. */
export function wordsOf(query: string): string[] {
  return searchable(query).split(/\s+/).filter(Boolean);
}

/** The term begins a word of the text (both already `searchable`). */
export function startsWord(text: string, term: string): boolean {
  for (let at = text.indexOf(term); at !== -1; at = text.indexOf(term, at + 1)) {
    if (at === 0 || !/[a-z0-9]/.test(text[at - 1])) return true;
  }
  return false;
}

/** Every word of the query begins a word of the text. */
export function matchesWords(text: string, words: readonly string[]): boolean {
  return words.every((word) => startsWord(text, word));
}

/** An article's search text: its title, its one-line answer and its topic, as its archive row shows them. */
export function archiveText(title: string, answer: string, topic: string): string {
  return searchable(`${title} ${answer} ${topic}`);
}
