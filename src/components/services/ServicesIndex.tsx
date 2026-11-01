import Image from 'next/image';
import Link from 'next/link';
import Cta from '@/components/home/Cta';
import { ESTIMATE_HREF } from '@/components/layout/chrome';
import LayerStack from './LayerStack';
import JobPicker from './JobPicker';
import PipelineDiagram from './PipelineDiagram';
import { keepTogether } from './keepTogether';
import {
  CLIENT_LOGOS,
  CLIENT_QUOTE,
  ENGAGEMENT,
  LAYER_VIEWS,
  PRICE_SUMMARY,
  cleanCopy,
  jobViews,
  tierTimelines,
  type LayerView,
} from './serviceContent';
import shared from './ServicePage.module.scss';
import styles from './ServicesIndex.module.scss';

/**
 * /services, flagship redesign: the four service lines as the four layers of
 * one build, from what customers see to what it all runs on.
 *
 *   hero (answer first: every line and its public "from" price, the layer
 *   stack as an index) → the four layers on one red request path (what it
 *   is, who it is for, from price, what the entry tier includes, the work)
 *   → start from the job (the one interaction) → how we work with agencies
 *   → your build, next.
 *
 * Server Component; the job picker is the only client island.
 */
export default function ServicesIndex() {
  return (
    <div className={shared.page}>
      <Hero />
      <Layers />
      <Engagement />
      <Jobs />
      <Close />
    </div>
  );
}

function Hero() {
  const lede = `${PRICE_SUMMARY}. One senior team engineers every layer, shipped under your brand.`;
  return (
    <section className={styles.hero} aria-labelledby="services-title">
      <div className={styles.heroInner}>
        <div>
          <p className={styles.eyebrow}>Services for agencies</p>
          <h1 id="services-title" className={styles.title}>
            Four layers. <span className={styles.titleLine}>One team.</span>
          </h1>
          <p className={styles.lede}>{lede}</p>
          <div className={shared.actions}>
            <Cta placement="services_hero_primary" hero href={ESTIMATE_HREF} size="large">
              Price your project
            </Cta>
            <Link href="/contact-us" className={shared.secondary} data-cta-placement="services_hero_secondary">
              Book a call
              <span aria-hidden="true" className={shared.arrow}>
                →
              </span>
            </Link>
          </div>
          <p className={shared.trust}>
            Every price on this page is public. Quotes are fixed after a{' '}
            <span className={shared.nowrap}>20-minute</span> call.
          </p>
          {CLIENT_LOGOS.length ? (
            <div className={styles.clients}>
              <p className={styles.clientsLabel}>Shipped for</p>
              <ul className={styles.logos} role="list">
                {CLIENT_LOGOS.map((logo) => (
                  <li key={logo.name}>
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={logo.width}
                      height={logo.height}
                      className={logo.invert ? styles.logoInvert : styles.logoMono}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        <LayerStack linkTo="anchor" label="The four layers of a build" className={styles.heroStack} />
      </div>
    </section>
  );
}

function Layers() {
  return (
    <section className={styles.layers} aria-labelledby="layers-title">
      <div className={styles.layersInner}>
        <div className={styles.layersHead}>
          <h2 id="layers-title" className={shared.h2}>
            Top to bottom, one build.
          </h2>
          <p className={styles.layersLede}>
            From what your client’s customers see down to what it all runs on. Each layer has its own page with every
            tier, the process and the work.
          </p>
        </div>
        <ol className={styles.bands} role="list">
          {LAYER_VIEWS.map((layer) => (
            <Band key={layer.slug} layer={layer} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Band({ layer }: { layer: LayerView }) {
  const timeline = tierTimelines(layer.record).get(layer.entryTier.name);
  const includes = layer.entryTier.features
    .filter((f) => !/^everything in /i.test(f))
    .slice(0, 3)
    .map(cleanCopy);
  const nameId = `layer-${layer.service}-name`;
  return (
    <li id={`layer-${layer.service}`} className={styles.band}>
      <article className={styles.bandGrid} aria-labelledby={nameId}>
        <div>
          <p className={styles.role}>{layer.role}</p>
          <h3 id={nameId} className={styles.bandName}>
            {layer.name}
          </h3>
          <p className={styles.bandSummary}>{layer.summary}</p>
          <p className={styles.bandFrom}>
            <span className={styles.fromLabel}>From</span>
            <span className={styles.fromValue}>{layer.fromMoney}</span>
            <span className={styles.fromNote}>
              {keepTogether(
                timeline
                  ? `for ${layer.entryTier.name}, typically ${timeline.min}–${timeline.max} weeks.`
                  : `for ${layer.entryTier.name}, the entry tier.`,
              )}
            </span>
          </p>
          <dl className={styles.bandFacts}>
            <div>
              <dt>Who it’s for</dt>
              <dd>{layer.who}</dd>
            </div>
            <div>
              <dt>{layer.entryTier.name} includes</dt>
              <dd>
                <ul className={styles.included} role="list">
                  {includes.map((item) => (
                    <li key={item}>{keepTogether(item)}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
          <Link
            href={layer.path}
            className={`${shared.textLink} ${styles.bandMore}`}
            data-cta-placement={`services_band_${layer.service}`}
          >
            {layer.name}: every tier, the process and the work
            <span aria-hidden="true" className={shared.arrow}>
              &nbsp;→
            </span>
          </Link>
        </div>
        <figure className={styles.bandMedia}>
          <div className={styles.mediaBox}>
            <div className={styles.frame}>
              {layer.exhibit ? (
                <Image
                  src={layer.exhibit.src}
                  alt={layer.exhibit.alt}
                  width={1800}
                  height={1125}
                  sizes="(min-width: 1280px) 680px, (min-width: 1024px) 54vw, 92vw"
                  className={styles.shot}
                />
              ) : (
                <PipelineDiagram className={styles.diagram} />
              )}
            </div>
            <span className={styles.structure} aria-hidden="true" />
          </div>
          <figcaption className={styles.caption}>
            {layer.exhibit?.caption ?? 'A diagram, not a screenshot: how a change ships on infrastructure we set up.'}
          </figcaption>
        </figure>
      </article>
    </li>
  );
}

function Jobs() {
  const jobs = jobViews();
  return (
    <section id="start" className={styles.jobs} aria-labelledby="jobs-title">
      <div className={styles.jobsInner}>
        <JobPicker
          jobs={jobs}
          groups={LAYER_VIEWS.map((layer) => ({
            service: layer.service,
            name: layer.name,
          }))}
          head={
            <>
              <h2 id="jobs-title" className={shared.h2}>
                Start from the job.
              </h2>
              <p className={styles.jobsLede}>
                Pick the closest match. You get the layer, the tier and its public price, and the estimator opens with
                that layer and tier already selected.
              </p>
            </>
          }
        />
      </div>
    </section>
  );
}

function Engagement() {
  return (
    <section className={styles.engage} aria-labelledby="engage-title">
      <div className={styles.engageInner}>
        <div className={styles.engageHead}>
          <h2 id="engage-title" className={shared.h2}>
            How we work with agencies.
          </h2>
          <p className={styles.engageLede}>The same terms on every layer, stated before you ask.</p>
          {CLIENT_QUOTE ? (
            <figure className={styles.quoteWrap}>
              <span className={styles.quoteStructure} aria-hidden="true" />
              <div className={styles.quoteCard}>
                <blockquote className={styles.quoteText}>
                  <p>“{CLIENT_QUOTE.quote}”</p>
                </blockquote>
                <figcaption className={shared.quoteBy}>
                  {CLIENT_QUOTE.image ? (
                    <Image src={CLIENT_QUOTE.image} alt="" width={48} height={48} className={shared.avatar} />
                  ) : null}
                  <span>
                    <span className={shared.quoteName}>{CLIENT_QUOTE.name}</span>
                    <span className={shared.quoteRole}>
                      {CLIENT_QUOTE.role}, {CLIENT_QUOTE.company}
                    </span>
                  </span>
                </figcaption>
              </div>
            </figure>
          ) : null}
        </div>
        <ul className={styles.terms} role="list">
          {ENGAGEMENT.map((term) => (
            <li key={term.title} className={styles.term}>
              <h3 className={styles.termTitle}>{term.title}</h3>
              <p className={styles.termText}>{keepTogether(term.text)}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Close() {
  return (
    <section className={shared.close} aria-labelledby="index-close-title" data-page-close>
      <div className={shared.inner}>
        <div className={shared.slot}>
          <div>
            <h2 id="index-close-title" className={shared.closeTitle}>
              Your build, next.
            </h2>
            <p className={shared.closeText}>
              Price it from the public list, with every layer you need. Then we scope it with you on a{' '}
              <span className={shared.nowrap}>20-minute</span> call and the quote is fixed.
            </p>
            <div className={shared.actions}>
              <Cta placement="services_close_primary" href={ESTIMATE_HREF} size="large">
                Price your project
              </Cta>
              <Link href="/contact-us" className={shared.secondary} data-cta-placement="services_close_secondary">
                Book a call
                <span aria-hidden="true" className={shared.arrow}>
                  →
                </span>
              </Link>
            </div>
          </div>
          <dl className={shared.closeFacts}>
            {LAYER_VIEWS.map((layer) => (
              <div key={layer.slug}>
                <dt>{layer.name}</dt>
                <dd>{layer.fromLabel}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
