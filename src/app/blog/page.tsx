import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { blog, pageGraph } from '@/lib/schema';
import { absoluteUrl, toISODate } from '@/config/routes';
import { blogPosts, categories, type BlogPost } from '@/data/blog-posts';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import BlogArchive, { type ArchiveRow, type ArchiveTopic } from '@/components/editorial/BlogArchive';
import { firstSentence, topicSlug } from '@/components/convert/blog-utils';
import { SERVICE_LIST, topicLabel } from '@/components/editorial/services';
import styles from './blog-index.module.scss';

/**
 * /blog (Nov 2026 award pass): the archive as a publication. The page hero
 * with the real counts → the newest article presented large → every article
 * on paper, grouped by month as editorial rows, with topic facets and instant
 * search (BlogArchive) → the crimson close. All post links are in the server
 * HTML. Structured data: a CollectionPage with the Blog node listing every
 * BlogPosting.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Newest first, by the ISO date (blog-posts.ts is ordered that way already; this makes it a guarantee). */
const posts: BlogPost[] = [...blogPosts].sort((a, b) => toISODate(b.date).localeCompare(toISODate(a.date)));
const latest = posts[0];
const readTimes = posts.map((post) => post.readTime);
const minRead = Math.min(...readTimes);
const maxRead = Math.max(...readTimes);

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
    year,
    monthKey: iso.slice(0, 7),
    monthLabel: `${MONTHS[month - 1]} ${year}`,
    short: `${MONTHS[month - 1].slice(0, 3)} ${day}`,
  };
}

export default function BlogPage() {
  const rows: ArchiveRow[] = posts.map((post) => {
    const date = dateParts(post);
    return {
      slug: post.slug,
      title: post.title,
      answer: firstSentence(post.excerpt),
      category: topicLabel(post.category),
      topic: topicSlug(post.category),
      dateISO: date.iso,
      dateLabel: date.short,
      monthKey: date.monthKey,
      monthLabel: date.monthLabel,
      readTime: post.readTime,
    };
  });
  const topics: ArchiveTopic[] = categories.map((category) => ({ slug: topicSlug(category), label: topicLabel(category) }));
  const firstMonth = dateParts(posts[posts.length - 1]).monthLabel;
  const newest = dateParts(latest);

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

      <PageHeader
        size="l"
        label="MAPL TECH blog"
        title="Engineering, written down."
        lede={`Practical articles on ${SERVICE_LIST}, written by the MAPL TECH team for agencies and the clients they serve.`}
        actions={
          <a href="#archive" className={styles.heroLink} data-cta-placement="blog_hero_archive">
            Search the archive
          </a>
        }
        aside={
          <div className={styles.masthead}>
            <p className={styles.count}>
              <span className={styles.countValue}>{posts.length}</span>
              <span className={styles.countLabel}>articles since {firstMonth}</span>
            </p>
            <dl className={styles.facts}>
              <div>
                <dt>Topics</dt>
                <dd>{categories.length}</dd>
              </div>
              <div>
                <dt>Latest</dt>
                <dd>
                  <time dateTime={newest.iso}>
                    {newest.short}, {newest.year}
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
        }
      />

      {/* ---------------------------------------------------------- the newest article, large */}
      <section className={styles.latest} aria-label="Latest article">
        <div className={styles.latestInner}>
          <article className={styles.card} aria-labelledby="latest-title">
            <div className={styles.media}>
              <Image
                src={latest.coverImage}
                alt={latest.coverImageAlt}
                fill
                sizes="(min-width: 1440px) 1296px, 92vw"
                loading="eager"
                className={styles.image}
              />
            </div>
            <div className={styles.copy}>
              <div className={styles.headline}>
                <p className={styles.kind}>
                  <span className={styles.kindLead}>Latest</span>
                  <span>{topicLabel(latest.category)}</span>
                </p>
                <h2 id="latest-title" className={styles.cardTitle}>
                  <Link href={`/blog/${latest.slug}`} className={styles.stretch} data-cta-placement="blog_latest">
                    {latest.title}
                  </Link>
                </h2>
              </div>
              <div className={styles.standfirst}>
                <p className={styles.excerpt}>{latest.excerpt}</p>
                <p className={styles.meta}>
                  <time dateTime={newest.iso}>{latest.date}</time>
                  <span>{latest.readTime} min read</span>
                </p>
                <span className={styles.read} aria-hidden="true">
                  Read the article
                  <span className={styles.readArrow}>→</span>
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {/* ---------------------------------------------------------- the archive, on paper */}
      <section id="archive" className={styles.archive} aria-labelledby="archive-title">
        <div className={styles.archiveInner}>
          <header className={styles.archiveHead}>
            <p className={styles.archiveLabel}>The archive</p>
            <h2 id="archive-title" className={styles.archiveTitle}>
              Every article
            </h2>
            <p className={styles.archiveLede}>
              {posts.length} articles since {firstMonth}, newest first. Filter by topic or search titles and summaries.
            </p>
          </header>
          <BlogArchive rows={rows} topics={topics} />
        </div>
      </section>

      <CloseBand
        title="Need it built, not just explained?"
        lede="Our prices are public: you see your number before we ask for anything."
        placement="blog_close"
        id="blog-close-title"
      />
    </>
  );
}
