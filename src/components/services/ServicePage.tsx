import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { routeLastModified, REDESIGN_DATE } from '@/config/routes';
import {
  getService,
  serviceRecurringLines,
  serviceTiers,
  services,
  type ServiceSlug,
  type ServiceTier,
} from '@/config/services';
import { portfolioProjects, pricing, siteConfig, testimonials } from '@/config/site';
import { SIZE_OPTIONS, estimateHref, type EstimateService, type EstimateSize, type SizeKey } from '@/lib/estimate';
import { faqPage, howTo, pageGraph, service as serviceNode, slugify } from '@/lib/schema';
import Cta from './Cta';
import MiniScoper from './MiniScoper';
import ProcessTimeline from './ProcessTimeline';
import ServiceBriefForm from './ServiceBriefForm';
import ServiceFaq from './ServiceFaq';
import StackPinned from './StackPinned';
import StickyCtaRail from './StickyCtaRail';
import TierDetails from './TierDetails';
import { SERVICE_COPY, SERVICE_OFFICES, prettyPrice } from './serviceCopy';
import styles from '@/app/services/service.module.scss';

export interface ServicePageProps {
  slug: ServiceSlug;
  /** The page's meta description, verbatim (also the WebPage.description). */
  description: string;
}

const PHONE = { display: siteConfig.phone, tel: '+16473756724' };
const MOST_POPULAR_INDEX = 1;

/** The one approved testimonial. The UNSVCC quote is not shipped until signed off. */
const approvedQuote = testimonials.find((t) => t.name === 'Alita Fabiano');

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false">
      <path d="M2 6.2 4.8 9 10 3.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** "$5,000+" for web's starting-at tiers, "$3,500–$5,000" for ranges, "Custom" as is. */
function tierPriceLabel(tier: ServiceTier, startingAt: boolean): string {
  if (tier.price === 'Custom') return 'Custom';
  const pretty = prettyPrice(tier.price);
  return startingAt && !pretty.endsWith('+') ? `${pretty}+` : pretty;
}

function sizeKeyForTier(service: EstimateService, tierIndex: number) {
  return SIZE_OPTIONS[service].find((option) => option.tierIndex === tierIndex)?.key;
}

/**
 * The one template behind all four /services/* pages, fed by
 * `src/config/services.ts` + `serviceCopy.ts`. Server Component: every
 * headline, price, FAQ answer and step is in the SSR HTML. The islands
 * (StackPinned, MiniScoper, StickyCtaRail, TierDetails, ServiceBriefForm)
 * add behaviour to markup that already reads correctly without them.
 */
export default function ServicePage({ slug, description }: ServicePageProps) {
  const record = getService(slug);
  const copy = SERVICE_COPY[slug];
  const tiers = serviceTiers(record);
  const recurring = serviceRecurringLines(record);
  const startingAt = record.estimateKey === 'web';
  const index = services.findIndex((s) => s.slug === slug) + 1;
  const reviewed = routeLastModified(record.path) ?? REDESIGN_DATE;
  const heroEstimateHref = estimateHref({ services: [record.estimateKey] });
  const proof = copy.proofSlug ? portfolioProjects.find((p) => p.slug === copy.proofSlug) : undefined;
  const recurringLabel = record.estimateKey === 'web' ? 'Maintenance' : 'Retainers';

  const graph = pageGraph({
    path: record.path,
    name: record.name,
    description,
    breadcrumbs: [
      { name: 'Services', path: '/services' },
      { name: record.shortName, path: record.path },
    ],
    nodes: [
      serviceNode(slug),
      howTo(
        record.processSteps.map((step) => ({ name: `${step.phase}: ${step.title}`, text: step.description })),
        { name: record.sections.process.title, description: record.sections.process.subtitle, path: record.path },
      ),
      faqPage(record.faqs, { path: record.path, name: `${record.shortName} FAQ` }),
    ],
  });

  return (
    <div className={styles.page}>
      <JsonLd data={graph} />

      <div className={styles.layout}>
        <div className={styles.main}>
          {/* 01 HERO — all SSR, nothing revealed; the H1 is the LCP element */}
          <section className={styles.hero} aria-labelledby="service-title">
            <nav aria-label="Breadcrumb" className={styles.crumbs}>
              <ol>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/services">Services</Link>
                </li>
                <li aria-current="page">{record.shortName}</li>
              </ol>
            </nav>

            <p className={styles.eyebrow}>
              {record.heroLabel} · Service {String(index).padStart(2, '0')} of {String(services.length).padStart(2, '0')}
            </p>
            <h1 id="service-title" className={styles.title}>
              {record.heroTitle}
            </h1>
            <p className={styles.lede}>{copy.lede}</p>

            <dl className={`kv ${styles.kv}`}>
              <div>
                <dt>Starting price</dt>
                <dd>
                  {prettyPrice(tiers[0].price)} — {tiers[0].name}
                </dd>
              </div>
              <div>
                <dt>Typical timeline</dt>
                <dd>{copy.timelineFact}</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>{record.stack.join(' · ')}</dd>
              </div>
              <div>
                <dt>Offices</dt>
                <dd>{SERVICE_OFFICES}</dd>
              </div>
              <div>
                <dt>Last reviewed</dt>
                <dd>
                  <time dateTime={reviewed}>{reviewed.slice(0, 7)}</time>
                </dd>
              </div>
            </dl>

            <div className={styles.ctas}>
              <Cta
                href={heroEstimateHref}
                size="large"
                placement={`${slug}_hero_primary`}
                cursor="estimate"
                hero
                boxClassName={styles.ctaBox}
              >
                Get a 60-second estimate
              </Cta>
              <Cta href="/contact-us" variant="secondary" size="large" placement={`${slug}_hero_secondary`} boxClassName={styles.ctaBox}>
                Book a 20-min scoping call
              </Cta>
            </div>
            <p className={styles.fine}>Fixed quote after a 20-min scoping call.</p>
          </section>

          {/* 02 BUYER SITUATION — three chips, each an anchor to the tier that answers it */}
          <section className={styles.section} aria-labelledby="situation-title">
            <div className={`${styles.sectionHead} reveal`}>
              <p className="eyebrow">02 · Where you are</p>
              <h2 id="situation-title" className={styles.h2}>
                Which one is your Monday morning?
              </h2>
            </div>
            <ul className={styles.chips}>
              {record.buyerSituations.map((situation) => (
                <li key={situation.tierName} className="reveal">
                  <Link href={`#tier-${slugify(situation.tierName)}`} className={styles.chip} data-cursor="view">
                    <span>{situation.situation}</span>
                    <span className={styles.chipTo}>→ {situation.tierName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          {/* 03 DELIVERABLES — editorial tier rows from `pricing` (the crawlable Offer statements) */}
          <section id="deliverables" className={styles.section} aria-labelledby="deliverables-title">
            <div className={`${styles.sectionHead} reveal`}>
              <p className="eyebrow">03 · {record.sections.capabilities.label}</p>
              <h2 id="deliverables-title" className={styles.h2}>
                {record.sections.capabilities.title}
              </h2>
              <p className={styles.sub}>{record.sections.capabilities.subtitle}</p>
            </div>

            <span className={styles.everyTierLabel}>Every tier</span>
            <dl className={styles.everyTier}>
              {record.capabilities.map((capability) => (
                <div key={capability.title} className="reveal">
                  <dt>{capability.title}</dt>
                  <dd>{capability.description}</dd>
                </div>
              ))}
            </dl>

            <div className={styles.tiers}>
              {tiers.map((tier, i) => {
                const isCustom = tier.price === 'Custom';
                const sizeKey = sizeKeyForTier(record.estimateKey, i);
                const size: EstimateSize = {};
                if (sizeKey) (size as Record<EstimateService, SizeKey>)[record.estimateKey] = sizeKey;
                const tierHref = isCustom ? '/contact-us' : estimateHref({ services: [record.estimateKey], size });
                return (
                  <TierDetails
                    key={tier.name}
                    id={`tier-${slugify(tier.name)}`}
                    className={`${styles.tier} reveal`}
                    summaryClassName={styles.tierSummary}
                    summary={
                      <>
                        <h3 className={styles.tierName}>
                          {tier.name}
                          {i === MOST_POPULAR_INDEX ? <span className={styles.tag}>Most popular</span> : null}
                        </h3>
                        <span className={styles.tierPrice}>{tierPriceLabel(tier, startingAt)}</span>
                        <span className={styles.tierDesc}>{tier.description}</span>
                        <span className={styles.tierToggle} aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" focusable="false">
                            <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                          </svg>
                        </span>
                      </>
                    }
                  >
                    <div className={styles.tierBody}>
                      <ul className={styles.features}>
                        {tier.features.map((feature) => (
                          <li key={feature}>
                            <CheckIcon />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href={tierHref}
                        className={styles.inlineCta}
                        data-cta-placement={`${slug}_tier_${i + 1}`}
                        data-cursor={isCustom ? undefined : 'estimate'}
                      >
                        {isCustom ? 'Book a 20-min scoping call' : 'Get a 60-second estimate'} →
                      </Link>
                    </div>
                  </TierDetails>
                );
              })}
            </div>

            <p className={styles.afterLaunch}>
              <span className={styles.afterLaunchLabel}>After launch · {recurringLabel}</span>
              {recurring.map((line) => `${line.name} ${prettyPrice(line.price)}`).join(' · ')} · Hourly{' '}
              {prettyPrice(pricing.hourlyRates.standard)} (emergency {prettyPrice(pricing.hourlyRates.emergency)})
            </p>
          </section>

          {/* 04 THE STACK — PEAK: pinned sequence */}
          <StackPinned id="stack" eyebrow="04 · The stack" heading={copy.stack.heading} layers={copy.stack.layers} />

          {/* 05 PROCESS — CSS view() progress line; HowTo JSON-LD from the same array */}
          <ProcessTimeline
            id="process"
            eyebrow={`05 · ${record.sections.process.label}`}
            title={record.sections.process.title}
            subtitle={record.sections.process.subtitle}
            steps={record.processSteps}
          />

          {/* 06 PROOF — one case row + one approved quote */}
          <section id="proof" className={styles.section} aria-labelledby="proof-title" data-below-fold>
            <div className={`${styles.sectionHead} reveal`}>
              <p className="eyebrow">06 · Proof</p>
              <h2 id="proof-title" className={styles.h2}>
                Shipped under an agency&apos;s name, or our own.
              </h2>
            </div>

            {proof ? (
              <article className={`${styles.case} reveal`}>
                <Link
                  href={`/our-work/${proof.slug}`}
                  className={styles.caseLink}
                  data-cursor="view"
                  data-cta-placement={`${slug}_proof_case`}
                >
                  <span className={styles.caseMeta}>
                    <span className={styles.caseTitle}>{proof.title}</span>
                    <span className={styles.caseKind}>{proof.category}</span>
                    <span className={styles.caseDesc}>{proof.description}</span>
                    <span className={styles.caseCta}>View case study →</span>
                  </span>
                  <span className={styles.caseThumb}>
                    <Image
                      src={proof.image}
                      alt={`${proof.title} — ${proof.category}`}
                      fill
                      sizes="(max-width: 767px) 40vw, 360px"
                    />
                  </span>
                </Link>
                {'url' in proof && proof.url ? (
                  <a href={proof.url} className={styles.caseLive} target="_blank" rel="noopener noreferrer" data-cursor="external">
                    Visit the live site ↗
                  </a>
                ) : null}
              </article>
            ) : null}

            {approvedQuote ? (
              <figure className={`${styles.quote} reveal`}>
                <blockquote>
                  <p>&ldquo;{approvedQuote.quote}&rdquo;</p>
                </blockquote>
                <figcaption>
                  {approvedQuote.name} · {approvedQuote.role}, {approvedQuote.company}
                </figcaption>
              </figure>
            ) : null}
            <p className={styles.pairing}>
              Paired with the claim it proves: an embedded team shipping production-ready code your own developers can
              maintain.
            </p>
            <div className={styles.proofCta}>
              <Cta href="/our-work" variant="secondary" placement={`${slug}_proof_work`} cursor="view">
                See the work
              </Cta>
            </div>
          </section>

          {/* 07 MINI-SCOPER — estimator entry */}
          <MiniScoper
            id="scoper"
            service={record.estimateKey}
            slug={slug}
            eyebrow="07 · Scope it"
            heading="Scope this build in 60 seconds"
            intro="Three choices map to the same tiers listed above. The output is always a range; the fixed quote comes after a 20-min scoping call."
            legends={copy.scoper}
          />
          <p className={styles.staticLine}>
            {tiers.map((tier) => `${tier.name} ${tierPriceLabel(tier, startingAt)}`).join(' · ')} · {recurringLabel}{' '}
            {recurring.map((line) => prettyPrice(line.price).replace('/month', '')).join(' / ')} per month
          </p>
        </div>

        {/* RAIL — desktop sticky CTA card; collapses while the scoper is in view */}
        <aside className={styles.rail} aria-label="Get in touch">
          <StickyCtaRail
            label={record.shortName}
            price={prettyPrice(tiers[0].price)}
            note={copy.railNote}
            estimateHref={heroEstimateHref}
            slug={slug}
            phone={PHONE}
            collapseWhenVisible="#scoper"
          />
        </aside>
      </div>

      {/* 08 FAQ — question-shaped H2s, answers always in the HTML */}
      <div className={styles.narrow}>
        <ServiceFaq eyebrow="08 · FAQ" intro="Straight answers so you can make an informed decision." items={record.faqs} />
      </div>

      {/* 09 CTA BAND — personalised per service; 3-field brief posts to /api/contact */}
      <section id="start" className={styles.band} aria-labelledby="band-title" data-below-fold>
        <div className={styles.bandGrid}>
          <div className={`${styles.bandCopy} reveal`}>
            <p className="eyebrow">09 · Start</p>
            <h2 id="band-title" className={styles.h2}>
              {record.ctaBand.heading}
            </h2>
            <p>{record.ctaBand.body}</p>
            <div className={styles.ctas}>
              <Cta href={heroEstimateHref} size="large" placement={`${slug}_band_primary`} cursor="estimate" boxClassName={styles.ctaBox}>
                Get a 60-second estimate
              </Cta>
              <Cta href="/contact-us" variant="secondary" size="large" placement={`${slug}_band_secondary`} boxClassName={styles.ctaBox}>
                Book a 20-min scoping call
              </Cta>
            </div>
            <p className={styles.fine}>What to include: goal, current state, constraints, timeline, budget band.</p>
          </div>
          <ServiceBriefForm
            serviceName={record.name}
            shortName={record.shortName}
            path={record.path}
            submitLabel={record.ctaBand.submitLabel}
            placeholder={record.ctaBand.body}
            slug={slug}
          />
        </div>
      </section>
    </div>
  );
}
