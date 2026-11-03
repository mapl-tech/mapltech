import Link from 'next/link';
import type { BlogPost } from '@/data/blog-posts';
import type { ServiceSlug } from '@/config/services';
import { toISODate } from '@/config/routes';
import { SERVICE_META, estimateHref, formatMoney } from '@/lib/estimate';
import { ESTIMATE_HREF, PROJECT_HREF } from '@/components/layout/chrome';
import CloseBand from '@/components/flagship/CloseBand';
import QuoteLine from '@/components/flagship/QuoteLine';
import { HERO_REASSURE, LOWEST_PRICE, NDA_LINE } from '@/components/flagship/content';
import { layerView, proofCases } from '@/components/services/serviceContent';
import { categoryService, firstSentence, preparePost, topicSlug } from '@/components/convert/blog-utils';
import ArticleRow from './ArticleRow';
import ArticleToc from './ArticleToc';
import { SERVICE_LIST, serviceFrom, topicLabel } from './services';
import TocDisclosure from './TocDisclosure';
import styles from './Post.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * The blog post template (Nov 2026 award pass), reading first:
 *
 *   hero (the trail in the label column; a large title, the post's own
 *   summary, then one row of facts: published, reading time, topic, author)
 *   → the article on a 34em measure (about 70 characters a line at 18-20px)
 *   with a sticky, numbered contents rail and a reading line on wide screens,
 *   a disclosure and a top reading line on phones → the author → "Keep
 *   reading" on paper → the crimson close.
 *
 * The H1 is the LCP everywhere; the stock cover stays in the metadata and on
 * the blog index, out of the reading path. Posts are HTML strings
 * (blog-posts.ts): preparePost() anchors every <h2>, repairs legacy internal
 * links, makes tables scroll inside the measure and splits the body before its
 * third section for one quiet inline ask: the service's real public price, the
 * estimator (a filled button), the service page, and proof beside it (the
 * service's lead case study, or the approved client quote when the post has no
 * service). The ask is the page's hero action for the phone bar
 * (`data-hero-cta`), so mid-read the bar offers this post's estimate rather
 * than a generic brief. The estimator has one label across the ask (inline,
 * bar, close): ESTIMATE_LABEL. The close's primary opens the brief with the
 * post's service already chosen (`?svc=`), the NDA line under it.
 */

/** The estimator's one label across the post's ask, as on the service pages and /pricing. */
const ESTIMATE_LABEL = 'Price your project';

export interface PostArticleProps {
  post: BlogPost;
  related: readonly BlogPost[];
  newer?: BlogPost;
  older?: BlogPost;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "Sep 7, 2026" from a human or ISO date. */
function shortDate(date: string): string {
  const [year, month, day] = toISODate(date).split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export default function PostArticle({ post, related, newer, older }: PostArticleProps) {
  const iso = toISODate(post.date);
  const topic = topicSlug(post.category);
  const topicName = topicLabel(post.category);
  const { before, after, headings } = preparePost(post.content);
  const service = categoryService(post.category);
  const serviceName = service ? SERVICE_META[service].label : null;
  const from = service ? serviceFrom(service) : undefined;
  const askHref = service ? estimateHref({ services: [service] }) : ESTIMATE_HREF;
  // The brief with the post's service filled in (brief.ts readPrefill accepts ?svc=web and friends).
  const briefHref = service ? `${PROJECT_HREF}?svc=${service}` : PROJECT_HREF;
  // The service's lead case study (serviceContent.ts proofCases: listed projects only).
  const lead = service ? proofCases(layerView(SERVICE_META[service].slug as ServiceSlug))[0] : undefined;
  const leadResult = lead?.results[0];
  // The phone bar repeats this ask, its label beside the price it starts from.
  const barContext = `From ${from ?? formatMoney(LOWEST_PRICE)}`;
  const isOrgAuthor = post.author.name.trim().toLowerCase() === 'mapl tech';
  const hasToc = headings.length > 1;

  return (
    <>
      <article className={styles.post} aria-labelledby="post-title">
        {/* ---------------------------------------------------------- hero */}
        <header className={styles.hero}>
          <div className={styles.light} aria-hidden="true" />
          <div className={styles.heroGrid}>
            <nav aria-label="Breadcrumb" className={styles.crumbs}>
              <ol role="list">
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li>
                  <Link href={`/blog?topic=${topic}#archive`}>{topicName}</Link>
                </li>
                {/* The trail matches the BreadcrumbList; the title is the H1 right beside it. */}
                <li aria-current="page" className={styles.crumbCurrent}>
                  {post.title}
                </li>
              </ol>
            </nav>

            <div className={styles.heroMain}>
              <h1 id="post-title" className={styles.title}>
                {post.title}
              </h1>
              <p className={styles.dek}>{post.excerpt}</p>
              {/* Phones: one line of values ("Sep 7, 2026 · 8 min read · By MAPL TECH"); the labels
                  are read, not shown, and the topic is already in the trail above the title. */}
              <dl className={styles.facts}>
                <div>
                  <dt>Published</dt>
                  <dd>
                    <time dateTime={iso}>
                      <span className={styles.dateLong}>{post.date}</span>
                      <span className={styles.dateShort} aria-hidden="true">
                        {shortDate(post.date)}
                      </span>
                    </time>
                  </dd>
                </div>
                <div>
                  <dt>Reading time</dt>
                  <dd>{post.readTime} min read</dd>
                </div>
                <div className={styles.factTopic}>
                  <dt>Topic</dt>
                  <dd>{topicName}</dd>
                </div>
                <div className={styles.factAuthor}>
                  <dt>Written by</dt>
                  <dd>
                    <a href="#author">{post.author.name}</a>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------- body */}
        <div className={styles.bodyGrid}>
          <div className={styles.rail}>{hasToc ? <ArticleToc items={headings} bodyId="post-body" /> : null}</div>

          <div className={styles.main}>
            {hasToc ? <TocDisclosure items={headings} /> : null}

            <div id="post-body" className={styles.content}>
              <div className={styles.prose} dangerouslySetInnerHTML={{ __html: before }} />
              {after ? (
                <>
                  <aside className={styles.inline} aria-labelledby="inline-ask">
                    <p id="inline-ask" className={styles.inlineTitle}>
                      {serviceName ? 'Building this for a client?' : 'Planning a project?'}
                    </p>
                    <p className={styles.inlineText}>
                      {serviceName && from
                        ? `Our ${serviceName} service is delivered under your brand, from ${from}. The estimator shows your price before we ask for anything.`
                        : 'Our prices are public. The estimator shows your price before we ask for anything.'}
                    </p>
                    <div className={styles.inlineActions}>
                      <Link
                        href={askHref}
                        className={styles.inlineButton}
                        data-cta-placement="blog_post_inline"
                        data-hero-cta="below"
                        data-bar-context={barContext}
                      >
                        {ESTIMATE_LABEL}
                        <span aria-hidden="true" className={styles.arrow}>
                          <Arrow />
                        </span>
                      </Link>
                      {service && serviceName ? (
                        <Link
                          href={SERVICE_META[service].path}
                          className={styles.inlineService}
                          data-cta-placement="blog_post_inline_service"
                        >
                          How our {serviceName} service works
                        </Link>
                      ) : (
                        <Link href="/services" className={styles.inlineService} data-cta-placement="blog_post_inline_service">
                          What we build for agencies
                        </Link>
                      )}
                    </div>
                    {/* Proof beside the ask: the service's lead case, else the approved quote. */}
                    {lead ? (
                      <p className={styles.inlineProof}>
                        {leadResult ? (
                          <>
                            <strong className={styles.proofValue}>{leadResult.value}</strong> {leadResult.label}.{' '}
                          </>
                        ) : (
                          <>{lead.headline} </>
                        )}
                        <Link href={lead.href} className={styles.proofLink} data-cta-placement="blog_post_inline_case">
                          {lead.client} case study
                        </Link>
                      </p>
                    ) : (
                      <QuoteLine className={styles.inlineQuote} />
                    )}
                  </aside>
                  <div className={styles.prose} dangerouslySetInnerHTML={{ __html: after }} />
                </>
              ) : null}
            </div>

            {/* ---------------------------------------------------------- author */}
            <aside id="author" className={styles.author} aria-labelledby="author-name">
              <span className={styles.authorMark} aria-hidden="true">
                MT
              </span>
              <div>
                <p className={styles.authorLabel}>Written by</p>
                <p id="author-name" className={styles.authorName}>
                  {post.author.name}
                </p>
                <p className={styles.authorBio}>
                  {isOrgAuthor
                    ? `Engineers who build for digital agencies, under the agency’s brand: ${SERVICE_LIST}. Offices in Toronto, Lagos and Kingston.`
                    : post.author.role}
                </p>
                <p className={styles.authorLinks}>
                  <Link href="/about-us">About MAPL TECH</Link>
                  <Link href="/our-work">Work we can show</Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </article>

      {/* ---------------------------------------------------------- keep reading (paper) */}
      {related.length ? (
        <section className={styles.more} aria-labelledby="related-title">
          <div className={styles.moreInner}>
            <header className={styles.moreHead}>
              <p className={styles.moreLabel}>Related articles</p>
              <h2 id="related-title" className={styles.moreTitle}>
                Keep reading
              </h2>
            </header>

            <ul className={styles.moreList} role="list">
              {related.map((entry) => (
                <li key={entry.slug}>
                  <ArticleRow
                    href={`/blog/${entry.slug}`}
                    title={entry.title}
                    excerpt={firstSentence(entry.excerpt)}
                    category={topicLabel(entry.category)}
                    dateISO={toISODate(entry.date)}
                    dateLabel={shortDate(entry.date)}
                    readTime={entry.readTime}
                    headingId={`related-${entry.slug}`}
                  />
                </li>
              ))}
            </ul>

            <nav className={styles.adjacent} aria-label="Older and newer articles">
              {older ? (
                <Link href={`/blog/${older.slug}`} className={styles.adjacentLink}>
                  <span className={styles.adjacentLabel}>
                    <Arrow direction="left" /> Older
                  </span>
                  <span className={styles.adjacentTitle}>{older.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {newer ? (
                <Link href={`/blog/${newer.slug}`} className={`${styles.adjacentLink} ${styles.adjacentNext}`}>
                  <span className={styles.adjacentLabel}>
                    Newer <Arrow />
                  </span>
                  <span className={styles.adjacentTitle}>{newer.title}</span>
                </Link>
              ) : (
                <Link href="/blog" className={`${styles.adjacentLink} ${styles.adjacentNext}`}>
                  <span className={styles.adjacentLabel}>
                    All articles <Arrow />
                  </span>
                  <span className={styles.adjacentTitle}>Back to the blog</span>
                </Link>
              )}
            </nav>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- the close */}
      {/* The lede's "20-minute" uses a no-break hyphen (U+2011), so "20-" never ends a line. */}
      <CloseBand
        title={serviceName ? 'Want help putting this into practice?' : 'Have a project in mind?'}
        lede={
          serviceName
            ? `Our ${serviceName} service is delivered under your brand, for agencies and the businesses they serve. Every price is public, and a 20\u2011minute call turns yours into a fixed quote.`
            : `We offer ${SERVICE_LIST} for agencies, under your brand. Every price is public.`
        }
        href={briefHref}
        note={serviceName ? NDA_LINE : HERO_REASSURE}
        secondary={{ label: ESTIMATE_LABEL, href: askHref }}
        placement="blog_post_close"
        id="post-close-title"
      />
    </>
  );
}
