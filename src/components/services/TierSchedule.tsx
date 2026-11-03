import type { CSSProperties } from 'react';
import Link from 'next/link';
import { PRICING_HREF, PRICING_LABEL } from '@/components/layout/chrome';
import { pricing } from '@/config/site';
import { formatMoney } from '@/lib/estimate';
import { keepTogether } from './keepTogether';
import {
  QUOTE_LINE,
  TIER_HIGHLIGHTS,
  cleanCopy,
  costTitle,
  humanPrice,
  supportWindow,
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
 * What the service costs, on paper: one card per tier with its name, public
 * price, who it is for and what it includes. A starting price reads "From
 * $5,000"; a range reads as a range. Tablets and desktops show the first three
 * inclusions and fold the rest into "What’s included"; phones fold them all,
 * with the tier's action, into the same "What’s included", so four tiers read
 * in under two screens. No tier is marked "recommended": nothing in the data
 * says which one most clients choose. Each card deep-links the estimator with
 * that package selected ("Price this package"); a Custom package goes to the project
 * brief ("Start a project"). Monthly plans and the hourly rate follow, one tap
 * away.
 */
export default function TierSchedule({ view }: { view: LayerView }) {
  const tiers = tierViews(view);
  const support = supportWindow(view);
  const monthly = view.lowestMonthly ? `${formatMoney(view.lowestMonthly.amount)} a month` : null;
  const hourly = humanPrice(pricing.hourlyRates.standard);
  const afterIntro = [
    support ? `Every tier includes ${support} of support after launch.` : 'Once it is live, we can keep looking after it.',
    monthly ? (support ? `After that, plans cost from ${monthly}.` : `Plans cost from ${monthly}.`) : null,
    `Hourly work is ${hourly}.`,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section id="tiers" className={styles.tiers} aria-labelledby="tiers-title">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.label}>What it costs</p>
          <h2 id="tiers-title" className={styles.title}>
            {costTitle(view)}
          </h2>
          <p className={styles.lede}>{keepTogether(`Every price is public. Pick the tier closest to your project. ${QUOTE_LINE}`)}</p>
        </header>

        <ol className={styles.grid} data-count={tiers.length}>
          {tiers.map((tier) => (
            <TierCard key={tier.id} tier={tier} slug={view.slug} />
          ))}
        </ol>

        <div className={styles.after}>
          <h3 className={styles.afterTitle}>After launch</h3>
          <p className={styles.afterIntro}>{keepTogether(afterIntro)}</p>
          <details className={styles.plansBox}>
            <summary className={styles.summary}>
              See the monthly plans
              <span className={styles.chevron} aria-hidden="true" />
            </summary>
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
          </details>
          <p className={styles.allPrices}>
            <Link href={PRICING_HREF} className={styles.textLink} data-cta-placement={`${view.slug}_tiers_pricing`}>
              {PRICING_LABEL}
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

/** Under the price: how Custom is priced, and the typical timeline where one is published (web), kept on one line. */
function PriceNote({ tier }: { tier: TierView }) {
  const timeline = tier.timeline ? `${tier.priceNote ? 'usually' : 'Usually'} ${tier.timeline.label}` : null;
  if (!tier.priceNote && !timeline) return null;
  return (
    <p className={styles.priceNote}>
      {tier.priceNote}
      {tier.priceNote && timeline ? ' · ' : null}
      {timeline ? <span className={styles.nowrap}>{timeline}</span> : null}
    </p>
  );
}

function TierCard({ tier, slug }: { tier: TierView; slug: string }) {
  const top = tier.features.slice(0, TIER_HIGHLIGHTS);
  const rest = tier.features.slice(TIER_HIGHLIGHTS);
  const builds = tier.builds ? <p className={styles.builds}>{tier.builds}, plus:</p> : null;
  const item = (feature: string) => <li key={feature}>{keepTogether(feature)}</li>;
  const action = (
    <Link href={tier.href} className={styles.tierLink} data-cta-placement={`${slug}_${tier.id}`}>
      {tier.isCustom ? (
        <>
          Start a project<span className="visually-hidden"> at the {tier.name} tier</span>
        </>
      ) : (
        <>
          Price this package<span className="visually-hidden">: {tier.name}</span>
        </>
      )}
      <span aria-hidden="true" className={styles.arrow}>
        →
      </span>
    </Link>
  );

  return (
    <li id={tier.id} className={styles.tier}>
      <div className={styles.top}>
        <h3 className={styles.tierName}>{tier.name}</h3>
        <div className={styles.priceBlock}>
          <p className={styles.price} data-long={tier.price.length > 8 ? '' : undefined}>
            {tier.isFloor ? <span className={styles.from}>From </span> : null}
            {tier.price}
          </p>
          <PriceNote tier={tier} />
        </div>
      </div>
      <p className={styles.who}>{keepTogether(sentence(tier.who))}</p>
      <div className={styles.features}>
        {/* Tablets and desktops: the first three inclusions stay open. */}
        <div className={styles.wide}>
          {builds}
          <ul role="list">{top.map(item)}</ul>
        </div>
        <details className={styles.more} data-rest={rest.length ? undefined : 'none'}>
          <summary className={styles.summary}>
            What’s included
            <span className="visually-hidden"> in {tier.name}</span>
            <span className={styles.chevron} aria-hidden="true" />
          </summary>
          <div className={styles.moreBody}>
            {/* Phones: every inclusion sits in here, the first three included, then the tier's action. */}
            <div className={styles.phoneOnly}>
              {builds}
              <ul role="list">{top.map(item)}</ul>
            </div>
            {rest.length ? <ul role="list">{rest.map(item)}</ul> : null}
            <p className={`${styles.phoneOnly} ${styles.innerAction}`}>{action}</p>
          </div>
        </details>
      </div>
      <p className={styles.action}>{action}</p>
    </li>
  );
}
