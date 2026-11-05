import styles from './TrustList.module.scss';

/**
 * The trust line beside an ask, as a short list: what a director checks
 * before booking a call (a fixed quote, an NDA, our hands off their clients),
 * a few words each behind a check mark. It replaced a two-sentence note that
 * read as one grey block under the buttons (Nov 2026). One item a line, the
 * checks in one column. `tone="band"` is for the crimson close (solid white).
 * Items come from content.ts (TRUST_ITEMS and friends).
 */
export default function TrustList({
  items,
  tone = 'ground',
  className,
}: {
  items: readonly string[];
  tone?: 'ground' | 'band';
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <ul className={[styles.list, className].filter(Boolean).join(' ')} data-tone={tone} role="list">
      {items.map((item) => (
        <li key={item} className={styles.item}>
          <svg className={styles.check} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M3.25 8.5 6.5 11.75 12.75 4.75" />
          </svg>
          {item}
        </li>
      ))}
    </ul>
  );
}
