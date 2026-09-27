import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import SnapRow from '@/components/ui/SnapRow';
import Cta, { TextCta } from '@/components/work/Cta';
import {
  approvedTestimonialFor,
  caseMedia,
  caseStudyDetail,
  estimateLinkFor,
  findEntry,
  findProject,
  labsProjectFor,
  neighbours,
  scopingCallLinkFor,
  serviceRecordFor,
  startingPriceLabel,
  workEntries,
} from '@/components/work/work-data';
import { absoluteUrl, routeLastModified } from '@/config/routes';
import { creativeWork, pageGraph } from '@/lib/schema';
import styles from '../work.module.scss';

/**
 * /our-work/[slug] — one case study per `portfolioProjects` entry.
 *
 * Server Component. Every fact on the page comes from site.ts, services.ts or
 * the cited extras in work-data.ts; sections whose data does not exist for a
 * project are omitted, never padded. The hero image carries the same
 * `view-transition-name` as its row on /our-work.
 */

interface Params {
  slug: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return workEntries().map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = findEntry(slug);
  if (!entry) return {};

  const title = `${entry.title} | MAPL TECH`;
  const url = absoluteUrl(entry.path);
  const imageAlt = `${entry.title} — ${entry.serviceLabel} by MAPL TECH`;

  return {
    title: { absolute: title },
    description: entry.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title,
      description: entry.description,
      url,
      siteName: 'MAPL TECH',
      images: [{ url: entry.image, alt: imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: entry.description,
      images: [entry.image],
    },
  };
}

const wordCount = (text: string) => text.trim().split(/\s+/).length;
const article = (noun: string) => (/^[aeiou]/i.test(noun) ? 'an' : 'a');

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const entry = findEntry(slug);
  const project = findProject(slug);
  if (!entry || !project) notFound();

  const detail = caseStudyDetail(slug);
  const service = serviceRecordFor(entry.service);
  const from = startingPriceLabel(entry.service);
  const fromAmount = from?.replace(/^From /, '');
  const media = caseMedia(entry);
  const quote = approvedTestimonialFor(entry);
  const lab = labsProjectFor(entry);
  const pager = neighbours(slug);
  const lastModified = routeLastModified('/our-work');
  const reviewed = lastModified ? lastModified.slice(0, 7) : undefined;

  const estimateHref = estimateLinkFor(entry.service);
  const callHref = scopingCallLinkFor(entry.service);

  // 40–60 word lede: the project description, plus the service one-liner when
  // the description alone is short, closing with who built it and the real
  // starting price for the line.
  const ledeParts = [entry.description];
  if (wordCount(entry.description) < 30) ledeParts.push(service.oneLiner);
  ledeParts.push(
    lab
      ? `Built and operated by MAPL TECH through MAPL Labs; ${entry.serviceLabel} projects for agencies start at ${fromAmount}.`
      : `Delivered by MAPL TECH as ${entry.serviceLabel} work; projects on this service line start at ${fromAmount}.`,
  );
  const lede = ledeParts.join(' ');

  const scopeItems = lab ? lab.capabilities : entry.tags;
  const deliverables = service.deliverables.slice(0, 8);

  const graph = pageGraph({
    path: entry.path,
    name: entry.title,
    description: entry.description,
    type: 'ItemPage',
    image: entry.image,
    dateModified: lastModified,
    breadcrumbs: [
      { name: 'Our Work', path: '/our-work' },
      { name: entry.title, path: entry.path },
    ],
    nodes: [creativeWork(project, { path: entry.path })],
  });

  const heroAlt = `${entry.title} — ${entry.serviceLabel} by MAPL TECH`;

  return (
    <>
      <JsonLd data={graph} />

      {/* 05 · Case-study hero: breadcrumb → eyebrow → H1 (LCP) → lede → key facts → CTAs; image is the morph target. */}
      <section className={styles.caseHero} aria-labelledby="case-title">
        <div className={styles.caseHeroInner}>
          <div className={styles.caseCopy}>
            <nav aria-label="Breadcrumb">
              <ol className={styles.crumbs}>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li>
                  <Link href="/our-work">Our Work</Link>
                </li>
                <li aria-current="page">{entry.title}</li>
              </ol>
            </nav>

            <p className={`eyebrow ${styles.caseEyebrow}`}>
              {entry.serviceLabel}
              {entry.isLab ? ' · MAPL Labs' : null}
              {entry.host ? ` · ${entry.host}` : null}
            </p>
            <h1 id="case-title" className={styles.caseTitle}>
              {entry.title}
            </h1>
            <p className={styles.lede}>{lede}</p>

            <dl className={`kv ${styles.caseFacts}`}>
              <div>
                <dt>Client</dt>
                <dd>{entry.isLab ? `${entry.title} (own product)` : (detail.client ?? entry.title)}</dd>
              </div>
              <div>
                <dt>Service line</dt>
                <dd>
                  <Link href={service.path} data-cta-placement="case_facts_service">
                    {service.shortName}
                  </Link>
                </dd>
              </div>
              {from ? (
                <div>
                  <dt>Starting price</dt>
                  <dd>{from}</dd>
                </div>
              ) : null}
              {detail.industry ? (
                <div>
                  <dt>Industry</dt>
                  <dd>{detail.industry}</dd>
                </div>
              ) : null}
              <div>
                <dt>Scope</dt>
                <dd>{entry.tags.join(' · ')}</dd>
              </div>
              {detail.timeline ? (
                <div>
                  <dt>Timeline</dt>
                  <dd>{detail.timeline}</dd>
                </div>
              ) : null}
              {entry.url && entry.host ? (
                <div>
                  <dt>Live site</dt>
                  <dd>
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-cursor="external"
                      data-cta-placement="case_facts_live"
                    >
                      {entry.host}
                      <span className="visually-hidden"> (opens in a new tab)</span>
                    </a>
                  </dd>
                </div>
              ) : null}
              {reviewed ? (
                <div>
                  <dt>Last reviewed</dt>
                  <dd>
                    <time dateTime={lastModified}>{reviewed}</time>
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className={`${styles.ctas} ${styles.caseCtas}`}>
              <Cta href={estimateHref} size="large" placement="case_hero_primary" hero>
                Get a 60-second estimate
              </Cta>
              <Cta href={callHref} variant="secondary" size="large" placement="case_hero_secondary">
                Book a 20-min scoping call
              </Cta>
            </div>
          </div>

          <div className={styles.caseMedia} style={{ viewTransitionName: `work-${entry.slug}` }}>
            <Image
              src={entry.image}
              alt={heroAlt}
              width={1200}
              height={800}
              sizes="(max-width: 1023px) 100vw, 45vw"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* 08 · Challenge → Solution (only where the record states them) */}
      {detail.challenge || detail.solution ? (
        <section className={`${styles.section} reveal`} data-below-fold aria-labelledby="case-challenge">
          <div className={styles.sectionGrid}>
            <h2 id="case-challenge" className={styles.sectionTitle}>
              {detail.challenge?.question ?? detail.solution?.question}
            </h2>
            <div className={styles.prose}>
              {detail.challenge ? <p>{detail.challenge.answer}</p> : null}
              {detail.solution ? (
                <>
                  <h3>{detail.solution.question}</h3>
                  <ul className={styles.bullets}>
                    {detail.solution.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Scope: what the project covered + what this service line includes */}
      <section className={`${styles.section} reveal`} data-below-fold aria-labelledby="case-scope">
        <div className={styles.sectionGrid}>
          <h2 id="case-scope" className={styles.sectionTitle}>
            What was in scope for {entry.title}?
          </h2>
          <div className={styles.prose}>
            <ul className={styles.tags} aria-label="Scope">
              {scopeItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            {lab ? (
              <>
                <p>{lab.description}</p>
                <p>
                  <TextCta href="/labs" placement="case_scope_labs" className={styles.textLink} cursor="view">
                    Read more in MAPL Labs
                  </TextCta>
                </p>
              </>
            ) : null}
            <h3>
              What {article(service.shortName)} {service.shortName} engagement from MAPL TECH includes
            </h3>
            <ul className={styles.bullets}>
              {deliverables.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p>
              <TextCta href={service.path} placement="case_scope_service" className={styles.textLink} cursor="view">
                Full {service.shortName} scope and pricing
              </TextCta>
            </p>
          </div>
        </div>
      </section>

      {/* 09 · How it was built (stack) — only where the record states it */}
      {detail.stack ? (
        <section className={`${styles.section} reveal`} data-below-fold aria-labelledby="case-built">
          <div className={styles.sectionGrid}>
            <h2 id="case-built" className={styles.sectionTitle}>
              How was it built?
            </h2>
            <div className={styles.backstage}>
              {detail.stack ? (
                <div>
                  <h3>Stack</h3>
                  <ul className={styles.bullets}>
                    {detail.stack.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* 10 · Results + adjacent testimonial — real, attributable only */}
      {detail.results || quote ? (
        <section className={`${styles.section} reveal`} data-below-fold aria-labelledby="case-results">
          <div className={styles.sectionGrid}>
            <h2 id="case-results" className={styles.sectionTitle}>
              {detail.results?.question ?? `What did ${entry.title} say?`}
            </h2>
            <div className={styles.prose}>
              {detail.results ? (
                <ul className={styles.bullets}>
                  {detail.results.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {detail.sourceNote ? <p className={styles.footnote}>Source: {detail.sourceNote}</p> : null}
              {quote ? (
                <figure className={styles.quote}>
                  <blockquote>
                    <p>“{quote.quote}”</p>
                  </blockquote>
                  <figcaption>
                    {quote.image ? <Image src={quote.image} alt="" width={40} height={40} /> : null}
                    <span>
                      <strong>{quote.name}</strong>
                      {quote.role}, {quote.company}
                    </span>
                  </figcaption>
                </figure>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* Process for this service line — real copy from the service record */}
      <section className={`${styles.section} reveal`} data-below-fold aria-labelledby="case-process">
        <div className={styles.listHead}>
          <p className="eyebrow">{service.sections.process.label}</p>
          <h2 id="case-process">
            How does MAPL TECH run {article(service.shortName)} {service.shortName} project?
          </h2>
          <p>{service.sections.process.subtitle}</p>
        </div>
        <ol className={styles.steps}>
          {service.processSteps.map((step) => (
            <li key={step.phase}>
              <span className={styles.stepNo}>{step.phase}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 11 · Media snap / drag row — only when more than the hero image exists */}
      {media.length > 1 ? (
        <section className={`${styles.mediaSection} reveal`} data-below-fold aria-labelledby="case-media">
          <div className={styles.mediaHead}>
            <p className="eyebrow">Screenshots</p>
            <h2 id="case-media">{entry.title} in production</h2>
          </div>
          <SnapRow label={`${entry.title} screenshots`} className={styles.mediaRow}>
            {media.map((item, i) => {
              const figure = (
                <figure className={styles.mediaCard}>
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={item.width}
                    height={item.height}
                    sizes="(max-width: 767px) 85vw, 560px"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                  <figcaption>
                    {String(i + 1).padStart(2, '0')} · {entry.title}
                  </figcaption>
                </figure>
              );
              return entry.url ? (
                <a
                  key={item.src}
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.mediaLink}
                  data-cursor="external"
                  aria-label={`${item.alt} (opens ${entry.host} in a new tab)`}
                >
                  {figure}
                </a>
              ) : (
                <div key={item.src}>{figure}</div>
              );
            })}
          </SnapRow>
        </section>
      ) : null}

      {/* 13 · Start a similar project — CTAs prefilled with the same service line */}
      <section className={`${styles.band} reveal`} data-below-fold aria-labelledby="case-band">
        <div className={styles.bandInner}>
          <div>
            <h2 id="case-band">Start a similar project</h2>
            <p>
              {service.shortName} {from ? from.toLowerCase() : ''}. Fixed quote after a 20-min scoping call, one PM,
              one invoice, and your brand on every deliverable.
            </p>
          </div>
          <div className={styles.bandActions}>
            <Cta href={estimateHref} size="large" placement="case_band_primary">
              Get a 60-second estimate
            </Cta>
            <Cta href={callHref} variant="secondary" size="large" placement="case_band_secondary">
              Book a 20-min scoping call
            </Cta>
            <TextCta href="/our-work" placement="case_band_tertiary" className={styles.textLink} cursor="view">
              See the work
            </TextCta>
          </div>
        </div>
      </section>

      {pager ? (
        <nav className={styles.pager} aria-label="More case studies">
          <Link href={pager.previous.path} data-cursor="view" data-cta-placement="case_pager_previous">
            <span>← Previous</span>
            <span>{pager.previous.title}</span>
          </Link>
          <Link href={pager.next.path} data-cursor="view" data-cta-placement="case_pager_next">
            <span>Next →</span>
            <span>{pager.next.title}</span>
          </Link>
        </nav>
      ) : null}
    </>
  );
}
