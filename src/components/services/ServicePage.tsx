import Link from 'next/link';
import CloseBand from '@/components/flagship/CloseBand';
import JsonLd from '@/components/seo/JsonLd';
import PageHeader from '@/components/ui/PageHeader';
import { estimateLinkFor } from '@/components/work/work-data';
import type { ServiceSlug } from '@/config/services';
import { formatMoney } from '@/lib/estimate';
import { faqPage, itemList, pageGraph, service as serviceNode } from '@/lib/schema';
import FaqList from './FaqList';
import HeroActions from './HeroActions';
import { keepTogether } from './keepTogether';
import ProofBlock from './ProofBlock';
import TierSchedule from './TierSchedule';
import {
  LAYER_VIEWS,
  SERVICES_REVISED,
  capabilityViews,
  faqItems,
  layerView,
  proofCases,
  stackLine,
  stageViews,
  supportWindow,
  tierViews,
  type FaqView,
  type LayerView,
} from './serviceContent';
import styles from './ServicePage.module.scss';

export interface ServicePageProps {
  slug: ServiceSlug;
}

/** The secondary ask on every service page (award guide §2). */
const ESTIMATE_LABEL = 'Price a build like this';

/**
 * The one template behind all four /services/* pages (award pass, Nov 2026),
 * in the homepage's shell and voice:
 *
 *   the service and its promise, with the answer beside it (from price,
 *   what the entry tier includes, support, the quote) → what we build
 *   (paper, numbered) → the work that proves it (real captures) → how we
 *   build it → tiers and prices (paper) → questions → the other services →
 *   the crimson close.
 *
 * Server Component, all copy in the HTML, no client island. JSON-LD is one
 * page graph built from the same arrays the page renders.
 */
export default function ServicePage({ slug }: ServicePageProps) {
  const view = layerView(slug);
  const faqs = faqItems(view);
  const cases = proofCases(view);
  const estimate = estimateLinkFor(view.service);

  const graph = pageGraph({
    path: view.path,
    name: view.meta.title,
    description: view.meta.description,
    dateModified: SERVICES_REVISED,
    image: cases.find((c) => c.media)?.media?.desktop,
    breadcrumbs: [
      { name: 'Services', path: '/services' },
      { name: view.name, path: view.path },
    ],
    nodes: [
      serviceNode(slug, { description: view.lede }),
      faqPage(faqs, { path: view.path, name: `${view.name}: questions agencies ask` }),
      itemList(
        cases.map((c) => ({ name: c.client, path: c.href, description: c.headline })),
        { path: view.path, name: `${view.name}: work we can show` },
      ),
    ],
  });

  return (
    <>
      <JsonLd data={graph} />

      <PageHeader
        id="service-title"
        size="l"
        crumbs={[{ label: 'Services', href: '/services' }, { label: view.name }]}
        label={view.role}
        title={view.name}
        lede={<p>{view.lede}</p>}
        actions={<HeroActions page={view.slug} secondary={{ label: ESTIMATE_LABEL, href: estimate }} />}
        aside={<HeroFacts view={view} />}
      />

      <WhatWeBuild view={view} />
      <ProofBlock view={view} />
      <Process view={view} />
      <TierSchedule view={view} />
      <Questions view={view} faqs={faqs} />
      <OtherServices current={view} />

      <CloseBand
        id="service-close-title"
        title={view.close.title}
        lede={view.close.lede}
        secondary={{ label: ESTIMATE_LABEL, href: estimate }}
        placement={`${view.slug}_close`}
      />
    </>
  );
}

/** The answer, beside the promise: the public "from" price and the three facts an agency asks first. */
function HeroFacts({ view }: { view: LayerView }) {
  const entryTimeline = tierViews(view)[0]?.timeline?.label;
  const support = supportWindow(view);
  const monthly = view.lowestMonthly ? formatMoney(view.lowestMonthly.amount) : null;
  return (
    <dl className={styles.facts}>
      <div className={styles.factLead}>
        <dt className={styles.factTerm}>From</dt>
        <dd className={styles.factPrice}>{view.fromMoney}</dd>
        <dd className={styles.factNote}>
          {keepTogether(
            entryTimeline
              ? `for ${view.entryTier.name}, typically live in ${entryTimeline}.`
              : `for ${view.entryTier.name}, the entry tier.`,
          )}
        </dd>
      </div>
      <div className={styles.fact}>
        <dt className={styles.factTerm}>{view.entryTier.name} includes</dt>
        <dd>{keepTogether(view.entryIncludes)}</dd>
      </div>
      <div className={styles.fact}>
        <dt className={styles.factTerm}>After launch</dt>
        <dd>
          {keepTogether(
            support
              ? `${support} of support included, then plans from ${monthly} a month`
              : `Monthly plans from ${monthly} a month`,
          )}
        </dd>
      </div>
      <div className={styles.fact}>
        <dt className={styles.factTerm}>Your quote</dt>
        <dd>{keepTogether('Fixed, after a 20-minute call')}</dd>
      </div>
    </dl>
  );
}

/** What the line delivers: the six capabilities as numbered rows, on paper, then the stack. */
function WhatWeBuild({ view }: { view: LayerView }) {
  return (
    <section id="what-we-build" className={styles.build} aria-labelledby="build-title">
      <div className={styles.buildInner}>
        <header className={styles.head}>
          <p className={styles.label}>What we build</p>
          <h2 id="build-title" className={styles.title}>
            {view.promise}
          </h2>
          <p className={styles.lede}>{view.deliverIntro}</p>
        </header>

        <ol className={styles.caps}>
          {capabilityViews(view).map((capability, i) => (
            <li key={capability.title} className={styles.cap}>
              <span className={styles.capNo} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.capTitle}>{capability.title}</h3>
              <p className={styles.capText}>{keepTogether(capability.text)}</p>
            </li>
          ))}
        </ol>

        <div className={styles.stack}>
          <p className={styles.stackLabel}>{view.stackLabel}</p>
          <ul className={styles.stackList} role="list">
            {stackLine(view).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** The four stages, as published for this line (services.ts processSteps). */
function Process({ view }: { view: LayerView }) {
  return (
    <section id="process" className={styles.process} aria-labelledby="process-title">
      <div className={styles.processInner}>
        <header className={styles.head}>
          <p className={styles.label}>How we build it</p>
          <h2 id="process-title" className={styles.title}>
            {view.processTitle}
          </h2>
        </header>
        <ol className={styles.stages}>
          {stageViews(view).map((stage, i) => (
            <li key={stage.name} className={styles.stage}>
              <span className={styles.stageNo} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.stageName}>{stage.name}</h3>
              <p className={styles.stageText}>{keepTogether(stage.text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** The service FAQ, laid out as the homepage's diligence answers; the same array the FAQPage JSON-LD is built from. */
function Questions({ view, faqs }: { view: LayerView; faqs: readonly FaqView[] }) {
  return (
    <section id="questions" className={styles.faq} aria-labelledby="faq-title">
      <div className={styles.faqInner}>
        <div className={styles.faqHead}>
          <p className={styles.label}>Before you sign</p>
          <h2 id="faq-title" className={styles.faqTitle}>
            Questions agencies ask.
          </h2>
          <p className={styles.faqLede}>Straight answers about {view.name}, from our price list and our process.</p>
        </div>
        <FaqList items={faqs} name={`${view.service}-faq`} />
      </div>
    </section>
  );
}

/** Service to service, with the public "from" prices. */
function OtherServices({ current }: { current: LayerView }) {
  return (
    <nav className={styles.others} aria-labelledby="others-title">
      <div className={styles.othersInner}>
        <h2 id="others-title" className={styles.othersLabel}>
          Other services
        </h2>
        <ul className={styles.othersList} role="list">
          {LAYER_VIEWS.filter((layer) => layer.slug !== current.slug).map((layer) => (
            <li key={layer.slug}>
              <Link
                href={layer.path}
                className={styles.other}
                data-cta-placement={`${current.slug}_other_${layer.service}`}
              >
                <span className={styles.otherNo} aria-hidden="true">
                  {layer.numeral}
                </span>
                <span className={styles.otherName}>
                  {layer.name}
                  <span className="visually-hidden">, </span>
                </span>
                <span className={styles.otherPrice}>{layer.fromLabel}</span>
                <span className={styles.otherGo} aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.allServices}>
          <Link href="/services" className={styles.textLink} data-cta-placement={`${current.slug}_other_all`}>
            All services, side by side
            <span aria-hidden="true" className={styles.arrow}>
              →
            </span>
          </Link>
        </p>
      </div>
    </nav>
  );
}
