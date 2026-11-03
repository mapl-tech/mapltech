import { ViewTransition, type CSSProperties } from 'react';
import Link from 'next/link';
import { WORK_SECTION } from '@/components/flagship/content';
import QuoteLine from '@/components/flagship/QuoteLine';
import { BrowserFrame, DesktopShot, PhoneFrame } from './Frames';
import PipelineDiagram from './PipelineDiagram';
import { keepTogether } from './keepTogether';
import { proofCases, type LayerView, type ProofCase } from './serviceContent';
import styles from './ProofBlock.module.scss';

/**
 * Proof for one service, staged like the homepage's work cards: the lead case
 * with its real captures (the live site in a browser, its phone view over the
 * corner) and its published results, then one more case study. Two projects
 * at most. Cloud has no screen to show, so its exhibit is how a release runs
 * on infrastructure we set up, beside MAPL Tours' published delivery facts.
 * Every fact is from stories.ts; a case with no published numbers shows what
 * was built instead. The lead case that carries the approved client quote
 * (LRO Staffing) shows it, so the work has its client's voice beside it.
 */
export default function ProofBlock({ view }: { view: LayerView }) {
  const cases = proofCases(view);
  if (!cases.length) return null;
  const [lead, ...more] = cases;

  return (
    <section id="work" className={styles.work} aria-labelledby="work-title">
      <div className={styles.head}>
        <p className={styles.label}>{WORK_SECTION.label}</p>
        <h2 id="work-title" className={styles.title}>
          {WORK_SECTION.title}
        </h2>
        <p className={styles.lede}>{WORK_SECTION.lede}</p>
      </div>

      <div className={styles.body}>
        <LeadCase item={lead} view={view} />

        {more.length ? (
          <div className={styles.more}>
            <h3 className={styles.moreLabel}>More {view.name} work</h3>
            <ul className={styles.moreList} role="list">
              {more.map((item) => (
                <li key={item.slug}>
                  {/* Named "CHHA-NCR case study"; the one-line outcome is the description. */}
                  <Link
                    href={item.href}
                    className={styles.moreLink}
                    aria-labelledby={`more-${item.slug}`}
                    aria-describedby={`more-${item.slug}-line`}
                    data-cta-placement={`${view.slug}_case_${item.slug}`}
                  >
                    <span className={styles.moreKind}>{item.kind}</span>
                    <span id={`more-${item.slug}`} className={styles.moreName}>
                      {item.client}
                      <span className="visually-hidden"> case study</span>
                    </span>
                    <span id={`more-${item.slug}-line`} className={styles.moreLine}>
                      {item.headline}
                    </span>
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
  // What was built shows only when there are no published numbers to show.
  const showStages = item.stages.length > 0 && item.results.length === 0;
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
        {item.clientQuote ? <QuoteLine className={styles.quote} /> : null}
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
