import { Fragment, type CSSProperties, type ReactNode } from 'react';

/** Number-word compounds ("20-minute", "5-year-old") and en-dash ranges ("3–4", "$3,500–$5,000+"). */
const UNBREAKABLE = /(\d+-[A-Za-z]+(?:-[A-Za-z]+)*|\$?\d[\d,]*–\$?\d[\d,]*\+?)/g;

const NOWRAP: CSSProperties = { whiteSpace: 'nowrap' };

/**
 * Typography for prices and timelines in running text: wraps the pieces a
 * line must never split ("20-" / "minute", "$3,500–" / "$5,000") in a
 * no-wrap span. Text without them comes back unchanged.
 */
export function keepTogether(text: string): ReactNode {
  const parts = text.split(UNBREAKABLE);
  if (parts.length === 1) return text;
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
