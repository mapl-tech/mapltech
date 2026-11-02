import Link from 'next/link';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import styles from './HeroActions.module.scss';

/**
 * The page hero's two actions, styled as the homepage hero's: "Start a
 * project" filled (marked `data-hero-cta`, so the mobile bar repeats it and
 * the header button quiets while it is on screen), then one quiet text link.
 * Plain links, no client JS.
 */
export default function HeroActions({
  page,
  secondary,
}: {
  /** Placement prefix: `data-cta-placement="<page>_hero_primary"`. */
  page: string;
  secondary: { label: string; href: string };
}) {
  return (
    <>
      <Link href={PROJECT_HREF} className={styles.primary} data-hero-cta="" data-cta-placement={`${page}_hero_primary`}>
        {PROJECT_LABEL}
        <span aria-hidden="true" className={styles.arrow}>
          →
        </span>
      </Link>
      <Link href={secondary.href} className={styles.secondary} data-cta-placement={`${page}_hero_secondary`}>
        {secondary.label}
      </Link>
    </>
  );
}
