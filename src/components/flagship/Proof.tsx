import CountUp from '@/components/ui/CountUp';
import ClientsMarquee from './ClientsMarquee';
import { PROOF, PROOF_SECTION } from './content';
import styles from './Proof.module.scss';

/**
 * Why agencies choose us: the live homepage's published numbers and the logos
 * of clients shown on the site. The one approved client quote sits beside the
 * hero's ask, so it is not repeated here.
 */
export default function Proof() {
  return (
    <section className={styles.proof} aria-labelledby="proof-title">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.label}>{PROOF_SECTION.label}</p>
          <h2 id="proof-title" className={styles.title}>
            {PROOF_SECTION.title}
          </h2>
        </header>

        <dl className={styles.stats}>
          {PROOF.stats.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.value}>
                <CountUp value={stat.value} />
                <span className={styles.suffix}>{stat.suffix}</span>
              </dt>
              <dd className={styles.statLabel}>{stat.label}</dd>
            </div>
          ))}
        </dl>

        <ClientsMarquee label={PROOF.clientsLabel} logos={PROOF.logos} />
      </div>
    </section>
  );
}
