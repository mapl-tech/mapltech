import type { CSSProperties } from 'react';
import Image from 'next/image';
import CountUp from '@/components/ui/CountUp';
import { PROOF, PROOF_SECTION } from './content';
import styles from './Proof.module.scss';

/** A square mark's height on wide screens: the cap of --mark in Proof.module.scss. */
const MARK_MAX = 56;

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

        <div className={styles.clients}>
          <p id="clients-label" className={styles.clientsLabel}>
            {PROOF.clientsLabel}
          </p>
          <ul className={styles.logos} aria-labelledby="clients-label">
            {PROOF.logos.map((logo) => {
              // Requested at the largest size shown; the CSS sizes it from --mark.
              const height = Math.round(MARK_MAX * logo.scale);
              return (
                <li key={logo.name} className={styles.logo} style={{ '--scale': logo.scale } as CSSProperties}>
                  <Image
                    src={logo.src}
                    alt={logo.name}
                    width={Math.round((height * logo.width) / logo.height)}
                    height={height}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
