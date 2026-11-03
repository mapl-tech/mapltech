import Link from 'next/link';
import CloseBand from '@/components/flagship/CloseBand';
import { NDA_LINE } from '@/components/flagship/content';
import JsonLd from '@/components/seo/JsonLd';
import PageHeader from '@/components/ui/PageHeader';
import type { ServiceSlug } from '@/config/services';
import { formatMoney } from '@/lib/estimate';
import { faqPage, itemList, pageGraph, service as serviceNode } from '@/lib/schema';
import FaqList from './FaqList';
import HeroActions from './HeroActions';
import { keepTogether } from './keepTogether';
import ProofBlock from './ProofBlock';
import Steps from './Steps';
import TierSchedule from './TierSchedule';
import {
  LAYER_VIEWS,
  SERVICES_REVISED,
  briefHref,
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

/** The secondary ask on every service page: the estimator, with this service selected. */
const ESTIMATE_LABEL = 'Price your project';

/**
 * The one template behind all four /services/* pages (Nov 2026 simplify
 * pass). One idea per section, and the headings alone tell the story:
 *
 *   the service's name as the eyebrow and its promise as the H1 (the one
 *   dominant element), with the answer beside it at a quieter size (from
 *   price, what the entry tier includes, support, the quote) → what we build
 *   (paper, four points) → work we can show → what it costs (paper) → how we
 *   deliver → questions → the other services, one quiet line → the crimson
 *   close.
 *
 * Every "Start a project" (the hero's, the close's, and so the phone bar's,
 * which repeats the hero's) opens the brief with this service chosen; the NDA
 * line sits under the hero's pair. Server Component, all copy in the HTML, no
 * client island. JSON-LD is one page graph built from the same arrays the
 * page renders.
 */
export default function ServicePage({ slug }: ServicePageProps) {
  const view = layerView(slug);
  const faqs = faqItems(view);
  const cases = proofCases(view);
  const brief = briefHref(view.service);

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
        label={view.name}
        title={view.headline}
        lede={<p>{view.lede}</p>}
        actions={
          <HeroActions
            page={view.slug}
            href={brief}
            secondary={{ label: ESTIMATE_LABEL, href: view.estimate }}
            note={NDA_LINE}
          />
        }
        aside={<HeroFacts view={view} />}
      />

      <WhatWeBuild view={view} />
      <ProofBlock view={view} />
      <TierSchedule view={view} />
      <Process view={view} />
      <Questions view={view} faqs={faqs} />
      <OtherServices current={view} />

      <CloseBand
        id="service-close-title"
        title={view.close.title}
        lede={view.close.lede}
        href={brief}
        secondary={{ label: ESTIMATE_LABEL, href: view.estimate }}
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
              ? `for ${view.entryTier.name}, usually live in ${entryTimeline}.`
              : `for ${view.entryTier.name}, the first tier.`,
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
              : `Plans from ${monthly} a month`,
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

/** What the service delivers: its four strongest points on paper, then the technologies we build with. */
function WhatWeBuild({ view }: { view: LayerView }) {
  const stack = view.stackLabel ? stackLine(view) : [];
  return (
    <section id="what-we-build" className={styles.build} aria-labelledby="build-title">
      <div className={styles.buildInner}>
        <header className={styles.head}>
          <p className={styles.label}>What we build</p>
          <h2 id="build-title" className={styles.title}>
            {view.buildTitle}
          </h2>
          <p className={styles.lede}>{view.deliverIntro}</p>
        </header>

        <ul className={styles.caps} role="list">
          {capabilityViews(view).map((capability) => (
            <li key={capability.title} className={styles.cap}>
              <h3 className={styles.capTitle}>{capability.title}</h3>
              <p className={styles.capText}>{keepTogether(capability.text)}</p>
            </li>
          ))}
        </ul>

        {view.stackLabel && stack.length ? (
          <div className={styles.stack}>
            <p className={styles.stackLabel}>{view.stackLabel}</p>
            <ul className={styles.stackList} role="list">
              {stack.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/**
 * The four delivery steps, as published for this service (services.ts
 * processSteps). Labelled "How we deliver": the homepage's "How it works" is
 * the engagement (brief, quote, build, launch), and the two must not share a name.
 */
function Process({ view }: { view: LayerView }) {
  const steps = stageViews(view).map((stage) => ({ title: stage.name, text: stage.text }));
  return (
    <section id="process" className={styles.process} aria-labelledby="process-title">
      <div className={styles.processInner}>
        <header className={styles.head}>
          <p className={styles.label}>How we deliver</p>
          <h2 id="process-title" className={styles.title}>
            {view.processTitle}
          </h2>
        </header>
        <Steps steps={steps} />
      </div>
    </section>
  );
}

/** The service FAQ on the shared accordion; the same array the FAQPage JSON-LD is built from. */
function Questions({ view, faqs }: { view: LayerView; faqs: readonly FaqView[] }) {
  return (
    <section id="questions" className={styles.faq} aria-labelledby="faq-title">
      <div className={styles.faqInner}>
        <div className={styles.faqHead}>
          <p className={styles.label}>Questions</p>
          <h2 id="faq-title" className={styles.faqTitle}>
            Questions agencies ask.
          </h2>
          <p className={styles.faqLede}>Short answers about {view.name}.</p>
        </div>
        <FaqList items={faqs} name={`${view.service}-faq`} />
      </div>
    </section>
  );
}

/**
 * Service to service, with the public "from" prices: one quiet row of three
 * links at body size, so the exits never outweigh the close that follows.
 */
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
                <span className={styles.otherName}>
                  {layer.name}
                  <span className="visually-hidden">, </span>
                </span>
                <span className={styles.otherPrice}>
                  {layer.fromLabel}
                  <span className={styles.otherGo} aria-hidden="true">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.allServices}>
          <Link href="/services" className={styles.textLink} data-cta-placement={`${current.slug}_other_all`}>
            See all services
            <span aria-hidden="true" className={styles.arrow}>
              →
            </span>
          </Link>
        </p>
      </div>
    </nav>
  );
}
