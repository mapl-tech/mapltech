import type { Metadata } from 'next';
import Accordion from '@/components/ui/Accordion';
import JsonLd from '@/components/seo/JsonLd';
import { faqPage, offerCatalog, pageGraph } from '@/lib/schema';
import PricingHero from '@/components/pricing/PricingHero';
import ScopeEstimator from '@/components/pricing/ScopeEstimator';
import QuoteSteps from '@/components/pricing/QuoteSteps';
import PriceList from '@/components/pricing/PriceList';
import PricingClose from '@/components/pricing/PricingClose';
import { pricingFaq } from '@/components/pricing/pricingFaq';
import {
  ESTIMATOR,
  FAQ_COPY,
  PRICING_DESCRIPTION,
  PRICING_PATH,
  PRICING_TITLE,
  PRICING_URL,
} from '@/components/pricing/content';
import sections from '@/components/pricing/PricingSections.module.scss';
import styles from './page.module.scss';

/*
 * /pricing, flagship redesign (Nov 2026). Answer first (the four "from"
 * prices), then the page's one interaction (the Scope Estimator, #estimator,
 * deep-linkable as /pricing?svc=web#estimator), what happens after it, the
 * full price list as plain HTML, the FAQ and the close.
 *
 * Every price is read from site.ts through src/lib/estimate.ts. Structured
 * data is one page graph: WebPage + BreadcrumbList + the OfferCatalog of every
 * published price (src/lib/schema.ts) + the FAQPage built from the same array
 * the accordion renders, so markup and JSON-LD can never disagree.
 */

const SOCIAL_TITLE = `${PRICING_TITLE} | MAPL TECH`;
// The site's Open Graph image (the root layout's), with its own alt text.
const OG_IMAGE = '/images/og-flagship.jpg';

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
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'MAPL TECH: Your agency sells the vision. We engineer the software behind it.' }],
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

      <PricingHero />

      {/* The one interaction: the page stops moving and starts answering. */}
      <section id="estimator" className={styles.estimator} aria-labelledby="estimator-title">
        <div className={styles.inner}>
          <div className={styles.head}>
            <h2 id="estimator-title" className={styles.title}>
              {ESTIMATOR.title}
            </h2>
            <p className={styles.lede}>{ESTIMATOR.lede}</p>
          </div>
          <ScopeEstimator />
        </div>
      </section>

      <QuoteSteps />

      <PriceList />

      <section id="faq" className={sections.faq} aria-labelledby="faq-title">
        <div className={sections.split}>
          <div className={sections.splitHead}>
            <h2 id="faq-title" className={sections.h2}>
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

      <PricingClose />
    </>
  );
}
