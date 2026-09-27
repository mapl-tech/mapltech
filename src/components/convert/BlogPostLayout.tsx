import Image from 'next/image';
import Link from 'next/link';
import type { BlogPost } from '@/data/blog-posts';
import { toISODate } from '@/config/routes';
import { getServiceLine, startingPrice, type ServiceSlug } from '@/lib/schema';
import { SERVICE_META, estimateHref, tiersFor } from '@/lib/estimate';
import Breadcrumbs from './Breadcrumbs';
import Cta from './Cta';
import { anchorHeadings, categoryService, splitLead, topicSlug } from './blog-utils';
import shared from '@/app/convert.module.scss';
import styles from './BlogPost.module.scss';

/**
 * Post layout (brief §2.10): text first so the H1 is the LCP, visible byline,
 * a static 16:9 cover under the byline, the post's own opening paragraph as
 * the TL;DR (verbatim, quotable, plain HTML), the body, then a related-service
 * CTA card with its starting price, older/newer links and related articles.
 * No motion beyond ReadingProgress (mounted by the page) and section reveals
 * below the body.
 */

export interface BlogPostLayoutProps {
  post: BlogPost;
  newer?: BlogPost;
  older?: BlogPost;
  related: BlogPost[];
}

function PostLink({ post, label }: { post: BlogPost; label: string }) {
  return (
    <Link href={`/blog/${post.slug}`} className={styles.adjacent} data-cursor="view">
      <span className={styles.adjacentLabel}>{label}</span>
      <span className={styles.adjacentTitle}>{post.title}</span>
      <span className={styles.adjacentMeta}>
        {post.category} · <time dateTime={toISODate(post.date)}>{post.date}</time> · {post.readTime} min
      </span>
    </Link>
  );
}

export default function BlogPostLayout({ post, newer, older, related }: BlogPostLayoutProps) {
  const iso = toISODate(post.date);
  const { lead, body } = splitLead(post.content);
  const { html, headings } = anchorHeadings(body);

  const serviceKey = categoryService(post.category);
  const service = serviceKey ? SERVICE_META[serviceKey] : null;
  const line = service ? getServiceLine(service.slug as ServiceSlug) : null;
  const from = line ? startingPrice(line) : undefined;
  const tiers = serviceKey ? tiersFor(serviceKey) : [];

  return (
    <article className={styles.post} aria-labelledby="post-title">
      {/* Hero: text first */}
      <header className={styles.hero}>
        <div className={shared.innerProse}>
          <Breadcrumbs
            className={styles.crumbs}
            items={[
              { name: 'Blog', path: '/blog' },
              { name: post.category, path: `/blog?topic=${topicSlug(post.category)}` },
              { name: post.title },
            ]}
          />
          <p className="eyebrow">{post.category}</p>
          <h1 id="post-title" className={styles.title}>
            {post.title}
          </h1>
          <p className={styles.lede}>{post.excerpt}</p>
          <p className={styles.byline}>
            By {post.author.name} · <time dateTime={iso}>{post.date}</time> · {post.readTime} min read
          </p>
        </div>
        <div className={shared.innerNarrow}>
          <figure className={styles.cover}>
            <Image
              src={post.coverImage}
              alt={post.coverImageAlt}
              fill
              sizes="(max-width: 900px) 100vw, 900px"
              className={styles.coverImage}
              priority
            />
          </figure>
        </div>
      </header>

      <div className={shared.innerProse}>
        {/* TL;DR: the post's own opening paragraph, verbatim */}
        {lead ? (
          <aside className={styles.tldr} aria-labelledby="tldr-title">
            <p id="tldr-title" className={styles.tldrLabel}>
              TL;DR
            </p>
            <p className={styles.tldrText} dangerouslySetInnerHTML={{ __html: lead }} />
          </aside>
        ) : null}

        {headings.length > 1 ? (
          <nav className={styles.contents} aria-label="In this article">
            <p className={styles.contentsLabel}>In this article</p>
            <ol className={styles.contentsList}>
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.text}</a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className={styles.prose} dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {/* Related service: the CTA card with its starting price */}
      <aside className={`${styles.serviceCard} reveal`} aria-labelledby="service-title">
        <div className={shared.innerProse}>
          <div className={shared.card}>
            <div className={shared.stack}>
              <p className="eyebrow">
                Related service{service ? ` · ${service.label}` : ''}
                {from ? ` · from ${from}` : ''}
              </p>
              <h2 id="service-title" className={shared.cardTitle}>
                Ready to put this into practice?
              </h2>
              {service && tiers.length > 0 ? (
                <p className={shared.cardBody}>
                  MAPL TECH builds the systems, automation, and infrastructure behind agencies. {service.label}{' '}
                  starts with {tiers[0].name} at {tiers[0].price}
                  {tiers[1] ? `, then ${tiers[1].name} at ${tiers[1].price}` : ''}
                  {tiers[2] ? ` and ${tiers[2].name} at ${tiers[2].price}` : ''}. Fixed quote after a 20-min scoping
                  call.
                </p>
              ) : (
                <p className={shared.cardBody}>
                  MAPL TECH builds the systems, automation, and infrastructure behind agencies in Nigeria, Jamaica,
                  and beyond. Let&apos;s talk about your project.
                </p>
              )}
              <div className={shared.ctaRow}>
                <Cta
                  placement="blog_post_service_estimate"
                  href={serviceKey ? estimateHref({ services: [serviceKey] }) : '/pricing#estimator'}
                  size="medium"
                  cursor="estimate"
                >
                  Get a 60-second estimate
                </Cta>
                <Cta placement="blog_post_service_call" href="/contact-us" variant="secondary" size="medium">
                  Book a 20-min scoping call
                </Cta>
              </div>
              {service ? (
                <p className={shared.small}>
                  <Link className={shared.link} href={service.path}>
                    See the {service.label} service
                  </Link>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </aside>

      {/* Newer / older */}
      <nav className={`${styles.adjacentNav} reveal`} aria-label="Newer and older articles">
        <div className={shared.innerNarrow}>
          <div className={styles.adjacentGrid}>
            {newer ? <PostLink post={newer} label="Newer" /> : (
              <Link href="/blog" className={styles.adjacent}>
                <span className={styles.adjacentLabel}>Newest post</span>
                <span className={styles.adjacentTitle}>Back to the blog</span>
              </Link>
            )}
            {older ? <PostLink post={older} label="Older" /> : (
              <Link href="/blog" className={styles.adjacent}>
                <span className={styles.adjacentLabel}>Oldest post</span>
                <span className={styles.adjacentTitle}>Back to the blog</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Related articles */}
      {related.length > 0 ? (
        <section className={`${styles.related} reveal`} data-below-fold aria-labelledby="related-title">
          <div className={shared.innerNarrow}>
            <p className="eyebrow">Keep reading</p>
            <h2 id="related-title" className={styles.relatedTitle}>
              Related articles
            </h2>
            <ul className={styles.relatedList}>
              {related.map((entry) => (
                <li key={entry.slug}>
                  <Link href={`/blog/${entry.slug}`} className={styles.relatedRow} data-cursor="view">
                    <span className={styles.relatedRowTitle}>{entry.title}</span>
                    <span className={styles.adjacentMeta}>
                      {entry.category} · <time dateTime={toISODate(entry.date)}>{entry.date}</time> · {entry.readTime} min
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </article>
  );
}
