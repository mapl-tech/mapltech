import type { ReactNode } from 'react';
import styles from '@/app/company.module.scss';

export interface SectionHeadProps {
  /** Mono eyebrow above the heading, e.g. "03 · How we work". */
  eyebrow?: string;
  title: string;
  /** id for the <h2> so the section can be labelled by it. */
  id?: string;
  intro?: string;
  /** Inline action beside the heading (an editorial link). */
  action?: ReactNode;
}

export default function SectionHead({ eyebrow, title, id, intro, action }: SectionHeadProps) {
  return (
    <div className={styles.sectionHead}>
      {eyebrow ? <p className={`eyebrow ${styles.sectionEyebrow}`}>{eyebrow}</p> : null}
      <div className={styles.sectionHeadRow}>
        <h2 id={id} className={styles.h2}>
          {title}
        </h2>
        {action}
      </div>
      {intro ? <p className={styles.intro}>{intro}</p> : null}
    </div>
  );
}
