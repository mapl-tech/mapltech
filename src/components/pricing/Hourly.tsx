import { pricing } from '@/config/site';
import styles from './sections.module.scss';

const RATES = [
  {
    name: 'Standard Rate',
    price: pricing.hourlyRates.standard,
    description: 'Development, automation, and systems work',
  },
  {
    name: 'Emergency / AI Specialist',
    price: pricing.hourlyRates.emergency,
    description: "Urgent fixes, AI agent development, and specialized work. The rate the estimator's Rush option references.",
  },
];

export default function Hourly() {
  return (
    <section id="hourly" className={styles.section} aria-labelledby="hourly-title">
      <div className={styles.inner}>
        <header className={`${styles.head} reveal`}>
          <p className={styles.eyebrow}>Hourly</p>
          <h2 id="hourly-title" className={styles.title}>
            Quick Fix? We&apos;ve Got You.
          </h2>
          <p className={styles.sub}>For urgent fixes, small tasks, or scoping out a bigger engagement.</p>
        </header>

        <ul className={`${styles.hourlyGrid} reveal`}>
          {RATES.map((rate) => (
            <li key={rate.name} className={styles.retainer}>
              <span className={styles.retainerName}>{rate.name}</span>
              <span className={styles.retainerPrice}>{rate.price}</span>
              <span className={styles.retainerDesc}>{rate.description}</span>
            </li>
          ))}
        </ul>

        <p className={`${styles.hourlyNote} reveal`}>
          Hourly is great for a quick win, but most agencies switch to a bundle within 30 days. Predictable costs beat
          surprise invoices every time.
        </p>
      </div>
    </section>
  );
}
