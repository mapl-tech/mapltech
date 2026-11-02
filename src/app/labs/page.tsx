import type { Metadata } from 'next';
import Image from 'next/image';
import JsonLd from '@/components/seo/JsonLd';
import { PrimaryCta, TextCta } from '@/components/work/Cta';
import LabsStepper from '@/components/work/LabsStepper';
import { BOOKING_PIPELINE, LABS_PAGE, NEXT_PRODUCTS, PIPELINE_FOOTNOTE, TOURS, TOURS_STORY } from '@/components/work/labs';
import { estimateLinkFor, hostOf, scopingCallLinkFor, startingPriceLabel } from '@/components/work/work-data';
import { CALL_LABEL, ESTIMATE_LABEL } from '@/components/layout/chrome';
import { labsProjects } from '@/config/site';
import { FIXED_QUOTE_NOTE } from '@/lib/estimate';
import { creativeWork, imageObject, itemList, pageGraph } from '@/lib/schema';
import styles from './labs.module.scss';

const url = 'https://mapltech.com/labs';
const toursMedia = TOURS_STORY?.media;
// A real capture of MAPL Tours (never the placeholder art in site.ts).
const ogImage = { url: toursMedia?.desktop ?? '/images/og-image.png', width: 1800, height: 1125, alt: toursMedia?.alt ?? 'MAPL Tours' };

export const metadata: Metadata = {
  title: LABS_PAGE.title,
  description: LABS_PAGE.description,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    url,
    siteName: 'MAPL TECH',
    title: `${LABS_PAGE.title} | MAPL TECH`,
    description: LABS_PAGE.description,
    images: [ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${LABS_PAGE.title} | MAPL TECH`,
    description: LABS_PAGE.description,
    images: [ogImage.url],
  },
};

/*
 * /labs, flagship redesign (Nov 2026). MAPL Labs as proof that MAPL TECH
 * ships and operates real products. Facts: site.ts `labsProjects` and the
 * 'mapl-tours' case story only (see components/work/labs.ts). The one
 * interaction is the booking pipeline, presented as an illustration.
 *
 * Structured data: CollectionPage + BreadcrumbList + an ItemList of both
 * products (CreativeWork, with their real status), anchored at #mapl-tours
 * and #labsci on this page.
 */
export default function LabsPage() {
  const estimateHref = estimateLinkFor('automation');
  const callHref = scopingCallLinkFor('automation');
  const automationFrom = startingPriceLabel('automation');
  const toursHost = hostOf(TOURS.url ?? undefined);
  const results = TOURS_STORY?.results ?? [];
  const proves = TOURS_STORY?.impact?.[0];

  const graph = pageGraph({
    path: LABS_PAGE.path,
    name: LABS_PAGE.name,
    description: LABS_PAGE.description,
    type: 'CollectionPage',
    image: toursMedia?.desktop,
    breadcrumbs: [
      { name: 'Work', path: '/our-work' },
      { name: 'MAPL Labs', path: LABS_PAGE.path },
    ],
    nodes: [
      itemList(
        labsProjects.map((project) => {
          const real = project.slug === TOURS.slug ? toursMedia?.desktop : undefined;
          return {
            name: project.name,
            path: `${LABS_PAGE.path}#${project.slug}`,
            description: project.tagline,
            item: { ...creativeWork(project), image: real ? imageObject(real, project.name) : undefined },
          };
        }),
        { path: LABS_PAGE.path, name: 'MAPL Labs products' },
      ),
    ],
  });

  return (
    <>
      <JsonLd data={graph} />

      {/* ------------------------------------------------------------ hero */}
      <section className={styles.hero} aria-labelledby="labs-title">
        <div className={styles.heroInner}>
          <div className={styles.heroHead}>
            <p className={styles.eyebrow}>MAPL Labs</p>
            <h1 id="labs-title" className={styles.title}>
              <span className={styles.question}>Is AI-built software ready for production?</span>{' '}
              <span className={styles.answer}>
                We answer with <em className={styles.accent}>a business.</em>
              </span>
            </h1>
          </div>

          <div className={styles.heroCopy}>
            <p className={styles.lede}>
              MAPL Labs is where we build and run our own products. {TOURS.name}, a travel company run by AI, is live and
              taking real payments. {NEXT_PRODUCTS.map((p) => p.name).join(' and ')} is in development.
            </p>
            <div className={styles.decide}>
              <div className={styles.actions}>
                <PrimaryCta href={estimateHref} placement="labs_hero_estimate" hero>
                  {ESTIMATE_LABEL}
                </PrimaryCta>
                <TextCta href="/our-work/mapl-tours" placement="labs_hero_case">
                  Read the {TOURS.name} case study
                </TextCta>
              </div>
              {automationFrom ? (
                <p className={styles.trust}>Automation and AI: {automationFrom.toLowerCase()}. Our prices are public.</p>
              ) : null}
            </div>
          </div>

          {toursMedia ? (
            <figure className={styles.devices}>
              <div className={styles.stage}>
                <div className={styles.laptop}>
                  <div className={styles.screen}>
                    <Image
                      src={toursMedia.desktop}
                      alt={toursMedia.alt}
                      width={1800}
                      height={1125}
                      sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 88vw"
                      preload
                      fetchPriority="high"
                      className={styles.shot}
                    />
                  </div>
                  <span className={styles.base} aria-hidden="true" />
                </div>
                {toursMedia.mobile ? (
                  <div className={styles.phone}>
                    <Image
                      src={toursMedia.mobile}
                      alt=""
                      width={780}
                      height={1688}
                      sizes="(min-width: 1024px) 200px, 24vw"
                      className={styles.shot}
                    />
                  </div>
                ) : null}
                <span className={styles.frame} aria-hidden="true" />
              </div>
              <figcaption className={styles.caption}>
                <span className={styles.live}>{TOURS.status}</span>
                <span>
                  {TOURS.name}, {TOURS.tagline.charAt(0).toLowerCase() + TOURS.tagline.slice(1)}.
                </span>
              </figcaption>
            </figure>
          ) : null}
        </div>
      </section>

      {/* ------------------------------------------------------------ MAPL Tours, by the numbers */}
      <section id={TOURS.slug} className={styles.tours} aria-labelledby="tours-title">
        <div className={styles.inner}>
          <div className={styles.toursHead}>
            <div>
              <p className={styles.statusRow}>
                <span className={styles.live}>{TOURS.status}</span>
                {TOURS.url && toursHost ? (
                  <a href={TOURS.url} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
                    {toursHost}
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                ) : null}
              </p>
              <h2 id="tours-title" className={styles.h2}>
                {TOURS_STORY?.headline.split(',')[0] ?? TOURS.tagline}.
              </h2>
            </div>
            {TOURS_STORY?.situation?.[1] ? <p>{TOURS_STORY.situation[1]}</p> : <p>{TOURS.description}</p>}
          </div>

          {results.length ? (
            <dl className={styles.results}>
              {results.map((result) => (
                <div key={result.label} className={styles.result}>
                  <dt className={styles.resultLabel}>{result.label}</dt>
                  <dd className={styles.resultValue}>{result.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <ul className={styles.caps} role="list" aria-label={`What runs on its own at ${TOURS.name}`}>
            {TOURS.capabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>

          {TOURS_STORY?.sources ? <p className={styles.sources}>Sources: {TOURS_STORY.sources}</p> : null}
          <p className={styles.toursMore}>
            <TextCta href="/our-work/mapl-tours" placement="labs_tours_case">
              Read the {TOURS.name} case study
            </TextCta>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ one booking, start to finish */}
      <section className={styles.pipeline} aria-labelledby="pipeline-title">
        <div className={styles.inner}>
          <LabsStepper
            stages={BOOKING_PIPELINE}
            intro={
              <>
                <p className={styles.pipelineTag}>Illustration</p>
                <h2 id="pipeline-title" className={styles.h2}>
                  One booking, start to finish.
                </h2>
                <p className={styles.pipelineIntro}>
                  The five stages every {TOURS.name} booking passes through, and the engineering under each one. This is
                  an illustration, not a live feed: nothing here touches a real booking.
                </p>
              </>
            }
            footnote={PIPELINE_FOOTNOTE}
            after={
              <p className={styles.pipelineCta}>
                <span>Want a pipeline like this for a client?</span>
                <TextCta href={estimateHref} placement="labs_pipeline_estimate">
                  {ESTIMATE_LABEL}
                </TextCta>
              </p>
            }
          />
        </div>
      </section>

      {/* ------------------------------------------------------------ next in the lab */}
      {NEXT_PRODUCTS.map((product) => (
        <section key={product.slug} id={product.slug} className={styles.next} aria-labelledby={`${product.slug}-title`}>
          <div className={styles.inner}>
            {/* Not public yet, so no picture of it: only what site.ts says, in a dashed "in development" frame. */}
            <div className={styles.soonCard}>
              <div className={styles.soonHead}>
                <p className={styles.soon}>{product.status}</p>
                <h2 id={`${product.slug}-title`} className={styles.h2}>
                  {product.name}
                </h2>
                <p className={styles.tagline}>{product.tagline}.</p>
              </div>
              <div className={styles.soonBody}>
                <p className={styles.nextText}>{product.description}</p>
                <ul className={styles.caps} role="list" aria-label={`${product.name} status`}>
                  {product.capabilities.map((capability) => (
                    <li key={capability}>{capability}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* ------------------------------------------------------------ why it matters */}
      {/* data-page-close: the shared footer hides its own ask when a page ends on one. */}
      <section className={styles.close} aria-labelledby="close-title" data-page-close>
        <div className={styles.closeInner}>
          <div className={styles.closeCard}>
            <div>
              <h2 id="close-title" className={styles.closeTitle}>
                {TOURS_STORY?.matters?.heading ?? 'Why this matters to your clients'}
              </h2>
              {TOURS_STORY?.matters ? <p className={styles.closeText}>{TOURS_STORY.matters.text}</p> : null}
            </div>
            {proves ? (
              <div className={styles.proves}>
                <h3 className={styles.kicker}>{proves.heading}</h3>
                <ul role="list">
                  {proves.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className={styles.closeActions}>
              <PrimaryCta href={estimateHref} placement="labs_close_estimate">
                {ESTIMATE_LABEL}
              </PrimaryCta>
              <TextCta href={callHref} placement="labs_close_call">
                {CALL_LABEL}
              </TextCta>
              <p className={styles.closeNote}>
                Automation and AI {automationFrom ? automationFrom.toLowerCase() : null}. {FIXED_QUOTE_NOTE}.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
