import Link from 'next/link';
import HoursExplorer from './HoursExplorer';
import OfficeMap from './OfficeMap';
import { ABOUT } from './content';
import styles from './Offices.module.scss';

const BRANCHES = [
  { label: 'MAPL TECH Nigeria', note: 'Lagos', href: '/nigeria' },
  { label: 'MAPL TECH Jamaica', note: 'Kingston', href: '/jamaica' },
] as const;

/**
 * The /about-us signature: where the three offices are (drawn to scale) and,
 * beside it, the instrument that turns that into an answer in the visitor's
 * own hours. The static facts (offsets, daylight saving) are server-rendered
 * text, so the answer survives without JavaScript.
 */
export default function Offices() {
  const { offices } = ABOUT;
  return (
    <section id="offices" className={styles.offices} aria-labelledby="offices-title">
      <div className={styles.inner}>
        <div className={styles.rail}>
          <h2 id="offices-title" className={styles.h2}>
            {offices.title}
          </h2>
          <p className={styles.lede}>{offices.lede}</p>
          <OfficeMap className={styles.map} />
          <p className={styles.footnote}>{offices.footnote}</p>
          <ul className={styles.branches} role="list">
            {BRANCHES.map((branch) => (
              <li key={branch.href}>
                <Link href={branch.href} className={styles.branch} data-cta-placement={`about_offices_${branch.note.toLowerCase()}`}>
                  <span className={styles.branchName}>{branch.label}</span>{' '}
                  <span className={styles.branchNote}>{branch.note}</span>
                  <span aria-hidden="true" className={styles.branchArrow}>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <HoursExplorer />
      </div>
    </section>
  );
}
