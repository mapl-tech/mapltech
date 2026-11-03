import Link from 'next/link';
import { PRICING_HREF, PRICING_LABEL } from '@/components/layout/chrome';
import { CLOSE_BAND, HERO_PROOF, PRIMARY_CTA } from './content';
import CloseBandPrimary from './CloseBandPrimary';
import QuoteLine from './QuoteLine';
import styles from './CloseBand.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * The close: a full crimson band with the one ask. Every page ends on one;
 * the copy defaults to the homepage's and can be set per page. The primary can
 * carry the page's context into the brief (`href`, e.g. a case study's
 * service), the secondary defaults to pricing, and the approved client quote
 * sits under the ask (`proof`), so the last decision has its proof beside it:
 * on phones under the buttons, from 1024px in a column of its own beside the
 * ask, so the band is balanced. `data-page-close` tells the footer to drop its
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
  // Only proof that renders opens the second column (QuoteLine is empty without an approved quote).
  const proofNode = proofLine ? (
    <p className={`${styles.proof} ${styles.proofLine}`}>{proofLine}</p>
  ) : proof && HERO_PROOF ? (
    <QuoteLine tone="band" size="large" className={styles.proof} />
  ) : null;
  return (
    // data-header-quiet: while any of the band is on screen the header's ask is an outline.
    <section className={styles.close} aria-labelledby={id} data-page-close="" data-header-quiet="">
      <div className={styles.bar} aria-hidden="true" />
      {/* With proof, wide screens run the title across and set the proof in a column of its own beside the ask. */}
      <div className={styles.inner} data-has-proof={proofNode ? '' : undefined}>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
        <div className={styles.ask}>
          {lede ? <p className={styles.lede}>{lede}</p> : null}
          <div className={styles.actions}>
            <CloseBandPrimary href={href} className={styles.primary} placement={`${placement}_primary`} hero={hero}>
              {PRIMARY_CTA.label}
              <span aria-hidden="true" className={styles.arrow}>
                <Arrow />
              </span>
            </CloseBandPrimary>
            {secondary ? (
              <Link href={secondary.href} className={styles.secondary} data-cta-placement={`${placement}_secondary`}>
                {secondary.label}
              </Link>
            ) : null}
          </div>
          {note ? <p className={styles.note}>{note}</p> : null}
        </div>
        {proofNode}
      </div>
    </section>
  );
}
