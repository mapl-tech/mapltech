import { pricing } from '@/config/site';
import { slugify } from '@/lib/schema';
import Cta from './Cta';
import TierDetails from './TierDetails';
import styles from './sections.module.scss';

/** Index of the "Recommended" bundle (Full Systems Partner). */
const RECOMMENDED_INDEX = 1;

/** Partner retainers from `pricing.bundles`; also surfaced inside the estimator when 2+ lines are picked. */
export default function Bundles() {
  return (
    <section id="bundles" className={styles.section} aria-labelledby="bundles-title">
      <div className={styles.inner}>
        <header className={`${styles.head} reveal`}>
          <p className={styles.eyebrow}>Agency bundles</p>
          <h2 id="bundles-title" className={styles.title}>
            The Smartest Agencies Don&apos;t Hire. They Partner.
          </h2>
          <p className={styles.sub}>One predictable monthly cost. A full engineering team on tap. Zero overhead.</p>
          <p className={styles.body}>
            Hiring a senior developer costs $120K+/year before benefits. Our bundles give you an entire engineering
            team for a fraction of the cost - with no recruiting, no onboarding, and no downtime between projects.
          </p>
        </header>

        <ul className={`${styles.tiers} reveal`} data-cols={pricing.bundles.length}>
          {pricing.bundles.map((bundle, index) => {
            const slug = slugify(bundle.name);
            const recommended = index === RECOMMENDED_INDEX;
            return (
              <li key={bundle.name} className={styles.tier} data-featured={recommended || undefined}>
                {recommended && <span className={styles.badge}>Recommended</span>}
                <h3 className={styles.tierName}>{bundle.name}</h3>
                <p className={styles.tierDesc}>{bundle.description}</p>
                <p className={styles.price}>
                  <span className={styles.priceValue}>{bundle.price}</span>
                  <span className={styles.priceUnit}>retainer</span>
                </p>
                <TierDetails
                  className={styles.details}
                  summaryClassName={styles.summary}
                  summary={
                    <span>
                      What&apos;s included <span className={styles.count}>({bundle.features.length})</span>
                    </span>
                  }
                >
                  <ul className={styles.features}>
                    {bundle.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                </TierDetails>
                <div className={styles.tierAction}>
                  <Cta
                    href={`/contact-us?bundle=${slug}`}
                    variant={recommended ? 'primary' : 'secondary'}
                    size="small"
                    placement={`pricing_bundle_${slug.replace(/-/g, '_')}`}
                  >
                    Book a 20-min scoping call
                  </Cta>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
