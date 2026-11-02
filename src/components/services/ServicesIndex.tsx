import Image from 'next/image';
import Link from 'next/link';
import CloseBand from '@/components/flagship/CloseBand';
import { PRICING_HREF, PRICING_LABEL } from '@/components/layout/chrome';
import PageHeader from '@/components/ui/PageHeader';
import HeroActions from './HeroActions';
import IndexRows from './IndexRows';
import { keepTogether } from './keepTogether';
import { CLIENT_QUOTE, ENGAGEMENT, PARTNERSHIPS, RATES } from './serviceContent';
import styles from './ServicesIndex.module.scss';

/**
 * /services (award pass, Nov 2026). The homepage's shell and voice, as a hub:
 *
 *   the statement (PageHeader) → the four service lines as a big numbered
 *   index (each row one link, real work trailing the cursor on desktop) →
 *   how we work with agencies, on paper, with the client in her own words →
 *   the two monthly partnerships and the single-line rates → the crimson close.
 *
 * Server Component; the index preview is the only client island. Copy is
 * sourced in serviceContent.ts (the H1 is the live web page's capabilities
 * heading, "Every Layer of the Stack, Done Right"; the lede opens with the
 * homepage's services lede).
 */
export default function ServicesIndex() {
  return (
    <>
      <PageHeader
        id="services-title"
        label="Services for agencies"
        title={
          <>
            Every layer of the stack, <em>done right.</em>
          </>
        }
        lede={
          <p>
            Systems, automation, and infrastructure, built by engineers who understand agency life. Every price is
            public, and every quote is fixed after a <span className={styles.nowrap}>20-minute</span> call.
          </p>
        }
        actions={<HeroActions page="services" secondary={{ label: PRICING_LABEL, href: PRICING_HREF }} />}
      />

      <section className={styles.index} aria-labelledby="lines-title">
        <div className={styles.indexInner}>
          <h2 id="lines-title" className={styles.indexLabel}>
            Four service lines
          </h2>
          <IndexRows labelId="lines-title" />
        </div>
      </section>

      <HowWeWork />
      <Partnerships />

      <CloseBand placement="services_close" />
    </>
  );
}

function HowWeWork() {
  return (
    <section className={styles.how} aria-labelledby="how-title">
      <div className={styles.howInner}>
        <header className={styles.head}>
          <p className={styles.label}>Working together</p>
          <h2 id="how-title" className={styles.title}>
            How we work with agencies.
          </h2>
          <p className={styles.lede}>The same terms on every service line, stated before you ask.</p>
        </header>

        <ol className={styles.terms}>
          {ENGAGEMENT.map((term, i) => (
            <li key={term.title} className={styles.term}>
              <span className={styles.termNo} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.termTitle}>{term.title}</h3>
              <p className={styles.termText}>{keepTogether(term.text)}</p>
            </li>
          ))}
        </ol>

        {CLIENT_QUOTE ? (
          <figure className={styles.quote}>
            <blockquote className={styles.quoteText}>
              <p>“{CLIENT_QUOTE.quote}”</p>
            </blockquote>
            <figcaption className={styles.by}>
              {CLIENT_QUOTE.image ? (
                <Image src={CLIENT_QUOTE.image} alt="" width={56} height={56} className={styles.avatar} />
              ) : null}
              <span>
                <span className={styles.byName}>{CLIENT_QUOTE.name}</span>
                <span className={styles.byRole}>
                  {CLIENT_QUOTE.role}, {CLIENT_QUOTE.company}
                </span>
              </span>
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}

function Partnerships() {
  return (
    <section className={styles.partner} aria-labelledby="partner-title">
      <div className={styles.partnerInner}>
        <header className={styles.head}>
          <p className={styles.label}>Partnerships</p>
          <h2 id="partner-title" className={styles.title}>
            Two or more lines, one partnership.
          </h2>
          <p className={styles.lede}>A monthly engagement with one team, priced in the open like everything else.</p>
        </header>

        <ul className={styles.plans} role="list">
          {PARTNERSHIPS.map((plan) => {
            const range = plan.price.replace(/ a month$/, '');
            return (
              <li key={plan.name} className={styles.plan}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <p className={styles.planPrice}>
                  {range}
                  <span className={styles.planUnit}> a month</span>
                </p>
                <p className={styles.planWhat}>{plan.description}</p>
                <ul className={styles.planFeatures} role="list">
                  {plan.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>

        <div className={styles.rates}>
          <p className={styles.ratesText}>
            {keepTogether(
              `One line on its own? Monthly plans start at ${RATES.monthlyFrom}. Hourly work runs ${RATES.hourly}, and emergency work ${RATES.emergency}.`,
            )}
          </p>
          <Link href={PRICING_HREF} className={styles.textLink} data-cta-placement="services_partner_pricing">
            Every price we publish, on one page
            <span aria-hidden="true" className={styles.arrow}>
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
