import { HOURLY, priceText } from './content';
import styles from './PriceList.module.scss';

/** Hourly rates from `pricing.hourlyRates`; names match the OfferCatalog JSON-LD. */
export default function HourlyRates() {
  return (
    <section id="hourly" className={styles.group} aria-labelledby="hourly-title">
      <header className={styles.groupHead}>
        <h3 id="hourly-title" className={styles.groupTitle}>
          Hourly
        </h3>
        <p className={styles.groupAnswer}>{HOURLY.answer}</p>
      </header>
      <div className={styles.monthly}>
        <ul className={styles.monthlyList} role="list">
          {HOURLY.rates.map((rate) => (
            <li key={rate.name} className={styles.monthlyRow}>
              <span className={styles.monthlyName}>{rate.name}</span>
              <span className={styles.monthlyPrice}>
                {priceText(rate.price)}
                <span className={styles.per}>/hour</span>
              </span>
              <span className={styles.monthlyDesc}>{rate.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
