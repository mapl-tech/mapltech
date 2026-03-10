import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { HiArrowLeft, HiArrowRight, HiClock, HiCalendar, HiChevronRight } from 'react-icons/hi2';
import { getPostBySlug, getRelatedPosts, blogPosts } from '@/data/blog-posts';
import ReadingProgress from '@/components/ui/ReadingProgress';
import MagneticButton from '@/components/ui/MagneticButton';
import styles from '@/styles/blog.module.scss';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: `${post.title} | MAPL TECH Blog`,
    description: post.excerpt,
    keywords: `${post.category}, MAPL TECH, ${post.author.name}, agency technology`,
    alternates: { canonical: `https://mapltech.com/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://mapltech.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      section: post.category,
      siteName: 'MAPL TECH',
      images: [{ url: post.coverImage, width: 1200, height: 630, alt: post.coverImageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]).join('');
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(slug, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    author: { '@type': 'Person', name: post.author.name, jobTitle: post.author.role },
    publisher: {
      '@type': 'Organization',
      name: 'MAPL TECH',
      url: 'https://mapltech.com',
      logo: { '@type': 'ImageObject', url: 'https://mapltech.com/images/mapl-tech-logo.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://mapltech.com/blog/${post.slug}` },
    url: `https://mapltech.com/blog/${post.slug}`,
    articleSection: post.category,
    wordCount: post.content.split(' ').length,
    timeRequired: `PT${post.readTime}M`,
    image: { '@type': 'ImageObject', url: post.coverImage, description: post.coverImageAlt },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ReadingProgress />

      {/* ── Full-bleed image hero ───────────────────────────────────────── */}
      <header className={styles.postHero}>
        {/* Background image */}
        <div className={styles.postHeroBg} aria-hidden="true">
          <Image
            src={post.coverImage}
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
            priority
          />
        </div>

        {/* Layered gradient — cinematic dark vignette */}
        <div className={styles.postHeroGradient} aria-hidden="true" />

        {/* Content on top of image */}
        <div className={styles.postHeroInner}>
          {/* Breadcrumb */}
          <nav className={styles.postBreadcrumb} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <HiChevronRight size={12} aria-hidden="true" />
            <Link href="/blog">Blog</Link>
            <HiChevronRight size={12} aria-hidden="true" />
            <span aria-current="page">{post.category}</span>
          </nav>

          {/* Category + title + meta stacked at bottom */}
          <div className={styles.postHeroContent}>
            <div className={styles.postCategory} aria-label={`Category: ${post.category}`}>
              {post.category}
            </div>

            <h1 className={styles.postTitle}>{post.title}</h1>

            <p className={styles.postExcerpt}>{post.excerpt}</p>

            <div className={styles.postMeta}>
              <div className={styles.postMetaAuthor}>
                <div className={styles.authorAvatar} aria-hidden="true">
                  {initials(post.author.name)}
                </div>
                <div className={styles.postMetaAuthorInfo}>
                  <p className={styles.authorName}>{post.author.name}</p>
                  <p className={styles.authorRole}>{post.author.role}</p>
                </div>
              </div>

              <div className={styles.postMetaDivider} aria-hidden="true" />

              <div className={styles.postMetaItem}>
                <HiCalendar size={14} aria-hidden="true" />
                <time dateTime={post.date}>{post.date}</time>
              </div>

              <div className={styles.postMetaDivider} aria-hidden="true" />

              <div className={styles.postMetaItem}>
                <HiClock size={14} aria-hidden="true" />
                <span>{post.readTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Article content ────────────────────────────────────────────── */}
      <main className={styles.postContent}>
        <div className={styles.postContentInner}>
          <article>
            <div
              className={styles.prose}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* CTA */}
          <aside className={styles.postCta} aria-label="Contact MAPL TECH">
            <h3>Ready to put this into practice?</h3>
            <p>
              MAPL TECH builds the systems, automation, and infrastructure behind
              agencies in Nigeria, Jamaica, and beyond. Let&apos;s talk about your project.
            </p>
            <MagneticButton href="/contact-us" size="large">
              Start a Conversation
            </MagneticButton>
          </aside>

          {/* Back */}
          <Link href="/blog" className={styles.backLink} aria-label="Back to all blog posts">
            <HiArrowLeft aria-hidden="true" /> Back to Blog
          </Link>
        </div>
      </main>

      {/* ── Related posts ──────────────────────────────────────────────── */}
      {related.length > 0 && (
        <section className={styles.relatedSection} aria-label="Related articles">
          <div className={styles.relatedInner}>
            <h2 className={styles.relatedTitle}>Related Articles</h2>
            <ul className={styles.relatedGrid} role="list">
              {related.map((rel) => (
                <li key={rel.slug} role="listitem">
                  <Link
                    href={`/blog/${rel.slug}`}
                    className={styles.card}
                    aria-label={`${rel.title} — ${rel.category}, ${rel.readTime} min read`}
                  >
                    <div className={styles.cardImageBlock}>
                      <Image
                        src={rel.coverImage}
                        alt={rel.coverImageAlt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                      <div className={styles.cardImageOverlay} aria-hidden="true" />
                      <span className={styles.cardCategory}>{rel.category}</span>
                    </div>
                    <div className={styles.cardBody}>
                      <div className={styles.cardMeta}>
                        <time dateTime={rel.date}>{rel.date}</time>
                        <span aria-hidden="true">·</span>
                        <HiClock size={12} aria-hidden="true" />
                        <span>{rel.readTime} min</span>
                      </div>
                      <h3 className={styles.cardTitle}>{rel.title}</h3>
                      <div className={styles.cardFooter}>
                        <div className={styles.cardAuthor}>
                          <div className={styles.cardAvatarSmall} aria-hidden="true">
                            {initials(rel.author.name)}
                          </div>
                          <span className={styles.cardAuthorName}>{rel.author.name}</span>
                        </div>
                        <div className={styles.cardArrow} aria-hidden="true">
                          <HiArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
