import ScrollLit from '@/components/ui/ScrollLit';
import { STATEMENT } from './content';
import styles from './Statement.module.scss';

/** The launch-week story, lit word by word as it scrolls, then the answer. */
export default function Statement() {
  return (
    <section className={styles.statement} aria-labelledby="statement-label">
      <div className={styles.inner}>
        <p id="statement-label" className={styles.label}>
          {STATEMENT.label}
        </p>
        <ScrollLit as="p" runs={STATEMENT.runs} className={styles.text} />
        <p className={styles.resolve}>{STATEMENT.resolve}</p>
      </div>
    </section>
  );
}
