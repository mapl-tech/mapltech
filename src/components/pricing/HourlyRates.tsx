import { HOURLY, HOURLY_FROM, priceText } from './content';
import PriceGroup from './PriceGroup';
import styles from './PriceList.module.scss';

/** Hourly rates from `pricing.hourlyRates`; names match the OfferCatalog JSON-LD. */
export default function HourlyRates() {
  return (
    <PriceGroup id="hourly" title="Hourly rates" from={`From ${HOURLY_FROM} an hour`} meta={`${HOURLY.rates.length} rates`}>
      <div className={styles.groupHead}>
        <p className={styles.groupAnswer}>{HOURLY.answer}</p>
      </div>
      <div className={styles.monthly}>
        <ul className={styles.monthlyList} role="list">
          {HOURLY.rates.map((rate) => (
            <li key={rate.name} className={styles.monthlyRow}>
              <span className={styles.monthlyName}>{rate.name}</span>
              <span className={styles.monthlyPrice}>
                {priceText(rate.price)}
                <span className={styles.per}> an hour</span>
              </span>
              <span className={styles.monthlyDesc}>{rate.description}</span>
            </li>
          ))}
        </ul>
      </div>
    </PriceGroup>
  );
}
