import Link from 'next/link';
import styles from './Steps.module.scss';

export interface Step {
  title: string;
  text: string;
  /** Where the visitor can take this step from here (the homepage's "Tell us what you need" → the brief). */
  href?: string;
}

/**
 * Every numbered process on the site ("How it works" on the homepage, /services
 * and each service page; what happens after the brief; how to apply; how a
 * referral works): three or four steps, each a short title and one sentence.
 * The list is an <ol>, so the order is announced; the visible numbers are
 * decoration. It lays out by its own width, not the viewport's: a column in a
 * narrow rail or on a phone, two across from 560px, one row from 880px.
 * `tone` matches the section's ground. A step with an `href` links its title,
 * so the first step of an engagement is one tap away.
 */
export default function Steps({
  steps,
  tone = 'dark',
  placement,
}: {
  steps: readonly Step[];
  tone?: 'dark' | 'paper';
  /** Prefix for a linked step's data-cta-placement ("<page>_step_<n>"). */
  placement?: string;
}) {
  return (
    <div className={styles.wrap}>
      <ol className={styles.steps} data-tone={tone} data-count={steps.length}>
        {steps.map((step, i) => (
          <li key={step.title} className={styles.step}>
            <span className={styles.no} aria-hidden="true">
              {i + 1}
            </span>
            <h3 className={styles.name}>
              {step.href ? (
                <Link
                  href={step.href}
                  className={styles.nameLink}
                  data-cta-placement={placement ? `${placement}_step_${i + 1}` : undefined}
                >
                  {step.title}{' '}
                  <span aria-hidden="true" className={styles.nameArrow}>
                    →
                  </span>
                </Link>
              ) : (
                step.title
              )}
            </h3>
            <p className={styles.text}>{step.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
