import type { Metadata } from 'next';
import BlogGrid from '@/components/ui/BlogGrid';
import BlurReveal from '@/components/ui/BlurReveal';
import styles from '@/styles/blog.module.scss';
import { blogPosts } from '@/data/blog-posts';

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

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Blog',
  name: 'MAPL TECH Blog',
  description: 'Engineering insights on AI automation, web development, and custom internal tools.',
  url: 'https://mapltech.com/blog',
  publisher: {
    '@type': 'Organization',
    name: 'MAPL TECH',
    url: 'https://mapltech.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://mapltech.com/images/mapl-tech-logo.svg',
    },
  },
  blogPost: blogPosts.map((post) => ({
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: post.author.name,
      jobTitle: post.author.role,
    },
    url: `https://mapltech.com/blog/${post.slug}`,
  })),
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <BlurReveal>
            <span className={styles.heroLabel}>MAPL TECH Blog</span>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <h1 className={styles.heroTitle}>
              Engineering Insights,<br />Published Weekly
            </h1>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <p className={styles.heroSubtitle}>
              Practical articles on AI automation, web development, and custom
              internal tools - written by the engineers building them.
            </p>
          </BlurReveal>
        </div>
      </header>

      {/* Filterable grid (client component) */}
      <BlogGrid />
    </>
  );
}
