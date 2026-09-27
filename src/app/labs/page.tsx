import type { Metadata } from 'next';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import JsonLd from '@/components/seo/JsonLd';
import SnapRow from '@/components/ui/SnapRow';
import Cta, { TextCta } from '@/components/work/Cta';
import LabsStepper from '@/components/work/LabsStepper';
import {
  LABS_ETHOS,
  LABS_PIPELINE,
  MAPL_TOURS_WORKFLOW,
  estimateLinkFor,
  hostOf,
  scopingCallLinkFor,
  startingPriceLabel,
} from '@/components/work/work-data';
import { routeLastModified } from '@/config/routes';
import { labsProjects, portfolioProjects } from '@/config/site';
import { creativeWork, pageGraph } from '@/lib/schema';
import styles from './labs.module.scss';

export const metadata: Metadata = {
  title: 'Labs',
  description:
    'MAPL Labs is where MAPL TECH builds and operates its own products - starting with MAPL Tours, a travel company run end-to-end by AI. Proof we ship and run real production systems, not just client work.',
  openGraph: {
    title: 'MAPL Labs | MAPL TECH',
    description:
      'Proprietary products MAPL TECH builds and operates in-house. The proving ground for the systems, automation, and infrastructure we bring to every client.',
  },
  alternates: { canonical: 'https://mapltech.com/labs' },
};

const PAGE_DESCRIPTION = metadata.description as string;

const pad = (n: number) => String(n).padStart(2, '0');

export default function LabsPage() {
  const tours = labsProjects.find((p) => p.slug === 'mapl-tours') ?? labsProjects[0];
  const toursHost = hostOf(tours.url ?? undefined);
  // The portfolio entry's screenshot (1200×800) is the hero poster; the card keeps the Labs image,
  // so the two above-the-fold uses of MAPL Tours do not share one src.
  const toursPoster = portfolioProjects.find((p) => p.slug === tours.slug)?.image ?? tours.image;
  const liveCount = labsProjects.filter((p) => p.status === 'Live').length;
  const buildingCount = labsProjects.length - liveCount;

  const automationFrom = startingPriceLabel('automation');
  const toolsFrom = startingPriceLabel('tools');
  const estimateHref = estimateLinkFor('automation');
  const callHref = scopingCallLinkFor('automation');

  const lastModified = routeLastModified('/labs');
  const reviewed = lastModified ? lastModified.slice(0, 7) : undefined;

  const graph = pageGraph({
    path: '/labs',
    name: 'Labs',
    description: PAGE_DESCRIPTION,
    type: 'CollectionPage',
    breadcrumbs: [
      { name: 'Our Work', path: '/our-work' },
      { name: 'MAPL Labs', path: '/labs' },
    ],
    nodes: labsProjects.map((project) => creativeWork(project)),
  });

  return (
    <>
      <JsonLd data={graph} />

      {/* 01 · Hero: H1 (LCP) → lede → key facts → CTAs; poster only in v1, never the LCP on phones. */}
      <section className={styles.hero} aria-labelledby="labs-title">
        <div className={styles.heroInner}>
          <div className={styles.heroCopy}>
            <p className="eyebrow">MAPL Labs · /labs</p>
            <h1 id="labs-title" className={styles.title}>
              We don&apos;t just build for clients. We build for ourselves.
            </h1>
            <p className={styles.lede}>
              MAPL Labs is where MAPL TECH runs its own products, starting with MAPL Tours, an AI-operated travel
              company. It is the proving ground for the systems, automation and infrastructure we bring to every
              agency engagement: {liveCount === 1 ? 'one product' : `${liveCount} products`} live today,{' '}
              {buildingCount === 1 ? 'one' : buildingCount} in development, {labsProjects.length === 2 ? 'both' : 'all'} built and operated in-house.
            </p>

            <dl className={`kv ${styles.facts}`}>
              <div>
                <dt>Products</dt>
                <dd>
                  {labsProjects.length} —{' '}
                  {labsProjects.map((p) => `${p.name} (${p.status.toLowerCase()})`).join(' · ')}
                </dd>
              </div>
              <div>
                <dt>Operated from</dt>
                <dd>Toronto (HQ) · Lagos · Kingston</dd>
              </div>
              <div>
                <dt>Stack</dt>
                <dd>The same AI agents, automations and cloud systems we sell to clients</dd>
              </div>
              <div>
                <dt>Want it for your agency</dt>
                <dd>
                  Automation &amp; AI {automationFrom?.toLowerCase()} · Custom Internal Tools {toolsFrom?.toLowerCase()}
                </dd>
              </div>
              {reviewed ? (
                <div>
                  <dt>Last reviewed</dt>
                  <dd>
                    <time dateTime={lastModified}>{reviewed}</time>
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className={styles.ctas}>
              <Cta href={estimateHref} size="large" placement="labs_hero_primary" hero>
                Get a 60-second estimate
              </Cta>
              <Cta href={callHref} variant="secondary" size="large" placement="labs_hero_secondary">
                Book a 20-min scoping call
              </Cta>
              <TextCta href="/our-work" placement="labs_hero_tertiary" className={styles.textLink} cursor="view">
                See the work
              </TextCta>
            </div>
          </div>

          <div className={styles.poster}>
            <Image
              src={toursPoster}
              alt={`${tours.name} — ${tours.tagline}`}
              width={1200}
              height={750}
              sizes="(max-width: 1023px) 100vw, 42vw"
              loading="eager"
            />
            <span className={styles.posterCaption}>
              <span className={styles.dot} aria-hidden="true" />
              {tours.name} · {tours.status.toLowerCase()}
            </span>
          </div>
        </div>
      </section>

      {/* 02 · Ethos strip: real copy, static, revealed on scroll */}
      <section className={`${styles.section} reveal`} data-below-fold aria-labelledby="labs-ethos">
        <div className={styles.sectionHead}>
          <p className="eyebrow">Why we run our own products</p>
          <h2 id="labs-ethos">Ship it. Run it. Prove it.</h2>
        </div>
        <ol className={styles.numbered}>
          {LABS_ETHOS.map((item, i) => (
            <li key={item.title}>
              <span className={styles.indexLabel}>{pad(i + 1)}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 03 · Experiment track: snap / drag row generated from labsProjects */}
      <section className={styles.trackSection} aria-labelledby="labs-track">
        <div className={styles.sectionHead}>
          <p className="eyebrow">Inside the lab</p>
          <h2 id="labs-track">Products we build and operate</h2>
          <p>
            Owned, engineered, and run by MAPL TECH. {labsProjects.length === 2 ? 'Two entries today' : `${labsProjects.length} entries today`};
            the track is generated from the config.
          </p>
        </div>
        <SnapRow label="Products we build and operate" className={styles.track}>
          {labsProjects.map((project) => {
            const isLive = project.status === 'Live';
            return (
              <article
                key={project.slug}
                id={project.slug === 'mapl-tours' ? undefined : project.slug}
                className={styles.card}
                aria-labelledby={`labs-card-${project.slug}`}
              >
                <div className={`${styles.cardMedia} ${isLive ? '' : styles.cardMediaSoon}`}>
                  <Image
                    src={project.image}
                    alt={`${project.name} — ${project.tagline}`}
                    width={720}
                    height={450}
                    sizes="(max-width: 767px) 85vw, 560px"
                  />
                  {!isLive ? <span className={styles.stamp}>In development</span> : null}
                  <span className={styles.swipe} aria-hidden="true">
                    Swipe
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <p className={`${styles.status} ${isLive ? styles.live : ''}`}>
                    <span className={styles.dot} aria-hidden="true" />
                    {project.status}
                  </p>
                  <h3 id={`labs-card-${project.slug}`}>{project.name}</h3>
                  <p className={styles.tagline}>{project.tagline}</p>
                  <p className={styles.desc}>{project.description}</p>
                  <ul className={styles.caps} aria-label={`${project.name} capabilities`}>
                    {project.capabilities.map((cap) => (
                      <li key={cap}>{cap}</li>
                    ))}
                  </ul>
                  {project.url ? (
                    <TextCta href={project.url} external placement="labs_card_visit" className={styles.textLink}>
                      Visit {project.name}
                    </TextCta>
                  ) : (
                    <span className={styles.soonNote}>Announcing soon</span>
                  )}
                </div>
              </article>
            );
          })}
        </SnapRow>
      </section>

      {/* 04 · MAPL Tours deep-dive: "Run this workflow" stepper (PEAK). Step text is real <h3>/<p>. */}
      <section id="mapl-tours" className={styles.deepDive} aria-labelledby="labs-tours">
        <div className={styles.deepDiveHead}>
          <p className={styles.eyebrowRow}>
            <span className={styles.dot} aria-hidden="true" />
            {tours.name} · {tours.status.toLowerCase()}
            {tours.url && toursHost ? (
              <>
                {' · '}
                <a href={tours.url} target="_blank" rel="noopener noreferrer" data-cursor="external">
                  {toursHost}
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </>
            ) : null}
          </p>
          <h2 id="labs-tours">{tours.tagline}</h2>
          <p>
            AI handles the entire journey — trip planning, booking, itinerary generation, and customer communication —
            on the same agents, pipelines and infrastructure we build for clients, running a live company 24/7.
          </p>
        </div>

        <LabsStepper steps={MAPL_TOURS_WORKFLOW} productName={tours.name} />

        {tours.url ? (
          <p>
            <TextCta href={tours.url} external placement="labs_tours_visit" className={styles.textLink}>
              Visit {tours.name}
            </TextCta>
          </p>
        ) : null}
      </section>

      {/* 05 · How it ships: static <ol>, real copy */}
      <section className={`${styles.section} reveal`} data-below-fold aria-labelledby="labs-ships">
        <div className={styles.sectionHead}>
          <p className="eyebrow">How it ships</p>
          <h2 id="labs-ships">From prototype to operating business</h2>
          <p>The four stages every MAPL Labs product moves through.</p>
        </div>
        <ol className={styles.numbered} style={{ '--cols': 4 } as CSSProperties}>
          {LABS_PIPELINE.map((step, i) => (
            <li key={step.stage}>
              <span className={styles.indexLabel}>{pad(i + 1)}</span>
              <div>
                <h3>{step.stage}</h3>
                <p>{step.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 06 · CTA band */}
      <section className={`${styles.band} reveal`} data-below-fold aria-labelledby="labs-band">
        <div className={styles.bandInner}>
          <div>
            <h2 id="labs-band">Want this for your agency?</h2>
            <p>
              The engineering that runs our own companies is the same engineering we bring to yours. Tell us what
              you&apos;re building.
            </p>
          </div>
          <div className={styles.bandActions}>
            <Cta href={estimateHref} size="large" placement="labs_band_primary">
              Get a 60-second estimate
            </Cta>
            <Cta href={callHref} variant="secondary" size="large" placement="labs_band_secondary">
              Book a 20-min scoping call
            </Cta>
            <TextCta href="/our-work" placement="labs_band_tertiary" className={styles.textLink} cursor="view">
              See the work
            </TextCta>
          </div>
        </div>
      </section>
    </>
  );
}
