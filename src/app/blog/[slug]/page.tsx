import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import { blogPosting, pageGraph } from '@/lib/schema';
import { absoluteUrl, toISODate } from '@/config/routes';
import { getPostBySlug, getRelatedPosts, blogPosts } from '@/data/blog-posts';
import PostArticle from '@/components/editorial/PostArticle';
import { topicSlug } from '@/components/convert/blog-utils';
import { topicLabel } from '@/components/editorial/services';

/**
 * /blog/[slug]: one page per post in src/data/blog-posts.ts, prerendered.
 * Template: src/components/editorial/PostArticle.tsx. Structured data: the
 * WebPage, a Blog > topic > post BreadcrumbList and the BlogPosting, all from
 * the same post object the page renders (the topic crumb carries the same
 * label as the visible trail, topicLabel()).
 */

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

/** Search and AI snippets: the excerpt, cut on a word boundary under 160 characters. */
function snippet(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,:;.\s-]+$/, '')}…`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  const url = absoluteUrl(`/blog/${post.slug}`);
  const description = snippet(post.excerpt);
  const published = toISODate(post.date);

  return {
    // The root template appends " | MAPL TECH".
    title: post.title,
    description,
    alternates: { canonical: url },
    authors: [{ name: post.author.name }],
    openGraph: {
      type: 'article',
      title: post.title,
      description,
      url,
      siteName: 'MAPL TECH',
      publishedTime: published,
      modifiedTime: published,
      authors: [post.author.name],
      section: post.category,
      images: [{ url: post.coverImage, width: 1200, alt: post.coverImageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  // Older / newer by publication date (the data file is not strictly ordered).
  const byDate = [...blogPosts].sort((a, b) => toISODate(b.date).localeCompare(toISODate(a.date)));
  const index = byDate.findIndex((entry) => entry.slug === slug);
  const newer = index > 0 ? byDate[index - 1] : undefined;
  const older = index >= 0 ? byDate[index + 1] : undefined;
  const related = getRelatedPosts(slug, 3);
  const path = `/blog/${post.slug}`;

  return (
    <>
      <JsonLd
        data={pageGraph({
          path,
          name: post.title,
          description: post.excerpt,
          datePublished: post.date,
          dateModified: post.date,
          image: post.coverImage,
          breadcrumbs: [
            { name: 'Blog', path: '/blog' },
            { name: topicLabel(post.category), path: `/blog?topic=${topicSlug(post.category)}` },
            { name: post.title, path },
          ],
          nodes: [blogPosting(post)],
        })}
      />
      <PostArticle post={post} related={related} newer={newer} older={older} />
    </>
  );
}
