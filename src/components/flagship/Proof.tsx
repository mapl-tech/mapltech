import Image from 'next/image';
import { PROOF, PROOF_SECTION, SPOTLIGHT } from './content';
import styles from './Proof.module.scss';

/**
 * Why agencies choose us: the live homepage's published numbers, the one
 * approved client quote, and the logos of clients shown on the site.
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
                {stat.value}
                <span className={styles.suffix}>{stat.suffix}</span>
              </dt>
              <dd className={styles.statLabel}>{stat.label}</dd>
            </div>
          ))}
        </dl>

        {SPOTLIGHT ? (
          <figure className={styles.quote}>
            <blockquote className={styles.quoteText}>
              <p>“{SPOTLIGHT.quote}”</p>
            </blockquote>
            <figcaption className={styles.by}>
              {SPOTLIGHT.image ? (
                <Image src={SPOTLIGHT.image} alt="" width={56} height={56} className={styles.avatar} />
              ) : null}
              <span>
                <span className={styles.name}>{SPOTLIGHT.name}</span>
                <span className={styles.role}>
                  {SPOTLIGHT.role}, {SPOTLIGHT.company}
                </span>
              </span>
            </figcaption>
          </figure>
        ) : null}

        <ul className={styles.logos} aria-label="Clients">
          {PROOF.logos.map((logo) => (
            <li key={logo.name} className={styles.logo}>
              <Image
                src={logo.src}
                alt={logo.name}
                width={logo.width}
                height={logo.height}
                className={logo.invert ? styles.invert : undefined}
                style={{ width: 'auto', height: logo.height }}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
