import type { CSSProperties } from 'react';
import Link from 'next/link';
import { PRICING_HREF } from '@/components/layout/chrome';
import { pricing } from '@/config/site';
import { keepTogether } from './keepTogether';
import {
  QUOTE_LINE,
  cleanCopy,
  humanPrice,
  tierSentence,
  tierViews,
  type LayerView,
  type TierView,
} from './serviceContent';
import styles from './TierSchedule.module.scss';

/** Tier descriptions in site.ts have no closing punctuation. */
function sentence(text: string): string {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

/** "$1,000-$2,000/month" → the amount at display size, "a month" beside it in body type. */
function Amount({ label }: { label: string }) {
  const human = humanPrice(label);
  const match = human.match(/^(.*?)\s(a month|an hour)$/);
  if (!match) return <>{keepTogether(human)}</>;
  return (
    <>
      {keepTogether(match[1])} <span className={styles.unit}>{match[2]}</span>
    </>
  );
}

/**
 * The line's tiers on paper, side by side like a printed price list: name,
 * public price and what kind of number it is, the typical timeline where
 * services.ts states one, who it is for and every feature. No tier is marked
 * "recommended": nothing in the data says which one most clients choose.
 * Each column deep-links the estimator with that tier selected; a Custom tier
 * goes to the project brief. Below, the monthly plans and the hourly rate:
 * nothing price-related is hidden.
 */
export default function TierSchedule({ view }: { view: LayerView }) {
  const tiers = tierViews(view);
  const isWeb = view.service === 'web';

  return (
    <section id="tiers" className={styles.tiers} aria-labelledby="tiers-title">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.label}>Tiers and prices</p>
          <h2 id="tiers-title" className={styles.title}>
            Transparent pricing, no surprises.
          </h2>
          <p className={styles.lede}>{keepTogether(`${tierSentence(view)} ${QUOTE_LINE}`)}</p>
        </header>

        <ol className={styles.grid} data-count={tiers.length}>
          {tiers.map((tier, i) => (
            <TierColumn key={tier.id} tier={tier} index={i} slug={view.slug} />
          ))}
        </ol>

        <div className={styles.after}>
          <div className={styles.afterHead}>
            <h3 className={styles.afterTitle}>After launch</h3>
            <p className={styles.afterIntro}>
              {keepTogether(
                isWeb && view.record.postLaunchSupport
                  ? `Every tier includes post-launch support (${cleanCopy(view.record.postLaunchSupport)}). After that, a monthly plan or hourly work.`
                  : 'Once it is live: a monthly retainer, or hourly work when you need it.',
              )}
            </p>
          </div>
          <dl className={styles.plans} style={{ '--plans': view.recurring.length + 1 } as CSSProperties}>
            {view.recurring.map((line) => (
              <div key={line.name} className={styles.plan}>
                <dt className={styles.planName}>{line.name}</dt>
                <dd className={styles.planPrice}>
                  <Amount label={line.price} />
                </dd>
                {line.description ? (
                  <dd className={styles.planWhat}>{sentence(cleanCopy(line.description))}</dd>
                ) : null}
              </div>
            ))}
            <div className={styles.plan}>
              <dt className={styles.planName}>Hourly</dt>
              <dd className={styles.planPrice}>
                <Amount label={pricing.hourlyRates.standard} />
              </dd>
              <dd className={styles.planWhat}>Emergency work {humanPrice(pricing.hourlyRates.emergency)}.</dd>
            </div>
          </dl>
          <p className={styles.allPrices}>
            <Link href={PRICING_HREF} className={styles.textLink} data-cta-placement={`${view.slug}_tiers_pricing`}>
              Every price we publish, on one page
              <span aria-hidden="true" className={styles.arrow}>
                →
              </span>
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}

function TierColumn({ tier, index, slug }: { tier: TierView; index: number; slug: string }) {
  return (
    <li id={tier.id} className={styles.tier}>
      <div className={styles.tierHead}>
        <span className={styles.tierNo} aria-hidden="true">
          {String(index + 1).padStart(2, '0')}
        </span>
        <h3 className={styles.tierName}>{tier.name}</h3>
      </div>
      <div className={styles.priceBlock}>
        <p className={styles.price} data-long={tier.price.length > 8 ? '' : undefined}>
          {tier.price}
        </p>
        <p className={styles.priceNote}>
          {tier.priceNote}
          {tier.timeline ? (
            <>
              {' · '}
              <span className={styles.nowrap}>typically {tier.timeline.label}</span>
            </>
          ) : null}
        </p>
      </div>
      <p className={styles.who}>{keepTogether(sentence(tier.who))}</p>
      <div className={styles.features}>
        {tier.builds ? <p className={styles.builds}>{tier.builds}, plus:</p> : null}
        <ul role="list">
          {tier.features.map((feature) => (
            <li key={feature}>{keepTogether(feature)}</li>
          ))}
        </ul>
      </div>
      <p className={styles.action}>
        <Link href={tier.href} className={styles.tierLink} data-cta-placement={`${slug}_${tier.id}`}>
          {tier.isCustom ? (
            <>
              Start a project<span className="visually-hidden"> at the {tier.name} tier</span>
            </>
          ) : (
            <>
              Price this tier<span className="visually-hidden">: {tier.name}</span>
            </>
          )}
          <span aria-hidden="true" className={styles.arrow}>
            →
          </span>
        </Link>
      </p>
    </li>
  );
}
