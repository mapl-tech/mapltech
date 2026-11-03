import Link from 'next/link';
import { pricing } from '@/config/site';
import { PROJECT_LABEL } from '@/components/layout/chrome';
import { slugify } from '@/lib/schema';
import { BUNDLES_ANSWER, BUNDLES_FROM, canonicalCopy, priceText } from './content';
import PriceGroup from './PriceGroup';
import TierDetails from './TierDetails';
import styles from './PriceList.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * Monthly partnerships from `pricing.bundles`: several services for one
 * monthly price. The estimator names the matching partnership whenever two or
 * more services are priced together (`bundleFor` in estimate.ts). Each one's
 * "Start a project" opens the brief with that partnership already chosen.
 * The row keeps its #bundles anchor (links and the OfferCatalog JSON-LD use it).
 */
export default function BundleTiers() {
  return (
    <PriceGroup
      id="bundles"
      title="Monthly partnerships"
      from={`From ${BUNDLES_FROM} a month`}
      meta={`${pricing.bundles.length} partnerships`}
    >
      <div className={styles.groupHead}>
        <p className={styles.groupAnswer}>{BUNDLES_ANSWER}</p>
        <p className={styles.groupNote}>Pick two or more services in the estimator to see the partnership that fits.</p>
      </div>

      <ol className={styles.tiers} role="list">
        {pricing.bundles.map((bundle) => {
          const slug = slugify(bundle.name);
          return (
            <li key={bundle.name} className={styles.tier}>
              <div className={styles.tierHead}>
                <h4 className={styles.tierName}>{bundle.name}</h4>
                <p className={styles.tierPrice}>
                  <span className={styles.priceValue}>
                    {priceText(bundle.price)}
                    <span className={styles.perLarge}> a month</span>
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
                  {PROJECT_LABEL}
                  <span className="visually-hidden">: {bundle.name}</span>
                   <Arrow />
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </PriceGroup>
  );
}
