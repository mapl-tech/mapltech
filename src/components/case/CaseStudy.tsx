import Image from 'next/image';
import Link from 'next/link';
import type { WorkEntry } from '@/components/work/work-types';
import { estimateLinkFor, scopingCallLinkFor } from '@/components/work/work-data';
import CloseBand from '@/components/flagship/CloseBand';
import { HERO_REASSURE } from '@/components/flagship/content';
import CaseStage from './CaseStage';
import ChapterNav from './ChapterNav';
import SiteScroll from './SiteScroll';
import { FULL_PAGES } from './fullPages';
import type { CaseStory } from './stories';
import styles from './Case.module.scss';

/**
 * The case-study template (Nov 2026, simplified). Written for the next buyer:
 *
 *   hero (the name, the product, the facts) → results → the story in
 *   chapters (situation, what we built, what changed, what they said) and its
 *   sources → the live site, top to bottom → why it matters to you, with the
 *   ask → the next project, as one row. The ask is the last decision; the
 *   next project is only a way on for a reader who is still looking.
 *
 * Every section renders only when its story field exists, so a project with a
 * thin record gets a shorter page, never padding. Every sentence is sourced in
 * stories.ts. "Price a project like this" opens the estimator on the story's
 * own target (stories.ts `estimate`), or on its service line alone; the ask
 * opens the brief with that same service line already chosen.
 */
export default function CaseStudy({
  entry,
  story,
  next,
}: {
  entry: WorkEntry;
  story: CaseStory;
  next?: { entry: WorkEntry; story: CaseStory | undefined };
}) {
  const service = story.estimate?.service ?? entry.service;
  const estimateHref = estimateLinkFor(story.estimate ?? { service });
  const full = FULL_PAGES[entry.slug];
  const live = story.facts.find((fact) => fact.href);
  // "Skip the live site" lands on the first thing after it: the ask, else the next project.
  const afterLive = story.matters ? 'case-matters' : next ? 'case-next' : undefined;
  const nextName = next ? (next.story?.client ?? next.entry.title) : '';
  // A real capture only, never a mockup: a project without one gets a text-only row.
  const nextShot = next?.story?.media?.desktop;

  const chapters = [
    story.situation?.length ? { id: 'situation', label: 'The situation' } : null,
    story.built ? { id: 'built', label: 'What we built' } : null,
    story.impact?.length ? { id: 'impact', label: 'What changed' } : null,
    story.quote ? { id: 'words', label: 'What they said' } : null,
  ].filter((c): c is { id: string; label: string } => c !== null);

  const [lead, ...rest] = story.situation ?? [];

  return (
    <article className={styles.case} aria-labelledby="case-title">
      {/* ---------------------------------------------------------- hero */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            <ol role="list">
              <li>
                <Link href="/our-work">Work</Link>
              </li>
              <li aria-current="page">{story.client}</li>
            </ol>
          </nav>
          <p className={styles.tags}>
            <span className={styles.tagLead}>Case study</span>
            {story.tags.map((tag) => (
              <span key={tag}>
                <span aria-hidden="true"> · </span>
                <span className="visually-hidden">, </span>
                {tag}
              </span>
            ))}
          </p>
          <h1 id="case-title" className={styles.title}>
            {story.client}
          </h1>
          {/* Headline, facts, then the product, at every width. On a phone the
              capture peeks into the first screen under the facts: fully in view it
              becomes the page's LCP image, which Lighthouse's simulated phone
              scores 93 instead of 100 however early it is fetched. */}
          <div className={styles.heroFoot}>
            <p className={styles.headline}>{story.headline}</p>
            <dl className={styles.facts}>
              {story.facts.map((fact) => (
                <div key={fact.term} className={styles.fact}>
                  <dt>{fact.term}</dt>
                  <dd>
                    {fact.href ? (
                      <a href={fact.href} target="_blank" rel="noopener noreferrer">
                        {fact.detail}
                        <span className="visually-hidden"> (opens in a new tab)</span>
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    ) : (
                      fact.detail
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            {story.media ? (
              <CaseStage
                slug={entry.slug}
                url={live?.detail}
                desktop={story.media.desktop}
                mobile={story.media.mobile}
                alt={story.media.alt}
                caption={story.media.caption}
              />
            ) : null}
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- results */}
      {story.results?.length ? (
        <section className={styles.results} aria-labelledby="case-results">
          <div className={styles.shell}>
            <h2 id="case-results" className={styles.sectionLabel}>
              At a glance
            </h2>
            <dl className={styles.resultGrid} data-count={story.results.length}>
              {story.results.map((result) => (
                // Value first, in the DOM as on screen: "~50%, of customers now
                // arrive through ChatGPT" reads right aloud as well.
                <div key={result.label} className={styles.result}>
                  <dt className={styles.resultValue}>{result.value}</dt>
                  <dd className={styles.resultLabel}>{result.label}</dd>
                </div>
              ))}
            </dl>
            <Link href={estimateHref} className={styles.resultsAction} data-cta-placement={`case_${entry.slug}_results`}>
              Price a project like this<span aria-hidden="true"> →</span>
            </Link>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- story */}
      {chapters.length ? (
        <div className={styles.story}>
          <div className={styles.storyGrid}>
            <ChapterNav chapters={chapters} />

            <div className={styles.storyBody}>
              {lead ? (
                <section id="situation" className={styles.chapter} aria-labelledby="case-situation">
                  <h2 id="case-situation" className={styles.chapterTitle}>
                    The situation
                  </h2>
                  <p className={styles.lead}>{lead}</p>
                  {rest.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)} className={styles.prose}>
                      {paragraph}
                    </p>
                  ))}
                </section>
              ) : null}

              {story.built ? (
                <section id="built" className={styles.chapter} aria-labelledby="case-built">
                  <h2 id="case-built" className={styles.chapterTitle}>
                    What we built
                  </h2>
                  {story.built.intro ? <p className={styles.prose}>{story.built.intro}</p> : null}
                  <ul className={styles.build} role="list">
                    {story.built.stages.map((stage) => (
                      <li key={stage.name} className={styles.buildStep}>
                        <h3 className={styles.buildName}>{stage.name}</h3>
                        <p className={styles.buildText}>{stage.text}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {story.impact?.length ? (
                <section id="impact" className={styles.chapter} aria-labelledby="case-impact">
                  <h2 id="case-impact" className={styles.chapterTitle}>
                    What changed
                  </h2>
                  <div className={styles.impactGrid} data-count={story.impact.length}>
                    {story.impact.map((group) => (
                      <div key={group.heading} className={styles.impactGroup}>
                        <h3 className={styles.impactHeading}>{group.heading}</h3>
                        <ul role="list">
                          {group.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              ) : null}

              {story.quote ? (
                <section id="words" className={styles.chapter} aria-labelledby="case-quote">
                  <h2 id="case-quote" className={styles.chapterTitle}>
                    What they said
                  </h2>
                  <figure className={styles.quote}>
                    <blockquote>
                      <p>“{story.quote.text}”</p>
                    </blockquote>
                    <figcaption className={styles.quoteBy}>
                      {story.quote.image ? (
                        <Image src={story.quote.image} alt="" width={56} height={56} className={styles.avatar} />
                      ) : null}
                      <span>
                        <span className={styles.quoteName}>{story.quote.name}</span>
                        <span className={styles.quoteRole}>{story.quote.role}</span>
                      </span>
                    </figcaption>
                  </figure>
                </section>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {story.sources ? (
        <div className={styles.shell}>
          <p className={styles.sources}>Sources: {story.sources}</p>
        </div>
      ) : null}

      {/* ---------------------------------------------------------- the live site */}
      {full ? (
        <SiteScroll client={story.client} url={live?.detail} desktop={full.desktop} mobile={full.mobile} skipTo={afterLive} />
      ) : null}

      {/* ---------------------------------------------------------- matters: the ask, with the brief on this service line */}
      {/* The band's quote line only where the story has no client words of its
          own: a case with a quote has just shown it in "What they said". */}
      {story.matters ? (
        <CloseBand
          id="case-matters"
          title={story.matters.heading}
          lede={story.matters.text}
          href={scopingCallLinkFor(service)}
          secondary={{ label: 'Price a project like this', href: estimateHref }}
          placement={`case_${entry.slug}`}
          note={HERO_REASSURE}
          proof={!story.quote}
          hero
        />
      ) : null}

      {/* ---------------------------------------------------------- next: one row, after the ask */}
      {next ? (
        <div className={styles.nextBand}>
          <div className={styles.shell}>
            <Link
              id="case-next"
              href={next.entry.path}
              className={styles.next}
              data-has-media={nextShot ? '' : undefined}
              aria-label={`Next project: ${nextName}`}
              aria-describedby="case-next-line"
              data-cta-placement={`case_${entry.slug}_next`}
            >
              {nextShot ? (
                <span className={styles.nextMedia} aria-hidden="true">
                  <Image
                    src={nextShot}
                    alt=""
                    width={1800}
                    height={1125}
                    sizes="(min-width: 1024px) 264px, 26vw"
                    className={styles.nextImg}
                  />
                </span>
              ) : null}
              <span className={styles.nextText}>
                <span className={styles.nextLabel}>Next project</span>
                <span className={styles.nextName}>{nextName}</span>
                <span id="case-next-line" className={styles.nextLine}>
                  {next.story?.headline ?? next.entry.description}
                </span>
              </span>
              <span className={styles.nextGo} aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      ) : null}
    </article>
  );
}
