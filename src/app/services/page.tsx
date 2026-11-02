import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import ServicesIndex from '@/components/services/ServicesIndex';
import { INDEX_META, LAYER_VIEWS, SERVICES_REVISED, indexMetadata } from '@/components/services/serviceContent';
import { itemList, pageGraph, serviceId } from '@/lib/schema';

/*
 * /services (award pass, Nov 2026): the four service lines as a numbered
 * index, how we work, the partnerships. Copy, prices and sources live in
 * src/components/services/serviceContent.ts.
 *
 * Metadata: unique title, a 140-160 character description that answers "what
 * and how much", self-canonical, full Open Graph. Structured data: the page,
 * its breadcrumb and an ItemList of the four lines (the rows the page shows),
 * each pointing at the Service entity its own page defines (prices live
 * there, beside the tiers).
 */
export const metadata: Metadata = {
  ...indexMetadata(),
  keywords: [
    'MAPL TECH services',
    'engineering services for agencies',
    'white-label development partner',
    'web development for agencies',
    'automation and AI workflows',
    'custom internal tools',
    'cloud engineering for agencies',
  ],
};

const graph = pageGraph({
  path: '/services',
  name: INDEX_META.title,
  description: INDEX_META.description,
  type: 'CollectionPage',
  dateModified: SERVICES_REVISED,
  breadcrumbs: [{ name: 'Services', path: '/services' }],
  nodes: [
    itemList(
      LAYER_VIEWS.map((layer) => ({
        name: layer.name,
        path: layer.path,
        description: layer.summary,
        item: { '@id': serviceId(layer.slug) },
      })),
      { path: '/services', name: 'Four service lines' },
    ),
  ],
});

export default function ServicesHubPage() {
  return (
    <>
      <JsonLd data={graph} />
      <ServicesIndex />
    </>
  );
}
