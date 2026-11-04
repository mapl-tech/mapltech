import { Fragment, type CSSProperties, type ReactNode } from 'react';

/**
 * Number-word compounds ("20-minute", "5-year-old"), en-dash ranges in price labels ("3–4",
 * "$3,500–$5,000+") and ranges in sentences ("3 to 4", "$4,000 to $12,000").
 */
const UNBREAKABLE = /(\d+-[A-Za-z]+(?:-[A-Za-z]+)*|\$?\d[\d,]*(?:–| to )\$?\d[\d,]*\+?)/g;

const NOWRAP: CSSProperties = { whiteSpace: 'nowrap' };

/**
 * The hyphen inside a capitalised name ("E-Commerce", "AI-Powered", "Multi-Client") as a
 * non-breaking hyphen (U+2011, the same glyph in DM Sans): a package name never splits across
 * lines, and every place that shows one sets the same character. All-caps names ("CHHA-NCR")
 * keep their plain hyphen, as everywhere else on the site. Display only: structured data and
 * the data itself keep the plain hyphen.
 */
export const nameHyphens = (text: string): string => text.replace(/\b([A-Z][A-Za-z]*)-(?=[A-Z][a-z])/g, '$1\u2011');

/**
 * Typography for prices and timelines in running text: wraps the pieces a
 * line must never split ("20-" / "minute", "$3,500–" / "$5,000", "$4,000 to" /
 * "$12,000") in a no-wrap span. Text without them comes back unchanged.
 */
export function keepTogether(text: string): ReactNode {
  const parts = nameHyphens(text).split(UNBREAKABLE);
  if (parts.length === 1) return parts[0];
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <span key={i} style={NOWRAP}>
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

/**
 * Number-word compounds with a non-breaking hyphen ("20‑minute"), for plain
 * string props that cannot carry a no-wrap span (the close band's lede and
 * note). Display only: structured data keeps the plain hyphen.
 */
export const keepNumberWords = (text: string): string => text.replace(/(\d)-(?=[A-Za-z])/g, '$1‑');

/**
 * A link's label with its arrow kept on the last word's line: the last word
 * and `end` (the arrow, and any visually hidden end of the link's name) share
 * a no-wrap span, so a label that wraps carries its last word down with the
 * arrow ("More about Custom Internal" / "Tools →"). The arrow never sits alone
 * on a line, and in a flex link it never drifts to the far edge of the row
 * (wrap the result in one element there, so the words and the arrow are one
 * flex item, and space the arrow with a margin, not the flex gap).
 */
export function withLastWord(label: string, end: ReactNode): ReactNode {
  const cut = label.lastIndexOf(' ');
  return (
    <>
      {cut > 0 ? label.slice(0, cut + 1) : null}
      <span style={NOWRAP}>
        {label.slice(cut + 1)}
        {end}
      </span>
    </>
  );
}
