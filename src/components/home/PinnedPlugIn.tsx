'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useMediaQuery, usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import type { PlugInStep } from './data';
import styles from './PinnedPlugIn.module.scss';

/**
 * 03 "How we plug in" — the homepage PEAK (interaction #3, pinned sequence).
 *
 * Desktop (>= 768px, motion allowed): a 300vh runway with a sticky 100svh
 * stage. `useScroll` over the runway maps progress to a step index; the left
 * column keeps the headline and the three steps (aria-current on the active
 * one), the right column cross-fades one diagram panel per step (opacity /
 * translate only, never a transform on the sticky container). Native scroll
 * speed is untouched. A thin rail under the panel shows progress.
 *
 * Every step's text is in the SSR HTML. Each diagram lives inside its own
 * step <li> (single source, no duplication); CSS positions it into the right
 * column while pinned and stacks it under the step text otherwise.
 *
 * Phones and reduced motion: the stacked, non-pinned layout. Highlighting
 * toggles data attributes from a MotionValue event, never per-frame React state.
 */

const PIN_QUERY = '(min-width: 768px)';
const WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const;

export interface PinnedPlugInProps {
  id: string;
  eyebrow: string;
  heading: string;
  steps: readonly PlugInStep[];
}

const pad = (n: number) => String(n).padStart(2, '0');

function Arrow() {
  return (
    <svg className={styles.flowArrow} viewBox="0 0 40 40" focusable="false">
      <path d="M2 20h34m-6-6l6 6-6 6" pathLength={1} className={`${styles.draw} ${styles.arrowH}`} />
      <path d="M20 2v34m-6-6l6 6 6-6" pathLength={1} className={`${styles.draw} ${styles.arrowV}`} />
    </svg>
  );
}

function ScopeDiagram() {
  return (
    <div className={styles.flow}>
      <div className={styles.flowNode}>
        <span className={styles.nodeKey}>01</span>
        <span className={styles.nodeLabel}>20-min call</span>
        <span className={styles.nodeSub}>your lead, our lead</span>
      </div>
      <Arrow />
      <div className={styles.flowNode}>
        <span className={styles.nodeKey}>02</span>
        <span className={styles.nodeLabel}>Brief</span>
        <span className={styles.nodeSub}>goal · current state · constraints</span>
      </div>
      <Arrow />
      <div className={`${styles.flowNode} ${styles.flowNodeOut}`}>
        <span className={styles.nodeKey}>03</span>
        <span className={styles.nodeLabel}>Fixed range</span>
        <span className={styles.nodeSub}>from our public pricing</span>
      </div>
    </div>
  );
}

function BuildDiagram() {
  return (
    <div className={styles.build}>
      <div className={styles.buildSides}>
        <div className={styles.side}>
          <span className={styles.sideLabel}>Your agency</span>
          <div className={styles.box}>Your PM</div>
          <div className={`${styles.box} ${styles.boxMuted}`}>
            Your client
            <span className={styles.nodeSub}>never hears our name</span>
          </div>
        </div>
        <svg className={styles.bridge} viewBox="0 0 64 96" focusable="false">
          <path d="M2 24H62" pathLength={1} className={styles.draw} />
          <path d="M2 48H62" pathLength={1} className={styles.draw} />
          <path d="M2 72H62" pathLength={1} className={styles.draw} />
        </svg>
        <div className={styles.side}>
          <span className={styles.sideLabel}>MAPL TECH</span>
          <div className={`${styles.box} ${styles.boxAccent}`}>Engineers</div>
          <div className={`${styles.box} ${styles.boxMuted}`}>
            Your Slack, your standups
            <span className={styles.nodeSub}>we sit in your office</span>
          </div>
        </div>
      </div>
      <ol className={styles.week}>
        {WEEK.map((day) => (
          <li key={day} data-demo={day === 'Fri' ? 'true' : 'false'}>
            {day}
            {day === 'Fri' ? <span>demo</span> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function HandoffDiagram() {
  return (
    <ul className={styles.handoff}>
      <li>
        <svg className={styles.check} viewBox="0 0 20 20" focusable="false">
          <path d="M4 10.5l4 4 8-9" pathLength={1} className={styles.draw} />
        </svg>
        <div>
          <span className={styles.nodeLabel}>Docs</span>
          <span className={styles.nodeSub}>documented code, clean handoff</span>
        </div>
      </li>
      <li>
        <svg className={styles.check} viewBox="0 0 20 20" focusable="false">
          <path d="M4 10.5l4 4 8-9" pathLength={1} className={styles.draw} />
        </svg>
        <div>
          <span className={styles.nodeLabel}>Training</span>
          <span className={styles.nodeSub}>hands-on, with your team</span>
        </div>
      </li>
      <li>
        <svg className={styles.check} viewBox="0 0 20 20" focusable="false">
          <path d="M4 10.5l4 4 8-9" pathLength={1} className={styles.draw} />
        </svg>
        <div>
          <span className={styles.nodeLabel}>Post-launch support</span>
          <span className={styles.nodeSub}>30 · 60 · 90 days, by tier</span>
          <div className={styles.supportBar}>
            <span className={styles.supportFill} />
            <span className={styles.supportTick} style={{ left: '33.333%' }} />
            <span className={styles.supportTick} style={{ left: '66.666%' }} />
          </div>
        </div>
      </li>
    </ul>
  );
}

const DIAGRAMS = [ScopeDiagram, BuildDiagram, HandoffDiagram];

export default function PinnedPlugIn({ id, eyebrow, heading, steps }: PinnedPlugInProps) {
  const wide = useMediaQuery(PIN_QUERY);
  const reduceMotion = usePrefersReducedMotion();
  const pinned = wide && !reduceMotion;

  const rootRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLOListElement>(null);
  const activeIndex = useRef(0);

  const { scrollYProgress } = useScroll({ target: rootRef, offset: ['start start', 'end end'] });

  const indexFor = useCallback(
    (progress: number) => Math.min(steps.length - 1, Math.max(0, Math.floor(progress * steps.length))),
    [steps.length],
  );

  const apply = useCallback((index: number, force = false) => {
    if (!force && index === activeIndex.current) return;
    activeIndex.current = index;
    const items = listRef.current?.querySelectorAll<HTMLElement>('[data-step]');
    items?.forEach((item, i) => {
      const on = i === index;
      item.dataset.active = on ? 'true' : 'false';
      if (on) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
  }, []);

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (pinned) apply(indexFor(progress));
  });

  // Sync when the layout mode settles (hydration, resize, motion preference).
  useEffect(() => {
    if (pinned) {
      apply(indexFor(scrollYProgress.get()), true);
      return;
    }
    // Stacked layout: every step is shown, none is "current".
    activeIndex.current = -1;
    const items = listRef.current?.querySelectorAll<HTMLElement>('[data-step]');
    items?.forEach((item) => {
      item.dataset.active = 'true';
      item.removeAttribute('aria-current');
    });
  }, [pinned, apply, indexFor, scrollYProgress]);

  return (
    <section id={id} ref={rootRef} className={styles.root} aria-labelledby="h-how" data-pinned={pinned ? 'true' : 'false'}>
      <div className={styles.stage}>
        <div className={styles.frame}>
          <div className={styles.lead}>
            <p className="eyebrow">
              <span className={styles.eyebrowIndex}>03</span>
              {eyebrow}
            </p>
            <h2 id="h-how" className={styles.heading}>
              {heading}
            </h2>

            <ol ref={listRef} className={styles.steps}>
              {steps.map((step, i) => {
                const Diagram = DIAGRAMS[i] ?? ScopeDiagram;
                return (
                  <li
                    key={step.id}
                    id={step.id}
                    data-step=""
                    data-active={i === 0 ? 'true' : 'false'}
                    aria-current={i === 0 ? 'step' : undefined}
                    className={styles.step}
                  >
                    <span className={styles.stepIndex} aria-hidden="true">
                      {pad(i + 1)}
                    </span>
                    <div className={styles.stepBody}>
                      <h3 className={styles.stepTitle}>{step.name}</h3>
                      <p className={styles.stepText}>{step.text}</p>
                    </div>
                    <figure className={styles.panel} aria-hidden="true">
                      <div className={styles.panelInner}>
                        <Diagram />
                      </div>
                      <figcaption className={styles.caption}>
                        <span className={styles.captionIndex}>{pad(i + 1)}</span>
                        {step.caption}
                      </figcaption>
                    </figure>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className={styles.rail} aria-hidden="true">
            <motion.span className={styles.railFill} style={{ scaleX: scrollYProgress }} />
            {steps.map((step, i) =>
              i > 0 ? <span key={step.id} className={styles.railTick} style={{ left: `${(i / steps.length) * 100}%` }} /> : null,
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
