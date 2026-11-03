'use client';

import { useEffect } from 'react';
import LiveNumber from '@/components/ui/LiveNumber';
import { formatMoney, type EstimateResult } from '@/lib/estimate';
import { TOTAL_SPRING, estimateHeadline, headlineRange } from './content';
import styles from './ScopeEstimator.module.scss';
import Arrow from '@/components/ui/Arrow';

interface EstimateBarProps {
  result: EstimateResult;
  /** Questions on screen and the readout not yet in view. */
  visible: boolean;
  onJump: () => void;
}

/**
 * The bar's range springs exactly like the readout's (same LiveNumber and
 * the same headline: a package quoted after a call is named in the label,
 * never folded into a "+" floor), but stays silent: the readout's live region
 * is the one announcement (so the digits are decorative, with no live regions
 * of their own), and the button's accessible name comes from the visually
 * hidden text.
 */
function Range({ result }: { result: EstimateResult }) {
  const headline = estimateHeadline(result);
  if (headline.allCustom) return <>Custom quote</>;
  return (
    <>
      <span className="visually-hidden">{headlineRange(headline).replace('–', ' to ')}</span>
      <span aria-hidden="true">
        {headline.high === null ? (
          <LiveNumber value={headline.low} format={formatMoney} suffix="+" spring={TOTAL_SPRING} decorative />
        ) : (
          <>
            <LiveNumber value={headline.low} format={formatMoney} spring={TOTAL_SPRING} decorative />–
            <LiveNumber
              value={headline.high}
              format={formatMoney}
              suffix={headline.openEnded ? '+' : ''}
              spring={TOTAL_SPRING}
              decorative
            />
          </>
        )}
      </span>
    </>
  );
}

/**
 * What the range leaves out, in two lines at most on a 320px phone: "Your estimate, plus a custom
 * quote" first, since a package quoted after a call changes what the range means (the monthly
 * plan stays one tap away, in the readout), else "Your estimate, plus monthly".
 */
function barLabel(result: EstimateResult): string {
  if (estimateHeadline(result).customNote) return 'Your estimate, plus a custom quote';
  return result.monthly.length > 0 ? 'Your estimate, plus monthly' : 'Your estimate';
}

/**
 * Phones and tablets: the live range pinned to the bottom edge while the
 * questions are on screen, so every tap shows its effect without scrolling.
 * One button, one outcome (Fitts): the whole bar jumps to the full readout.
 * It is short (68px + safe area) so it never hides more than one row of
 * options, and it slides away once the readout itself is in view.
 */
export default function EstimateBar({ result, visible, onJump }: EstimateBarProps) {
  // While the bar is up, the page's optimal viewing area ends above it, so a
  // control reached by keyboard is scrolled clear of the bar, never under it.
  useEffect(() => {
    if (!visible) return;
    const root = document.documentElement;
    root.style.scrollPaddingBottom = '96px';
    return () => {
      root.style.scrollPaddingBottom = '';
    };
  }, [visible]);

  return (
    // inert while hidden: out of the tab order and the accessibility tree in one attribute.
    <div className={styles.bar} data-visible={visible || undefined} inert={!visible}>
      <button type="button" className={styles.barButton} onClick={onJump}>
        <span className={styles.barText}>
          <span className={styles.barLabel}>{barLabel(result)}</span>
          <span className={styles.barRange}>
            <Range result={result} />
          </span>
        </span>
        <span className={styles.barAction}>
          Details
          <span aria-hidden="true" className={styles.barArrow}>
            <Arrow direction="down" />
          </span>
        </span>
      </button>
    </div>
  );
}
