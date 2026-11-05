import Link from 'next/link';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import TrustList from '@/components/flagship/TrustList';
import styles from './HeroActions.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * The page hero's two actions, styled as the homepage hero's: "Start a
 * project" filled (marked `data-hero-cta`, so the mobile bar repeats it and
 * the header button quiets while it is on screen), then one quiet text link.
 * The primary can open the brief with the page's service already chosen
 * (`href`, e.g. /contact-us?svc=web). An optional `trust` list answers the
 * risk under the pair, as the homepage hero's does. Plain links, no client JS.
 */
export default function HeroActions({
  page,
  secondary,
  trust,
  href = PROJECT_HREF,
}: {
  /** Placement prefix: `data-cta-placement="<page>_hero_primary"`. */
  page: string;
  secondary: { label: string; href: string };
  /** The trust answers under the buttons, as a short list (content.ts TRUST_ITEMS and friends). */
  trust?: readonly string[];
  /** Where "Start a project" goes: the brief, optionally with the service filled in. */
  href?: string;
}) {
  return (
    <>
      <Link href={href} className={styles.primary} data-hero-cta="" data-cta-placement={`${page}_hero_primary`}>
        {PROJECT_LABEL}
        <span aria-hidden="true" className={styles.arrow}>
          <Arrow />
        </span>
      </Link>
      <Link href={secondary.href} className={styles.secondary} data-cta-placement={`${page}_hero_secondary`}>
        {secondary.label}
      </Link>
      {trust?.length ? <TrustList items={trust} rating className={styles.note} /> : null}
    </>
  );
}
