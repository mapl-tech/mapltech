import type { Metadata } from 'next';
import Link from 'next/link';
import Accordion from '@/components/ui/Accordion';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import JsonLd from '@/components/seo/JsonLd';
import { faqPage, offerCatalog, pageGraph } from '@/lib/schema';
import { REDESIGN_DATE, routeLastModified } from '@/config/routes';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import ScopeEstimator from '@/components/pricing/ScopeEstimator';
import PriceList from '@/components/pricing/PriceList';
import { pricingFaq } from '@/components/pricing/pricingFaq';
import {
  BUNDLES_FROM,
  CLOSE,
  ESTIMATOR,
  FAQ_COPY,
  HERO,
  HOURLY_FROM,
  PRICING_DESCRIPTION,
  PRICING_PATH,
  PRICING_TITLE,
  PRICING_URL,
  SERVICES,
  longDate,
} from '@/components/pricing/content';
import sections from '@/components/pricing/PricingSections.module.scss';
import styles from './page.module.scss';

/*
 * /pricing (Nov 2026 award pass, simplified). Answer first: the H1 names the
 * question, the lede says how to use the page and the trust line says what
 * happens after the range (a 20-minute call, one fixed price). Then the four
 * starting prices as a ledger of very large numerals, the estimator (the hero
 * action: #estimator, deep-linkable as /pricing?svc=web#estimator, URL state
 * and engine untouched), the full price list on paper with every service
 * collapsed to one row, the FAQ and the crimson close.
 *
 * Every price is read from site.ts through src/lib/estimate.ts. Structured
 * data is one page graph: WebPage + BreadcrumbList + the OfferCatalog of every
 * published price (src/lib/schema.ts) + the FAQPage built from the same array
 * the accordion renders, so markup and JSON-LD can never disagree.
 */

const SOCIAL_TITLE = `${PRICING_TITLE} | MAPL TECH`;
// The site's Open Graph image (the root layout's), with its own alt text.
const OG_IMAGE = '/images/og-flagship.jpg';

/** ISO date the page last changed (the route's lastModified, also the JSON-LD dateModified). */
const LAST_REVIEWED = routeLastModified(PRICING_PATH) ?? REDESIGN_DATE;

export const metadata: Metadata = {
  title: PRICING_TITLE,
  description: PRICING_DESCRIPTION,
  alternates: { canonical: PRICING_URL },
  openGraph: {
    type: 'website',
    url: PRICING_URL,
    siteName: 'MAPL TECH',
    locale: 'en_CA',
    title: SOCIAL_TITLE,
    description: PRICING_DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'MAPL TECH: The engineering backbone behind agencies that refuse to cut corners. A spine of crimson, graphite and chrome rods beside the headline.' }],
  },
  twitter: { card: 'summary_large_image', title: SOCIAL_TITLE, description: PRICING_DESCRIPTION, images: [OG_IMAGE] },
};

const pricingGraph = pageGraph({
  path: PRICING_PATH,
  name: PRICING_TITLE,
  description: PRICING_DESCRIPTION,
  nodes: [offerCatalog({ path: PRICING_PATH }), faqPage(pricingFaq, { path: PRICING_PATH, name: FAQ_COPY.title })],
});

export default function PricingPage() {
  return (
    <>
      <JsonLd data={pricingGraph} />

      <PageHeader
        id="pricing-title"
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Pricing' }]}
        label={HERO.eyebrow}
        title={HERO.title}
        lede={<p>{HERO.lede}</p>}
        actions={
          <>
            {/* The hero action is the estimator; the mobile bar repeats it (data-hero-cta). */}
            <a href="#estimator" className={styles.primary} data-hero-cta="" data-cta-placement="pricing_hero_primary">
              Price your project
            </a>
            <Link href={PROJECT_HREF} className={styles.secondary} data-cta-placement="pricing_hero_project">
              {PROJECT_LABEL}
            </Link>
            <p className={styles.trust}>{HERO.trust}</p>
          </>
        }
      />

      {/* The answer, as a ledger: the four starting prices, each a link to its tiers. */}
      <section className={styles.starting} aria-labelledby="starting-title">
        <div className={styles.startingInner}>
          <h2 id="starting-title" className={styles.startingLabel}>
            Starting prices
          </h2>
          <dl className={styles.ledger}>
            {SERVICES.map((facts) => (
              <div key={facts.service} className={styles.cell}>
                <dt className={styles.cellName}>{facts.name}</dt>
                <dd className={styles.cellPrice}>
                  <span className={styles.from}>From</span>
                  <span className={styles.amount}>{facts.fromLabel}</span>
                </dd>
                <dd className={styles.cellNote}>{facts.entry}</dd>
                <dd className={styles.cellLink}>
                  {/* Visible words first, context after (2.5.3); OpenTarget opens the row it points at. */}
                  <a href={`#${facts.id}`} data-cta-placement={`pricing_ledger_${facts.service}`}>
                    All {facts.tierCount} packages<span className="visually-hidden"> for {facts.name}</span>
                    <span className={styles.cellArrow} aria-hidden="true">
                      ↓
                    </span>
                  </a>
                </dd>
              </div>
            ))}
          </dl>
          <p className={styles.asOf}>
            Bundles of several services from {BUNDLES_FROM} a month. Hourly work from {HOURLY_FROM} an hour. Prices last
            updated <time dateTime={LAST_REVIEWED}>{longDate(LAST_REVIEWED)}</time>.
          </p>
        </div>
      </section>

      {/* The one interaction. */}
      <section id="estimator" className={styles.estimator} aria-labelledby="estimator-title">
        <div className={styles.estimatorInner}>
          <header className={sections.head}>
            <p className={sections.label}>{ESTIMATOR.label}</p>
            <h2 id="estimator-title" className={sections.title}>
              {ESTIMATOR.title}
            </h2>
            <p className={sections.lede}>{ESTIMATOR.lede}</p>
          </header>
          <ScopeEstimator />
        </div>
      </section>

      <PriceList />

      <section id="faq" className={sections.faq} aria-labelledby="faq-title">
        <div className={sections.faqInner}>
          <div className={sections.faqHead}>
            <p className={sections.label}>{FAQ_COPY.label}</p>
            <h2 id="faq-title" className={sections.title}>
              {FAQ_COPY.title}
            </h2>
            <p className={sections.lede}>{FAQ_COPY.lede}</p>
          </div>
          <Accordion
            name="pricing-faq"
            defaultOpen={0}
            className={sections.faqList}
            items={pricingFaq.map((item, index) => ({ id: `faq-${index + 1}`, question: item.question, answer: item.answer }))}
          />
        </div>
      </section>

      <CloseBand
        id="pricing-close-title"
        placement="pricing_close"
        title={CLOSE.title}
        lede={CLOSE.lede}
        secondary={{ label: 'See the work', href: '/our-work' }}
      />
    </>
  );
}
