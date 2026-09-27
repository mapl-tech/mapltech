'use client';

import { useEffect, useState } from 'react';
import BottomSheet, { SHEET_SNAP_POINTS, type SnapPoint } from '@/components/ui/BottomSheet';
import { estimateHref, type EstimateInput, type EstimateResult } from '@/lib/estimate';
import Cta from './Cta';
import { EstimateBreakdown, EstimateHeadline } from './EstimateSummary';
import styles from './ScopeEstimator.module.scss';

interface EstimateSheetProps {
  open: boolean;
  result: EstimateResult;
  input: EstimateInput;
}

/**
 * BottomSheet caps its content at 97% of the viewport, so vaul's pixel snap is
 * measured from a box that starts ~3vh below the top: 248px here shows ~225px
 * of sheet (the brief's 220px peek) on a 664-844px phone.
 */
const SNAP_POINTS: SnapPoint[] = ['248px', SHEET_SNAP_POINTS[1], SHEET_SNAP_POINTS[2]];
const PEEK = SNAP_POINTS[0];
const HALF = SNAP_POINTS[1];

/**
 * Interaction #9 on phones: a non-modal vaul sheet pinned to the viewport
 * bottom while the estimator controls are on screen. The peek keeps the live
 * range and one CTA visible as chips are tapped; 65% adds the breakdown and
 * the email-only send; 100% reveals the matched tier's features. Chips stay
 * tappable underneath (modal=false), and the sheet can never be swiped away
 * (dismissible=false) - it closes on its own once the inline summary scrolls
 * into view.
 */
export default function EstimateSheet({ open, result, input }: EstimateSheetProps) {
  const [snap, setSnap] = useState<SnapPoint | null>(PEEK);
  const [wasOpen, setWasOpen] = useState(open);

  // Adjust state on prop change (React pattern): a sheet that closes because
  // the visitor scrolled on reopens at the peek, not at 100%.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setSnap(PEEK);
  }

  // vaul 1.1.2 never forwards `modal` to Radix, so a non-modal sheet still gets
  // Radix's modal side effects: body { pointer-events: none } (vaul only undoes
  // it inside its own onChange, which a controlled `open` never triggers) and
  // aria-hidden on every sibling of the portal. Release both once Radix's own
  // effects have run, so the chips underneath stay tappable and readable.
  useEffect(() => {
    if (!open) return;
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => {
        document.body.style.pointerEvents = 'auto';
        document.querySelectorAll('[data-aria-hidden="true"]').forEach((el) => el.removeAttribute('aria-hidden'));
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  const expanded = snap !== PEEK;

  return (
    <BottomSheet
      open={open}
      modal={false}
      dismissible={false}
      title="Your estimate"
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      className={styles.sheet}
      header={
        <div className={styles.sheetHead}>
          <div className={styles.sheetRow}>
            <span className={styles.eyebrow} aria-hidden="true">
              Your estimate
            </span>
            <button
              type="button"
              className={styles.sheetToggle}
              aria-expanded={expanded}
              onClick={() => setSnap(expanded ? PEEK : HALF)}
            >
              What drove this <span aria-hidden="true">{expanded ? '▾' : '▴'}</span>
            </button>
          </div>
          <EstimateHeadline result={result} totalId="estimate-total-sheet" compact />
          <Cta
            href={estimateHref(input, { path: '/contact-us', hash: null })}
            size="small"
            block
            wrapClassName={styles.sheetCta}
            placement="pricing_sheet_continue"
          >
            Continue to scoping call
          </Cta>
        </div>
      }
    >
      <div className={styles.sheetBody}>
        <EstimateBreakdown result={result} input={input} placement="sheet" showContinue={false} />
      </div>
    </BottomSheet>
  );
}
