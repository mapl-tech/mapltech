import { googleReviews } from '@/config/site';
import styles from './TrustList.module.scss';

/**
 * The trust line beside an ask, as a short list: what a director checks
 * before booking a call (a fixed quote, an NDA, our hands off their clients),
 * a few words each behind a check mark. It replaced a two-sentence note that
 * read as one grey block under the buttons (Nov 2026). One item a line, the
 * checks in one column. `tone="band"` is for the crimson close (solid white).
 * Items come from content.ts (TRUST_ITEMS and friends).
 *
 * `rating` adds the Google rating as the last line, a star in the checks'
 * column, linked to the Business Profile so anyone can read the reviews
 * (site.ts googleReviews, as the profile showed it on its `checked` date).
 * It is shown under the first ask of a page only, never in schema markup:
 * Google gives no stars for reviews a business shows on its own site.
 *
 * The list keeps its own gap from the buttons above it (TrustList.module.scss).
 */
export default function TrustList({
  items,
  tone = 'ground',
  rating = false,
  className,
}: {
  items: readonly string[];
  tone?: 'ground' | 'band';
  /** Add the Google rating, linked to the profile, as the last line. */
  rating?: boolean;
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
      {rating ? (
        <li className={styles.item}>
          <svg
            className={`${styles.check} ${styles.star}`}
            viewBox="0 0 16 16"
            width="16"
            height="16"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M8 1.5l1.94 4.13 4.53.55-3.34 3.1.87 4.47L8 11.53l-4 2.22.87-4.47-3.34-3.1 4.53-.55z" />
          </svg>
          <a
            href={googleReviews.url}
            className={styles.ratingLink}
            target="_blank"
            rel="noopener noreferrer"
            data-cta-placement="google_reviews"
          >
            Rated {googleReviews.rating} on Google from {googleReviews.count} reviews
            <span className="visually-hidden"> (opens in a new tab)</span>
          </a>
        </li>
      ) : null}
    </ul>
  );
}
