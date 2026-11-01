import { PROBLEM } from './content';
import styles from './Problem.module.scss';

/**
 * Act 3, Familiar dread. Three lines on near-black, each arriving as it reaches
 * the reader (CSS scroll timeline, zero JavaScript). The last line is the turn,
 * in brand red. Without scroll-timeline support, or under reduced motion, the
 * lines are simply there.
 */
export default function Problem() {
  return (
    <section className={styles.problem} aria-labelledby="problem-title">
      <div className={styles.inner}>
        <h2 id="problem-title" className={styles.label}>
          {PROBLEM.label}
        </h2>
        <ol className={styles.lines} role="list">
          {PROBLEM.lines.map((line, i) => (
            <li key={line} className={styles.line} data-turn={i === PROBLEM.lines.length - 1 ? '' : undefined}>
              {line}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
