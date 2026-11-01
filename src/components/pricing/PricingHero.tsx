import Link from 'next/link';
import { BUNDLES_FROM, HERO, HOURLY_FROM, LAST_REVIEWED, SERVICES, longDate } from './content';
import styles from './PricingHero.module.scss';

/**
 * Answer-first hero. The H1 names the reader's question, the first sentence
 * under it is the price list, and the four "from" prices stand underneath as
 * a schedule: a red rule that draws across as the page arrives, a node per
 * service line, hairline dividers between them (static under reduced motion).
 * The H1 is in the first paint, never faded, so it can be the LCP element.
 * One filled action.
 */
export default function PricingHero() {
  return (
    <section className={styles.hero} aria-labelledby="pricing-title">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div className={styles.eyebrowRow}>
            <span className={styles.tick} aria-hidden="true" />
            <p className={styles.eyebrow}>{HERO.eyebrow}</p>
          </div>
          <h1 id="pricing-title" className={styles.title}>
            {HERO.title}
          </h1>
        </div>

        <div className={styles.intro}>
          <p className={styles.lede}>{HERO.lede}</p>
          <div className={styles.actions}>
            <a href="#estimator" className={styles.primary} data-hero-cta="" data-cta-placement="pricing_hero_primary">
              Price your project
            </a>
            <Link href="/contact-us" className={styles.secondary} data-cta-placement="pricing_hero_call">
              Book a call
              <span aria-hidden="true" className={styles.arrow}>
                →
              </span>
            </Link>
          </div>
          <p className={styles.trust}>{HERO.trust}</p>
        </div>

        <div className={styles.schedule}>
          <h2 className={styles.scheduleTitle}>Starting prices, per service line</h2>
          <dl className={styles.ledger}>
            {SERVICES.map((facts, index) => (
              <div key={facts.service} className={styles.cell} style={{ '--i': index } as React.CSSProperties}>
                <dt className={styles.cellName}>{facts.name}</dt>
                <dd className={styles.cellPrice}>
                  <span className={styles.from}>From</span>
                  <span className={styles.amount}>{facts.fromLabel}</span>
                </dd>
                <dd className={styles.cellNote}>{facts.entry}</dd>
                <dd className={styles.cellLink}>
                  {/* Visible words first, context after (2.5.3): "All 4 tiers of Web Development". */}
                  <a href={`#${facts.id}`}>
                    All {facts.tierCount} tiers<span className="visually-hidden"> of {facts.name}</span>
                    <span aria-hidden="true"> ↓</span>
                  </a>
                </dd>
              </div>
            ))}
          </dl>
          <p className={styles.asOf}>
            Partner bundles from {BUNDLES_FROM} a month. Hourly work from {HOURLY_FROM} an hour. Page last updated{' '}
            <time dateTime={LAST_REVIEWED}>{longDate(LAST_REVIEWED)}</time>.
          </p>
        </div>
      </div>
    </section>
  );
}
