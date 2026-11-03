import Link from 'next/link';
import type { OfficeCity } from './OfficeMap';
import OfficeNow from './OfficeNow';
import styles from './OfficeList.module.scss';

interface OfficeRow {
  city: OfficeCity;
  country: string;
  timeZone: string;
  /** How the office's clock sits against Toronto's (the published offsets). */
  note: string;
  href: string;
  linkLabel: string;
}

/**
 * The three offices in site order (Toronto, Lagos, Kingston). Lagos keeps West Africa Time
 * all year; Kingston keeps Eastern Standard Time all year (no daylight
 * saving), so both move against Toronto when Toronto changes its clocks.
 */
const OFFICE_ROWS: readonly OfficeRow[] = [
  { city: 'Toronto', country: 'Canada', timeZone: 'America/Toronto', note: 'Our headquarters', href: '/about-us', linkLabel: 'About MAPL TECH' },
  {
    city: 'Lagos',
    country: 'Nigeria',
    timeZone: 'Africa/Lagos',
    note: '5\u00a0hours ahead of Toronto in summer, 6\u00a0in winter',
    href: '/nigeria',
    linkLabel: 'MAPL TECH Nigeria',
  },
  {
    city: 'Kingston',
    country: 'Jamaica',
    timeZone: 'America/Jamaica',
    note: 'Same time as Toronto in winter, 1\u00a0hour behind in summer',
    href: '/jamaica',
    linkLabel: 'MAPL TECH Jamaica',
  },
];

export interface OfficeListProps {
  /** Accessible name for the list. */
  label: string;
  /** The office this page is about: listed first. */
  focus?: OfficeCity;
  /** The current page's path: that office gets no link to itself. */
  current: string;
  /** `<page>_<slot>` prefix for the links' data-cta-placement. */
  placement: string;
}

/**
 * The three offices as a ruled list: city, country and how its clock sits
 * against Toronto's, the live local time with whether the office is open (and
 * when that changes), and a link to the office's own page. Server Component;
 * only the clocks hydrate.
 */
export default function OfficeList({ label, focus, current, placement }: OfficeListProps) {
  const rows = focus ? [...OFFICE_ROWS].sort((a, b) => Number(b.city === focus) - Number(a.city === focus)) : OFFICE_ROWS;
  return (
    <div className={styles.wrap}>
      <ul className={styles.list} role="list" aria-label={label}>
        {rows.map((row) => (
          <li key={row.city} className={styles.row}>
            <h3 className={styles.city}>{row.city}</h3>
            <p className={styles.note}>
              {row.country} · {row.note}
            </p>
            <OfficeNow timeZone={row.timeZone} />
            {row.href !== current ? (
              <Link href={row.href} className={styles.link} data-cta-placement={`${placement}_${row.city.toLowerCase()}`}>
                {row.linkLabel}
                <span aria-hidden="true" className={styles.arrow}>
                  →
                </span>
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
