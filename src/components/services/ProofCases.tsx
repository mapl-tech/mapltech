import Image from 'next/image';
import Link from 'next/link';
import { keepTogether } from './keepTogether';
import { CLIENT_QUOTE, proofCases, type LayerView, type ProofCase } from './serviceContent';
import styles from './ServicePage.module.scss';

/**
 * Proof, straight after the prices (social proof beside the decision): the
 * MAPL TECH case studies for this line, real screenshots of the live sites,
 * the published results, and the client in her own words where she is the
 * client behind the lead case. Every fact comes from stories.ts; a case with
 * no published numbers shows what was built instead, never a guess.
 */
export default function ProofCases({ view }: { view: LayerView }) {
  const cases = proofCases(view);
  if (!cases.length) return null;
  const [lead, ...rest] = cases;

  return (
    <section id="work" className={styles.section} aria-labelledby="work-title">
      <div className={styles.inner}>
        <div className={styles.proofHead}>
          <h2 id="work-title" className={styles.h2}>
            Work we can show.
          </h2>
          <p className={styles.sectionLede}>
            Most of what we build ships under our partners’ names. These projects carry ours.
          </p>
        </div>

        <LeadCase item={lead} slug={view.slug} />

        {view.quote && CLIENT_QUOTE ? (
          <figure className={styles.quote}>
            <blockquote className={styles.quoteText}>
              <p>“{CLIENT_QUOTE.quote}”</p>
            </blockquote>
            <figcaption className={styles.quoteBy}>
              {CLIENT_QUOTE.image ? (
                <Image src={CLIENT_QUOTE.image} alt="" width={48} height={48} className={styles.avatar} />
              ) : null}
              <span>
                <span className={styles.quoteName}>{CLIENT_QUOTE.name}</span>
                <span className={styles.quoteRole}>
                  {CLIENT_QUOTE.role}, {CLIENT_QUOTE.company}
                </span>
              </span>
            </figcaption>
          </figure>
        ) : null}

        {rest.length ? (
          <ul className={styles.moreCases} role="list" data-solo={rest.length === 1 ? '' : undefined}>
            {rest.map((item) => (
              <li key={item.slug}>
                <CaseCard item={item} slug={view.slug} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

function CasePoints({ item, compact = false }: { item: ProofCase; compact?: boolean }) {
  const results = compact ? item.results.slice(0, 2) : item.results;
  // Stages show when there are no published numbers, or when the line narrowed
  // the case to specific facts (cloud: the pipeline and the payment guardrails).
  const showStages = item.stages.length > 0 && (results.length === 0 || item.focused);
  const stages = item.stages.slice(0, 3);
  // A stage text that opens with its own name ("Inventory that stays in sync")
  // would read the name twice; then the list goes without names.
  const named = !stages.some((stage) => stage.text.toLowerCase().startsWith(stage.name.toLowerCase()));
  return (
    <>
      {results.length ? (
        // Value first in the markup too, so it reads as the sentence it is: "~50% of customers…".
        <ul className={styles.results} role="list">
          {results.map((result) => (
            <li key={result.label} className={styles.result}>
              <span className={styles.resultValue}>{result.value}</span>{' '}
              <span className={styles.resultLabel}>{result.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {showStages ? (
        <ul className={styles.built} role="list">
          {stages.map((stage) => (
            <li key={stage.name}>
              {named ? <strong>{stage.name}. </strong> : null}
              {keepTogether(stage.text)}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function LeadCase({ item, slug }: { item: ProofCase; slug: string }) {
  return (
    <article className={styles.leadCase} aria-labelledby={`case-${item.slug}`}>
      {item.media ? (
        <figure className={styles.caseFigure}>
          <div className={styles.caseMedia}>
            <div className={styles.caseFrame}>
              <Image
                src={item.media.src}
                alt={item.media.alt}
                width={1800}
                height={1125}
                sizes="(min-width: 1280px) 700px, (min-width: 1024px) 56vw, 92vw"
                className={styles.caseShot}
              />
            </div>
            <span className={styles.caseStructure} aria-hidden="true" />
          </div>
          {item.media.caption ? <figcaption className={styles.caseCaption}>{item.media.caption}</figcaption> : null}
        </figure>
      ) : null}
      <div>
        <p className={styles.caseKind}>{item.kind}</p>
        <h3 id={`case-${item.slug}`} className={styles.caseClient}>
          {item.client}
        </h3>
        <p className={styles.caseHeadline}>{item.headline}</p>
        <CasePoints item={item} />
        {item.focused && item.stack ? (
          <p className={styles.caseStack}>
            <span>Stack</span>
            {item.stack}
          </p>
        ) : null}
        <Link
          href={item.href}
          className={`${styles.textLink} ${styles.caseLink}`}
          data-cta-placement={`${slug}_case_${item.slug}`}
        >
          Read the {item.client} case study
          <span aria-hidden="true" className={styles.arrow}>
            &nbsp;→
          </span>
        </Link>
      </div>
    </article>
  );
}

function CaseCard({ item, slug }: { item: ProofCase; slug: string }) {
  const plain = !item.media;
  return (
    <article className={styles.caseCard} aria-labelledby={`case-${item.slug}`} data-plain={plain ? '' : undefined}>
      {item.media ? (
        <div className={styles.cardMedia}>
          <Image
            src={item.media.src}
            alt={item.media.alt}
            width={1800}
            height={1125}
            sizes="(min-width: 1024px) 40vw, (min-width: 768px) 46vw, 92vw"
            className={styles.caseShot}
          />
        </div>
      ) : null}
      <div className={styles.cardBody}>
        <div className={styles.cardMain}>
          {plain && item.logo ? (
            <Image src={item.logo.src} alt={item.logo.alt} width={80} height={80} className={styles.cardLogo} />
          ) : null}
          <p className={styles.caseKind}>{item.kind}</p>
          <h3 id={`case-${item.slug}`} className={styles.cardClient}>
            {item.client}
          </h3>
          <p className={styles.cardHeadline}>{item.headline}</p>
          {item.media?.caption ? <p className={styles.caseCaption}>{item.media.caption}</p> : null}
        </div>
        <div className={styles.cardPoints}>
          <CasePoints item={item} compact />
        </div>
        <p className={styles.cardFoot}>
          <Link
            href={item.href}
            className={`${styles.textLink} ${styles.caseLink}`}
            data-cta-placement={`${slug}_case_${item.slug}`}
          >
            Read the {item.client} case study
            <span aria-hidden="true" className={styles.arrow}>
              &nbsp;→
            </span>
          </Link>
        </p>
      </div>
    </article>
  );
}
