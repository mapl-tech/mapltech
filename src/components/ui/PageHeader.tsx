import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from './PageHeader.module.scss';

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * The standard page hero (Nov 2026 award pass): optional breadcrumbs, a
 * numbered-label voice, a very large Overpass H1, a measured lede, then the
 * page's actions. `aside` sits beside the copy on desktop and under it on
 * phones (a figure, live clocks, facts). Server-rendered; the H1 is painted
 * at full opacity in the first frame (only transform animates), so it can be
 * the LCP element.
 */
export default function PageHeader({
  label,
  title,
  lede,
  crumbs,
  actions,
  aside,
  id = 'page-title',
  size = 'xl',
}: {
  label?: string;
  title: ReactNode;
  lede?: ReactNode;
  crumbs?: readonly Crumb[];
  actions?: ReactNode;
  aside?: ReactNode;
  id?: string;
  /** xl: 48 -> 136px, for pages that lead with a statement; l: 44 -> 104px for long titles. */
  size?: 'xl' | 'l';
}) {
  return (
    <header className={styles.header} aria-labelledby={id}>
      <div className={styles.light} aria-hidden="true" />
      <div className={styles.inner} data-has-aside={aside ? '' : undefined}>
        <div className={styles.copy}>
          {crumbs?.length ? (
            <nav aria-label="Breadcrumb" className={styles.crumbs}>
              <ol role="list">
                {crumbs.map((crumb) => (
                  <li key={crumb.label} aria-current={crumb.href ? undefined : 'page'}>
                    {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          {label ? <p className={styles.label}>{label}</p> : null}
          <h1 id={id} className={styles.title} data-size={size}>
            {title}
          </h1>
          {lede ? <div className={styles.lede}>{lede}</div> : null}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
        {aside ? <div className={styles.aside}>{aside}</div> : null}
      </div>
    </header>
  );
}
