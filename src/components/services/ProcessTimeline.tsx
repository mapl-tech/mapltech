import type { ServiceProcessStep } from '@/config/services';
import styles from './ProcessTimeline.module.scss';

export interface ProcessTimelineProps {
  id?: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  steps: readonly ServiceProcessStep[];
}

/**
 * Process timeline: four phases from `processSteps` (the HowTo JSON-LD is
 * built from the same array by the page). The red progress line and the
 * step numbers are CSS scroll-driven animations (`animation-timeline: view()`)
 * inside `@supports` + `prefers-reduced-motion: no-preference`; everywhere
 * else the line is simply drawn. Zero JS. Server Component.
 */
export default function ProcessTimeline({ id = 'process', eyebrow, title, subtitle, steps }: ProcessTimelineProps) {
  return (
    <section id={id} className={styles.process} aria-labelledby={`${id}-title`} data-below-fold>
      <div className={`${styles.head} reveal`}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={`${id}-title`} className={styles.h2}>
          {title}
        </h2>
        <p className={styles.sub}>{subtitle}</p>
      </div>

      <ol className={styles.steps}>
        {steps.map((step, i) => (
          <li key={step.phase} className={styles.step}>
            <span className={styles.num} aria-hidden="true">
              {i + 1}
            </span>
            <span className={styles.phase}>{step.phase}</span>
            <h3 className={styles.title}>{step.title}</h3>
            <p className={styles.text}>{step.description}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
