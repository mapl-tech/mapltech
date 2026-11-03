import BundleTiers from './BundleTiers';
import HourlyRates from './HourlyRates';
import MatchedTiers from './MatchedTiers';
import OpenTarget from './OpenTarget';
import ServiceTiers from './ServiceTiers';
import WideOpen from './WideOpen';
import { PRICE_LIST, SERVICES } from './content';
import styles from './PriceList.module.scss';

/**
 * The full price list, on paper (the page's light section). Each service is
 * one row, a native <details> that opens to its packages, monthly plans and
 * what every package includes, so the page stays short and the summaries
 * double as the index. Everything is server HTML whether a row is open or
 * not, read by search engines and by the OfferCatalog JSON-LD. Links to a
 * row (the starting-price ledger, the readout's bundle link, /pricing#bundles)
 * open it first (OpenTarget).
 */
export default function PriceList() {
  return (
    <section id="price-list" className={styles.list} aria-labelledby="price-list-title">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.label}>{PRICE_LIST.label}</p>
          <h2 id="price-list-title" className={styles.title}>
            {PRICE_LIST.title}
          </h2>
          <p className={styles.lede}>{PRICE_LIST.lede}</p>
        </header>

        <div className={styles.groups}>
          {SERVICES.map((facts) => (
            <ServiceTiers key={facts.service} facts={facts} />
          ))}
          <BundleTiers />
          <HourlyRates />
        </div>
      </div>
      <MatchedTiers />
      <WideOpen />
      <OpenTarget />
    </section>
  );
}
