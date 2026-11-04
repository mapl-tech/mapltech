import Image from 'next/image';
import CountUp from '@/components/ui/CountUp';
import ClientsMarquee from './ClientsMarquee';
import { PROOF, PROOF_SECTION, VOICES } from './content';
import styles from './Proof.module.scss';

/**
 * Why agencies choose us: the reasons first (the white-label guarantees the
 * FAQ makes, in its words), then the live homepage's published numbers, the
 * site's testimonials in full (the approved client quote and the CHHA-NCR
 * audit's verdict) and the logos of clients shown on the site.
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
          <ul className={styles.promises} role="list">
            {PROOF_SECTION.promises.map((promise) => (
              <li key={promise} className={styles.promise}>
                {promise}
              </li>
            ))}
          </ul>
        </header>

        <dl className={styles.stats}>
          {PROOF.stats.map((stat) => (
            // The term is what is counted, the value its number; CSS sets the number first.
            <div key={stat.label} className={styles.stat}>
              <dt className={styles.statLabel}>{stat.label}</dt>
              <dd className={styles.value}>
                <CountUp value={stat.value} />
                <span className={styles.suffix}>{stat.suffix}</span>
              </dd>
            </div>
          ))}
        </dl>

        {VOICES.length ? (
          <section className={styles.voices} aria-labelledby="voices-title">
            <h3 id="voices-title" className={styles.voicesLabel}>
              {PROOF_SECTION.voicesLabel}
            </h3>
            <ul className={styles.voiceList} role="list">
              {VOICES.map((voice) => (
                <li key={voice.name} className={styles.voiceItem}>
                  <figure className={styles.voice}>
                    <blockquote className={styles.voiceQuote}>
                      <p>“{voice.quote}”</p>
                    </blockquote>
                    <figcaption className={styles.voiceBy}>
                      {voice.image ? (
                        <Image src={voice.image} alt="" width={48} height={48} className={styles.voiceAvatar} />
                      ) : null}
                      <span>
                        <span className={styles.voiceName}>{voice.name}</span>
                        <span className={styles.voiceDetail}>{voice.detail}</span>
                      </span>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <ClientsMarquee label={PROOF.clientsLabel} logos={PROOF.logos} />
      </div>
    </section>
  );
}
