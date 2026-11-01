'use client';

import { useEffect } from 'react';
import LiveNumber from '@/components/ui/LiveNumber';
import { formatEstimateMonthly, formatEstimateRange, formatMoney, type EstimateResult } from '@/lib/estimate';
import styles from './ScopeEstimator.module.scss';

interface EstimateBarProps {
  result: EstimateResult;
  /** Questions on screen and the readout not yet in view. */
  visible: boolean;
  onJump: () => void;
}

/**
 * The bar's range springs exactly like the readout's (same LiveNumber), but
 * stays silent: the readout's live region is the one announcement, and the
 * button's accessible name comes from the visually hidden text.
 */
function Range({ result }: { result: EstimateResult }) {
  const spoken = formatEstimateRange(result).replace('–', ' to ');
  if (result.lines.length > 0 && result.lines.every((line) => line.isCustom)) return <>Custom quote</>;
  return (
    <>
      <span className="visually-hidden">{spoken === 'Custom' ? 'Custom quote' : spoken}</span>
      <span aria-hidden="true">
        {result.oneTimeHigh === null ? (
          <LiveNumber value={result.oneTimeLow} format={formatMoney} suffix="+" />
        ) : (
          <>
            <LiveNumber value={result.oneTimeLow} format={formatMoney} />–
            <LiveNumber value={result.oneTimeHigh} format={formatMoney} suffix={result.isOpenEnded ? '+' : ''} />
          </>
        )}
      </span>
    </>
  );
}

/**
 * Phones and tablets: the live range pinned to the bottom edge while the
 * questions are on screen, so every tap shows its effect without scrolling.
 * One button, one outcome (Fitts): the whole bar jumps to the full readout.
 * It is short (68px + safe area) so it never hides more than one row of
 * options, and it slides away once the readout itself is in view.
 */
export default function EstimateBar({ result, visible, onJump }: EstimateBarProps) {
  const monthly = formatEstimateMonthly(result);

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
          <span className={styles.barLabel}>Your estimate{monthly ? ' · plus monthly' : ''}</span>
          <span className={styles.barRange}>
            <Range result={result} />
          </span>
        </span>
        <span className={styles.barAction}>
          Breakdown
          <span aria-hidden="true" className={styles.barArrow}>
            ↓
          </span>
        </span>
      </button>
    </div>
  );
}
