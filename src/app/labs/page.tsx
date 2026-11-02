import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import { HERO_REASSURE } from '@/components/flagship/content';
import { PrimaryCta, TextCta } from '@/components/work/Cta';
import LabsStage from '@/components/work/LabsStage';
import LabsStepper from '@/components/work/LabsStepper';
import { BOOKING_PIPELINE, LABS_PAGE, NEXT_PRODUCTS, PIPELINE_FOOTNOTE, TOURS, TOURS_STORY } from '@/components/work/labs';
import { estimateLinkFor, hostOf } from '@/components/work/work-data';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import { labsProjects } from '@/config/site';
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
 * /labs (Nov 2026 award pass). MAPL Labs as proof that MAPL TECH ships and
 * operates real products: the question agencies ask and our answer, the live
 * product rising into view, MAPL Tours by its published numbers (paper), one
 * booking through the real pipeline (the interaction, an illustration),
 * Labsci in development (paper), and the ask. Facts: site.ts `labsProjects`
 * and the 'mapl-tours' case story only (see components/work/labs.ts).
 *
 * Structured data: CollectionPage + BreadcrumbList + an ItemList of both
 * products (CreativeWork, with their real status), anchored at #mapl-tours
 * and #labsci on this page.
 */
export default function LabsPage() {
  const toursHost = hostOf(TOURS.url ?? undefined);
  const results = TOURS_STORY?.results ?? [];
  const proves = TOURS_STORY?.impact?.[0];
  const caseHref = '/our-work/mapl-tours';

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

      {/* One H1, two voices: the question agencies ask, then our answer at display scale. */}
      <PageHeader
        id="labs-title"
        size="xl"
        crumbs={[{ label: 'Work', href: '/our-work' }, { label: LABS_PAGE.name }]}
        label={LABS_PAGE.name}
        title={
          <>
            <span className={styles.question}>Is AI-built software ready for production?</span> We answer with{' '}
            <em>a business.</em>
          </>
        }
        lede={
          <p>
            MAPL Labs is where we build and run our own products. {TOURS.name}, a travel company run by AI, is live and
            taking real payments. {NEXT_PRODUCTS.map((p) => p.name).join(' and ')} is in development.
          </p>
        }
        actions={
          <>
            <PrimaryCta href={PROJECT_HREF} placement="labs_hero_primary" hero>
              {PROJECT_LABEL}
            </PrimaryCta>
            <TextCta href={caseHref} placement="labs_hero_case">
              Read the {TOURS.name} case study
            </TextCta>
          </>
        }
      />

      {/* ------------------------------------------------------------ the live product */}
      {toursMedia ? (
        <div className={styles.stageWrap}>
          <div className={styles.stageInner}>
            <LabsStage
              slug={TOURS.slug}
              address={toursHost}
              desktop={toursMedia.desktop}
              mobile={toursMedia.mobile}
              alt={toursMedia.alt}
              caption={
                <>
                  <span className={styles.live}>{TOURS.status}</span>
                  <span>
                    {TOURS.name}, {TOURS.tagline.charAt(0).toLowerCase() + TOURS.tagline.slice(1)}.
                  </span>
                </>
              }
            />
          </div>
        </div>
      ) : null}

      {/* ------------------------------------------------------------ MAPL Tours, by the numbers (paper) */}
      <section id={TOURS.slug} className={styles.tours} aria-labelledby="tours-title">
        <div className={styles.toursInner}>
          <header className={styles.toursHead}>
            <p className={styles.toursLabel}>{TOURS.name}</p>
            <div className={styles.toursHeadCopy}>
              <h2 id="tours-title" className={styles.toursTitle}>
                {TOURS_STORY?.headline.split(',')[0] ?? TOURS.tagline}.
              </h2>
              {/* The stage caption and the third result already say it is live; the link stands alone. */}
              <p className={styles.toursMeta}>
                {TOURS.url && toursHost ? (
                  <a href={TOURS.url} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
                    {toursHost}
                    <span className="visually-hidden"> (opens in a new tab)</span>
                    <span aria-hidden="true"> ↗</span>
                  </a>
                ) : null}
              </p>
              <p className={styles.toursLede}>{TOURS_STORY?.situation?.[1] ?? TOURS.description}</p>
            </div>
          </header>

          {results.length ? (
            <dl className={styles.results} data-count={results.length}>
              {results.map((result) => (
                // Value first, in the DOM as on screen ("~50%, of customers now arrive through ChatGPT").
                <div key={result.label} className={styles.result}>
                  <dt className={styles.resultValue}>{result.value}</dt>
                  <dd className={styles.resultLabel}>{result.label}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <div className={styles.lists}>
            {proves ? (
              <div className={styles.list}>
                <h3 className={styles.listTitle}>{proves.heading}</h3>
                <ul role="list">
                  {proves.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ) : null}
            <div className={styles.list}>
              <h3 className={styles.listTitle}>What runs on its own</h3>
              <ul role="list">
                {TOURS.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </div>
          </div>

          <footer className={styles.toursFoot}>
            {TOURS_STORY?.sources ? <p className={styles.sources}>Sources: {TOURS_STORY.sources}</p> : null}
            <TextCta href={caseHref} placement="labs_tours_case" tone="paper">
              Read the {TOURS.name} case study
            </TextCta>
          </footer>
        </div>
      </section>

      {/* ------------------------------------------------------------ one booking, start to finish */}
      <section className={styles.pipeline} aria-labelledby="pipeline-title">
        <div className={styles.pipelineInner}>
          <LabsStepper
            stages={BOOKING_PIPELINE}
            intro={
              <>
                <p className={styles.pipelineLabel}>Illustration</p>
                <h2 id="pipeline-title" className={styles.pipelineTitle}>
                  One booking, start to finish.
                </h2>
                <p className={styles.pipelineIntro}>
                  The five stages every {TOURS.name} booking passes through, and the engineering under each one. This is an
                  illustration, not a live feed: nothing here touches a real booking.
                </p>
              </>
            }
            footnote={PIPELINE_FOOTNOTE}
            after={
              <p className={styles.pipelineCta}>
                <span>Want a pipeline like this for a client?</span>
                <TextCta href={estimateLinkFor('automation')} placement="labs_pipeline_estimate">
                  Price a build like this
                </TextCta>
              </p>
            }
          />
        </div>
      </section>

      {/* ------------------------------------------------------------ next in the lab (paper) */}
      {NEXT_PRODUCTS.map((product) => (
        <section key={product.slug} id={product.slug} className={styles.next} aria-labelledby={`${product.slug}-title`}>
          <div className={styles.nextInner}>
            <p className={styles.nextLabel}>Next in the lab</p>
            {/* Not public yet, so no picture of it: only what site.ts says. */}
            <div className={styles.nextBody}>
              <p className={styles.status}>{product.status}</p>
              <h2 id={`${product.slug}-title`} className={styles.nextName}>
                {product.name}
              </h2>
              <p className={styles.nextLine}>{product.tagline}.</p>
              <p className={styles.nextText}>{product.description}</p>
              <ul className={styles.caps} role="list" aria-label={`${product.name} status`}>
                {product.capabilities.map((capability) => (
                  <li key={capability}>{capability}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ))}

      <CloseBand
        id="labs-close-title"
        placement="labs_close"
        title={TOURS_STORY?.matters?.heading ?? 'Your product could be next.'}
        lede={TOURS_STORY?.matters?.text}
        note={HERO_REASSURE}
      />
    </>
  );
}
