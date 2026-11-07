import Image from 'next/image';
import Link from 'next/link';
import { findStory } from '@/components/case/stories';
import { PROOF, TRUST_ITEMS, WORK, WORK_SECTION } from '@/components/flagship/content';
import TrustList from '@/components/flagship/TrustList';
import { PROJECT_LABEL } from '@/components/layout/chrome';
import ResultCards, { type ResultCardItem } from '@/components/proof/ResultCards';
import Arrow from '@/components/ui/Arrow';
import ed from '../Company.module.scss';
import { INQUIRE_HREF, type RegionProof } from '../regions';
import styles from './RegionalProof.module.scss';

/**
 * The funnel's proof step, after the local reasons. Every figure is read
 * from where it is published, never retyped: a local project's results from
 * case/stories.ts (MAPL Tours: "~50%", "~2,000", "Live"), the homepage's
 * counts from flagship/content.ts PROOF, and each case's metric from WORK
 * (only cases listed on /our-work are in WORK, so a hidden case drops out on
 * its own). Where no local project exists (Nigeria) the section shows the
 * site's general proof under a heading that claims no local clients.
 *
 * Nov 7, 2026 (Leshan: "sections like these seem very confusing and may not
 * convert well"): the ledger set each figure apart from its meaning, with the
 * client between ("100 … LRO Staffing", the words two lines later), under a
 * strip of even larger counts, and the section asked for nothing. Now:
 *
 * - the counts are one quiet line in the section's head (the figure at body
 *   scale beside its words), so the results are the only large figures;
 * - each result is a card (proof/ResultCards) that reads figure, its words,
 *   whose it is and what was built, then "Read the case study";
 * - the cases' heading shows only where it separates them from the local
 *   project above (Jamaica: "More travel work"); with nothing above them the
 *   section's own H2 introduces the cards and the heading names the list for
 *   assistive tech;
 * - the section ends on one ask, the homepage's after its work: the question,
 *   "Start a project" and the risk answers. While it is on screen the header's
 *   ask is an outline (data-header-quiet) and the phone bar steps aside
 *   (data-bar-stand-down), so it is the one filled button in view; the price
 *   list after it uses text actions.
 *
 * Server Component, no client JS; the images are the case study's own.
 */
export default function RegionalProof({ proof, prefix }: { proof: RegionProof; prefix: string }) {
  const { feature, cases } = proof;
  const results = feature ? (findStory(feature.slug)?.results ?? []) : [];
  const cards: ResultCardItem[] = (cases?.items ?? []).flatMap((ref) => {
    const card = WORK.find((c) => c.slug === ref.slug);
    const metric = card?.metrics[ref.metric ?? 0] ?? card?.metrics[0];
    return card && metric ? [{ slug: card.slug, href: card.href, client: card.client, built: card.kind, result: metric }] : [];
  });
  const casesTitleId = `${prefix}-cases-title`;

  return (
    <section id="work" className={ed.dark} aria-labelledby="work-title">
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{proof.label}</p>
          <h2 id="work-title" className={ed.title}>
            {proof.title}
          </h2>
          <p className={ed.lede}>{proof.lede}</p>
          {proof.stats ? (
            // The homepage's counts as one line under the head, each figure beside its words
            // ("200+ projects supported"), at a size that leaves the results below as the figures to read.
            <ul className={styles.facts} role="list">
              {PROOF.stats.map((stat) => (
                <li key={stat.label} className={styles.fact}>
                  <span className={styles.factValue}>
                    {stat.value}
                    {stat.suffix}
                  </span>{' '}
                  {stat.label}
                </li>
              ))}
            </ul>
          ) : null}
        </header>

        {feature ? (
          <article className={`${ed.card} ${styles.work}`} aria-labelledby="region-work-client">
            <div className={styles.workCopy}>
              <h3 id="region-work-client" className={styles.workClient}>
                {feature.client}
              </h3>
              <p className={styles.workText}>{feature.text}</p>
              {results.length ? (
                // The labels are written to follow their figure ("~50% of customers now arrive through ChatGPT"),
                // so each result is one line of text, figure first, in reading and in visual order.
                <ul className={styles.results} role="list">
                  {results.map((result) => (
                    <li key={result.label} className={styles.result}>
                      <span className={styles.resultValue}>{result.value}</span> <span className={styles.resultLabel}>{result.label}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <Link href={feature.href} className={ed.action} data-cta-placement={`${prefix}_work`}>
                Read the case study<span className="visually-hidden">: {feature.client}</span>
                <span aria-hidden="true" className={ed.arrow}>
                  <Arrow />
                </span>
              </Link>
            </div>
            <div className={styles.workMedia}>
              <figure className={styles.browser}>
                <div className={styles.chrome} aria-hidden="true">
                  <span className={styles.lights}>
                    <i />
                    <i />
                    <i />
                  </span>
                  <span className={styles.url}>{feature.url}</span>
                </div>
                <Image
                  src={feature.image.src}
                  alt={feature.image.alt}
                  width={feature.image.width}
                  height={feature.image.height}
                  sizes="(min-width: 1024px) 46vw, 92vw"
                  className={styles.shot}
                />
              </figure>
              {feature.mobile ? (
                <div className={styles.phone} aria-hidden="true">
                  <Image src={feature.mobile} alt="" width={780} height={1688} sizes="(min-width: 1024px) 12vw, 26vw" className={styles.phoneShot} />
                </div>
              ) : null}
            </div>
          </article>
        ) : null}

        {cases && cards.length ? (
          <div className={styles.cases} data-after-feature={feature ? '' : undefined}>
            {feature ? (
              <h3 id={casesTitleId} className={styles.casesTitle}>
                {cases.heading}
              </h3>
            ) : null}
            <ResultCards
              items={cards}
              placement={`${prefix}_proof`}
              labelledBy={feature ? casesTitleId : undefined}
              label={feature ? undefined : cases.heading}
              // Under the local project, its figures at the size of the project's own results.
              size={feature ? 'm' : 'l'}
            />
          </div>
        ) : null}

        <div className={styles.ask} data-header-quiet="" data-bar-stand-down="">
          <p className={styles.askTitle}>{WORK_SECTION.ask}</p>
          <div className={styles.askAction}>
            <a href={INQUIRE_HREF} className={ed.primary} data-cta-placement={`${prefix}_proof_ask`}>
              {PROJECT_LABEL}
              <span aria-hidden="true" className={ed.arrow}>
                <Arrow />
              </span>
            </a>
            <TrustList items={TRUST_ITEMS} className={styles.askTrust} />
          </div>
        </div>
      </div>
    </section>
  );
}
