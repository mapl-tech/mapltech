import Link from 'next/link';
import HoursExplorer from './HoursExplorer';
import OfficeMap from './OfficeMap';
import { ABOUT } from './content';
import ed from './Company.module.scss';
import styles from './Offices.module.scss';

const BRANCHES = [
  { label: 'MAPL TECH Nigeria', note: 'Lagos', href: '/nigeria' },
  { label: 'MAPL TECH Jamaica', note: 'Kingston', href: '/jamaica' },
] as const;

/**
 * The three offices: where they are (drawn to scale, arcs drawing in as the
 * figure scrolls into view) and, beside it, the instrument that turns that
 * into an answer in the visitor's own hours, with each office's live local
 * time. The static facts (offsets, daylight saving) are server-rendered
 * text, so the answer survives without JavaScript.
 */
export default function Offices() {
  const { offices } = ABOUT;
  return (
    <section id="offices" className={ed.dark} aria-labelledby="offices-title">
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{offices.label}</p>
          <h2 id="offices-title" className={ed.title}>
            {offices.title}
          </h2>
          <p className={ed.lede}>{offices.lede}</p>
        </header>

        <div className={styles.body}>
          <div className={styles.place}>
            <OfficeMap />
            <p className={styles.footnote}>{offices.footnote}</p>
            <ul className={styles.branches} role="list">
              {BRANCHES.map((branch) => (
                <li key={branch.href}>
                  <Link href={branch.href} className={styles.branch} data-cta-placement={`about_offices_${branch.note.toLowerCase()}`}>
                    <span className={styles.branchName}>{branch.label}</span>{' '}
                    <span className={styles.branchNote}>{branch.note}</span>
                    <span aria-hidden="true" className={styles.branchGo}>
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <HoursExplorer />
        </div>
      </div>
    </section>
  );
}
