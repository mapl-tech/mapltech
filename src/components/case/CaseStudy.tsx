import Image from 'next/image';
import Link from 'next/link';
import type { WorkEntry } from '@/components/work/work-types';
import { estimateLinkFor, startingPriceLabel } from '@/components/work/work-data';
import type { CaseStory } from './stories';
import styles from './Case.module.scss';

/**
 * The case-study template (flagship redesign). Written for the next buyer:
 * outcome → facts → the product on real devices → results → the situation →
 * what we built, in stages → what changed → the client in their words → why it
 * matters to you → your project in the empty slot.
 *
 * Every section renders only when its story field exists, so a project with a
 * thin record gets a shorter page, never padding.
 */
export default function CaseStudy({
  entry,
  story,
  related,
}: {
  entry: WorkEntry;
  story: CaseStory;
  related: readonly { entry: WorkEntry; story: CaseStory | undefined }[];
}) {
  const estimateHref = estimateLinkFor(entry.service);
  const from = startingPriceLabel(entry.service);

  return (
    <article className={styles.case} aria-labelledby="case-title">
      {/* ---------------------------------------------------------- hero */}
      <header className={styles.hero}>
        <div className={styles.inner}>
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            <ol role="list">
              <li>
                <Link href="/our-work">Work</Link>
              </li>
              <li aria-current="page">{story.client}</li>
            </ol>
          </nav>
          <p className={styles.tags}>
            <span>Case study</span>
            {story.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </p>
          <h1 id="case-title" className={styles.title}>
            {story.client}
          </h1>
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
          <p className={styles.heroAction}>
            <Link href={estimateHref} data-cta-placement={`case_${entry.slug}_hero`}>
              Price a build like this<span aria-hidden="true"> →</span>
            </Link>
          </p>
        </div>
      </header>

      {/* ---------------------------------------------------------- devices */}
      {story.media ? (
        <figure className={styles.devices}>
          <div className={styles.devicesInner}>
            <div className={styles.laptop}>
              <div className={styles.laptopScreen}>
                <Image
                  src={story.media.desktop}
                  alt={story.media.alt}
                  width={1800}
                  height={1125}
                  sizes="(min-width: 1280px) 1080px, 92vw"
                  preload
                  className={styles.screen}
                />
              </div>
              <span className={styles.laptopBase} aria-hidden="true" />
            </div>
            {story.media.mobile ? (
              <div className={styles.phone}>
                <Image
                  src={story.media.mobile}
                  alt=""
                  width={780}
                  height={1688}
                  sizes="(min-width: 1024px) 240px, 32vw"
                  className={styles.screen}
                />
              </div>
            ) : null}
            <span className={styles.structure} aria-hidden="true" />
          </div>
          {story.media.caption ? <figcaption className={styles.caption}>{story.media.caption}</figcaption> : null}
        </figure>
      ) : null}

      {/* ---------------------------------------------------------- results */}
      {story.results?.length ? (
        <section className={styles.results} aria-labelledby="case-results">
          <div className={styles.inner}>
            <h2 id="case-results" className={styles.kicker}>
              Key results
            </h2>
            <dl className={styles.resultGrid} data-count={story.results.length}>
              {story.results.map((result) => (
                <div key={result.label} className={styles.result}>
                  <dt className={styles.resultLabel}>{result.label}</dt>
                  <dd className={styles.resultValue}>{result.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- situation */}
      {story.situation?.length ? (
        <section className={styles.split} aria-labelledby="case-situation">
          <div className={styles.inner}>
            <h2 id="case-situation" className={styles.h2}>
              The situation
            </h2>
            <div className={styles.prose}>
              {story.situation.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- built */}
      {story.built ? (
        <section className={styles.split} aria-labelledby="case-built">
          <div className={styles.inner}>
            <div className={styles.splitHead}>
              <h2 id="case-built" className={styles.h2}>
                What we built
              </h2>
              {story.built.intro ? <p className={styles.splitIntro}>{story.built.intro}</p> : null}
            </div>
            <ol className={styles.stages} role="list">
              {story.built.stages.map((stage) => (
                <li key={stage.name} className={styles.stage}>
                  <h3 className={styles.stageName}>{stage.name}</h3>
                  <p className={styles.stageText}>{stage.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- impact */}
      {story.impact?.length ? (
        <section className={styles.impact} aria-labelledby="case-impact">
          <div className={styles.inner}>
            <h2 id="case-impact" className={styles.h2}>
              What it did
            </h2>
            <div className={styles.impactGrid} data-count={story.impact.length}>
              {story.impact.map((group) => (
                <div key={group.heading} className={styles.impactGroup}>
                  <h3 className={styles.kicker}>{group.heading}</h3>
                  <ul role="list">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- quote */}
      {story.quote ? (
        <section className={styles.quote} aria-labelledby="case-quote">
          <div className={styles.inner}>
            <h2 id="case-quote" className="visually-hidden">
              In their words
            </h2>
            <figure className={styles.quoteFigure}>
              <blockquote>
                <p>{story.quote.text}</p>
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
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- matters */}
      {story.matters ? (
        <section className={styles.matters} aria-labelledby="case-matters">
          <div className={styles.mattersInner}>
            <h2 id="case-matters" className={styles.mattersTitle}>
              {story.matters.heading}
            </h2>
            <p className={styles.mattersText}>{story.matters.text}</p>
            <p className={styles.mattersActions}>
              <Link href={estimateHref} className={styles.primary} data-cta-placement={`case_${entry.slug}_estimate`}>
                Price your project
              </Link>
              {from ? <span className={styles.from}>{entry.serviceLabel}: {from.toLowerCase()}</span> : null}
            </p>
          </div>
        </section>
      ) : null}

      {story.sources ? (
        <p className={styles.sources}>
          <span className={styles.inner}>Sources: {story.sources}</span>
        </p>
      ) : null}

      {/* ---------------------------------------------------------- more */}
      <section className={styles.more} aria-labelledby="case-more">
        <div className={styles.inner}>
          <h2 id="case-more" className={styles.h2}>
            More work
          </h2>
          <ul className={styles.moreGrid} role="list">
            {related.map(({ entry: other, story: otherStory }) => (
              <li key={other.slug}>
                <Link href={other.path} className={styles.moreCard}>
                  <span className={styles.moreMedia}>
                    <Image
                      src={otherStory?.media?.desktop ?? other.image}
                      alt=""
                      width={1800}
                      height={1125}
                      sizes="(min-width: 1024px) 30vw, 100vw"
                      className={styles.moreImg}
                    />
                  </span>
                  <span className={styles.moreName}>{otherStory?.client ?? other.title}</span>
                  <span className={styles.moreLine}>{otherStory?.headline ?? other.description}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link href={estimateHref} className={styles.nextCard} data-cta-placement={`case_${entry.slug}_next`}>
                <span className={styles.nextLabel}>Your project, next.</span>
                <span className={styles.nextText}>
                  Price it in 60 seconds from our public list, then we scope it with you on a short call.
                </span>
                <span className={styles.nextCta}>
                  Price your project<span aria-hidden="true"> →</span>
                </span>
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </article>
  );
}
