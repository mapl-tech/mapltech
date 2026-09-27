import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { blog, pageGraph } from '@/lib/schema';
import { toISODate } from '@/config/routes';
import { blogPosts, categories } from '@/data/blog-posts';
import ConvertHero, { LastReviewed } from '@/components/convert/ConvertHero';
import Cta from '@/components/convert/Cta';
import BlogIndex, { type BlogRow, type BlogTopic } from '@/components/convert/BlogIndex';
import { firstSentence, topicSlug } from '@/components/convert/blog-utils';
import shared from '@/app/convert.module.scss';
import styles from './blog-index.module.scss';

export const metadata: Metadata = {
  title: 'Blog | MAPL TECH - Tech Insights for Agencies',
  description:
    'Weekly articles on web development, AI automation, and custom internal tools from the MAPL TECH engineering team. Practical insights for agencies in Nigeria, Jamaica, and beyond.',
  keywords:
    'MAPL TECH blog, web development articles, AI automation insights, internal tools, agency technology, Nigeria tech, Jamaica digital',
  alternates: {
    canonical: 'https://mapltech.com/blog',
  },
  openGraph: {
    title: 'MAPL TECH Blog - Tech Insights for Agencies',
    description:
      'Weekly engineering insights on AI automation, web development, and custom internal tools from the MAPL TECH team.',
    url: 'https://mapltech.com/blog',
    type: 'website',
    siteName: 'MAPL TECH',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAPL TECH Blog',
    description: 'Weekly tech insights for agencies building on the African and Caribbean digital economy.',
  },
};

const PATH = '/blog';

export default function BlogPage() {
  const featured = blogPosts.find((post) => post.featured);
  const listed = blogPosts.filter((post) => !post.featured);

  const rows: BlogRow[] = listed.map((post) => ({
    slug: post.slug,
    title: post.title,
    answer: firstSentence(post.excerpt),
    category: post.category,
    topic: topicSlug(post.category),
    dateISO: toISODate(post.date),
    dateLabel: post.date,
    readTime: post.readTime,
    author: post.author.name,
  }));

  const topics: BlogTopic[] = categories.map((category) => ({
    slug: topicSlug(category),
    label: category,
    count: listed.filter((post) => post.category === category).length,
  }));

  const authorNames = Array.from(new Set(blogPosts.map((post) => post.author.name)));

  return (
    <>
      <JsonLd
        data={pageGraph({
          path: PATH,
          name: 'MAPL TECH Blog',
          type: 'CollectionPage',
          description: metadata.description ?? undefined,
          nodes: [blog(blogPosts, { description: metadata.description ?? undefined })],
        })}
      />

      <ConvertHero
        eyebrow="MAPL TECH Blog"
        title="Engineering Insights, Published Weekly"
        wideTitle
        lede={`Practical articles on AI automation, web development, custom internal tools and cloud engineering, written by the MAPL TECH engineers who build them for agencies. ${blogPosts.length} articles across ${categories.length} topics, each opening with the author's own summary and closing with a route to a scoped estimate for the service it relates to.`}
        facts={[
          { label: 'Articles', value: String(blogPosts.length) },
          { label: 'Topics', value: categories.join(' · ') },
          { label: 'Cadence', value: 'Weekly' },
          { label: 'Written by', value: authorNames.join(', ') },
          { label: 'Last reviewed', value: <LastReviewed path={PATH} /> },
        ]}
        actions={
          <>
            <Cta placement="blog_hero_primary" hero href="/pricing#estimator" size="large" cursor="estimate">
              Get a 60-second estimate
            </Cta>
            <Cta placement="blog_hero_secondary" href="/contact-us" variant="secondary" size="large">
              Book a 20-min scoping call
            </Cta>
          </>
        }
      />

      {/* 02 — Featured post (the post flagged in blog-posts.ts; badge reads "Featured", not "Latest") */}
      {featured ? (
        <section className={shared.sectionTight} aria-labelledby="featured-title">
          <div className={shared.inner}>
            <Link href={`/blog/${featured.slug}`} className={styles.featured} data-cursor="view">
              <div className={styles.featuredMedia}>
                <Image
                  src={featured.coverImage}
                  alt={featured.coverImageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className={styles.featuredImage}
                />
              </div>
              <div className={styles.featuredBody}>
                <p className={styles.featuredMeta}>
                  <span className={styles.featuredBadge}>Featured</span>
                  <span>
                    {featured.category} · <time dateTime={toISODate(featured.date)}>{featured.date}</time> ·{' '}
                    {featured.readTime} min read
                  </span>
                </p>
                <h2 id="featured-title" className={styles.featuredTitle}>
                  {featured.title}
                </h2>
                <p className={styles.featuredExcerpt}>{featured.excerpt}</p>
                <span className={styles.featuredRead}>Read article →</span>
              </div>
            </Link>
          </div>
        </section>
      ) : null}

      {/* 03/04 — Topic chips + rows (all rows in the HTML, hidden by filter) */}
      <section className={shared.section} aria-labelledby="articles-title">
        <div className={shared.inner}>
          <div className={shared.sectionHead}>
            <p className="eyebrow">All articles</p>
            <h2 id="articles-title" className={shared.sectionTitle}>
              Pick a topic, read the answer, scope the work
            </h2>
          </div>
          <BlogIndex rows={rows} topics={topics} />
        </div>
      </section>
    </>
  );
}
