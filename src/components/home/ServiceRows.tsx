import Link from 'next/link';
import type { ServiceRow } from './data';
import styles from './ServiceRows.module.scss';

/**
 * 04 Services: four editorial rows (no card grid). Each row is one link
 * (stretched over the row), carries `data-cursor="view"` for the cursor pill
 * and shows an always-visible "View" chip on touch devices.
 */
export default function ServiceRows({ rows }: { rows: readonly ServiceRow[] }) {
  return (
    <ul className={styles.rows}>
      {rows.map((row, i) => (
        <li key={row.slug} className={styles.row} data-cursor="view">
          <span className={styles.index} aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className={styles.title}>
            <Link href={row.href} className={styles.link}>
              {row.name}
            </Link>
          </h3>
          <p className={styles.situation}>{row.situation}</p>
          <p className={styles.stack}>{row.stack.join(' · ')}</p>
          <p className={styles.price}>
            from <span className="mono">{row.startingPrice}</span>
          </p>
          <span className={styles.affordance} aria-hidden="true">
            <span className={styles.chip}>View</span>
            <svg className={styles.arrow} viewBox="0 0 24 24" focusable="false">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </li>
      ))}
    </ul>
  );
}
