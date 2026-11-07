import Link from 'next/link';
import Arrow from '@/components/ui/Arrow';
import styles from './ResultCards.module.scss';

/** One published result, with whose it is and the case study it comes from. */
export interface ResultCardItem {
  /** The case's slug: the key, and the end of the link's analytics placement. */
  slug: string;
  /** The case study ("/our-work/lro-staffing"). */
  href: string;
  /** Whose result it is, as the case study names the client. */
  client: string;
  /** What was built, in a few plain words ("Website · Ottawa and Toronto"). */
  built: string;
  /**
   * The figure and the words written to follow it, verbatim from where they
   * are published ("~50%", "of customers now arrive through ChatGPT").
   */
  result: { value: string; label: string };
}

/**
 * Published results as cards (Nov 7, 2026; Leshan on /nigeria's ledger:
 * "sections like these seem very confusing and may not convert well"). The
 * ledger set the figure in its own column, then the client, then a meta line,
 * and only then the sentence that says what the figure is: "100 … LRO
 * Staffing" read as a score for a name. Here every card reads in one order,
 * on screen and aloud:
 *
 *   1. the result, the figure with its own words directly under it (or beside
 *      it on a wide card), one paragraph: "100 Google Lighthouse score for…";
 *   2. whose result it is and what was built: "LRO Staffing", "Website ·
 *      Ottawa and Toronto";
 *   3. one explicit way in: "Read the case study", the only link, stretched
 *      over the card so the whole card is the target (Fitts), the client's name
 *      completing it for assistive tech and the result describing it.
 *
 * Layout is by room, not by viewport: the list is a container (one card a
 * row, two from 34rem, three or four across from 68rem), each figure is sized
 * to its own card's width from the list's (cqi), so it can never run into a
 * neighbour at any width, and the cards in a row share three rows (subgrid),
 * so their rules and links line up whatever wraps. A lone card with 44rem of
 * room (a project under a feature) is one line: the figure beside its words,
 * the link at the line's end. Server Component, no client JavaScript.
 */
export default function ResultCards({
  items,
  placement,
  label,
  labelledBy,
  size = 'l',
  className,
}: {
  items: readonly ResultCardItem[];
  /** Analytics placement prefix: each link is `${placement}_${slug}`. */
  placement: string;
  /** The list's accessible name, when no heading on screen names it. */
  label?: string;
  /** The id of the heading that names the list. */
  labelledBy?: string;
  /** 'm' for a secondary list beside larger proof (smaller figures). */
  size?: 'l' | 'm';
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <div className={[styles.wrap, className].filter(Boolean).join(' ')}>
      <ul
        className={styles.list}
        role="list"
        data-count={items.length}
        data-size={size === 'l' ? undefined : size}
        aria-label={labelledBy ? undefined : label}
        aria-labelledby={labelledBy}
      >
        {items.map((item) => (
          <li key={item.slug} className={styles.card}>
            <p id={`${placement}-${item.slug}-result`} className={styles.result}>
              <span className={styles.value}>{item.result.value}</span> <span className={styles.meaning}>{item.result.label}</span>
            </p>
            <p className={styles.whose}>
              <span className={styles.client}>{item.client}</span> <span className={styles.built}>{item.built}</span>
            </p>
            {/* Described by its result, so a Tab stop or a list of links says what the study shows. */}
            <Link
              href={item.href}
              className={styles.read}
              aria-describedby={`${placement}-${item.slug}-result`}
              data-cta-placement={`${placement}_${item.slug}`}
            >
              Read the case study<span className="visually-hidden">: {item.client}</span>
              <span aria-hidden="true" className={styles.arrow}>
                <Arrow />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
