import Link from 'next/link';
import { PRICING_HREF, PRICING_LABEL } from '@/components/layout/chrome';
import { CLOSE_BAND, PRIMARY_CTA } from './content';
import CloseBandPrimary from './CloseBandPrimary';
import QuoteLine from './QuoteLine';
import styles from './CloseBand.module.scss';

/**
 * The close: a full crimson band with the one ask. Every page ends on one;
 * the copy defaults to the homepage's and can be set per page. The primary can
 * carry the page's context into the brief (`href`, e.g. a case study's
 * service), the secondary defaults to pricing, and the approved client quote
 * sits under the ask (`proof`), so the last decision has its proof beside it. `data-page-close` tells the footer to drop its
 * own ask, so the page never asks twice in a row.
 */
export default function CloseBand({
  title = CLOSE_BAND.title,
  lede = CLOSE_BAND.lede,
  secondary = { label: PRICING_LABEL, href: PRICING_HREF },
  placement = 'home_close',
  id = 'close-title',
  note,
  hero = false,
  href = PRIMARY_CTA.href,
  proof = true,
  proofLine,
}: {
  title?: string;
  lede?: string;
  secondary?: { label: string; href: string } | null;
  /** Prefix for data-cta-placement ("<page>_close"). */
  placement?: string;
  id?: string;
  /** One line under the buttons answering the risk (sourced copy only). */
  note?: string;
  /** Mark the primary as the page's hero CTA (pages whose only ask is this band). */
  hero?: boolean;
  /** Where the primary goes: the brief, optionally with an answer filled in (`/contact-us?svc=web`). */
  href?: string;
  /** The approved client quote under the ask (off where the page already shows it nearby). */
  proof?: boolean;
  /** A sourced proof line in place of the quote (the homepage, whose hero already has the quote). */
  proofLine?: string;
}) {
  return (
    // data-header-quiet: while any of the band is on screen the header's ask is an outline.
    <section className={styles.close} aria-labelledby={id} data-page-close="" data-header-quiet="">
      <div className={styles.bar} aria-hidden="true" />
      <div className={styles.inner}>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
        {lede ? <p className={styles.lede}>{lede}</p> : null}
        <div className={styles.actions}>
          <CloseBandPrimary href={href} className={styles.primary} placement={`${placement}_primary`} hero={hero}>
            {PRIMARY_CTA.label}
            <span aria-hidden="true" className={styles.arrow}>
              →
            </span>
          </CloseBandPrimary>
          {secondary ? (
            <Link href={secondary.href} className={styles.secondary} data-cta-placement={`${placement}_secondary`}>
              {secondary.label}
            </Link>
          ) : null}
        </div>
        {note ? <p className={styles.note}>{note}</p> : null}
        {proofLine ? (
          <p className={`${styles.proof} ${styles.proofLine}`}>{proofLine}</p>
        ) : proof ? (
          <QuoteLine tone="band" className={styles.proof} />
        ) : null}
      </div>
    </section>
  );
}
