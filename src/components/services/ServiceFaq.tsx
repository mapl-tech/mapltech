import type { ServiceFaq as ServiceFaqItem } from '@/config/services';
import styles from './ServiceFaq.module.scss';

export interface ServiceFaqProps {
  id?: string;
  eyebrow: string;
  intro: string;
  items: readonly ServiceFaqItem[];
  className?: string;
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/**
 * FAQ as native <details name="faq"> (interaction #11). Every question is a
 * question-shaped H2 (the GEO-quotable unit); every answer is in the SSR HTML
 * whether open or closed. Open/close motion + the red rule come from
 * styles/_motion.scss via the `accordion-*` hook classes. Server Component.
 */
export default function ServiceFaq({ id = 'faq', eyebrow, intro, items, className = '' }: ServiceFaqProps) {
  return (
    <section id={id} className={`${styles.faq} ${className}`.trim()} aria-label="Frequently asked questions" data-below-fold>
      <div className={`${styles.head} reveal`}>
        <p className="eyebrow">{eyebrow}</p>
        <p className={styles.intro}>{intro}</p>
      </div>

      <div className={styles.list}>
        {items.map((qa, i) => (
          <details key={qa.question} id={`${id}-${i + 1}`} name="faq" className={`${styles.item} accordion-item`}>
            <summary className={`${styles.summary} accordion-summary`}>
              <h2 className={styles.question}>{qa.question}</h2>
              <span className={styles.icon} aria-hidden="true">
                <PlusIcon />
              </span>
            </summary>
            <div className={`${styles.content} accordion-content`}>
              <p className={styles.answer}>{qa.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
