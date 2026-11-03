import type { ReactNode } from 'react';
import styles from './PriceList.module.scss';

interface PriceGroupProps {
  /** The row's anchor (#web-development, #bundles, #hourly), also the JSON-LD node ids. */
  id: string;
  title: string;
  /** "From $5,000": the row's answer, beside its name. */
  from: string;
  /** "4 packages", "2 rates". */
  meta: string;
  children: ReactNode;
}

/**
 * One row of the price list: a native <details>, closed on first paint at
 * every width. The summary carries the name (the row's h3), the starting
 * price and how many packages it holds; the body is the full schedule, in the
 * HTML either way. Motion comes from the global accordion hooks
 * (styles/_motion.scss): height on ::details-content, the red rule on open.
 */
export default function PriceGroup({ id, title, from, meta, children }: PriceGroupProps) {
  return (
    <details id={id} className={`${styles.group} accordion-item`}>
      <summary className={`${styles.groupSummary} accordion-summary`}>
        <h3 id={`${id}-title`} className={styles.groupTitle}>
          {title}
        </h3>
        <span className={styles.groupFrom}>{from}</span>
        <span className={styles.groupMeta}>{meta}</span>
        <span className={styles.groupIcon} aria-hidden="true" />
      </summary>
      <div className={styles.groupBody}>{children}</div>
    </details>
  );
}
