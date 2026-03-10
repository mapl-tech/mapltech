'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { HiArrowRight, HiClock, HiCalendar } from 'react-icons/hi2';
import { blogPosts, categories, type BlogCategory } from '@/data/blog-posts';
import styles from '@/styles/blog.module.scss';

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}

export default function BlogGrid() {
  const [active, setActive] = useState<BlogCategory | 'All'>('All');

  const nonFeatured = blogPosts.filter((p) => !p.featured);
  const featured = blogPosts.find((p) => p.featured);

  const filtered = useMemo(
    () => (active === 'All' ? nonFeatured : nonFeatured.filter((p) => p.category === active)),
    [active]
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: nonFeatured.length };
    categories.forEach((c) => {
      map[c] = nonFeatured.filter((p) => p.category === c).length;
    });
    return map;
  }, []);

  return (
    <>
      {/* Filter bar */}
      <nav
        className={styles.filterSection}
        aria-label="Filter blog posts by category"
      >
        <div className={styles.filterInner} role="list">
          {(['All', ...categories] as const).map((cat) => (
            <button
              key={cat}
              role="listitem"
              className={`${styles.filterBtn} ${active === cat ? styles.active : ''}`}
              onClick={() => setActive(cat)}
              aria-pressed={active === cat}
              aria-label={`Show ${cat === 'All' ? 'all posts' : cat + ' posts'} (${counts[cat]} posts)`}
            >
              {cat}
              <span className={styles.filterCount} aria-hidden="true">
                {counts[cat] ?? 0}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Featured post — always visible */}
      {featured && active === 'All' && (
        <section className={styles.featuredSection} aria-label="Featured post">
          <div className={styles.featuredInner}>
            <Link
              href={`/blog/${featured.slug}`}
              className={styles.featuredCard}
              aria-label={`Read featured post: ${featured.title}`}
            >
              {/* Visual side */}
              <div className={styles.featuredImageSide} aria-hidden="true">
                <div className={styles.featuredImagePattern} />
                <span className={styles.featuredCategoryBadge}>{featured.category}</span>
                <span className={styles.featuredNewBadge}>Latest Post</span>
              </div>

              {/* Content side */}
              <div className={styles.featuredContent}>
                <div className={styles.featuredMeta}>
                  <time dateTime={featured.date}>{featured.date}</time>
                  <span className={styles.metaDot} aria-hidden="true" />
                  <span>
                    <HiClock aria-hidden="true" style={{ display: 'inline', marginRight: 4 }} />
                    {featured.readTime} min read
                  </span>
                </div>

                <h2 className={styles.featuredTitle}>{featured.title}</h2>
                <p className={styles.featuredExcerpt}>{featured.excerpt}</p>

                <span className={styles.featuredReadMore} aria-hidden="true">
                  Read Article <HiArrowRight />
                </span>

                <div className={styles.featuredAuthor}>
                  <div className={styles.authorAvatar} aria-hidden="true">
                    {initials(featured.author.name)}
                  </div>
                  <div>
                    <p className={styles.authorName}>{featured.author.name}</p>
                    <p className={styles.authorRole}>{featured.author.role}</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className={styles.gridSection} aria-label={`${active === 'All' ? 'All' : active} blog posts`}>
        <div className={styles.gridInner}>
          <div className={styles.gridHeader}>
            <h2 className={styles.gridTitle}>
              {active === 'All' ? 'All Articles' : active}
            </h2>
            <span className={styles.gridCount} aria-live="polite" aria-atomic="true">
              {filtered.length} {filtered.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          <ul className={styles.grid} role="list">
            {filtered.length === 0 ? (
              <li className={styles.emptyState}>No posts in this category yet.</li>
            ) : (
              filtered.map((post) => (
                <li key={post.slug} role="listitem">
                  <Link
                    href={`/blog/${post.slug}`}
                    className={styles.card}
                    aria-label={`${post.title} — ${post.category}, ${post.readTime} min read`}
                  >
                    <div className={styles.cardImageBlock} aria-hidden="true">
                      <div className={styles.cardImageBg} />
                      <div className={styles.cardImagePattern} />
                      <span className={styles.cardCategory}>{post.category}</span>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.cardMeta}>
                        <HiCalendar size={12} aria-hidden="true" />
                        <time dateTime={post.date}>{post.date}</time>
                        <span aria-hidden="true">·</span>
                        <HiClock size={12} aria-hidden="true" />
                        <span>{post.readTime} min</span>
                      </div>

                      <h3 className={styles.cardTitle}>{post.title}</h3>
                      <p className={styles.cardExcerpt}>{post.excerpt}</p>

                      <div className={styles.cardFooter}>
                        <div className={styles.cardAuthor}>
                          <div className={styles.cardAvatarSmall} aria-hidden="true">
                            {initials(post.author.name)}
                          </div>
                          <span className={styles.cardAuthorName}>{post.author.name}</span>
                        </div>
                        <div className={styles.cardArrow} aria-hidden="true">
                          <HiArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      </section>
    </>
  );
}
