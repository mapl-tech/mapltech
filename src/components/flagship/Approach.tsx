'use client';

import { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import { APPROACH } from './content';
import styles from './Approach.module.scss';

/**
 * "We embed into your team": the live site's four steps. On desktop the
 * section pins and the steps travel sideways as you scroll down (the track's
 * shift is measured, then driven by `--p`); on phones, with reduced motion,
 * or before JS, it is a plain vertical list.
 */
export default function Approach() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || reduceMotion) return;
    const wide = window.matchMedia('(min-width: 1024px) and (min-aspect-ratio: 21/20)');

    let frame = 0;
    const measure = () => {
      if (!wide.matches) {
        section.removeAttribute('data-pinned');
        return;
      }
      section.setAttribute('data-pinned', '');
      // How far the track must travel for its last card to finish at the shell's right edge.
      const shift = Math.max(0, track.scrollWidth - track.clientWidth);
      section.style.setProperty('--shift', `${shift}px`);
      update();
    };
    const update = () => {
      frame = 0;
      if (!wide.matches) return;
      const rect = section.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const p = Math.min(1, Math.max(0, -rect.top / travel));
      section.style.setProperty('--p', p.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    wide.addEventListener('change', measure);
    window.addEventListener('scroll', schedule, { passive: true });
    return () => {
      ro.disconnect();
      wide.removeEventListener('change', measure);
      window.removeEventListener('scroll', schedule);
      if (frame) cancelAnimationFrame(frame);
      section.removeAttribute('data-pinned');
    };
  }, [reduceMotion]);

  return (
    <section ref={sectionRef} className={styles.approach} aria-labelledby="approach-title">
      <div className={styles.sticky}>
        <div className={styles.inner}>
          <header className={styles.head}>
            <p className={styles.label}>{APPROACH.label}</p>
            <h2 id="approach-title" className={styles.title}>
              {APPROACH.title}
            </h2>
            <p className={styles.lede}>{APPROACH.lede}</p>
          </header>

          <ol ref={trackRef} className={styles.track}>
            {APPROACH.steps.map((step, i) => (
              <li key={step.title} className={styles.step}>
                <span className={styles.number} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </li>
            ))}
          </ol>

          <div className={styles.progress} aria-hidden="true">
            <span />
          </div>
        </div>
      </div>
    </section>
  );
}
