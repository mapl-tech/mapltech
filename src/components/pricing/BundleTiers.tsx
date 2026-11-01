import Link from 'next/link';
import { pricing } from '@/config/site';
import { slugify } from '@/lib/schema';
import { BUNDLES_ANSWER, canonicalCopy, priceText } from './content';
import TierDetails from './TierDetails';
import styles from './PriceList.module.scss';

/**
 * Partner bundles from `pricing.bundles`: one monthly partnership across
 * several service lines. The estimator surfaces the matching bundle whenever
 * two or more lines are priced together (`bundleFor` in estimate.ts).
 */
export default function BundleTiers() {
  return (
    <section id="bundles" className={styles.group} aria-labelledby="bundles-title">
      <header className={styles.groupHead}>
        <h3 id="bundles-title" className={styles.groupTitle}>
          Partner bundles
        </h3>
        <p className={styles.groupAnswer}>{BUNDLES_ANSWER}</p>
        <p className={styles.groupNote}>Price two or more service lines in the estimator and it names the bundle that covers them.</p>
      </header>

      <ol className={styles.tiers} role="list">
        {pricing.bundles.map((bundle) => {
          const slug = slugify(bundle.name);
          return (
            <li key={bundle.name} className={styles.tier}>
              <div className={styles.tierHead}>
                <h4 className={styles.tierName}>{bundle.name}</h4>
                <p className={styles.tierPrice}>
                  <span className={styles.tierUnit}>Monthly retainer</span>
                  <span className={styles.priceValue}>
                    {priceText(bundle.price)}
                    <span className={styles.perLarge}>/mo</span>
                  </span>
                </p>
              </div>
              <div className={styles.tierBody}>
                <p className={styles.tierDesc}>{canonicalCopy(bundle.description)}</p>
                <TierDetails
                  className={styles.details}
                  summaryClassName={styles.detailsSummary}
                  summary={
                    <span>
                      What&apos;s included <span className={styles.count}>({bundle.features.length})</span>
                    </span>
                  }
                >
                  <ul className={styles.features} role="list">
                    {bundle.features.map((feature) => (
                      <li key={feature}>{canonicalCopy(feature)}</li>
                    ))}
                  </ul>
                </TierDetails>
                <Link
                  href={`/contact-us?bundle=${slug}`}
                  className={styles.tierAction}
                  data-cta-placement={`pricing_bundle_${slug.replace(/-/g, '_')}`}
                >
                  Book a call<span className="visually-hidden"> about the {bundle.name} bundle</span>
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
