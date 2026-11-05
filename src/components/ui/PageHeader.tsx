import type { ReactNode } from 'react';
import Link from 'next/link';
import QuoteLine from '@/components/flagship/QuoteLine';
import TrustList from '@/components/flagship/TrustList';
import styles from './PageHeader.module.scss';

export interface Crumb {
  label: string;
  href?: string;
}

/**
 * The standard page hero (Nov 2026 award pass): optional breadcrumbs, a
 * numbered-label voice, a very large Overpass H1, a measured lede, then the
 * page's actions, then (optionally) one line answering the risk and the
 * approved client quote, so proof sits beside the first ask. `aside` sits
 * beside the copy on desktop (or, with asideAlign="body", beside the copy
 * under a full-width title) and under it on phones (a figure, live clocks,
 * facts, a price list). Server-rendered; the H1 is painted
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
  note,
  trust,
  proof = false,
  id = 'page-title',
  size = 'xl',
  asideAlign = 'end',
  fill = false,
}: {
  label?: string;
  title: ReactNode;
  lede?: ReactNode;
  crumbs?: readonly Crumb[];
  actions?: ReactNode;
  aside?: ReactNode;
  /** One line under the actions (sourced copy only), e.g. the blog's services line. */
  note?: ReactNode;
  /** The trust answers under the actions, as a short list (content.ts TRUST_ITEMS). */
  trust?: readonly string[];
  /** The approved client quote under the actions. */
  proof?: boolean;
  id?: string;
  /** xl: 48 -> 136px, for pages that lead with a statement; l: 44 -> 104px for long titles. */
  size?: 'xl' | 'l';
  /**
   * Wide screens: the aside sits on the copy's last line (end) or level with its top (start, for a
   * tall aside); `body` runs the title the full width and sets the aside beside the lede, actions
   * and proof under it, ending level with their last line (a short aside: the title keeps its
   * lines, so the first screen keeps the proof).
   */
  asideAlign?: 'end' | 'start' | 'body';
  /**
   * Landscape screens from 1024px: the hero is at least one screen tall, so the section after it
   * starts at the fold and the fold never cuts its first lines (the regional pages' facts band).
   */
  fill?: boolean;
}) {
  // The label names the page's section; when the breadcrumb already ends on
  // that same name ("Pricing / Pricing"), the label is left out.
  const lastCrumb = crumbs?.[crumbs.length - 1]?.label;
  const showLabel = Boolean(label) && label?.trim().toLowerCase() !== lastCrumb?.trim().toLowerCase();

  return (
    <header className={styles.header} aria-labelledby={id} data-fill={fill ? '' : undefined}>
      <div className={styles.light} aria-hidden="true" />
      <div className={styles.inner} data-has-aside={aside ? '' : undefined} data-aside-align={aside ? asideAlign : undefined}>
        <div className={styles.copy}>
          {/* The head and the body are plain blocks; asideAlign="body" lays them out on the grid. */}
          <div className={styles.head}>
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
            {showLabel ? <p className={styles.label}>{label}</p> : null}
            <h1 id={id} className={styles.title} data-size={size}>
              {title}
            </h1>
          </div>
          {lede || actions || note || trust?.length || proof ? (
            <div className={styles.body}>
              {lede ? <div className={styles.lede}>{lede}</div> : null}
              {actions ? <div className={styles.actions}>{actions}</div> : null}
              {note ? <p className={styles.note}>{note}</p> : null}
              {trust?.length ? <TrustList items={trust} rating className={styles.trust} /> : null}
              {proof ? <QuoteLine className={styles.proof} /> : null}
            </div>
          ) : null}
        </div>
        {aside ? <div className={styles.aside}>{aside}</div> : null}
      </div>
    </header>
  );
}
