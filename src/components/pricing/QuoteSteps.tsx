import { QUOTE_STEPS } from './content';
import styles from './PricingSections.module.scss';

/**
 * What happens after the estimate, at the moment the reader is deciding
 * whether to book: four stages on a red timeline that draws as you read
 * (the case-study idiom). Static and complete under reduced motion.
 */
export default function QuoteSteps() {
  return (
    <section className={styles.steps} aria-labelledby="quote-steps-title">
      <div className={styles.split}>
        <div className={styles.splitHead}>
          <h2 id="quote-steps-title" className={styles.h2}>
            {QUOTE_STEPS.title}
          </h2>
          <p className={styles.lede}>{QUOTE_STEPS.lede}</p>
        </div>
        <ol className={styles.stages} role="list">
          {QUOTE_STEPS.steps.map((step) => (
            <li key={step.name} className={styles.stage}>
              <h3 className={styles.stageName}>{step.name}</h3>
              <p className={styles.stageText}>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
