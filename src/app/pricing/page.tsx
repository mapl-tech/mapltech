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
  CLOSE,
  ESTIMATOR,
  FAQ_COPY,
  HERO,
  PRICING_DESCRIPTION,
  PRICING_PATH,
  PRICING_TITLE,
  PRICING_URL,
  SERVICES,
  keepNumberWords,
  longDate,
} from '@/components/pricing/content';
import sections from '@/components/pricing/PricingSections.module.scss';
import { keepTogether, withLastWord } from '@/components/services/keepTogether';
import styles from './page.module.scss';
import Arrow from '@/components/ui/Arrow';

/*
 * /pricing (Nov 2026 award pass, simplified). Answer first: the H1 names the
 * question, the lede says how to use the page and the trust line says what
 * happens after the range (a 20-minute call, one fixed price), and the four
 * starting prices sit beside them in the hero (under them on phones and
 * tablets), so the first screen shows a price at every width. Then the
 * estimator (the hero action: #estimator, deep-linkable as
 * /pricing?svc=web#estimator, URL state and engine untouched), the full price
 * list on paper with every service collapsed to one row, the FAQ and the
 * crimson close.
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
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'MAPL TECH: The engineering backbone behind your agency. A spine of crimson, graphite and chrome rods beside the headline.' }],
  },
  twitter: { card: 'summary_large_image', title: SOCIAL_TITLE, description: PRICING_DESCRIPTION, images: [OG_IMAGE] },
};

const pricingGraph = pageGraph({
  path: PRICING_PATH,
  name: PRICING_TITLE,
  description: PRICING_DESCRIPTION,
  nodes: [offerCatalog({ path: PRICING_PATH }), faqPage(pricingFaq, { path: PRICING_PATH, name: FAQ_COPY.title })],
});

/**
 * The answer beside the question: each service's "From" price and what its
 * first package is, each row a link to that service's packages in the price
 * list (OpenTarget opens the row it points at), then what the numbers cover.
 * In the hero's right column on wide screens, under its copy on phones and
 * tablets.
 */
function StartingPrices() {
  return (
    <section className={styles.starting} aria-labelledby="starting-title">
      <h2 id="starting-title" className={styles.startingLabel}>
        What each service costs
      </h2>
      <ul className={styles.ledger} role="list">
        {SERVICES.map((facts) => (
          <li key={facts.service}>
            {/* Named "Web Development, From $5,000, All 4 packages". What each package buys is
                in the price list it leads to, so the row is the name and its price only. */}
            <a
              href={`#${facts.id}`}
              className={styles.cell}
              aria-labelledby={`ledger-${facts.service}-name ledger-${facts.service}-price ledger-${facts.service}-more`}
              data-cta-placement={`pricing_ledger_${facts.service}`}
            >
              <span id={`ledger-${facts.service}-name`} className={styles.cellName}>
                {facts.name}
                <span className="visually-hidden">,</span>
              </span>
              <span id={`ledger-${facts.service}-price`} className={styles.cellPrice}>
                <span className={styles.from}>From </span>
                <span className={styles.amount}>{facts.fromLabel}</span>
                <span className="visually-hidden">,</span>
              </span>
              <span id={`ledger-${facts.service}-more`} className={styles.cellMore}>
                {/* One flex item, so a label that wraps ("All 3" / "packages") keeps the arrow after its last word. */}
                <span>
                  {withLastWord(
                    `All ${facts.tierCount} packages`,
                    <span className={styles.cellArrow} aria-hidden="true">
                      <Arrow direction="down" />
                    </span>,
                  )}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      {/* Monthly partnerships and hourly rates have their own sections below. */}
      <p className={styles.asOf}>
        All prices in US dollars, updated <time dateTime={LAST_REVIEWED}>{longDate(LAST_REVIEWED)}</time>.
      </p>
    </section>
  );
}

export default function PricingPage() {
  return (
    <>
      <JsonLd data={pricingGraph} />

      <PageHeader
        id="pricing-title"
        size="l"
        asideAlign="start"
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
            <p className={styles.trust}>{keepTogether(HERO.trust)}</p>
          </>
        }
        aside={<StartingPrices />}
      />

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
            // The JSON-LD's words exactly; "20-minute" and ranges kept on one line (a no-wrap span).
            items={pricingFaq.map((item, index) => ({
              id: `faq-${index + 1}`,
              question: item.question,
              answer: <p className={sections.faqText}>{keepTogether(item.answer)}</p>,
            }))}
          />
        </div>
      </section>

      <CloseBand
        id="pricing-close-title"
        placement="pricing_close"
        title={CLOSE.title}
        lede={keepNumberWords(CLOSE.lede)}
        secondary={{ label: 'See the work', href: '/our-work' }}
      />
    </>
  );
}
