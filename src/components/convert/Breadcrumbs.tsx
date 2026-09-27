import Link from 'next/link';
import styles from './Breadcrumbs.module.scss';

export interface Crumb {
  name: string;
  /** Omit on the current page. */
  path?: string;
}

/**
 * Visible breadcrumb trail (Home is prepended). Mirrors the BreadcrumbList the
 * page emits through pageGraph()/breadcrumb() so the two never disagree.
 */
export default function Breadcrumbs({ items, className = '' }: { items: Crumb[]; className?: string }) {
  const trail: Crumb[] = [{ name: 'Home', path: '/' }, ...items];
  return (
    <nav className={`${styles.nav} ${className}`.trim()} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={`${crumb.name}-${i}`} className={styles.item}>
              {crumb.path && !last ? (
                <Link href={crumb.path} className={styles.link}>
                  {crumb.name}
                </Link>
              ) : (
                <span className={styles.current} aria-current={last ? 'page' : undefined}>
                  {crumb.name}
                </span>
              )}
              {!last ? (
                <span className={styles.sep} aria-hidden="true">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
