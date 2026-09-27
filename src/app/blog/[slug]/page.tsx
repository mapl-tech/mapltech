import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import { blogPosting, pageGraph } from '@/lib/schema';
import { getPostBySlug, getRelatedPosts, blogPosts } from '@/data/blog-posts';
import ReadingProgress from '@/components/ui/ReadingProgress';
import BlogPostLayout from '@/components/convert/BlogPostLayout';
import { topicSlug } from '@/components/convert/blog-utils';

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

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const index = blogPosts.findIndex((entry) => entry.slug === slug);
  const newer = index > 0 ? blogPosts[index - 1] : undefined;
  const older = index >= 0 ? blogPosts[index + 1] : undefined;
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
            { name: post.category, path: `/blog?topic=${topicSlug(post.category)}` },
            { name: post.title, path },
          ],
          nodes: [blogPosting(post)],
        })}
      />

      {/* The only chrome motion on posts (existing component) */}
      <ReadingProgress />

      <BlogPostLayout post={post} newer={newer} older={older} related={related} />
    </>
  );
}
