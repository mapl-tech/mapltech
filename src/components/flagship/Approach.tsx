import Link from 'next/link';
import Steps from '@/components/services/Steps';
import Arrow from '@/components/ui/Arrow';
import { APPROACH } from './content';
import styles from './Approach.module.scss';

/**
 * How it works: four short steps from the first message to launch, drawn by
 * the same Steps list as /services and every service page, so the process
 * looks the same wherever it appears. The first step links to the brief, so it
 * can be taken from here. Plain list markup, no scroll effects.
 */
export default function Approach() {
  return (
    <section className={styles.approach} aria-labelledby="approach-title">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.label}>{APPROACH.label}</p>
          <h2 id="approach-title" className={styles.title}>
            {APPROACH.title}
          </h2>
          <p className={styles.lede}>{APPROACH.lede}</p>
        </header>

        <Steps steps={APPROACH.steps} tone="paper" placement="home_approach" />

        {/* The full account, for the founder who wants the mechanics before the call. */}
        <Link href={APPROACH.more.href} className={styles.more} data-cta-placement="home_approach_more">
          {APPROACH.more.label}
          <span aria-hidden="true" className={styles.moreArrow}>
            <Arrow />
          </span>
        </Link>
      </div>
    </section>
  );
}
