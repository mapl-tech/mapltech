'use client';

import { useRef, useState, type CSSProperties } from 'react';
import { motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { useMediaQuery, usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import type { StackLayer } from './serviceCopy';
import styles from './StackPinned.module.scss';

export interface StackPinnedProps {
  id?: string;
  eyebrow: string;
  heading: string;
  layers: StackLayer[];
}

const PINNED_QUERY = '(min-width: 768px)';

/**
 * THE PEAK — "The stack", a pinned sequence (interaction #3).
 *
 * Desktop with motion allowed: a 300vh wrapper with a `sticky top-0 h-[100svh]`
 * child. One `useScroll` maps progress to a step index (React state changes
 * only when the step changes, never per frame); the left list carries
 * `aria-current="step"`, the right diagram lifts the active plate with
 * transform/opacity only, and the "yours" plate draws a red hairline. The
 * vertical progress rail is a MotionValue on a transform (zero renders).
 *
 * Phones / reduced motion: the same DOM renders as three stacked cards, the
 * middle one inset and marked "yours" with the rule already drawn (CSS only).
 * All three layer texts are in the SSR HTML; the sticky container is never
 * transformed; inactive captions stay in the DOM under `hidden`.
 */
export default function StackPinned({ id = 'stack', eyebrow, heading, layers }: StackPinnedProps) {
  const ref = useRef<HTMLElement>(null);
  const wide = useMediaQuery(PINNED_QUERY);
  const reduceMotion = usePrefersReducedMotion();
  const pinned = wide && !reduceMotion;
  const [step, setStep] = useState(0);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (progress) => {
    if (!pinned) return;
    const next = Math.min(layers.length - 1, Math.max(0, Math.floor(progress * layers.length)));
    setStep((prev) => (prev === next ? prev : next));
  });

  return (
    <section
      ref={ref}
      id={id}
      className={styles.stack}
      aria-labelledby={`${id}-title`}
      data-pinned={pinned || undefined}
    >
      <div className={styles.sticky}>
        <div className={styles.copy}>
          <p className="eyebrow">{eyebrow}</p>
          <h2 id={`${id}-title`} className={styles.heading}>
            {heading}
          </h2>

          <div className={styles.listWrap}>
            <ol className={styles.steps}>
              {layers.map((layer, i) => (
                <li
                  key={layer.index}
                  className={styles.step}
                  data-active={i === step || undefined}
                  data-yours={layer.yours || undefined}
                  aria-current={pinned && i === step ? 'step' : undefined}
                >
                  <span className={styles.num} aria-hidden="true">
                    {layer.index}
                  </span>
                  <div className={styles.stepBody}>
                    <h3 className={styles.stepTitle}>
                      {layer.title}
                      {layer.yours ? <span className={styles.yoursTag}>yours</span> : null}
                    </h3>
                    <p className={styles.stepText}>{layer.body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Progress rail: a transform driven straight from the scroll MotionValue. */}
            <motion.span
              className={styles.progress}
              aria-hidden="true"
              style={pinned ? { scaleY: scrollYProgress } : undefined}
            />
          </div>
        </div>

        {/* Diagram duplicates the list visually; the list is the accessible source. */}
        <div className={styles.diagram} aria-hidden="true">
          <div className={styles.plates}>
            {layers.map((layer, i) => (
              <div
                key={layer.index}
                className={styles.plate}
                data-active={i === step || undefined}
                data-yours={layer.yours || undefined}
                style={{ '--i': i } as CSSProperties}
              >
                <span className={styles.plateIndex}>{layer.index}</span>
                <span className={styles.plateTitle}>{layer.title}</span>
                {layer.yours ? <span className={styles.plateYours}>yours</span> : null}
                <span className={styles.plateRule} />
              </div>
            ))}
          </div>
          <div className={styles.captions}>
            {layers.map((layer, i) => (
              <p key={layer.index} className={styles.caption} hidden={i !== step}>
                {layer.tags.join(' · ')}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
