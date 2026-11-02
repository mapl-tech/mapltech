import Link from 'next/link';
import { PRICING_HREF, PRICING_LABEL } from '@/components/layout/chrome';
import { CLOSE_BAND, PRIMARY_CTA } from './content';
import styles from './CloseBand.module.scss';

/**
 * The close: a full crimson band with the one ask. `data-page-close` tells
 * the footer to drop its own ask, so the page never asks twice in a row.
 */
export default function CloseBand() {
  return (
    <section className={styles.close} aria-labelledby="close-title" data-page-close="">
      <div className={styles.bar} aria-hidden="true" />
      <div className={styles.inner}>
        <h2 id="close-title" className={styles.title}>
          {CLOSE_BAND.title}
        </h2>
        <p className={styles.lede}>{CLOSE_BAND.lede}</p>
        <div className={styles.actions}>
          <Link href={PRIMARY_CTA.href} className={styles.primary} data-cta-placement="home_close_primary">
            {PRIMARY_CTA.label}
            <span aria-hidden="true" className={styles.arrow}>
              →
            </span>
          </Link>
          <Link href={PRICING_HREF} className={styles.secondary} data-cta-placement="home_close_pricing">
            {PRICING_LABEL}
          </Link>
        </div>
      </div>
    </section>
  );
}
