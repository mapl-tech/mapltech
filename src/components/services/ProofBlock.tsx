import { ViewTransition, type CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BrowserFrame, DesktopShot, PhoneFrame } from './Frames';
import PipelineDiagram from './PipelineDiagram';
import { keepTogether } from './keepTogether';
import { CLIENT_QUOTE, proofCases, type LayerView, type ProofCase } from './serviceContent';
import styles from './ProofBlock.module.scss';

/**
 * Proof for one service line, staged like the homepage's work cards: the lead
 * case with its real captures (the live site in a browser, its phone view
 * over the corner), its published results, then the client in her own words
 * where she is the client behind the lead case, then the line's other case
 * studies. Cloud has no screen to show, so its exhibit is the pipeline we set
 * up, beside MAPL Tours' published delivery facts. Every fact is from
 * stories.ts; a case with no published numbers shows what was built instead.
 */
export default function ProofBlock({ view }: { view: LayerView }) {
  const cases = proofCases(view);
  if (!cases.length) return null;
  const [lead, ...more] = cases;

  return (
    <section id="work" className={styles.work} aria-labelledby="work-title">
      <div className={styles.head}>
        <p className={styles.label}>Selected work</p>
        <h2 id="work-title" className={styles.title}>
          Work we can show.
        </h2>
        <p className={styles.lede}>
          Most of what we build ships under our partners’ names. These are the projects that carry ours.
        </p>
      </div>

      <div className={styles.body}>
        <LeadCase item={lead} view={view} />

        {view.quote && CLIENT_QUOTE ? (
          <figure className={styles.quote}>
            <blockquote className={styles.quoteText}>
              <p>“{CLIENT_QUOTE.quote}”</p>
            </blockquote>
            <figcaption className={styles.by}>
              {CLIENT_QUOTE.image ? (
                <Image src={CLIENT_QUOTE.image} alt="" width={56} height={56} className={styles.avatar} />
              ) : null}
              <span>
                <span className={styles.byName}>{CLIENT_QUOTE.name}</span>
                <span className={styles.byRole}>
                  {CLIENT_QUOTE.role}, {CLIENT_QUOTE.company}
                </span>
              </span>
            </figcaption>
          </figure>
        ) : null}

        {more.length ? (
          <div className={styles.more}>
            <h3 className={styles.moreLabel}>More {view.name} work</h3>
            <ul className={styles.moreList} role="list">
              {more.map((item) => (
                <li key={item.slug}>
                  <Link href={item.href} className={styles.moreLink} data-cta-placement={`${view.slug}_case_${item.slug}`}>
                    <span className={styles.moreKind}>
                      {item.kind}
                      <span className="visually-hidden">: </span>
                    </span>
                    <span className={styles.moreName}>
                      {item.client}
                      <span className="visually-hidden">. </span>
                    </span>
                    <span className={styles.moreLine}>{item.headline}</span>
                    <span className={styles.moreGo} aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function LeadCase({ item, view }: { item: ProofCase; view: LayerView }) {
  const diagram = view.exhibit === null;
  // Stages show when there are no published numbers, or when the line narrowed the case to specific facts.
  const showStages = item.stages.length > 0 && (item.results.length === 0 || item.focused);
  // A stage text that opens with its own name would read the name twice; then the list goes without names.
  const named = !item.stages.some((stage) => stage.text.toLowerCase().startsWith(stage.name.toLowerCase()));

  return (
    <article className={styles.card} aria-labelledby={`case-${item.slug}`}>
      <div className={styles.copy}>
        <p className={styles.kind}>{item.kind}</p>
        <h3 id={`case-${item.slug}`} className={styles.client} data-long={item.client.length > 16 ? '' : undefined}>
          {item.client}
        </h3>
        <p className={styles.outcome}>{item.headline}</p>
        {showStages ? (
          <ul className={styles.built} role="list">
            {item.stages.map((stage) => (
              <li key={stage.name}>
                {named ? <strong>{stage.name}. </strong> : null}
                {keepTogether(stage.text)}
              </li>
            ))}
          </ul>
        ) : null}
        {item.focused && item.stack ? (
          <p className={styles.stack}>
            <span className={styles.stackLabel}>Stack</span>
            {item.stack}
          </p>
        ) : null}
        <Link href={item.href} className={styles.read} data-cta-placement={`${view.slug}_case_${item.slug}`}>
          Read the case study<span className="visually-hidden">: {item.client}</span>
          <span aria-hidden="true" className={styles.readArrow}>
            →
          </span>
        </Link>
      </div>

      {diagram ? (
        <div className={styles.diagram}>
          <PipelineDiagram />
        </div>
      ) : item.media ? (
        <div className={styles.media}>
          {/* Same name as the case hero's browser: the capture morphs into it on navigation. */}
          <ViewTransition name={`case-media-${item.slug}`} share="morph" default="none">
            <BrowserFrame url={item.url} className={styles.browser}>
              <DesktopShot src={item.media.desktop} alt={item.media.alt} sizes="(min-width: 1024px) 46vw, 92vw" />
            </BrowserFrame>
          </ViewTransition>
          {item.media.mobile ? (
            <PhoneFrame src={item.media.mobile} sizes="(min-width: 1024px) 12vw, 26vw" className={styles.phone} />
          ) : null}
        </div>
      ) : null}

      {item.results.length ? (
        <dl className={styles.metrics} style={{ '--cols': item.results.length } as CSSProperties}>
          {item.results.map((result) => (
            // Value first, in the DOM as on screen: "~50%, of customers now arrive through ChatGPT".
            <div key={result.label} className={styles.metric}>
              <dt className={styles.value}>{result.value}</dt>
              <dd className={styles.metricLabel}>{result.label}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </article>
  );
}
