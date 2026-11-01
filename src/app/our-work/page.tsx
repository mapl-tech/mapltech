import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { Arrow, PrimaryCta, TextCta } from '@/components/work/Cta';
import WorkIndex from '@/components/work/WorkIndex';
import {
  WORK_PAGE,
  catalogItems,
  catalogVoice,
  countWord,
  lowestFromPrice,
  serviceLinks,
  servicesOnView,
  type CatalogItem,
} from '@/components/work/catalog';
import { findProject } from '@/components/work/work-data';
import { CALL_HREF, CALL_LABEL, ESTIMATE_HREF, ESTIMATE_LABEL } from '@/components/layout/chrome';
import { FIXED_QUOTE_NOTE } from '@/lib/estimate';
import { creativeWork, imageObject, itemList, pageGraph } from '@/lib/schema';
import styles from './work.module.scss';

/*
 * /our-work, flagship redesign (Nov 2026). A catalog, not a card grid: one
 * museum label per listed project, in the owner's display order, each row a
 * link to its case study. It opens with the honest line (most of our work
 * ships under partners' names) and closes on the reader's project, set as the
 * next label in the catalog.
 *
 * Metadata lives in ./layout.tsx and shares WORK_PAGE with the JSON-LD below.
 * Structured data: CollectionPage + BreadcrumbList + an ItemList of the same
 * projects, in the same order, as the rows render them.
 */
export default function OurWorkPage() {
  const items = catalogItems();
  const voice = catalogVoice();
  const count = countWord(items.length);
  const from = lowestFromPrice();

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
        { path: WORK_PAGE.path, name: 'Projects on view' },
      ),
    ],
  });

  return (
    <>
      <JsonLd data={graph} />

      {/* ------------------------------------------------------------ hero: the wall text */}
      <section className={styles.hero} aria-labelledby="work-title">
        <div className={styles.heroInner}>
          <div className={styles.heroHead}>
            <p className={styles.eyebrow}>Case studies</p>
            <h1 id="work-title" className={styles.title}>
              Work we can show.
            </h1>
          </div>
          <div className={styles.heroCopy}>
            <p className={styles.lede}>
              Most of what we build ships under our partners’ names, and stays there. These {count} projects carry
              ours, and each one opens into the full story.
            </p>
            {/* An early path for readers who already know; the filled button waits in the slot below. */}
            <TextCta href={ESTIMATE_HREF} placement="work_hero_estimate" hero>
              {ESTIMATE_LABEL}
            </TextCta>
          </div>
          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>On view</dt>
              <dd>{items.length} projects</dd>
            </div>
            <div className={styles.fact}>
              <dt>Public prices</dt>
              <dd>From {from}</dd>
            </div>
            <div className={`${styles.fact} ${styles.factWide}`}>
              <dt>Work shown</dt>
              <dd>{sentenceList(servicesOnView())}</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ------------------------------------------------------------ the catalog */}
      <section className={styles.catalog} aria-labelledby="catalog-title">
        <div className={styles.inner}>
          <div className={styles.catalogHead}>
            <h2 id="catalog-title" className={styles.kicker}>
              Projects on view
            </h2>
            <span className={styles.colName} aria-hidden="true">
              What we built
            </span>
            <span className={styles.colName} aria-hidden="true">
              Sector
            </span>
          </div>

          <WorkIndex items={items.map((item) => item.preview)}>
            <ol className={styles.list} role="list">
              {items.map((item) => (
                <CatalogRow key={item.slug} item={item} />
              ))}
            </ol>
          </WorkIndex>

          <p className={styles.labsNote}>
            <span>Products we build and run ourselves live under MAPL Labs.</span>
            <TextCta href="/labs" placement="work_labs">
              See MAPL Labs
            </TextCta>
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------ the client voice, beside the decision */}
      {voice ? (
        <section className={styles.voice} aria-labelledby="voice-title">
          <div className={styles.voiceInner}>
            <h2 id="voice-title" className={styles.voiceKicker}>
              In her words
            </h2>
            <figure className={styles.quote}>
              <blockquote cite={voice.path}>
                <p>{voice.quote}</p>
              </blockquote>
              <figcaption className={styles.quoteBy}>
                <Image src={voice.image} alt="" width={56} height={56} className={styles.avatar} />
                <span>
                  <span className={styles.quoteName}>{voice.name}</span>
                  <span className={styles.quoteRole}>{voice.role}</span>
                </span>
              </figcaption>
            </figure>
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------------ the empty slot */}
      {/* data-page-close: the shared footer hides its own ask when a page ends on one. */}
      <section className={styles.next} aria-labelledby="next-title" data-page-close>
        <div className={styles.inner}>
          <div className={styles.slot}>
            <h2 id="next-title" className={styles.slotTitle}>
              Your project, next.
            </h2>
            <dl className={styles.slotLabel}>
              <div className={styles.slotField} data-field="built">
                <dt>What we build</dt>
                <dd>
                  <ul className={styles.services} role="list">
                    {serviceLinks().map((service) => (
                      <li key={service.key}>
                        <Link href={service.href}>{service.name}</Link>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div className={styles.slotField} data-field="sector">
                <dt>Sector</dt>
                <dd>Yours</dd>
              </div>
              <div className={styles.slotField} data-field="result">
                <dt>Result</dt>
                <dd className={styles.result}>A published price range, before we ask for anything.</dd>
              </div>
            </dl>
            <div className={styles.slotActions}>
              <PrimaryCta href={ESTIMATE_HREF} placement="work_next_estimate">
                {ESTIMATE_LABEL}
              </PrimaryCta>
              <TextCta href={CALL_HREF} placement="work_next_call">
                {CALL_LABEL}
              </TextCta>
              <p className={styles.slotNote}>
                Public prices, from {from}. {FIXED_QUOTE_NOTE}.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/** "Web Development, Automation & AI, Custom Internal Tools": service names as named. */
function sentenceList(names: readonly string[]): string {
  return names.join(', ');
}

/** One museum label. The client name is the link; it stretches over the whole row. */
function CatalogRow({ item }: { item: CatalogItem }) {
  return (
    <li className={styles.row} data-slug={item.slug}>
      <div className={styles.lead}>
        <span className={styles.thumb} aria-hidden="true">
          {item.thumb ? (
            <Image
              src={item.thumb}
              alt=""
              width={780}
              height={1688}
              sizes="(min-width: 1024px) 88px, (min-width: 768px) 136px, 104px"
              className={styles.thumbImg}
            />
          ) : item.flow ? (
            <span className={styles.flowTile}>
              <span className={styles.flowTag}>Diagram</span>
              <span className={styles.flowSteps}>
                {item.flow.map((step) => (
                  <span key={step} className={styles.flowStep}>
                    {step}
                  </span>
                ))}
              </span>
            </span>
          ) : null}
        </span>
        <h3 className={styles.client}>
          <Link href={item.path} className={styles.rowLink} data-cta-placement={`work_row_${item.slug}`}>
            <span className={styles.clientName}>{item.client}</span>
            <span className="visually-hidden">: read the case study</span>
          </Link>
        </h3>
      </div>

      <dl className={styles.label} data-dated={item.year ? '' : undefined}>
        <div className={styles.field} data-field="built">
          <dt>What we built</dt>
          <dd>{item.built}</dd>
        </div>
        <div className={styles.field} data-field="sector">
          <dt>Sector</dt>
          <dd>{item.sector}</dd>
        </div>
        {item.year ? (
          <div className={styles.field} data-field="year">
            <dt>Year</dt>
            <dd>
              <time dateTime={item.year}>{item.year}</time>
            </dd>
          </div>
        ) : null}
        {item.result ? (
          <div className={styles.field} data-field="result">
            <dt>Result</dt>
            <dd className={styles.result}>
              <span className={styles.value}>{item.result.value}</span>{' '}
              <span className={styles.resultLabel}>{item.result.label}</span>
            </dd>
          </div>
        ) : null}
      </dl>

      {item.note ? <p className={styles.note}>{item.note}</p> : null}

      <span className={styles.go} aria-hidden="true">
        <span className={styles.goText}>Case study</span>
        <Arrow />
      </span>
    </li>
  );
}
