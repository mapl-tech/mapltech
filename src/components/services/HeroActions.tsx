import Link from 'next/link';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import { keepTogether } from './keepTogether';
import styles from './HeroActions.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * The page hero's two actions, styled as the homepage hero's: "Start a
 * project" filled (marked `data-hero-cta`, so the mobile bar repeats it and
 * the header button quiets while it is on screen), then one quiet text link.
 * The primary can open the brief with the page's service already chosen
 * (`href`, e.g. /contact-us?svc=web). An optional `note` answers the risk on
 * its own line under the pair, as the homepage hero's reassurance does. Plain
 * links, no client JS.
 */
export default function HeroActions({
  page,
  secondary,
  note,
  href = PROJECT_HREF,
}: {
  /** Placement prefix: `data-cta-placement="<page>_hero_primary"`. */
  page: string;
  secondary: { label: string; href: string };
  /** One sourced line under the buttons (the homepage's HERO_REASSURE). */
  note?: string;
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
      {note ? <p className={styles.note}>{keepTogether(note)}</p> : null}
    </>
  );
}
