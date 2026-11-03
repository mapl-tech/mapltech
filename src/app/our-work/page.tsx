import { ViewTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import { PrimaryCta, TextCta } from '@/components/work/Cta';
import WorkIndex from '@/components/work/WorkIndex';
import { WORK_PAGE, catalogFilters, catalogItems, catalogVoice, countWord, type CatalogItem } from '@/components/work/catalog';
import { findProject } from '@/components/work/work-data';
import { PRICING_HREF, PRICING_LABEL, PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import { creativeWork, imageObject, itemList, pageGraph } from '@/lib/schema';
import styles from './work.module.scss';

/*
 * /our-work (Nov 2026 simplify pass): four parts, in reading order. The page
 * hero says the honest line (most of our work ships under partners' names);
 * the index lists every project in the owner's order, each with its real
 * capture and a link to its case study, filterable by service line; one
 * client quote; the ask.
 *
 * Every row's capture carries the case hero's view-transition name, so it
 * morphs into the case study's browser frame on navigation (one element per
 * name on this page).
 *
 * Metadata lives in ./layout.tsx and shares WORK_PAGE with the JSON-LD below.
 * Structured data: CollectionPage + BreadcrumbList + an ItemList of the same
 * projects, in the same order, as the rows render them.
 */
export default function OurWorkPage() {
  const items = catalogItems();
  const filters = catalogFilters();
  const voice = catalogVoice();

  const graph = pageGraph({
    path: WORK_PAGE.path,
    name: WORK_PAGE.name,
    description: WORK_PAGE.description,
    type: 'CollectionPage',
    breadcrumbs: [{ name: 'Work', path: WORK_PAGE.path }],
    nodes: [
      itemList(
        items.map((item) => {
          const project = findProject(item.slug);
          return {
            name: item.client,
            path: item.path,
            description: [item.built, item.sector, item.result ? `${item.result.value} ${item.result.label}` : null]
              .filter(Boolean)
              .join('. '),
            item: project
              ? {
                  ...creativeWork(project, { path: item.path }),
                  // The real capture, never a mockup; no capture, no image.
                  image: item.preview.src ? imageObject(item.preview.src, item.note ?? item.client) : undefined,
                }
              : undefined,
          };
        }),
        { path: WORK_PAGE.path, name: 'Projects' },
      ),
    ],
  });

  return (
    <>
      <JsonLd data={graph} />

      <PageHeader
        id="work-title"
        label="Our work"
        title="Websites, tools and automation we built."
        lede={
          <p>
            Most of our work is published under our partners’ names. These {countWord(items.length)} projects carry ours.
            Open any one to see what we built and what changed.
          </p>
        }
        actions={
          <>
            <PrimaryCta href={PROJECT_HREF} placement="work_hero_primary" hero>
              {PROJECT_LABEL}
            </PrimaryCta>
            <TextCta href={PRICING_HREF} placement="work_hero_pricing">
              {PRICING_LABEL}
            </TextCta>
          </>
        }
      />

      {/* ------------------------------------------------------------ the index */}
      <section className={styles.index} aria-labelledby="index-title">
        <div className={styles.indexInner}>
          <WorkIndex
            items={items.map((item) => item.preview)}
            filters={filters}
            total={items.length}
            heading={
              <h2 id="index-title" className={styles.indexLabel}>
                Projects
              </h2>
            }
          >
            <ol className={styles.rows} role="list">
              {items.map((item) => (
                <Row key={item.slug} item={item} />
              ))}
            </ol>
          </WorkIndex>
        </div>
      </section>

      {/* ------------------------------------------------------------ the client voice */}
      {voice ? (
        <section className={styles.voice} aria-labelledby="voice-title">
          <div className={styles.voiceInner}>
            <h2 id="voice-title" className={styles.voiceLabel}>
              What a client says
            </h2>
            <figure className={styles.quote}>
              <blockquote cite={voice.path} className={styles.quoteText}>
                <p>“{voice.quote}”</p>
              </blockquote>
              <figcaption className={styles.quoteBy}>
                <Image src={voice.image} alt="" width={56} height={56} className={styles.avatar} />
                <span>
                  <span className={styles.quoteName}>{voice.name}</span>
                  <span className={styles.quoteRole}>{voice.role}</span>
                </span>
              </figcaption>
            </figure>
            <p className={styles.voiceMore}>
              <TextCta href={voice.path} placement="work_voice_case">
                Read the {voice.client} case study
              </TextCta>
            </p>
          </div>
        </section>
      ) : null}

      <CloseBand
        id="work-close-title"
        placement="work_close"
        title="Ready to start your project?"
      />
    </>
  );
}

/**
 * One index row. The client name is the link and stretches over the whole row;
 * the capture beside it carries the case hero's view-transition name.
 */
function Row({ item }: { item: CatalogItem }) {
  return (
    <li className={styles.row} data-slug={item.slug} data-line={item.line}>
      <div className={styles.media}>
        <ViewTransition name={`case-media-${item.slug}`} share="morph" default="none">
          {item.desktop ? (
            <div className={styles.browser} aria-hidden="true">
              <div className={styles.chrome}>
                <span className={styles.lights}>
                  <i />
                  <i />
                  <i />
                </span>
                {item.address ? <span className={styles.url}>{item.address}</span> : null}
              </div>
              <Image
                src={item.desktop}
                alt=""
                width={1800}
                height={1125}
                sizes="(min-width: 1024px) 264px, (min-width: 768px) 44vw, 92vw"
                className={styles.shot}
              />
            </div>
          ) : (
            <div className={styles.diagram} aria-hidden="true">
              <span className={styles.diagramLabel}>Diagram, not a screenshot</span>
              <ol className={styles.diagramSteps}>
                {(item.flow ?? []).map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </ViewTransition>
        {/* The capture is not the work itself: say what it shows, right under it
            (read out with the row's facts, after the name, instead of here). */}
        {item.note ? (
          <p className={styles.note} aria-hidden="true">
            {item.note}
          </p>
        ) : null}
      </div>

      <h3 className={styles.name}>
        <Link href={item.path} className={styles.link} data-cta-placement={`work_row_${item.slug}`}>
          <span className={styles.nameText}>{item.client}</span>
          <span className="visually-hidden">: read the case study</span>
        </Link>
      </h3>

      <dl className={styles.facts}>
        <div className={styles.fact} data-field="built">
          <dt>What we built</dt>
          <dd>{item.built}</dd>
        </div>
        <div className={styles.fact} data-field="sector">
          <dt>Sector</dt>
          <dd>{item.sector}</dd>
        </div>
        {item.year ? (
          <div className={styles.fact} data-field="year">
            <dt>Year</dt>
            <dd>
              <time dateTime={item.year}>{item.year}</time>
            </dd>
          </div>
        ) : null}
        {item.note ? (
          <div className="visually-hidden">
            <dt>About the screenshot</dt>
            <dd>{item.note}</dd>
          </div>
        ) : null}
        {item.result ? (
          <div className={styles.fact} data-field="result">
            <dt>Result</dt>
            <dd className={styles.result}>
              <span className={styles.value}>{item.result.value}</span>
              <span className={styles.resultLabel}>{item.result.label}</span>
            </dd>
          </div>
        ) : null}
      </dl>

      <span className={styles.go} aria-hidden="true">
        →
      </span>
    </li>
  );
}
