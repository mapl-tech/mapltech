import Image from 'next/image';
import { PROOF } from './content';
import styles from './ProofStrip.module.scss';

/**
 * Act 2, Reassurance. Real client logos (the live homepage's set) and the three
 * numbers MAPL TECH already publishes. Small and fast: this is information, not
 * an experience, so it never pins, holds or counts up (a counting number spends
 * a second showing a figure that isn't true).
 */
export default function ProofStrip() {
  return (
    <section className={styles.strip} aria-label="Clients and track record">
      <div className={styles.inner}>
        <p className={styles.caption}>Engineering behind agencies and the businesses they serve</p>
        <ul className={styles.logos} role="list">
          {PROOF.logos.map((logo) => (
            <li key={logo.name} className={styles.logo}>
              <Image
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className={logo.invert ? styles.invert : styles.mono}
                style={{ height: logo.height, width: 'auto' }}
              />
            </li>
          ))}
        </ul>
        <dl className={styles.stats}>
          {PROOF.stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.statValue}>
                {stat.value.toLocaleString('en-US')}
                {stat.suffix}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
