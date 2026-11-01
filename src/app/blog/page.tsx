import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { blog, getServiceLine, pageGraph, startingPrice, type ServiceSlug } from '@/lib/schema';
import { SERVICE_META } from '@/lib/estimate';
import { testimonials } from '@/config/site';
import { absoluteUrl, toISODate } from '@/config/routes';
import { blogPosts, categories, type BlogPost } from '@/data/blog-posts';
import { ESTIMATE_HREF, ESTIMATE_LABEL } from '@/components/layout/chrome';
import BlogArchive, { type ArchiveRow, type ArchiveTopic } from '@/components/editorial/BlogArchive';
import { firstSentence, topicSlug } from '@/components/convert/blog-utils';
import { SERVICE_KEYS, SERVICE_LIST } from '@/components/editorial/services';
import styles from './blog-index.module.scss';

/**
 * /blog: the archive as a publication. Masthead with the real counts → the
 * featured post (the one flagged in blog-posts.ts) beside the latest four →
 * every article, grouped by month, with topic facets and instant search
 * (BlogArchive). All post links are in the server HTML. Structured data: a
 * CollectionPage with the Blog node listing every BlogPosting.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Newest first, by the ISO date (blog-posts.ts is ordered that way already; this makes it a guarantee). */
const posts: BlogPost[] = [...blogPosts].sort((a, b) => toISODate(b.date).localeCompare(toISODate(a.date)));
const featured = posts.find((post) => post.featured) ?? posts[0];
const latest = posts.filter((post) => post.slug !== featured.slug).slice(0, 4);
const readTimes = posts.map((post) => post.readTime);
const minRead = Math.min(...readTimes);
const maxRead = Math.max(...readTimes);

/** The four public "from" prices, shown at the ask (site.ts via schema.ts). */
const ASK_SERVICES = SERVICE_KEYS;
/** The one approved client quote (LRO Staffing), first sentence, verbatim. */
const proof = testimonials.find((entry) => entry.company === 'LRO Staffing');

const DESCRIPTION = `${posts.length} practical articles from MAPL TECH on ${SERVICE_LIST}, for digital agencies.`;

export const metadata: Metadata = {
  title: { absolute: 'MAPL TECH Blog: practical engineering for agencies' },
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('/blog') },
  openGraph: {
    type: 'website',
    title: 'MAPL TECH Blog: practical engineering for agencies',
    description: DESCRIPTION,
    url: absoluteUrl('/blog'),
    siteName: 'MAPL TECH',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAPL TECH Blog',
    description: DESCRIPTION,
  },
};

function dateParts(post: BlogPost) {
  const iso = toISODate(post.date);
  const [year, month, day] = iso.split('-').map(Number);
  return {
    iso,
    monthKey: iso.slice(0, 7),
    monthLabel: `${MONTHS[month - 1]} ${year}`,
    short: `${MONTHS[month - 1].slice(0, 3)} ${day}`,
  };
}

export default function BlogPage() {
  const rows: ArchiveRow[] = posts.map((post) => {
    const date = dateParts(post);
    const answer = firstSentence(post.excerpt);
    return {
      slug: post.slug,
      title: post.title,
      answer,
      category: post.category,
      topic: topicSlug(post.category),
      dateISO: date.iso,
      dateLabel: date.short,
      monthKey: date.monthKey,
      monthLabel: date.monthLabel,
      readTime: post.readTime,
    };
  });
  const topics: ArchiveTopic[] = categories.map((category) => ({ slug: topicSlug(category), label: category }));
  const firstMonth = dateParts(posts[posts.length - 1]).monthLabel;

  return (
    <>
      <JsonLd
        data={pageGraph({
          path: '/blog',
          name: 'MAPL TECH Blog',
          type: 'CollectionPage',
          description: DESCRIPTION,
          nodes: [blog(posts, { description: DESCRIPTION })],
        })}
      />

      {/* ---------------------------------------------------------- masthead */}
      <header className={styles.masthead}>
        <div className={styles.inner}>
          <div className={styles.mastGrid}>
            <div>
              <p className={styles.eyebrow}>
                <span>MAPL TECH blog</span>
              </p>
              <h1 className={styles.title}>Engineering, written down.</h1>
              <p className={styles.lede}>
                Practical articles on {SERVICE_LIST}, written by the MAPL TECH team for agencies and the clients they
                serve.
              </p>
            </div>
            <dl className={styles.stats}>
              <div>
                <dt>Articles</dt>
                <dd>{posts.length}</dd>
              </div>
              <div>
                <dt>Topics</dt>
                <dd>{categories.length}</dd>
              </div>
              <div>
                <dt>Latest</dt>
                <dd>
                  <time dateTime={toISODate(posts[0].date)}>
                    {dateParts(posts[0]).short}, {toISODate(posts[0].date).slice(0, 4)}
                  </time>
                </dd>
              </div>
              <div>
                <dt>Reading time</dt>
                <dd>
                  {minRead} to {maxRead} min
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- front page */}
      <section className={styles.front} aria-label="Featured and latest articles">
        <div className={`${styles.inner} ${styles.frontGrid}`}>
          <article className={styles.featured} aria-labelledby="featured-title">
            <div className={styles.media}>
              <span className={styles.mediaFrame}>
                <Image
                  src={featured.coverImage}
                  alt={featured.coverImageAlt}
                  fill
                  sizes="(min-width: 1280px) 700px, (min-width: 1024px) 56vw, 100vw"
                  loading="eager"
                  fetchPriority="high"
                  className={styles.image}
                />
              </span>
              <span className={styles.structure} aria-hidden="true" />
            </div>
            <p className={styles.badge}>
              <span>Featured</span>
            </p>
            <p className={styles.kicker}>
              <span>{featured.category}</span>
              <span>
                <time dateTime={toISODate(featured.date)}>{featured.date}</time>
              </span>
              <span>{featured.readTime} min read</span>
            </p>
            <h2 id="featured-title" className={styles.featuredTitle}>
              <Link href={`/blog/${featured.slug}`} className={styles.stretch}>
                {featured.title}
              </Link>
            </h2>
            <p className={styles.featuredDek}>{featured.excerpt}</p>
            <span className={styles.readMore} aria-hidden="true">
              Read the article
              <span className={styles.arrow}>→</span>
            </span>
          </article>

          <div className={styles.latest}>
            <h2 className={styles.latestTitle}>Latest</h2>
            <ol className={styles.latestList} role="list">
              {latest.map((post) => (
                <li key={post.slug} className={styles.latestRow}>
                  <p className={styles.latestMeta}>
                    <time dateTime={toISODate(post.date)}>{post.date}</time> · {post.category} · {post.readTime} min
                  </p>
                  <h3 className={styles.latestName}>
                    <Link href={`/blog/${post.slug}`} className={styles.rowLink}>
                      {post.title}
                    </Link>
                  </h3>
                </li>
              ))}
            </ol>
          </div>

          <aside className={styles.ask} aria-labelledby="blog-ask">
            <p id="blog-ask" className={styles.askTitle}>
              Need it built, not just explained?
            </p>
            <p className={styles.askText}>Our prices are public: you see your number before we ask for anything.</p>
            <dl className={styles.askPrices}>
              {ASK_SERVICES.map((service) => (
                <div key={service}>
                  <dt>{SERVICE_META[service].label}</dt>
                  <dd>From {startingPrice(getServiceLine(SERVICE_META[service].slug as ServiceSlug))}</dd>
                </div>
              ))}
            </dl>
            <Link href={ESTIMATE_HREF} className={styles.askButton} data-cta-placement="blog_index_estimate">
              {ESTIMATE_LABEL}
            </Link>
            {proof ? (
              <figure className={styles.askProof}>
                <blockquote>
                  <p>&ldquo;{firstSentence(proof.quote)}&rdquo;</p>
                </blockquote>
                <figcaption>
                  {proof.name}, {proof.role}, {proof.company}
                </figcaption>
              </figure>
            ) : null}
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------- archive */}
      <section id="archive" className={styles.archive} aria-labelledby="archive-title">
        <div className={styles.inner}>
          <div className={styles.archiveHead}>
            <h2 id="archive-title" className={styles.archiveTitle}>
              Every article
            </h2>
            <p className={styles.archiveLede}>
              {posts.length} articles since {firstMonth}, newest first. Filter by topic or search titles and summaries.
            </p>
          </div>
          <BlogArchive rows={rows} topics={topics} />
        </div>
      </section>
    </>
  );
}
