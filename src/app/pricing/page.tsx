import type { Metadata } from 'next';
import Accordion from '@/components/ui/Accordion';
import JsonLd from '@/components/seo/JsonLd';
import { faqPage, offerCatalog, pageGraph } from '@/lib/schema';
import { REDESIGN_DATE, routeLastModified } from '@/config/routes';
import { pricing } from '@/config/site';
import { getService } from '@/config/services';
import { ESTIMATE_SERVICES, SERVICE_META, formatMoney, formatRange, parsePriceLabel, tiersFor } from '@/lib/estimate';
import Cta from '@/components/pricing/Cta';
import ScopeEstimator from '@/components/pricing/ScopeEstimator';
import TierTable from '@/components/pricing/TierTable';
import Bundles from '@/components/pricing/Bundles';
import Hourly from '@/components/pricing/Hourly';
import { pricingFaq } from '@/components/pricing/pricingFaq';
import sections from '@/components/pricing/sections.module.scss';
import styles from './page.module.scss';

const DESCRIPTION =
  'MAPL TECH pricing for web development, automation & AI workflows, custom internal tools, cloud engineering, and agency partnerships. Transparent pricing with retainer options.';

export const metadata: Metadata = {
  title: 'Pricing',
  alternates: { canonical: 'https://mapltech.com/pricing' },
  description: DESCRIPTION,
  openGraph: {
    title: 'Pricing | MAPL TECH',
    description:
      'Transparent pricing for web development, agency automation, internal tools, cloud engineering, and partnership bundles.',
  },
};

/* ------------------------------------------------------------------ */
/* Key facts, derived from pricing so they can never drift from the tables */
/* ------------------------------------------------------------------ */

const lowOf = (label: string) => parsePriceLabel(label).low ?? 0;

const startingPrices = ESTIMATE_SERVICES.map(
  (service) => `${formatMoney(lowOf(tiersFor(service)[0].price))} ${SERVICE_META[service].shortLabel.toLowerCase()}`,
).join(' · ');

const webStart = tiersFor('web')[0].price;
const automationStart = formatMoney(lowOf(tiersFor('automation')[0].price));
const bundleRange = formatRange(
  lowOf(pricing.bundles[0].price),
  parsePriceLabel(pricing.bundles[pricing.bundles.length - 1].price).high ?? lowOf(pricing.bundles[pricing.bundles.length - 1].price),
);

const web = getService('web-development');
const stack = web.stack.map((item) => item.replace(' (custom themes, not page builders)', ' (custom themes)')).join(', ');
const lastReviewed = routeLastModified('/pricing') ?? REDESIGN_DATE;

const JUMP_LINKS = [
  { href: '#web-development', label: 'Web Development' },
  { href: '#automation', label: 'Automation & AI' },
  { href: '#internal-tools', label: 'Internal Tools' },
  { href: '#cloud-engineering', label: 'Cloud Engineering' },
  { href: '#bundles', label: 'Agency Bundles' },
  { href: '#hourly', label: 'Hourly Rates' },
  { href: '#faq', label: 'FAQ' },
];

export default function PricingPage() {
  return (
    <>
      <JsonLd
        data={pageGraph({
          path: '/pricing',
          name: 'Pricing',
          description: DESCRIPTION,
          nodes: [offerCatalog({ path: '/pricing' }), faqPage(pricingFaq, { path: '/pricing' })],
        })}
      />

      {/* 01 Hero - SSR block, no reveal: H1 -> lede -> key facts -> CTAs -> jump links */}
      <section className={styles.hero} aria-labelledby="pricing-title">
        <div className={styles.heroInner}>
          <p className={styles.eyebrow}>Pricing</p>
          <h1 id="pricing-title" className={styles.title}>
            Invest in Systems That Pay for Themselves
          </h1>
          <p className={styles.lede}>
            MAPL TECH publishes every price it charges digital agencies. Web builds start at {webStart}, automation from{' '}
            {automationStart}, and partner retainers run {bundleRange} a month. Build your own estimate below in about 60
            seconds, then take it into a 20-minute scoping call - no email required until you want the number in writing.
          </p>

          <dl className={`kv ${styles.kv}`}>
            <div>
              <dt>Starting price</dt>
              <dd>{startingPrices}</dd>
            </div>
            <div>
              <dt>Typical timeline</dt>
              <dd>{web.typicalTimeline}</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>{stack}</dd>
            </div>
            <div>
              <dt>Offices</dt>
              <dd>Toronto (HQ) &middot; Lagos &middot; Kingston</dd>
            </div>
            <div>
              <dt>Last reviewed</dt>
              <dd>
                <time dateTime={lastReviewed} className={styles.reviewed}>
                  {lastReviewed}
                </time>
              </dd>
            </div>
          </dl>

          <div className={styles.ctas}>
            <Cta href="#estimator" hero placement="pricing_hero_primary">
              Get a 60-second estimate
            </Cta>
            <Cta href="/contact-us" variant="secondary" placement="pricing_hero_secondary">
              Book a 20-min scoping call
            </Cta>
          </div>

          <nav className={styles.jump} aria-label="Jump to a pricing section">
            <span className={styles.jumpLabel} aria-hidden="true">
              Jump to
            </span>
            <ul className={styles.jumpList}>
              {JUMP_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={styles.jumpLink}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* 02 Scope Estimator - the signature interaction */}
      <section id="estimator" className={styles.estimatorSection} aria-labelledby="estimator-title">
        <div className={styles.estimatorInner}>
          <header className={styles.estimatorHead}>
            <p className={styles.eyebrow}>Scope estimator</p>
            <h2 id="estimator-title" className={styles.sectionTitle}>
              Build your own number in 60 seconds
            </h2>
            <p className={styles.sectionSub}>
              Every input maps to a published tier below. The output is always a range; the fixed quote comes after a
              20-minute scoping call.
            </p>
          </header>
          <ScopeEstimator />
        </div>
      </section>

      {/* 03-06 Static tier tables: the crawlable price statements */}
      <TierTable
        id="web-development"
        service="web"
        copy={{
          eyebrow: 'Web Development',
          title: 'Websites That Work as Hard as You Do',
          subtitle:
            'Custom-coded, performance-optimized sites that convert visitors into clients. No templates. No page builders. No compromises.',
        }}
        recurring={{
          eyebrow: 'Maintenance · monthly, after launch',
          title: 'Your site needs care after launch day',
          subtitle:
            'Security patches, performance monitoring, and ongoing updates keep your site fast, safe, and growing.',
        }}
      >
        <div className={`${sections.callout} reveal`}>
          <div>
            <h3>Not sure which plan fits your project?</h3>
            <p>
              Tell us what you need and we will recommend the right scope and budget. No pressure, no hard sell - just
              honest guidance.
            </p>
          </div>
          <Cta href="/contact-us" variant="secondary" placement="pricing_web_callout">
            Book a 20-min scoping call
          </Cta>
        </div>
      </TierTable>

      <TierTable
        id="automation"
        service="automation"
        copy={{
          eyebrow: 'Automation & AI',
          title: 'Stop Doing Manually What Should Run on Autopilot',
          subtitle:
            "Agencies that automate their intake, CRM, and ops save 15-20 hours per week. Here's how to get there.",
        }}
        recurring={{
          eyebrow: 'Retainers · monthly',
          title: "Automations break when nobody's watching them",
          subtitle: 'A retainer keeps your workflows running, optimized, and evolving as your agency scales.',
        }}
      />

      <TierTable
        id="internal-tools"
        service="tools"
        copy={{
          eyebrow: 'Internal Tools',
          title: 'Replace the Spreadsheets Your Team Actually Runs On',
          subtitle:
            'Custom dashboards, portals, and ops platforms that eliminate the duct-tape systems holding your agency back.',
        }}
        recurring={{
          eyebrow: 'Retainers · monthly',
          title: 'Your tools should grow with your agency',
          subtitle: 'New features, bug fixes, and optimizations shipped monthly so your systems never fall behind.',
        }}
      />

      <TierTable
        id="cloud-engineering"
        service="cloud"
        copy={{
          eyebrow: 'Cloud Engineering',
          title: 'Infrastructure That Runs Itself',
          subtitle:
            'Production-grade cloud architecture, CI/CD pipelines, and monitoring - so your agency never worries about uptime or scaling.',
        }}
        recurring={{
          eyebrow: 'Retainers · monthly',
          title: 'Your infrastructure needs attention after launch day',
          subtitle:
            'Ongoing monitoring, cost optimization, and incident response keep your cloud running smoothly as you scale.',
        }}
      />

      {/* 07 Agency bundles */}
      <Bundles />

      {/* 08 Hourly */}
      <Hourly />

      {/* 09 FAQ - native <details>, FAQPage JSON-LD from the same array */}
      <section id="faq" className={sections.section} aria-labelledby="faq-title">
        <div className={sections.faqInner}>
          <header className={`${sections.head} reveal`}>
            <p className={sections.eyebrow}>FAQ</p>
            <h2 id="faq-title" className={sections.title}>
              Questions We Get Asked a Lot
            </h2>
            <p className={sections.sub}>Straight answers so you can make an informed decision.</p>
          </header>
          <div className="reveal">
            <Accordion items={pricingFaq} name="faq" defaultOpen={0} />
          </div>
        </div>
      </section>

      {/* 10 Closing band - leads with the call; every price is already on the page */}
      <section className={sections.band} aria-labelledby="band-title">
        <div className={`${sections.bandInner} reveal`}>
          <h2 id="band-title" className={sections.bandTitle}>
            Let&apos;s Find the Right Fit for Your Agency
          </h2>
          <p className={sections.bandBody}>
            Tell us what&apos;s eating up your team&apos;s time. We&apos;ll show you exactly where automation and better
            systems will save you money - and build you a plan to get there.
          </p>
          <div className={sections.ctaRow}>
            <Cta href="/contact-us" size="large" placement="pricing_band_primary">
              Book a 20-min scoping call
            </Cta>
            <Cta href="#estimator" variant="secondary" size="large" placement="pricing_band_secondary">
              Get a 60-second estimate
            </Cta>
          </div>
        </div>
      </section>
    </>
  );
}
