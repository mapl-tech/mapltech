import Image from 'next/image';
import Link from 'next/link';
import type { WorkEntry } from '@/components/work/work-types';
import { estimateLinkFor } from '@/components/work/work-data';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import ScrollLit from '@/components/ui/ScrollLit';
import CaseStage from './CaseStage';
import ChapterNav from './ChapterNav';
import PhoneRow from './PhoneRow';
import SiteScroll from './SiteScroll';
import { FULL_PAGES } from './fullPages';
import type { CaseStory } from './stories';
import styles from './Case.module.scss';

/**
 * The case-study template (Nov 2026 award pass). Written for the next buyer
 * and staged like a film:
 *
 *   hero (the name, the facts, the product rising into view) → results →
 *   the story in chapters (situation, what we built, what changed, in their
 *   words) → the live site scrolling top to bottom → every screen → why it
 *   matters to you → the next project.
 *
 * Every section renders only when its story field exists, so a project with a
 * thin record gets a shorter page, never padding. Every sentence is sourced in
 * stories.ts.
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
  const estimateHref = estimateLinkFor(entry.service);
  const full = FULL_PAGES[entry.slug];
  const live = story.facts.find((fact) => fact.href);

  const chapters = [
    story.situation?.length ? { id: 'situation', label: 'The situation' } : null,
    story.built ? { id: 'built', label: 'What we built' } : null,
    story.impact?.length ? { id: 'impact', label: 'What changed' } : null,
    story.quote ? { id: 'words', label: 'In their words' } : null,
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
              <span key={tag}>{tag}</span>
            ))}
          </p>
          <h1 id="case-title" className={styles.title}>
            {story.client}
          </h1>
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
          </div>
        </div>

        {story.media ? (
          <CaseStage
            slug={entry.slug}
            url={live?.detail}
            desktop={story.media.desktop}
            mobile={story.media.mobile}
            alt={story.media.alt}
          />
        ) : null}
      </header>

      {/* ---------------------------------------------------------- results */}
      {story.results?.length ? (
        <section className={styles.results} aria-labelledby="case-results">
          <div className={styles.shell}>
            <h2 id="case-results" className={styles.sectionLabel}>
              Key results
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
                    <span className={styles.chapterNo} aria-hidden="true">
                      01
                    </span>
                    The situation
                  </h2>
                  <ScrollLit as="p" runs={[{ text: lead }]} className={styles.lead} />
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
                    <span className={styles.chapterNo} aria-hidden="true">
                      {String(chapters.findIndex((c) => c.id === 'built') + 1).padStart(2, '0')}
                    </span>
                    What we built
                  </h2>
                  {story.built.intro ? <p className={styles.prose}>{story.built.intro}</p> : null}
                  <ol className={styles.build} role="list">
                    {story.built.stages.map((stage, i) => (
                      <li key={stage.name} className={styles.buildStep}>
                        <span className={styles.buildNo} aria-hidden="true">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <div>
                          <h3 className={styles.buildName}>{stage.name}</h3>
                          <p className={styles.buildText}>{stage.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              ) : null}

              {story.impact?.length ? (
                <section id="impact" className={styles.chapter} aria-labelledby="case-impact">
                  <h2 id="case-impact" className={styles.chapterTitle}>
                    <span className={styles.chapterNo} aria-hidden="true">
                      {String(chapters.findIndex((c) => c.id === 'impact') + 1).padStart(2, '0')}
                    </span>
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
                    <span className={styles.chapterNo} aria-hidden="true">
                      {String(chapters.findIndex((c) => c.id === 'words') + 1).padStart(2, '0')}
                    </span>
                    In their words
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

      {/* ---------------------------------------------------------- the live site */}
      {full ? <SiteScroll client={story.client} url={live?.detail} desktop={full.desktop} mobile={full.mobile} /> : null}

      {/* ---------------------------------------------------------- every screen */}
      {full ? <PhoneRow client={story.client} mobile={full.mobile} /> : null}

      {/* ---------------------------------------------------------- matters */}
      {story.matters ? (
        <section className={styles.matters} aria-labelledby="case-matters" data-page-close="">
          <div className={styles.mattersInner}>
            <h2 id="case-matters" className={styles.mattersTitle}>
              {story.matters.heading}
            </h2>
            <p className={styles.mattersText}>{story.matters.text}</p>
            <div className={styles.mattersActions}>
              <Link href={PROJECT_HREF} className={styles.mattersPrimary} data-cta-placement={`case_${entry.slug}_project`} data-hero-cta="">
                {PROJECT_LABEL}
                <span aria-hidden="true"> →</span>
              </Link>
              <Link href={estimateHref} className={styles.mattersSecondary} data-cta-placement={`case_${entry.slug}_estimate`}>
                Price a build like this
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {story.sources ? (
        <p className={styles.sources}>
          <span className={styles.shell}>Sources: {story.sources}</span>
        </p>
      ) : null}

      {/* ---------------------------------------------------------- next */}
      {next ? (
        <Link href={next.entry.path} className={styles.next} data-cta-placement={`case_${entry.slug}_next`}>
          <span className={styles.nextMedia} aria-hidden="true">
            <Image
              src={next.story?.media?.desktop ?? next.entry.image}
              alt=""
              width={1800}
              height={1125}
              sizes="100vw"
              className={styles.nextImg}
            />
          </span>
          <span className={styles.nextInner}>
            <span className={styles.nextLabel}>Next project</span>
            <span className={styles.nextName}>{next.story?.client ?? next.entry.title}</span>
            <span className={styles.nextLine}>{next.story?.headline ?? next.entry.description}</span>
            <span className={styles.nextGo} aria-hidden="true">
              →
            </span>
          </span>
        </Link>
      ) : null}
    </article>
  );
}
