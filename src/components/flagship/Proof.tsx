import Image from 'next/image';
import Link from 'next/link';
import { STORIES } from '@/components/case/stories';
import Arrow from '@/components/ui/Arrow';
import CountUp from '@/components/ui/CountUp';
import { findEntry } from '@/components/work/work-data';
import { PROOF, PROOF_SECTION, VOICES } from './content';
import styles from './Proof.module.scss';

/**
 * The listed case study that quotes a testimonial in the same words
 * (stories.ts `quote`: Alita Fabiano on LRO Staffing's, the audit's verdict on
 * CHHA-NCR's), so a reader can check the words against the work. None when
 * the case is not listed on /our-work.
 */
function caseFor(quote: string): { slug: string; href: string; client: string } | null {
  const story = STORIES.find((s) => s.quote?.text === quote);
  const entry = story ? findEntry(story.slug) : undefined;
  return story && entry ? { slug: story.slug, href: entry.path, client: story.client } : null;
}

/**
 * Why agencies choose us: the reasons first (the white-label guarantees the
 * FAQ makes, in its words), then the live homepage's published numbers, the
 * site's testimonials in full (the approved client quote and the CHHA-NCR
 * audit's verdict). The clients' logos are in the hero's foot row, in the
 * first screen, so they are not repeated here.
 *
 * Nov 7, 2026 (the proof pass): each testimonial ends on the case study it
 * is about ("Read the LRO Staffing case study"), so the section closes on a
 * way to check it rather than on nothing; the FAQ and the close's ask follow.
 * The big numbers are sized to their columns (container query units), so at
 * no width can one reach the hairline or the number beside it.
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
              {VOICES.map((voice) => {
                const study = caseFor(voice.quote);
                return (
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
                    {study ? (
                      <Link href={study.href} className={styles.voiceCase} data-cta-placement={`home_proof_case_${study.slug}`}>
                        Read the {study.client} case study
                        <span aria-hidden="true" className={styles.voiceCaseArrow}>
                          <Arrow />
                        </span>
                      </Link>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}

      </div>
    </section>
  );
}
