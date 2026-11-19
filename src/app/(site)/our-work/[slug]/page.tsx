import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import JsonLd from '@/components/seo/JsonLd';
import CaseStudy from '@/components/case/CaseStudy';
import { findStory } from '@/components/case/stories';
import { findEntry, findProject, workEntries } from '@/components/work/work-data';
import { absoluteUrl, routeLastModified } from '@/config/routes';
import { creativeWork, pageGraph } from '@/lib/schema';

/**
 * /our-work/[slug]: one case study per listed project (hidden projects get no
 * page). Content comes from src/components/case/stories.ts, where every
 * sentence is sourced; the template omits any section a story does not have.
 */

interface Params {
  slug: string;
}

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return workEntries().map((entry) => ({ slug: entry.slug }));
}

/** Search and AI snippets get the one-line outcome, cut on a word boundary. */
function snippet(text: string, max = 158): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,:;]$/, '')}…`;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = findEntry(slug);
  if (!entry) return {};
  const story = findStory(slug);
  const client = story?.client ?? entry.title;
  const title = `${client} case study | MAPL TECH`;
  const description = snippet(story?.headline ?? entry.description);
  const image = story?.media?.desktop ?? entry.image;
  const url = absoluteUrl(entry.path);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: 'MAPL TECH',
      images: [{ url: image, alt: story?.media?.alt ?? `${client}, built by MAPL TECH` }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const entry = findEntry(slug);
  const project = findProject(slug);
  const story = findStory(slug);
  if (!entry || !project || !story) notFound();

  // Three more cases after the ask: the same service line first, then the rest, each in display
  // order from this case onward (wrapping), so every case links on to different ones.
  const entries = workEntries();
  const at = entries.findIndex((e) => e.slug === slug);
  const others = [...entries.slice(at + 1), ...entries.slice(0, at)].filter((e) => e.slug !== slug);
  const related = [...others.filter((e) => e.service === entry.service), ...others.filter((e) => e.service !== entry.service)]
    .slice(0, 3)
    .map((e) => ({ entry: e, story: findStory(e.slug) }));

  const graph = pageGraph({
    path: entry.path,
    name: `${story.client} case study`,
    description: story.headline,
    type: 'ItemPage',
    image: story.media?.desktop ?? entry.image,
    dateModified: routeLastModified('/our-work'),
    breadcrumbs: [
      { name: 'Work', path: '/our-work' },
      { name: story.client, path: entry.path },
    ],
    nodes: [creativeWork(project, { path: entry.path })],
  });

  return (
    <>
      <JsonLd data={graph} />
      <CaseStudy entry={entry} story={story} related={related} />
    </>
  );
}
