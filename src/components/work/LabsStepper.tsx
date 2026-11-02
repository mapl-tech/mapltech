'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { PipelineStage } from './work-types';
import styles from './LabsStepper.module.scss';

/**
 * /labs signature interaction: "Run this workflow". One button sends a
 * booking down the real MAPL Tours pipeline, stage by stage: the meter beside
 * the button fills a segment per stage (so a phone shows progress where it was
 * tapped), and on the stages themselves the crimson line draws down the rail
 * while a token travels from node to node. It is an illustration and says so:
 * nothing here talks to the live system, and the finished state says no
 * booking was made.
 *
 * - Every stage (name, what the traveller sees, what runs under the hood) is in
 *   the server HTML and readable at rest; running only moves the highlight.
 * - One React update per stage (900ms beat, 4.5s end to end, started by the
 *   reader), never per frame. The token and the rail move with CSS transforms
 *   from measured node centres; the meter segments fill with a CSS animation.
 * - Progress is announced in a polite live region. Under reduced motion the
 *   global stylesheet zeroes the motion: highlights change in place.
 */

const BEAT_MS = 900;
const TRACK_ID = 'booking-pipeline';

type Phase = 'idle' | 'running' | 'done';
type StageState = 'idle' | 'pending' | 'active' | 'done';

export interface LabsStepperProps {
  stages?: readonly PipelineStage[];
  /** Label, heading and explanation, server-rendered, beside the pipeline. */
  intro?: ReactNode;
  footnote?: ReactNode;
  /** Shown after the last stage: the action at the end of the run. */
  after?: ReactNode;
}

export default function LabsStepper({ stages = [], intro, footnote, after }: LabsStepperProps) {
  const [step, setStep] = useState(-1);
  const trackRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef(-1);
  const n = stages.length;
  const phase: Phase = step < 0 ? 'idle' : step < n ? 'running' : 'done';

  const stateOf = (i: number): StageState =>
    phase === 'idle' ? 'idle' : phase === 'done' || i < step ? 'done' : i === step ? 'active' : 'pending';

  /** Measure node centres and place the rail, its fill and the token for the current step. */
  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const nodes = Array.from(track.querySelectorAll<HTMLElement>('[data-node]'));
    if (nodes.length < 2) return;
    const top = track.getBoundingClientRect().top;
    const centres = nodes.map((node) => {
      const r = node.getBoundingClientRect();
      return r.top + r.height / 2 - top;
    });
    const span = centres[centres.length - 1] - centres[0] || 1;
    const s = stepRef.current;
    const at = centres[Math.min(Math.max(s, 0), centres.length - 1)] - centres[0];
    track.style.setProperty('--rail-top', `${centres[0]}px`);
    track.style.setProperty('--rail-height', `${span}px`);
    track.style.setProperty('--fill', s < 0 ? '0' : String(at / span));
    track.style.setProperty('--token-y', `${at}px`);
  }, []);

  // One stage per beat while running.
  useEffect(() => {
    if (phase !== 'running') return;
    const timer = window.setTimeout(() => setStep((s) => s + 1), BEAT_MS);
    return () => window.clearTimeout(timer);
  }, [phase, step]);

  useEffect(() => {
    stepRef.current = step;
    sync();
  }, [step, sync]);

  // Text reflows on resize; keep the rail on the node centres.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => sync());
    observer.observe(track);
    return () => observer.disconnect();
  }, [sync]);

  const status =
    phase === 'idle'
      ? ''
      : phase === 'running'
        ? `Stage ${step + 1} of ${n}: ${stages[step]?.name}.`
        : `Shown end to end, ${n} of ${n} stages. An illustration: no booking was made.`;

  return (
    <div className={styles.stepper} data-phase={phase}>
      <div className={styles.side}>
        {intro}
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.run}
            onClick={() => setStep(0)}
            aria-controls={TRACK_ID}
            data-cta-placement="labs_run_workflow"
          >
            <span className={styles.play} aria-hidden="true">
              <svg width="10" height="10" viewBox="0 0 10 10" focusable="false">
                <path d="M2 1v8l7-4-7-4Z" fill="currentColor" />
              </svg>
            </span>
            {/* A stable name: progress is announced once, by the status region, not by the button too. */}
            Run this workflow
          </button>
          <ol className={styles.meter} aria-hidden="true">
            {stages.map((stage, i) => (
              <li key={stage.id} className={styles.segment} data-state={stateOf(i)} />
            ))}
          </ol>
          <p className={styles.status} role="status">
            {status}
          </p>
        </div>
        {footnote ? <p className={styles.footnote}>{footnote}</p> : null}
      </div>

      <div ref={trackRef} className={styles.track}>
        <span className={styles.rail} aria-hidden="true">
          <span className={styles.railFill} />
          <span className={styles.token} />
        </span>
        <ol id={TRACK_ID} className={styles.stages} role="list" aria-label="The stages of one booking">
          {stages.map((stage, i) => {
            const state = stateOf(i);
            return (
              <li key={stage.id} className={styles.stage} data-state={state} aria-current={state === 'active' ? 'step' : undefined}>
                <p className={styles.index} aria-hidden="true">
                  <span className={styles.node} data-node />
                  {String(i + 1).padStart(2, '0')}
                </p>
                <h3 className={styles.name}>{stage.name}</h3>
                <dl className={styles.pair}>
                  <div>
                    <dt>What the traveller sees</dt>
                    <dd>{stage.surface}</dd>
                  </div>
                  <div className={styles.under}>
                    <dt>Under the hood</dt>
                    <dd>{stage.engineering}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ol>
        {after ? <div className={styles.after}>{after}</div> : null}
      </div>
    </div>
  );
}
