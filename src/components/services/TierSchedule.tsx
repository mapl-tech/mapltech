import Link from 'next/link';
import { pricing } from '@/config/site';
import { keepTogether } from './keepTogether';
import { cleanCopy, humanPrice, tierSentence, tierViews, type LayerView, type TierView } from './serviceContent';
import styles from './ServicePage.module.scss';

/** Tier descriptions in site.ts have no closing punctuation. */
function sentence(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

/**
 * Tiers as a schedule, one row per tier: name, public price, what kind of
 * number it is, the typical timeline where services.ts states one, who it is
 * for and every feature. No tier is marked "recommended": nothing in the data
 * says which one most clients choose. Each row deep-links the estimator with
 * that tier selected; Enterprise (Custom) goes to a call. Below the table,
 * the monthly lines and the hourly rate: nothing price-related is hidden.
 */
export default function TierSchedule({ view }: { view: LayerView }) {
  const tiers = tierViews(view);
  const isWeb = view.service === 'web';

  return (
    <section id="tiers" className={styles.section} aria-labelledby="tiers-title">
      <div className={styles.tiersHead}>
        <h2 id="tiers-title" className={styles.h2}>
          Tiers and prices
        </h2>
        <p className={styles.tiersAnswer}>
          {keepTogether(`${tierSentence(view)} Quotes are fixed after a 20-minute call.`)}
        </p>
      </div>

      <ol className={styles.schedule} role="list">
        {tiers.map((tier) => (
          <TierRow key={tier.id} tier={tier} slug={view.slug} />
        ))}
      </ol>

      <div className={styles.after}>
        <div>
          <h3 className={styles.afterTitle}>After launch</h3>
          <p className={styles.afterIntro}>
            {keepTogether(
              isWeb && view.record.postLaunchSupport
                ? `Every tier includes post-launch support (${cleanCopy(view.record.postLaunchSupport)}). After that, a monthly plan or hourly work.`
                : 'Once it is live: a monthly retainer, or hourly work when you need it.',
            )}
          </p>
        </div>
        <div>
          <dl className={styles.plans}>
            {view.recurring.map((line) => (
              <div key={line.name} className={styles.plan}>
                <dt className={styles.planName}>{line.name}</dt>
                <dd className={styles.planPrice}>{humanPrice(line.price)}</dd>
                {line.description ? (
                  <dd className={styles.planWhat}>{keepTogether(sentence(cleanCopy(line.description)))}</dd>
                ) : null}
              </div>
            ))}
            <div className={styles.plan}>
              <dt className={styles.planName}>Hourly</dt>
              <dd className={styles.planPrice}>{humanPrice(pricing.hourlyRates.standard)}</dd>
              <dd className={styles.planWhat}>Emergency work {humanPrice(pricing.hourlyRates.emergency)}.</dd>
            </div>
          </dl>
          <p className={styles.allPrices}>
            <Link href="/pricing" className={styles.textLink}>
              Every price we publish, on one page
              <span aria-hidden="true" className={styles.arrow}>
                &nbsp;→
              </span>
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function TierRow({ tier, slug }: { tier: TierView; slug: string }) {
  return (
    <li id={tier.id} className={styles.tier}>
      <div>
        <h3 className={styles.tierName}>{tier.name}</h3>
        <p className={styles.tierPrice}>{tier.price}</p>
        <p className={styles.tierPriceNote}>{tier.priceNote}</p>
        {tier.timeline ? (
          <p className={styles.tierTimeline}>
            <span>Typical timeline</span>
            {tier.timeline.label}
          </p>
        ) : null}
        <p className={styles.tierAction}>
          {tier.isCustom ? (
            <Link href={tier.href} className={styles.textLink} data-cta-placement={`${slug}_${tier.id}_call`}>
              Book a call<span className="visually-hidden"> about {tier.name}</span>
              <span aria-hidden="true" className={styles.arrow}>
                &nbsp;→
              </span>
            </Link>
          ) : (
            <Link href={tier.href} className={styles.textLink} data-cta-placement={`${slug}_${tier.id}`}>
              Price your project<span className="visually-hidden"> with {tier.name} selected</span>
              <span aria-hidden="true" className={styles.arrow}>
                &nbsp;→
              </span>
            </Link>
          )}
        </p>
      </div>
      <div>
        <p className={styles.tierWho}>{keepTogether(sentence(tier.who))}</p>
        {tier.builds ? <p className={styles.tierBuilds}>{tier.builds}, plus:</p> : null}
        <ul className={styles.features} role="list">
          {tier.features.map((feature) => (
            <li key={feature}>{keepTogether(feature)}</li>
          ))}
        </ul>
      </div>
    </li>
  );
}
