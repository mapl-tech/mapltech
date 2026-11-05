import Image from 'next/image';
import Link from 'next/link';
import { findStory } from '@/components/case/stories';
import { PROOF, WORK } from '@/components/flagship/content';
import Arrow from '@/components/ui/Arrow';
import ed from '../Company.module.scss';
import type { RegionProof } from '../regions';
import styles from './RegionalProof.module.scss';

/**
 * The funnel's proof step, after the local reasons. Every figure is read
 * from where it is published, never retyped: a local project's results from
 * case/stories.ts (MAPL Tours: "~50%", "~2,000", "Live"), the homepage's
 * counts from flagship/content.ts PROOF, and each case's metric from WORK
 * (only cases listed on /our-work are in WORK, so a hidden case drops out on
 * its own). Where no local project exists (Nigeria) the section shows the
 * site's general proof under a heading that claims no local clients.
 * Server Component, no client JS; the images are the case study's own.
 */
export default function RegionalProof({ proof, prefix }: { proof: RegionProof; prefix: string }) {
  const { feature, cases } = proof;
  const results = feature ? (findStory(feature.slug)?.results ?? []) : [];
  const rows = (cases?.items ?? []).flatMap((ref) => {
    const card = WORK.find((c) => c.slug === ref.slug);
    const metric = card?.metrics[ref.metric ?? 0] ?? card?.metrics[0];
    return card && metric ? [{ card, metric }] : [];
  });

  return (
    <section id="work" className={ed.dark} aria-labelledby="work-title">
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{proof.label}</p>
          <h2 id="work-title" className={ed.title}>
            {proof.title}
          </h2>
          <p className={ed.lede}>{proof.lede}</p>
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

        {proof.stats ? (
          // Figure first, then its words ("200+ projects supported"), in reading and in visual order.
          <ul className={styles.stats} role="list">
            {PROOF.stats.map((stat) => (
              <li key={stat.label} className={styles.stat}>
                <span className={styles.statValue}>
                  {stat.value}
                  {stat.suffix}
                </span>{' '}
                <span className={styles.statLabel}>{stat.label}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {cases && rows.length ? (
          <div className={styles.cases} data-after-feature={feature ? '' : undefined}>
            <h3 className={styles.casesTitle}>{cases.heading}</h3>
            <ul className={styles.ledger} role="list">
              {rows.map(({ card, metric }) => (
                <li key={card.slug} className={styles.entry}>
                  <span className={styles.entryValue} aria-hidden="true">
                    {metric.value}
                  </span>
                  <div className={styles.entryCopy}>
                    {/* The link covers the row. The figure is set large for the eye and read once, at the head of its label. */}
                    <Link href={card.href} className={styles.entryLink} data-cta-placement={`${prefix}_proof_${card.slug}`}>
                      <span className={styles.entryClient}>{card.client}</span>
                      <span className="visually-hidden"> case study</span>
                    </Link>
                    <p className={styles.entryKind}>{card.kind}</p>
                    <p className={styles.entryMetric}>
                      <span className="visually-hidden">{metric.value} </span>
                      {metric.label}
                    </p>
                  </div>
                  <span className={styles.entryGo} aria-hidden="true">
                    <Arrow />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
