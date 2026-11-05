import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/og';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { blog, pageGraph } from '@/lib/schema';
import { absoluteUrl, toISODate } from '@/config/routes';
import { blogPosts, categories, type BlogPost } from '@/data/blog-posts';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import { LOWEST_PRICE, SERVICES_INTRO, TRUST_ITEMS } from '@/components/flagship/content';
import BlogArchive, { type ArchiveRow, type ArchiveTopic } from '@/components/editorial/BlogArchive';
import { categoryService, firstSentence, topicSlug } from '@/components/convert/blog-utils';
import { SERVICE_LIST, serviceFrom, serviceLinks, topicLabel } from '@/components/editorial/services';
import { SERVICE_META, estimateHref, formatMoney } from '@/lib/estimate';
import styles from './blog-index.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * /blog (Nov 2026, simplified): the page hero (one line under its action
 * names the services' lowest public price and links the estimator, so a price
 * is in the first screen) → the newest article presented large (its title in
 * the first screen on desktop) → every other article on paper, grouped by
 * month as editorial rows, with topic facets and instant search
 * (BlogArchive) → the crimson close. All post links are in the server
 * HTML; the archive island gets only the fields a row shows, plus the four
 * services with their public prices (its line for the views without a service
 * of their own). The close says what its button opens: the four-question brief,
 * then a fixed quote after one call. Structured data: a CollectionPage with the
 * Blog node and its newest posts (schema.ts blog()).
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Newest first, by the ISO date (blog-posts.ts is ordered that way already; this makes it a guarantee). */
const posts: BlogPost[] = [...blogPosts].sort((a, b) => toISODate(b.date).localeCompare(toISODate(a.date)));
const latest = posts[0];

const DESCRIPTION = `${posts.length} practical articles from MAPL TECH on ${SERVICE_LIST}, for digital agencies.`;

export const metadata: Metadata = {
  title: { absolute: 'MAPL TECH Blog: practical engineering for agencies' },
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl('/blog') },
  openGraph: {
    images: [OG_IMAGE],
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

/** "September 2026" from an ISO date. */
function monthLabel(iso: string): string {
  return `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
}

/** A service topic carries its service page, public "from" price (the archive's service line) and estimate. */
function archiveTopic(category: BlogPost['category']): ArchiveTopic {
  const service = categoryService(category);
  const from = service ? serviceFrom(service) : undefined;
  return {
    slug: topicSlug(category),
    label: topicLabel(category),
    service:
      service && from
        ? { href: SERVICE_META[service].path, from, estimate: estimateHref({ services: [service] }) }
        : undefined,
  };
}

export default function BlogPage() {
  // Only what a row shows: the island derives labels, short dates and months itself.
  const rows: ArchiveRow[] = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    answer: firstSentence(post.excerpt),
    topic: topicSlug(post.category),
    date: toISODate(post.date),
    readTime: post.readTime,
  }));
  const topics: ArchiveTopic[] = categories.map(archiveTopic);
  const firstMonth = monthLabel(toISODate(posts[posts.length - 1].date));
  const latestISO = toISODate(latest.date);

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
        label="Blog"
        title="Practical guides for agencies."
        lede={`Articles on ${SERVICE_LIST}, written by the MAPL TECH team for agencies and their clients.`}
        actions={
          <a href="#archive-q" className={styles.heroLink} data-cta-placement="blog_hero_archive">
            Search all articles
          </a>
        }
        // How we work and the lowest public price (the published "Projects from" line): a price in the first screen.
        note={
          <>
            We work with your team, under your brand. Projects from&nbsp;{formatMoney(LOWEST_PRICE)}.{' '}
            <Link
              href={SERVICES_INTRO.estimate.href}
              className={styles.heroNoteLink}
              data-cta-placement="blog_hero_estimate"
            >
              {SERVICES_INTRO.estimate.label}
            </Link>
          </>
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
                sizes="(min-width: 1440px) 432px, (min-width: 1024px) 30vw, (min-width: 768px) 92vw, 1px"
                loading="eager"
                fetchPriority="high"
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
                  <time dateTime={latestISO}>{latest.date}</time>
                  <span>{latest.readTime} min read</span>
                </p>
                <span className={styles.read} aria-hidden="true">
                  Read the article
                  <span className={styles.readArrow}><Arrow /></span>
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
              All articles
            </h2>
            <p className={styles.archiveLede}>
              {posts.length} articles since {firstMonth}, newest first. Choose a topic, or search the titles and summaries.
            </p>
          </header>
          <BlogArchive rows={rows} topics={topics} services={serviceLinks()} featured={latest.slug} />
        </div>
      </section>

      {/* The primary opens the brief, so the lede and note say what happens there (the contact page's own words). */}
      <CloseBand
        title="Have a client project in mind?"
        lede="Answer four short questions. Then we agree the scope with you."
        trust={TRUST_ITEMS}
        placement="blog_close"
        id="blog-close-title"
      />
    </>
  );
}
