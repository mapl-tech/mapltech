import type { CSSProperties } from 'react';
import Link from 'next/link';
import Cta from '@/components/home/Cta';
import JsonLd from '@/components/seo/JsonLd';
import type { ServiceSlug } from '@/config/services';
import { formatMoney } from '@/lib/estimate';
import { faqPage, itemList, pageGraph, service as serviceNode } from '@/lib/schema';
import LayerStack from './LayerStack';
import FaqList from './FaqList';
import { keepTogether } from './keepTogether';
import ProofCases from './ProofCases';
import TierSchedule from './TierSchedule';
import {
  LAYER_VIEWS,
  SERVICES_REVISED,
  capabilityViews,
  cleanCopy,
  faqItems,
  layerView,
  proofCases,
  stackLine,
  stageViews,
  tierViews,
  type LayerView,
  type TierView,
} from './serviceContent';
import styles from './ServicePage.module.scss';

export interface ServicePageProps {
  slug: ServiceSlug;
}

/**
 * The one template behind all four /services/* pages (flagship redesign).
 * Answer first, then the structure under it:
 *
 *   hero (the service, outcome, public "from" price, one action, the layer
 *   stack with this layer lit) → what you get → how we build it (stages on
 *   the red line) → tiers and prices → the work that proves it →
 *   questions → your project in the empty slot → the other three layers.
 *
 * Server Component, all copy in the HTML. No client island: the motion is CSS
 * (scroll-driven where supported, static otherwise and under reduced motion).
 * JSON-LD is one page graph built from the same arrays the page renders.
 */
export default function ServicePage({ slug }: ServicePageProps) {
  const view = layerView(slug);
  const tiers = tierViews(view);
  const faqs = faqItems(view);
  const cases = proofCases(view);
  const isWeb = view.service === 'web';
  const entryTimeline = tiers[0]?.timeline?.label;

  const graph = pageGraph({
    path: view.path,
    name: view.meta.title,
    description: view.meta.description,
    dateModified: SERVICES_REVISED,
    image: cases.find((c) => c.media)?.media?.src,
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
    <div className={styles.page}>
      <JsonLd data={graph} />

      {/* ---------------------------------------------------------- hero */}
      <section className={styles.hero} aria-labelledby="service-title">
        <div className={styles.heroInner}>
          <div>
            <nav aria-label="Breadcrumb" className={styles.crumbs}>
              <ol role="list">
                <li>
                  <Link href="/services">Services</Link>
                </li>
                <li aria-current="page">{view.name}</li>
              </ol>
            </nav>
            <h1 id="service-title" className={styles.title}>
              {view.name}
            </h1>
            <p className={styles.heroLede}>{view.lede}</p>

            <p className={styles.answer}>
              <span className={styles.answerFrom}>From</span>
              <span className={styles.answerPrice}>{view.fromMoney}</span>
              <span className={styles.answerNote}>
                {keepTogether(
                  isWeb && entryTimeline
                    ? `for the ${view.entryTier.name} tier, which typically ships in ${entryTimeline}.`
                    : `for ${view.entryTier.name}, the entry tier.`,
                )}
              </span>
            </p>

            <div className={styles.actions}>
              <Cta placement={`${slug}_hero_primary`} hero href={view.estimate} size="large">
                Price your project
              </Cta>
              <Link href="/contact-us" className={styles.secondary} data-cta-placement={`${slug}_hero_secondary`}>
                Book a call
                <span aria-hidden="true" className={styles.arrow}>
                  →
                </span>
              </Link>
            </div>
            <p className={styles.trust}>
              The estimator opens with {view.name} selected. You see the range before we ask for anything.
            </p>
          </div>

          <dl className={styles.facts}>
            <div>
              <dt>{view.entryTier.name} includes</dt>
              <dd>{keepTogether(view.entryIncludes)}</dd>
            </div>
            <div>
              <dt>After launch</dt>
              <dd>
                {keepTogether(
                  isWeb && view.record.postLaunchSupport
                    ? `${cleanCopy(view.record.postLaunchSupport.replace(/ depending on tier/, ''))} of support included, then from ${money(view.lowestMonthly?.amount)} a month`
                    : `Retainers from ${money(view.lowestMonthly?.amount)} a month`,
                )}
              </dd>
            </div>
            <div>
              <dt>Your quote</dt>
              <dd>
                Fixed, after a <span className={styles.nowrap}>20-minute</span> call
              </dd>
            </div>
          </dl>

          <LayerStack current={view.service} label="The four layers of a build" className={styles.heroStack} />
        </div>
      </section>

      {/* ---------------------------------------------------------- what you get */}
      <section id="what-you-get" className={styles.section} aria-labelledby="get-title">
        <div className={styles.split}>
          <div className={styles.splitHead}>
            <h2 id="get-title" className={styles.h2}>
              What you get
            </h2>
            <p className={styles.sectionLede}>{view.deliverIntro}</p>
            <div className={styles.stack}>
              <p className={styles.label}>{view.stackLabel}</p>
              <ul className={styles.stackList} role="list">
                {stackLine(view).map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
          <ul className={styles.capabilities} role="list">
            {capabilityViews(view).map((capability) => (
              <li key={capability.title} className={styles.capability}>
                <h3 className={styles.capabilityTitle}>{capability.title}</h3>
                <p className={styles.capabilityText}>{keepTogether(capability.text)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------- how we build it */}
      <section id="process" className={styles.section} aria-labelledby="process-title">
        <div className={styles.split}>
          <div className={styles.splitHead}>
            <h2 id="process-title" className={styles.h2}>
              How we build it
            </h2>
            <p className={styles.sectionLede}>{view.stagesIntro}</p>
            <TimelineChart tiers={tiers} />
          </div>
          <ol className={styles.stages} role="list">
            {stageViews(view).map((stage) => (
              <li key={stage.name} className={styles.stage}>
                <h3 className={styles.stageName}>{stage.name}</h3>
                <p className={styles.stageText}>{keepTogether(stage.text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <TierSchedule view={view} />

      <ProofCases view={view} />

      {/* ---------------------------------------------------------- questions */}
      <section id="questions" className={styles.section} aria-labelledby="faq-title">
        <div className={styles.split}>
          <div className={styles.splitHead}>
            <h2 id="faq-title" className={styles.h2}>
              Questions about {view.name}
            </h2>
            <p className={styles.sectionLede}>Straight answers, from our price list and our process.</p>
          </div>
          <FaqList items={faqs} name={`${view.service}-faq`} />
        </div>
      </section>

      <Close view={view} entryTimeline={entryTimeline} />

      <OtherLayers current={view} />
    </div>
  );
}

function money(amount: number | undefined): string {
  return typeof amount === 'number' ? formatMoney(amount) : '';
}

/** Web only: the timelines services.ts publishes, drawn to scale. Renders nothing for lines without one. */
function TimelineChart({ tiers }: { tiers: readonly TierView[] }) {
  const rows = tiers.filter((tier) => tier.timeline);
  if (!rows.length) return null;
  const max = Math.max(...rows.map((tier) => tier.timeline?.max ?? 0));
  return (
    <figure className={styles.timeline}>
      <figcaption className={styles.label}>Typical timeline by tier</figcaption>
      <ul className={styles.timelineRows} role="list">
        {rows.map((tier) => (
          <li key={tier.id} className={styles.timelineRow}>
            <span className={styles.timelineName}>{tier.name}</span>
            <span className={styles.timelineWeeks}>{tier.timeline?.label}</span>
            <span className={styles.timelineTrack} aria-hidden="true">
              <span
                className={styles.timelineBar}
                style={{ '--from': tier.timeline?.min, '--to': tier.timeline?.max, '--max': max } as CSSProperties}
              />
            </span>
          </li>
        ))}
      </ul>
      <p className={styles.timelineAxis} aria-hidden="true">
        <span>Week 0</span>
        <span>Week {max}</span>
      </p>
    </figure>
  );
}

/** The empty slot: the reader's project, with the price restated at the action. */
function Close({ view, entryTimeline }: { view: LayerView; entryTimeline?: string }) {
  return (
    <section className={styles.close} aria-labelledby="close-title" data-page-close>
      <div className={styles.inner}>
        <div className={styles.slot}>
          <div>
            <h2 id="close-title" className={styles.closeTitle}>
              {view.closeHeading}
            </h2>
            <p className={styles.closeText}>
              The estimator opens with {view.name} selected and the range is on screen before we ask for anything. Then
              we scope it with you on a <span className={styles.nowrap}>20-minute</span> call.
            </p>
            <div className={styles.actions}>
              <Cta placement={`${view.slug}_close_primary`} href={view.estimate} size="large">
                Price your project
              </Cta>
              <Link href="/contact-us" className={styles.secondary} data-cta-placement={`${view.slug}_close_secondary`}>
                Book a call
                <span aria-hidden="true" className={styles.arrow}>
                  →
                </span>
              </Link>
            </div>
          </div>
          <dl className={styles.closeFacts}>
            <div>
              <dt>From</dt>
              <dd>{view.fromMoney}</dd>
            </div>
            <div>
              <dt>{entryTimeline ? `${view.entryTier.name} timeline` : 'Entry tier'}</dt>
              <dd>{entryTimeline ?? view.entryTier.name}</dd>
            </div>
            <div>
              <dt>Quote</dt>
              <dd>
                Fixed, after a <span className={styles.nowrap}>20-minute</span> call
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}

/** Service ↔ service links at the end of the page, with the public "from" prices. */
function OtherLayers({ current }: { current: LayerView }) {
  return (
    <nav className={styles.others} aria-labelledby="others-title">
      <h2 id="others-title" className={styles.othersTitle}>
        The other three layers
      </h2>
      <ul className={styles.othersList} role="list">
        {LAYER_VIEWS.filter((layer) => layer.slug !== current.slug).map((layer) => (
          <li key={layer.slug}>
            <Link
              href={layer.path}
              className={styles.otherLink}
              data-cta-placement={`${current.slug}_other_${layer.service}`}
            >
              <span className={styles.otherRole}>
                {layer.role}
                <span className="visually-hidden">: </span>
              </span>
              <span className={styles.otherName}>
                {layer.name}
                <span className="visually-hidden">, </span>
              </span>
              <span className={styles.otherPrice}>{layer.fromLabel}</span>
              <span className={styles.otherArrow} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className={styles.allLayers}>
        <Link href="/services" className={styles.textLink}>
          All four layers, side by side
          <span aria-hidden="true" className={styles.arrow}>
            &nbsp;→
          </span>
        </Link>
      </p>
    </nav>
  );
}
