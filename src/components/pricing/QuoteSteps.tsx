import { QUOTE_STEPS } from './content';
import styles from './PricingSections.module.scss';

/**
 * What happens after the estimate, at the moment the reader is deciding
 * whether to start: four numbered stages on hairlines (four columns on wide
 * screens, rows on phones). Static, so nothing depends on motion.
 */
export default function QuoteSteps() {
  return (
    <section className={styles.section} aria-labelledby="quote-steps-title">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.label}>{QUOTE_STEPS.label}</p>
          <h2 id="quote-steps-title" className={styles.title}>
            {QUOTE_STEPS.title}
          </h2>
          <p className={styles.lede}>{QUOTE_STEPS.lede}</p>
        </header>
        <ol className={styles.steps} role="list">
          {QUOTE_STEPS.steps.map((step, index) => (
            <li key={step.name} className={styles.step}>
              <span className={styles.stepNo} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <h3 className={styles.stepName}>{step.name}</h3>
                <p className={styles.stepText}>{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
