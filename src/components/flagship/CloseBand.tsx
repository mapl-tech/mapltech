import Link from 'next/link';
import { PRICING_HREF, PRICING_LABEL } from '@/components/layout/chrome';
import { CLOSE_BAND, PRIMARY_CTA } from './content';
import styles from './CloseBand.module.scss';

/**
 * The close: a full crimson band with the one ask. Every page ends on one;
 * the copy defaults to the homepage's and can be set per page. The secondary
 * action defaults to pricing. `data-page-close` tells the footer to drop its
 * own ask, so the page never asks twice in a row.
 */
export default function CloseBand({
  title = CLOSE_BAND.title,
  lede = CLOSE_BAND.lede,
  secondary = { label: PRICING_LABEL, href: PRICING_HREF },
  placement = 'home_close',
  id = 'close-title',
}: {
  title?: string;
  lede?: string;
  secondary?: { label: string; href: string } | null;
  /** Prefix for data-cta-placement ("<page>_close"). */
  placement?: string;
  id?: string;
}) {
  return (
    <section className={styles.close} aria-labelledby={id} data-page-close="">
      <div className={styles.bar} aria-hidden="true" />
      <div className={styles.inner}>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
        {lede ? <p className={styles.lede}>{lede}</p> : null}
        <div className={styles.actions}>
          <Link href={PRIMARY_CTA.href} className={styles.primary} data-cta-placement={`${placement}_primary`}>
            {PRIMARY_CTA.label}
            <span aria-hidden="true" className={styles.arrow}>
              →
            </span>
          </Link>
          {secondary ? (
            <Link href={secondary.href} className={styles.secondary} data-cta-placement={`${placement}_secondary`}>
              {secondary.label}
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
