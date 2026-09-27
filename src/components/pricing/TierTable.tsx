import type { ReactNode } from 'react';
import { SIZE_OPTIONS, parsePriceLabel, recurringLinesFor, tiersFor, type EstimateService } from '@/lib/estimate';
import Cta from './Cta';
import LoadIntoEstimator from './LoadIntoEstimator';
import TierDetails from './TierDetails';
import styles from './sections.module.scss';

export interface SectionCopy {
  eyebrow: string;
  title: string;
  subtitle: string;
}

interface TierTableProps {
  id: string;
  service: EstimateService;
  copy: SectionCopy;
  recurring: SectionCopy;
  children?: ReactNode;
}

/** Index of the "Most popular" tier (the middle tier on every service line). */
const FEATURED_INDEX = 1;

/**
 * One service line's static tier table: the crawlable price statements
 * (every tier, feature and monthly line in the server HTML), read by the
 * OfferCatalog JSON-LD and loadable into the estimator above.
 */
export default function TierTable({ id, service, copy, recurring, children }: TierTableProps) {
  const tiers = tiersFor(service);
  const lines = recurringLinesFor(service);
  const titleId = `${id}-title`;

  return (
    <section id={id} className={styles.section} aria-labelledby={titleId}>
      <div className={styles.inner}>
        <header className={`${styles.head} reveal`}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id={titleId} className={styles.title}>
            {copy.title}
          </h2>
          <p className={styles.sub}>{copy.subtitle}</p>
        </header>

        <ul className={`${styles.tiers} reveal`} data-cols={tiers.length}>
          {tiers.map((tier, index) => {
            const parsed = parsePriceLabel(tier.price);
            const size = SIZE_OPTIONS[service].find((option) => option.tierIndex === index);
            const featured = index === FEATURED_INDEX;
            const unit = parsed.isCustom ? 'fixed quote after scoping' : service === 'web' ? 'starting at' : 'one-time';

            return (
              <li key={tier.name} className={styles.tier} data-featured={featured || undefined}>
                {featured && <span className={styles.badge}>Most popular</span>}
                <h3 className={styles.tierName}>{tier.name}</h3>
                <p className={styles.tierDesc}>{tier.description}</p>
                <p className={styles.price}>
                  <span className={styles.priceValue}>{tier.price}</span>
                  <span className={styles.priceUnit}>{unit}</span>
                </p>

                <TierDetails
                  className={styles.details}
                  summaryClassName={styles.summary}
                  summary={
                    <span>
                      What&apos;s included <span className={styles.count}>({tier.features.length})</span>
                    </span>
                  }
                >
                  <ul className={styles.features}>
                    {tier.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </TierDetails>

                <div className={styles.tierAction}>
                  {parsed.isCustom || !size ? (
                    <Cta href="/contact-us" variant="secondary" size="small" placement="pricing_tier_enterprise_call">
                      Book a 20-min scoping call
                    </Cta>
                  ) : (
                    <LoadIntoEstimator service={service} size={size.key} className={styles.load}>
                      Load into estimator <span aria-hidden="true">&uarr;</span>
                    </LoadIntoEstimator>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <div className={`${styles.retainers} reveal`}>
          <header className={styles.headSm}>
            <p className={styles.eyebrow}>{recurring.eyebrow}</p>
            <h3 className={styles.titleSm}>{recurring.title}</h3>
            <p className={styles.sub}>{recurring.subtitle}</p>
          </header>
          <ul className={styles.retainerGrid}>
            {lines.map((line) => (
              <li key={line.name} className={styles.retainer}>
                <span className={styles.retainerName}>{line.name}</span>
                <span className={styles.retainerPrice}>{line.price}</span>
                {line.description && <span className={styles.retainerDesc}>{line.description}</span>}
              </li>
            ))}
          </ul>
        </div>

        {children}
      </div>
    </section>
  );
}
