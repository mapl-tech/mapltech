import Image from 'next/image';
import Link from 'next/link';
import { LiveClocks } from '@/components/ui/TimezoneOverlap';
import HomeFaq from '@/components/home/HomeFaq';
import EstimateTeaser from '@/components/home/EstimateTeaser';
import type { FaqEntry } from '@/components/home/data';
import { CLOSE, FOUNDERS, SILENCE, SPOTLIGHT } from './content';
import styles from './Acts.module.scss';

/** Act 5, authored silence: one line alone, so the peak has something to arrive from. */
export function Silence() {
  return (
    <section className={styles.silence} aria-label="Before we show you">
      <p className={styles.silenceLine}>{SILENCE}</p>
    </section>
  );
}

/** Act 8, Warmth: one client, in her words, with her face and full attribution. */
export function Spotlight() {
  if (!SPOTLIGHT) return null;
  return (
    <section className={styles.spotlight} aria-labelledby="spotlight-title">
      <div className={styles.spotlightInner}>
        <h2 id="spotlight-title" className="visually-hidden">
          What a client says
        </h2>
        <figure className={styles.quote}>
          <blockquote className={styles.quoteText}>
            <p>{SPOTLIGHT.quote}</p>
          </blockquote>
          <figcaption className={styles.attribution}>
            {SPOTLIGHT.image ? (
              <Image src={SPOTLIGHT.image} alt="" width={56} height={56} className={styles.avatar} />
            ) : null}
            <span>
              <span className={styles.person}>{SPOTLIGHT.name}</span>
              <span className={styles.role}>
                {SPOTLIGHT.role}, {SPOTLIGHT.company}
              </span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

/** Act 9, Control: price it yourself; the number lands before any ask. */
export function Estimator() {
  return (
    <section className={styles.estimator} aria-labelledby="estimate-title" id="estimate">
      <div className={styles.estimatorInner}>
        <div className={styles.estimatorHead}>
          <h2 id="estimate-title" className={styles.h2}>
            Price it yourself.
          </h2>
          <p className={styles.lede}>
            Our price list is public, so this is not a teaser. Pick what you need and the range updates as you go. No
            email until you want the estimate sent.
          </p>
        </div>
        <EstimateTeaser />
      </div>
    </section>
  );
}

/** Act 10, Intimacy: the two founders and the hours the three offices share with you. */
export function Founders() {
  return (
    <section className={styles.founders} aria-labelledby="founders-title">
      <div className={styles.foundersInner}>
        <div className={styles.foundersText}>
          <h2 id="founders-title" className={styles.h2}>
            {FOUNDERS.title}
          </h2>
          <p className={styles.lede}>{FOUNDERS.lede}</p>
          <div className={styles.clocks}>
            <LiveClocks />
          </div>
          <Link href="/about-us" className={styles.textLink}>
            How we work<span aria-hidden="true"> →</span>
          </Link>
        </div>
        <ul className={styles.people} role="list">
          {FOUNDERS.people.map((person) => (
            <li key={person.name} className={styles.person2}>
              <Image
                src={person.image}
                alt={`${person.name}, ${person.role} of MAPL TECH`}
                width={480}
                height={600}
                sizes="(min-width: 1024px) 22vw, 45vw"
                className={styles.portrait}
              />
              <p className={styles.personName}>{person.name}</p>
              <p className={styles.personRole}>{person.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Act 11, Assurance: diligence answers, compressed; FAQPage JSON-LD comes from the same items. */
export function Faq({ items }: { items: readonly FaqEntry[] }) {
  return (
    <section className={styles.faq} aria-labelledby="faq-title">
      <div className={styles.faqInner}>
        <div>
          <h2 id="faq-title" className={styles.h2}>
            Diligence answers.
          </h2>
          <p className={styles.lede}>The questions agency owners ask us before they sign, answered plainly.</p>
        </div>
        <HomeFaq items={items} />
      </div>
    </section>
  );
}

/** Act 12, Resolve: the tower finished, and one tiny first yes that carries into the estimator. */
export function Close({ image }: { image: { src: string; width: number; height: number } | null }) {
  return (
    <section className={styles.close} aria-labelledby="close-title">
      {image ? (
        // A wrapper sizes the photograph: full-bleed on landscape, the top of the
        // section on portrait so the copy below sits on solid ground, not on lit windows.
        <div className={styles.closeMedia}>
          <Image src={image.src} alt={CLOSE.imageAlt} fill sizes="100vw" className={styles.closeImg} />
        </div>
      ) : null}
      <div className={styles.closeScrim} aria-hidden="true" />
      <div className={styles.closeInner}>
        <h2 id="close-title" className={styles.closeTitle}>
          {CLOSE.title}
        </h2>
        <p className={styles.closeLede}>{CLOSE.lede}</p>
        <ul className={styles.choices} role="list">
          {CLOSE.choices.map((choice) => (
            <li key={choice.service}>
              <Link href={choice.href} className={styles.choice} data-cta-placement={`home_close_${choice.service}`}>
                {choice.label}
                <span aria-hidden="true" className={styles.choiceArrow}>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.closeAlt}>
          Rather talk it through?{' '}
          <Link href="/contact-us" className={styles.textLink}>
            Book a call
          </Link>
        </p>
      </div>
    </section>
  );
}
