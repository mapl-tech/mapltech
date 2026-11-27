import Link from 'next/link';
import Arrow from '@/components/ui/Arrow';
import { PRIMARY_CTA, TRUST_ITEMS } from './content';
import TrustList from './TrustList';
import styles from './SectionAsk.module.scss';

/**
 * The ask that ends a homepage section while its proof is still on screen:
 * the question, the one filled button, and the trust list beside it (what a
 * director checks before booking a call). The work cards and "Why agencies
 * work with us" end on it. One filled ask on screen at a time: while it is in
 * view the header's is an outline (data-header-quiet) and the phone bar
 * steps aside (data-bar-stand-down). `className` places it in its section.
 *
 * `compact`: a later ask on the same page reads as its section's conclusion,
 * a step quieter than the first (a smaller question under a hairline), so the
 * two never look like the same block repeated.
 *
 * `secondary`: a quiet text link beside the button (the hero's and the
 * close's pairing, "See pricing"), for a reader who wants the numbers first.
 * The button stays the one filled action.
 */
export default function SectionAsk({
  title,
  placement,
  className,
  compact = false,
  secondary,
}: {
  title: string;
  placement: string;
  className?: string;
  compact?: boolean;
  secondary?: { label: string; href: string; placement: string };
}) {
  const primary = (
    <Link href={PRIMARY_CTA.href} className={styles.primary} data-cta-placement={placement}>
      {PRIMARY_CTA.label}
      <span aria-hidden="true" className={styles.arrow}>
        <Arrow />
      </span>
    </Link>
  );
  return (
    <div
      className={[styles.ask, compact ? styles.compact : '', className].filter(Boolean).join(' ')}
      data-header-quiet=""
      data-bar-stand-down=""
    >
      <p className={styles.title}>{title}</p>
      <div className={styles.action}>
        {secondary ? (
          <div className={styles.buttons}>
            {primary}
            <Link href={secondary.href} className={styles.secondary} data-cta-placement={secondary.placement}>
              {secondary.label}
            </Link>
          </div>
        ) : (
          primary
        )}
        <TrustList items={TRUST_ITEMS} className={styles.note} />
      </div>
    </div>
  );
}
