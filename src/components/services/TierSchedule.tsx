import type { CSSProperties } from 'react';
import Link from 'next/link';
import { PRICING_HREF, PRICING_LABEL } from '@/components/layout/chrome';
import { pricing } from '@/config/site';
import { formatMoney } from '@/lib/estimate';
import { keepTogether, nameHyphens, withLastWord } from './keepTogether';
import {
  SCOPE_LINE,
  TIER_HIGHLIGHTS,
  cleanCopy,
  costTitle,
  humanPrice,
  pricePhrase,
  supportWindow,
  tierViews,
  type LayerView,
  type TierView,
} from './serviceContent';
import styles from './TierSchedule.module.scss';
import Arrow from '@/components/ui/Arrow';

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
 * inclusions and fold the rest into "What’s included"; phones fold them all
 * into the same "What’s included", so four tiers read in under two screens.
 * (The first three are written twice, one copy per width, and only one is ever
 * displayed: a single list cannot show three items while its <details> is
 * closed without client JS or ::details-content overrides.) No tier is marked
 * "recommended": nothing in the data says which one most clients choose.
 * Every card closes on its actions, on the row at every width: "Choose
 * <package>" opens the project brief with the service and the package chosen,
 * and "Price this package" opens the estimator with it selected (a Custom
 * package has no price to show, so it has only the first); across a row of
 * tiers both line up. Monthly plans and the hourly rate follow, one tap away.
 */
export default function TierSchedule({ view }: { view: LayerView }) {
  const tiers = tierViews(view);
  const support = supportWindow(view);
  const monthly = view.lowestMonthly ? `${formatMoney(view.lowestMonthly.amount)} a month` : null;
  // In a sentence, so the range reads "to"; the plan list below keeps the price label's en dash.
  const hourly = pricePhrase(pricing.hourlyRates.standard);
  const afterIntro = [
    support ? `Every package includes ${support} of support after launch.` : 'Once it is live, we can keep working on it with your team.',
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
          <p className={styles.lede}>{keepTogether(`Every price is public. Pick the package closest to your project. ${SCOPE_LINE}`)}</p>
        </header>

        {/* Every package carries its own two actions ("Choose…", "Price this package"), so the phone
            bar's plain "Start a project" steps aside while the list is on screen (MobileActionBar). */}
        <ol className={styles.grid} data-count={tiers.length} data-bar-stand-down="">
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
                  <dt className={styles.planName}>{nameHyphens(line.name)}</dt>
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
                <Arrow />
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
  const builds = tier.builds ? <p className={styles.builds}>{nameHyphens(tier.builds)}, plus:</p> : null;
  const item = (feature: string) => <li key={feature}>{keepTogether(feature)}</li>;

  return (
    <li id={tier.id} className={styles.tier}>
      <div className={styles.top}>
        <h3 className={styles.tierName}>{nameHyphens(tier.name)}</h3>
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
            <span className="visually-hidden"> in {nameHyphens(tier.name)}</span>
            <span className={styles.chevron} aria-hidden="true" />
          </summary>
          <div className={styles.moreBody}>
            {/* Phones: every inclusion sits in here, the first three included. */}
            <div className={styles.phoneOnly}>
              {builds}
              <ul role="list">{top.map(item)}</ul>
            </div>
            {rest.length ? <ul role="list">{rest.map(item)}</ul> : null}
          </div>
        </details>
      </div>
      <div className={styles.actions}>
        <Link href={tier.brief} className={styles.tierLink} data-cta-placement={`${slug}_${tier.id}_start`}>
          {/* No-break hyphens ("AI‑Powered" never splits), and the last word and the arrow in one
              no-wrap span, so a long name wraps without leaving the arrow alone on a line. */}
          {withLastWord(
            `Choose ${nameHyphens(tier.name)}`,
            <>
              {'\u00a0'}
              <span aria-hidden="true" className={styles.arrow}>
                <Arrow />
              </span>
            </>,
          )}
        </Link>
        {tier.isCustom ? null : (
          <Link href={tier.href} className={styles.priceLink} data-cta-placement={`${slug}_${tier.id}`}>
            Price this package<span className="visually-hidden">: {nameHyphens(tier.name)}</span>
          </Link>
        )}
      </div>
    </li>
  );
}
