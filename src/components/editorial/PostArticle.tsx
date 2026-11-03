import Link from 'next/link';
import type { BlogPost } from '@/data/blog-posts';
import { toISODate } from '@/config/routes';
import { getServiceLine, startingPrice, type ServiceSlug } from '@/lib/schema';
import { SERVICE_META, estimateHref, type EstimateService } from '@/lib/estimate';
import { ESTIMATE_HREF, PRICING_LABEL } from '@/components/layout/chrome';
import CloseBand from '@/components/flagship/CloseBand';
import { categoryService, firstSentence, preparePost, topicSlug } from '@/components/convert/blog-utils';
import ArticleRow from './ArticleRow';
import ArticleToc from './ArticleToc';
import { SERVICE_LIST, topicLabel } from './services';
import TocDisclosure from './TocDisclosure';
import styles from './Post.module.scss';

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
 * third section for one quiet inline ask carrying the service's real public
 * price.
 */

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

/** Public "from" price for a service line (site.ts via schema.ts). */
function fromPrice(service: EstimateService): string | undefined {
  return startingPrice(getServiceLine(SERVICE_META[service].slug as ServiceSlug));
}

export default function PostArticle({ post, related, newer, older }: PostArticleProps) {
  const iso = toISODate(post.date);
  const topic = topicSlug(post.category);
  const topicName = topicLabel(post.category);
  const { before, after, headings } = preparePost(post.content);
  const service = categoryService(post.category);
  const serviceName = service ? SERVICE_META[service].label : null;
  const from = service ? fromPrice(service) : undefined;
  const askHref = service ? estimateHref({ services: [service] }) : ESTIMATE_HREF;
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
              <dl className={styles.facts}>
                <div>
                  <dt>Published</dt>
                  <dd>
                    <time dateTime={iso}>{post.date}</time>
                  </dd>
                </div>
                <div>
                  <dt>Reading time</dt>
                  <dd>{post.readTime} min read</dd>
                </div>
                <div>
                  <dt>Topic</dt>
                  <dd>{topicName}</dd>
                </div>
                <div>
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
                    <Link href={askHref} className={styles.inlineLink} data-cta-placement="blog_post_inline">
                      Price a project like this
                      <span aria-hidden="true" className={styles.arrow}>
                        →
                      </span>
                    </Link>
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
                    <span aria-hidden="true">← </span>Older
                  </span>
                  <span className={styles.adjacentTitle}>{older.title}</span>
                </Link>
              ) : (
                <span />
              )}
              {newer ? (
                <Link href={`/blog/${newer.slug}`} className={`${styles.adjacentLink} ${styles.adjacentNext}`}>
                  <span className={styles.adjacentLabel}>
                    Newer<span aria-hidden="true"> →</span>
                  </span>
                  <span className={styles.adjacentTitle}>{newer.title}</span>
                </Link>
              ) : (
                <Link href="/blog" className={`${styles.adjacentLink} ${styles.adjacentNext}`}>
                  <span className={styles.adjacentLabel}>
                    All articles<span aria-hidden="true"> →</span>
                  </span>
                  <span className={styles.adjacentTitle}>Back to the blog</span>
                </Link>
              )}
            </nav>
          </div>
        </section>
      ) : null}

      {/* ---------------------------------------------------------- the close */}
      <CloseBand
        title={serviceName ? 'Want help putting this into practice?' : 'Have a project in mind?'}
        lede={
          serviceName
            ? `Our ${serviceName} service is delivered under your brand, for agencies and the businesses they serve. Every price is public, and a 20-minute call turns yours into a fixed quote.`
            : `We offer ${SERVICE_LIST} for agencies, under your brand. Every price is public.`
        }
        secondary={{ label: PRICING_LABEL, href: askHref }}
        placement="blog_post_close"
        id="post-close-title"
      />
    </>
  );
}
