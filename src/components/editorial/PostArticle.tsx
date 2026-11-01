import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@/data/blog-posts';
import { toISODate } from '@/config/routes';
import { testimonials } from '@/config/site';
import { getServiceLine, startingPrice, type ServiceSlug } from '@/lib/schema';
import { SERVICE_META, estimateHref, tiersFor, type EstimateService } from '@/lib/estimate';
import { CALL_HREF, CALL_LABEL, ESTIMATE_HREF, ESTIMATE_LABEL } from '@/components/layout/chrome';
import { categoryService, firstSentence, preparePost, topicSlug } from '@/components/convert/blog-utils';
import ArticleToc from './ArticleToc';
import { SERVICE_LIST } from './services';
import TocDisclosure from './TocDisclosure';
import styles from './Post.module.scss';

/**
 * The blog post template (flagship redesign): the site's best reading
 * experience. Text first: the answer paragraph starts inside the first
 * viewport and the H1 is the LCP everywhere (the cover is a small framed
 * thumbnail in the wide-screen rail, out of the reading path); a 608px measure
 * (about 66 characters) at 19px with 1.75 leading; Overpass headings inside the
 * body; a sticky contents rail with a reading line on wide screens and a
 * disclosure plus a top reading bar on phones; one inline and one closing
 * "Price your project" ask, both tied to the service the post is about and
 * carrying its real public prices; the author; related reading.
 *
 * Posts are HTML strings (blog-posts.ts). preparePost() anchors every <h2>,
 * repairs legacy internal links, makes tables scroll inside the measure and
 * splits the body before its third section for the inline ask.
 */

export interface PostArticleProps {
  post: BlogPost;
  related: readonly BlogPost[];
  newer?: BlogPost;
  older?: BlogPost;
}

/** Public "from" prices, per service line (site.ts via schema.ts). */
function fromPrice(service: EstimateService): string | undefined {
  return startingPrice(getServiceLine(SERVICE_META[service].slug as ServiceSlug));
}

/** "$3,500-$5,000" reads as a range: en dash, no spaces. */
function priceLabel(service: EstimateService, price: string): string {
  if (price === 'Custom') return 'Custom quote';
  const label = price.replace(/-/g, '–');
  return service === 'web' ? `From ${label}` : label;
}


export default function PostArticle({ post, related, newer, older }: PostArticleProps) {
  const iso = toISODate(post.date);
  const topic = topicSlug(post.category);
  const { before, after, headings } = preparePost(post.content);
  const service = categoryService(post.category);
  const meta = service ? SERVICE_META[service] : null;
  const serviceName = meta ? meta.label : null;
  const from = service ? fromPrice(service) : undefined;
  const askHref = service ? estimateHref({ services: [service] }) : ESTIMATE_HREF;
  const isOrgAuthor = post.author.name.trim().toLowerCase() === 'mapl tech';
  const [lead, ...rest] = related;
  // The one approved client quote, beside the closing ask (site.ts testimonials).
  const proof = testimonials.find((entry) => entry.company === 'LRO Staffing');

  return (
    <article className={styles.post} aria-labelledby="post-title">
      {/* ---------------------------------------------------------- hero */}
      <header className={styles.hero}>
        <div className={styles.grid}>
          <div className={styles.heroRail}>
            <nav aria-label="Breadcrumb" className={styles.crumbs}>
              <ol role="list">
                <li>
                  <Link href="/blog">Blog</Link>
                </li>
                <li>
                  <Link href={`/blog?topic=${topic}#archive`}>{post.category}</Link>
                </li>
                <li aria-current="page" className={styles.crumbCurrent}>
                  {post.title}
                </li>
              </ol>
            </nav>
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
            </dl>
            {/* Out of the reading path: a framed thumbnail in the rail on wide screens only. */}
            <figure className={styles.cover}>
              <span className={styles.coverFrame}>
                <Image
                  src={post.coverImage}
                  alt={post.coverImageAlt}
                  fill
                  sizes="220px"
                  className={styles.coverImage}
                />
              </span>
              <span className={styles.structure} aria-hidden="true" />
            </figure>
          </div>

          <div className={styles.heroMain}>
            <h1 id="post-title" className={styles.title}>
              {post.title}
            </h1>
            <p className={styles.dek}>{post.excerpt}</p>
            <p className={styles.byline}>
              <span className={styles.mark} aria-hidden="true">
                MT
              </span>
              <span>
                By{' '}
                <a href="#author" className={styles.bylineLink}>
                  {post.author.name}
                </a>
              </span>
            </p>
          </div>

        </div>
      </header>

      {/* ---------------------------------------------------------- body */}
      <div className={`${styles.grid} ${styles.body}`}>
        <div className={styles.bodyRail}>
          {headings.length > 1 ? <ArticleToc items={headings} bodyId="post-body" /> : null}
        </div>

        <div className={styles.bodyMain}>
          {headings.length > 1 ? <TocDisclosure items={headings} /> : null}

          <div id="post-body" className={styles.content}>
            <div className={styles.prose} dangerouslySetInnerHTML={{ __html: before }} />
            {after ? (
              <>
                <aside className={styles.inline} aria-labelledby="inline-ask">
                  <p id="inline-ask" className={styles.inlineKicker}>
                    {meta ? 'Building this for a client?' : 'Planning a build?'}
                  </p>
                  <p className={styles.inlineText}>
                    {serviceName && from
                      ? `Our ${serviceName} work ships under your brand, from ${from}. The estimator shows your number before we ask for anything.`
                      : 'Our prices are public. The estimator shows your number before we ask for anything.'}
                  </p>
                  <Link href={askHref} className={styles.inlineLink} data-cta-placement="blog_post_inline">
                    {ESTIMATE_LABEL}
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
                  ? `A white-label engineering team for digital agencies: ${SERVICE_LIST}, from offices in Toronto, Lagos and Kingston.`
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

      {/* ---------------------------------------------------------- closing ask */}
      <section className={styles.end} aria-labelledby="end-title">
        <div className={styles.grid}>
          <div className={styles.endCard}>
            <div className={styles.endCopy}>
              <h2 id="end-title" className={styles.endTitle}>
                {meta ? 'Put it into practice.' : 'Have a build in mind?'}
              </h2>
              <p className={styles.endText}>
                {serviceName
                  ? `Our ${serviceName} work ships under your brand, for agencies and the businesses they serve. Every price is public; a 20-minute scoping call turns yours into a fixed quote.`
                  : `${SERVICE_LIST}, for agencies and shipped under your brand. Every price is public.`}
              </p>
              <p className={styles.endActions}>
                <Link href={askHref} className={styles.primary} data-cta-placement="blog_post_end_estimate">
                  {ESTIMATE_LABEL}
                </Link>
                <Link href={CALL_HREF} className={styles.textLink} data-cta-placement="blog_post_end_call">
                  {CALL_LABEL}
                </Link>
              </p>
              {proof ? (
                <figure className={styles.endProof}>
                  <blockquote>
                    <p>{proof.quote}</p>
                  </blockquote>
                  <figcaption>
                    {proof.name}, {proof.role}, {proof.company}
                  </figcaption>
                </figure>
              ) : null}
            </div>

            <div className={styles.endPrices}>
              <p className={styles.endPricesLabel}>{meta ? `${meta.label}, public prices` : 'Public prices'}</p>
              <dl className={styles.priceList}>
                {service
                  ? tiersFor(service).map((tier) => (
                      <div key={tier.name}>
                        <dt>{tier.name}</dt>
                        <dd>{priceLabel(service, tier.price)}</dd>
                      </div>
                    ))
                  : (['web', 'automation', 'tools', 'cloud'] as const).map((svc) => (
                      <div key={svc}>
                        <dt>{SERVICE_META[svc].label}</dt>
                        <dd>From {fromPrice(svc)}</dd>
                      </div>
                    ))}
              </dl>
              {meta ? (
                <Link href={meta.path} className={styles.endMore}>
                  More about {serviceName}
                  <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <Link href="/pricing" className={styles.endMore}>
                  See the full price list
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- related */}
      {lead ? (
        <section className={styles.related} aria-labelledby="related-title">
          <div className={styles.relatedInner}>
            <h2 id="related-title" className={styles.relatedTitle}>
              Keep reading
            </h2>
            <ul className={styles.relatedGrid} role="list">
              <li className={styles.relatedLead}>
                <article className={styles.leadCard} aria-labelledby={`related-${lead.slug}`}>
                  <span className={styles.leadMedia}>
                    <Image
                      src={lead.coverImage}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 640px, 100vw"
                      className={styles.leadImage}
                    />
                  </span>
                  <p className={styles.rowMeta}>
                    {lead.category} · {lead.readTime} min read
                  </p>
                  <h3 id={`related-${lead.slug}`} className={styles.leadName}>
                    <Link href={`/blog/${lead.slug}`} className={styles.stretch}>
                      {lead.title}
                    </Link>
                  </h3>
                  <p className={styles.rowDek}>{firstSentence(lead.excerpt)}</p>
                </article>
              </li>
              {rest.map((entry) => (
                <li key={entry.slug}>
                  <article className={styles.row} aria-labelledby={`related-${entry.slug}`}>
                    <p className={styles.rowMeta}>
                      {entry.category} · {entry.readTime} min read
                    </p>
                    <h3 id={`related-${entry.slug}`} className={styles.rowName}>
                      <Link href={`/blog/${entry.slug}`} className={styles.stretch}>
                        {entry.title}
                      </Link>
                    </h3>
                    <p className={styles.rowDek}>{firstSentence(entry.excerpt)}</p>
                  </article>
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
    </article>
  );
}
