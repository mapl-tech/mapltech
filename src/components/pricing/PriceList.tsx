import BundleTiers from './BundleTiers';
import HourlyRates from './HourlyRates';
import MatchedTiers from './MatchedTiers';
import PriceIndex from './PriceIndex';
import ServiceTiers from './ServiceTiers';
import WideOpen from './WideOpen';
import { BUNDLES_FROM, HOURLY_FROM, PRICE_LIST, SERVICES } from './content';
import styles from './PriceList.module.scss';

/**
 * The full price list: the crawlable price statements, every tier, monthly
 * line, bundle and rate as plain HTML. The heading holds still on wide
 * screens with an index beside it (the homepage's Layers idiom); the rows
 * sit on a red timeline rule that draws as you read.
 */
export default function PriceList() {
  const index = [
    ...SERVICES.map((facts) => ({ id: facts.id, name: facts.name, from: `from ${facts.fromLabel}` })),
    { id: 'bundles', name: 'Partner bundles', from: `from ${BUNDLES_FROM}/mo` },
    { id: 'hourly', name: 'Hourly', from: `from ${HOURLY_FROM}/h` },
  ];

  return (
    <section id="price-list" className={styles.list} aria-labelledby="price-list-title">
      <div className={styles.inner}>
        <div className={styles.rail}>
          <h2 id="price-list-title" className={styles.title}>
            {PRICE_LIST.title}
          </h2>
          <p className={styles.lede}>{PRICE_LIST.lede}</p>
          <PriceIndex items={index} />
        </div>

        <div className={styles.groups}>
          {SERVICES.map((facts) => (
            <ServiceTiers key={facts.service} facts={facts} />
          ))}
          <BundleTiers />
          <HourlyRates />
          <MatchedTiers />
          <WideOpen />
        </div>
      </div>
    </section>
  );
}
