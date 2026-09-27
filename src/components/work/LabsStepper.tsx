'use client';

import { useEffect, useRef, useState } from 'react';
import { useAnimate } from 'framer-motion';
import { usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import type { WorkflowStep } from './work-types';
import styles from './LabsStepper.module.scss';

/**
 * /labs PEAK: "Run this workflow" stepper for MAPL Tours.
 *
 * Desktop: one click sequences intake → plan → book → confirm. Each node fills
 * red (scale 0.6 → 1, 240ms) and the connector to the next node draws in
 * (scaleX 0 → 1 from the left, 360ms); ~2.4s in total, replayable, each step
 * announced through a polite live region. Transform and opacity only; no
 * per-frame React state (useAnimate drives the DOM directly).
 *
 * Mobile: the same <ol> is a native snap row, one node + takeaway per slide;
 * an IntersectionObserver fills the node of the slide in view and the button
 * scrolls to the first slide.
 *
 * Reduced motion: every node renders filled and every connector drawn; the
 * button becomes a "Read the workflow" anchor to the steps.
 *
 * The step titles and takeaways are real <h3>/<p> in the SSR HTML.
 */

export interface LabsStepperProps {
  steps: readonly WorkflowStep[];
  productName: string;
}

const NODE_SECONDS = 0.24;
const LINK_SECONDS = 0.36;
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];
const LIST_ID = 'labs-workflow-steps';

const pad = (n: number) => String(n).padStart(2, '0');

export default function LabsStepper({ steps, productName }: LabsStepperProps) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const reduceMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [status, setStatus] = useState('');
  const runId = useRef(0);

  // Mobile: the slide in view lights its node. Written straight to a data
  // attribute; the desktop CSS never reads it.
  useEffect(() => {
    const root = scope.current;
    const list = root?.querySelector<HTMLElement>('[data-steps]');
    if (!list || typeof IntersectionObserver === 'undefined') return;
    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-step]'));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          (entry.target as HTMLElement).dataset.active = entry.intersectionRatio >= 0.6 ? 'true' : 'false';
        }
      },
      { root: list, threshold: [0.6] },
    );
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [scope]);

  const run = async () => {
    const list = scope.current?.querySelector<HTMLElement>('[data-steps]');
    const desktop = window.matchMedia('(min-width: 768px)').matches;

    if (!desktop) {
      list?.scrollTo({ left: 0, behavior: 'smooth' });
      setStatus(`Step 1 of ${steps.length} — ${steps[0]?.title ?? ''}`);
      return;
    }

    const id = ++runId.current;
    setPhase('running');
    animate('[data-fill]', { scale: 0.6, opacity: 0 }, { duration: 0 });
    animate('[data-connector]', { scaleX: 0 }, { duration: 0 });

    for (let i = 0; i < steps.length; i += 1) {
      if (runId.current !== id) return;
      setStatus(`Step ${i + 1} of ${steps.length} — ${steps[i].title}`);
      await animate(`[data-step="${i}"] [data-fill]`, { scale: 1, opacity: 1 }, { duration: NODE_SECONDS, ease: EASE_OUT });
      if (i < steps.length - 1) {
        await animate(`[data-step="${i}"] [data-connector]`, { scaleX: 1 }, { duration: LINK_SECONDS, ease: 'easeInOut' });
      }
    }

    if (runId.current === id) {
      setPhase('done');
      setStatus(`Workflow complete — ${steps.length} of ${steps.length} steps.`);
    }
  };

  const label = phase === 'idle' ? 'Run this workflow' : phase === 'running' ? 'Running…' : 'Replay';

  return (
    <div ref={scope} className={styles.stepper} data-reduced={reduceMotion ? 'true' : undefined}>
      <div className={styles.controls}>
        {reduceMotion ? (
          <a className={styles.run} href={`#${LIST_ID}`}>
            Read the workflow
          </a>
        ) : (
          <button
            type="button"
            className={styles.run}
            onClick={run}
            aria-controls={LIST_ID}
            data-cursor="play"
            data-cta-placement="labs_run_workflow"
          >
            <PlayGlyph />
            {label}
          </button>
        )}
        <p className={styles.status} role="status">
          {status}
        </p>
      </div>

      <ol id={LIST_ID} className={styles.steps} data-steps aria-label={`${productName} workflow`}>
        {steps.map((step, i) => (
          <li key={step.id} className={styles.step} data-step={i} data-active="false">
            <div className={styles.rail} aria-hidden="true">
              <span className={styles.node}>
                <span className={styles.fill} data-fill />
              </span>
              {i < steps.length - 1 ? (
                <span className={styles.connector}>
                  <span className={styles.connectorFill} data-connector />
                </span>
              ) : null}
            </div>
            <span className={styles.no}>{pad(i + 1)}</span>
            <h3 className={styles.stepTitle}>{step.title}</h3>
            <p className={styles.stepText}>{step.text}</p>
            <span className={styles.slideMeta}>
              Step {i + 1} of {steps.length} · swipe
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PlayGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true" focusable="false">
      <path d="M3 1.5v9l7-4.5-7-4.5Z" fill="currentColor" />
    </svg>
  );
}
