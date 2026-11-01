import Link from 'next/link';
import { SERVICE_META, SIZE_OPTIONS, parsePriceLabel, recurringLinesFor, tiersFor } from '@/lib/estimate';
import { cleanDash, priceText, type ServiceFacts } from './content';
import LoadIntoEstimator from './LoadIntoEstimator';
import TierDetails from './TierDetails';
import styles from './PriceList.module.scss';

/**
 * One service line in the price list: an answer-first sentence, every tier as
 * a row (name and price, what it is for, everything included) and the monthly
 * lines. All of it is server HTML, read by search engines and by the
 * OfferCatalog JSON-LD, and every priced tier can be loaded into the estimator.
 */
export default function ServiceTiers({ facts }: { facts: ServiceFacts }) {
  const tiers = tiersFor(facts.service);
  const lines = recurringLinesFor(facts.service);
  const meta = SERVICE_META[facts.service];
  const titleId = `${facts.id}-title`;

  return (
    <section id={facts.id} className={styles.group} aria-labelledby={titleId}>
      <header className={styles.groupHead}>
        <h3 id={titleId} className={styles.groupTitle}>
          {facts.name}
        </h3>
        <p className={styles.groupAnswer}>{facts.answer}</p>
        <Link href={facts.href} className={styles.textLink}>
          {facts.linkLabel}
          <span aria-hidden="true"> →</span>
        </Link>
      </header>

      <ol className={styles.tiers} role="list">
        {tiers.map((tier, index) => {
          const parsed = parsePriceLabel(tier.price);
          const size = SIZE_OPTIONS[facts.service].find((option) => option.tierIndex === index);
          const unit = parsed.isCustom ? 'Quoted after scoping' : facts.service === 'web' ? 'Starting at' : 'One-time';
          return (
            <li key={tier.name} className={styles.tier}>
              <div className={styles.tierHead}>
                <h4 className={styles.tierName}>{tier.name}</h4>
                <p className={styles.tierPrice}>
                  <span className={styles.unitRow}>
                    <span className={styles.tierUnit}>{unit}</span>
                    {/* Revealed by MatchedTiers when the visitor's estimate lands on this row. */}
                    <span className={styles.matched} data-match={`${facts.service}:${index}`} hidden>
                      Your estimate
                    </span>
                  </span>
                  <span className={styles.priceValue}>{priceText(tier.price)}</span>
                </p>
              </div>
              <div className={styles.tierBody}>
                <p className={styles.tierDesc}>{cleanDash(tier.description)}</p>
                <TierDetails
                  className={styles.details}
                  summaryClassName={styles.detailsSummary}
                  summary={
                    <span>
                      What&apos;s included <span className={styles.count}>({tier.features.length})</span>
                    </span>
                  }
                >
                  <ul className={styles.features} role="list">
                    {tier.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </TierDetails>
                {parsed.isCustom || !size ? (
                  <Link href="/contact-us" className={styles.tierAction} data-cta-placement={`pricing_tier_${facts.service}_call`}>
                    Book a call<span aria-hidden="true"> →</span>
                  </Link>
                ) : (
                  <LoadIntoEstimator service={facts.service} size={size.key} className={styles.tierAction}>
                    Load into the estimator<span className="visually-hidden">: {facts.name}, {tier.name}</span>
                    <span aria-hidden="true"> ↑</span>
                  </LoadIntoEstimator>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <div className={styles.monthly}>
        <h4 className={styles.monthlyTitle}>
          {meta.recurringLabel === 'Maintenance' ? 'Maintenance, monthly after launch' : 'Retainers, monthly'}
        </h4>
        <ul className={styles.monthlyList} role="list">
          {lines.map((line) => (
            <li key={line.name} className={styles.monthlyRow}>
              <span className={styles.monthlyName}>{line.name}</span>
              <span className={styles.monthlyPrice}>
                {priceText(line.price)}
                <span className={styles.per}>/month</span>
              </span>
              {line.description ? <span className={styles.monthlyDesc}>{line.description}</span> : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
