'use client';

import Link from 'next/link';
import { estimateHref, formatEstimateMonthly, formatEstimateRange } from '@/lib/estimate';
import { useEstimateState } from './estimateUrlStore';
import styles from './PricingSections.module.scss';

/**
 * The close echoes the visitor's own estimate back (commitment and
 * consistency) and carries it into the contact form, which reads the same
 * query string. With no estimate yet, the estimator stays the filled action.
 */
export default function EstimateEcho() {
  const { input, result, touched } = useEstimateState();

  if (!touched) {
    return (
      <div className={styles.closeActions}>
        <a href="#estimator" className={styles.primary} data-cta-placement="pricing_close_estimate">
          Price your project
        </a>
        <Link href="/contact-us" className={styles.textLink} data-cta-placement="pricing_close_call">
          Book a call<span aria-hidden="true"> →</span>
        </Link>
      </div>
    );
  }

  const monthly = formatEstimateMonthly(result);
  const range = formatEstimateRange(result);

  return (
    <>
      <p className={styles.echo}>
        <span className={styles.echoLabel}>Your estimate</span>
        <span className={styles.echoRange}>{range === 'Custom' ? 'Custom quote' : range}</span>
        <span className={styles.echoDetail}>
          {result.lines.map((line) => `${line.serviceName}, ${line.tierName}`).join(' + ')}
          {monthly ? `. Plus ${monthly.replace(' / ', ' a ')}` : ''}
        </span>
      </p>
      <div className={styles.closeActions}>
        <Link
          href={estimateHref(input, { path: '/contact-us', hash: null })}
          className={styles.primary}
          data-cta-placement="pricing_close_call"
        >
          Book a call
        </Link>
        <a href="#estimator" className={styles.textLink} data-cta-placement="pricing_close_adjust">
          Change your answers
        </a>
      </div>
    </>
  );
}
