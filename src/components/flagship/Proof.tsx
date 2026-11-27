import { Fragment } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRICING_HREF, PRICING_LABEL } from '@/components/layout/chrome';
import Arrow from '@/components/ui/Arrow';
import QuoteText from '@/components/ui/QuoteText';
import { caseFor } from './caseFor';
import { PROOF_SECTION, REASONS, VOICES } from './content';
import SectionAsk from './SectionAsk';
import styles from './Proof.module.scss';

/**
 * A figure as printed ("$3,500", "~50%", "200+"): the digits in the page's
 * ink, the signs in crimson. A sign before the digits ("$", "~") is set
 * smaller and raised, as a typeset price is, so the digits lead; one after
 * them ("%", "+") stays full size. "~" is shown, and read as "about".
 */
function Figure({ value }: { value: string }) {
  return value
    .split(/([^\d.,]+)/)
    .filter(Boolean)
    .map((part, i) => {
      if (/\d/.test(part)) return <Fragment key={i}>{part}</Fragment>;
      if (i > 0) {
        return (
          <span key={i} className={styles.sign}>
            {part}
          </span>
        );
      }
      return part === '~' ? (
        <Fragment key={i}>
          <span className={`${styles.sign} ${styles.lead} ${styles.approx}`} aria-hidden="true">
            ~
          </span>
          <span className="visually-hidden">about </span>
        </Fragment>
      ) : (
        <span key={i} className={`${styles.sign} ${styles.lead}`}>
          {part}
        </span>
      );
    });
}

/**
 * Why agencies work with us (content.ts PROOF_SECTION, reworked Nov 26, 2026).
 * Three parts, in the order a director weighs a partner:
 * - Four reasons, each one unit: its figure, what the figure counts directly
 *   under it, then the reason. In the DOM the reason's title comes first, so
 *   heading navigation lands on it; CSS shows the figure first (nothing in a
 *   reason is focusable). The figures are sized to their column (container
 *   query units), so none can reach its neighbour.
 * - The site's two testimonials in full, as cards, each ending on the case
 *   study it is about; the words a skimming reader should catch are set
 *   brighter (ui/QuoteText).
 * - One ask, with the trust list beside the button.
 * The clients' logos are in the hero's foot row, in the first screen, so
 * they are not repeated here.
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
          <p className={styles.lede}>{PROOF_SECTION.lede}</p>
        </header>

        <ul className={styles.reasons} role="list">
          {REASONS.map((reason) => (
            <li key={reason.title} className={styles.reason}>
              <h3 className={styles.reasonTitle}>{reason.title}</h3>
              <p className={styles.fact}>
                <span className={styles.figure}>
                  <Figure value={reason.figure} />
                </span>{' '}
                <span className={styles.caption}>{reason.caption}</span>
              </p>
              <p className={styles.reasonText}>{reason.text}</p>
            </li>
          ))}
        </ul>

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
                        <p>
                          <QuoteText quote={voice.quote} highlight={voice.highlight} />
                        </p>
                      </blockquote>
                      <figcaption className={styles.voiceBy}>
                        {voice.image ? (
                          <Image src={voice.image} alt="" width={56} height={56} className={styles.voiceAvatar} />
                        ) : null}
                        <span>
                          <span className={styles.voiceName}>{voice.name}</span>{' '}
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

        {/* The page's second ask (the work cards end on the first), so the quieter one; the
            first reason is public prices, so the prices are one quiet link away. The
            section's grid gap places it under the testimonials. */}
        <SectionAsk
          title={PROOF_SECTION.ask}
          placement="home_proof_ask"
          compact
          secondary={{ label: PRICING_LABEL, href: PRICING_HREF, placement: 'home_proof_pricing' }}
        />
      </div>
    </section>
  );
}
