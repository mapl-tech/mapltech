import styles from './Steps.module.scss';

export interface Step {
  title: string;
  text: string;
}

/**
 * Every numbered process on the site ("How it works" on the homepage, /services
 * and each service page; what happens after the brief; how to apply; how a
 * referral works): three or four steps, each a short title and one sentence.
 * The list is an <ol>, so the order is announced; the visible numbers are
 * decoration. It lays out by its own width, not the viewport's: a column in a
 * narrow rail or on a phone, two across from 560px, one row from 880px.
 * `tone` matches the section's ground.
 */
export default function Steps({ steps, tone = 'dark' }: { steps: readonly Step[]; tone?: 'dark' | 'paper' }) {
  return (
    <div className={styles.wrap}>
      <ol className={styles.steps} data-tone={tone} data-count={steps.length}>
        {steps.map((step, i) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.no} aria-hidden="true">
              {i + 1}
            </span>
            <h3 className={styles.name}>{step.title}</h3>
            <p className={styles.text}>{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
