import JsonLd from '@/components/seo/JsonLd';
import { faqPage, itemList, pageGraph } from '@/lib/schema';
import { FAQ_ITEMS, HOME_PAGE_DESCRIPTION, HOME_PAGE_NAME } from '@/components/home/data';
import Hero from '@/components/flagship/Hero';
import ProofStrip from '@/components/flagship/ProofStrip';
import Problem from '@/components/flagship/Problem';
import Layers from '@/components/flagship/Layers';
import XRay from '@/components/flagship/XRay';
import WorkStack from '@/components/flagship/WorkStack';
import { Close, Faq, Founders, Silence, Spotlight } from '@/components/flagship/Acts';
import { LAYERS, WORK } from '@/components/flagship/content';
import { siteGraph } from '@/lib/schema';

/*
 * Homepage, flagship redesign (Nov 2026). Grammar "Surface -> Structure":
 * every act shows a finished surface, then the structure that makes it true.
 * The brief, feeling curve and score live in the Scrollcraft BRIEF.md; the
 * Sentinel build spec in SENTINEL-SPEC.md (memory/redesign-artifacts).
 *
 * Metadata: inherited from the root layout (title, description, canonical
 * https://mapltech.com). Structured data: one page graph with the services
 * ItemList, the shown case studies and the FAQPage built from the same items
 * the page renders, so the markup and the JSON-LD can never disagree.
 */
const homeGraph = pageGraph({
  path: '/',
  name: HOME_PAGE_NAME,
  description: HOME_PAGE_DESCRIPTION,
  nodes: [
    itemList(
      LAYERS.map((layer) => ({ name: layer.name, path: layer.href, description: layer.summary })),
      { path: '/', name: 'Services' },
    ),
    itemList(
      WORK.map((card) => ({ name: card.client, path: card.href, description: card.outcome })),
      { path: '/', name: 'Work we can show' },
    ),
    faqPage(FAQ_ITEMS, { path: '/', name: 'Diligence answers' }),
  ],
});

/** Every schema.org type in the site + page graphs, most frequent first (server-side, for the X-ray). */
function schemaTypesOf(...graphs: unknown[]): string[] {
  const counts = new Map<string, number>();
  const visit = (node: unknown) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach(visit);
    const type = (node as Record<string, unknown>)['@type'];
    for (const t of Array.isArray(type) ? type : type ? [type] : []) {
      if (typeof t === 'string') counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    Object.values(node).forEach(visit);
  };
  graphs.forEach(visit);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
}

const XRAY_STATIC = { schemaTypes: schemaTypesOf(siteGraph(), homeGraph), faqCount: FAQ_ITEMS.length };

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeGraph} />
      <Hero />
      <ProofStrip />
      <Problem />
      <Layers />
      <Silence />
      <XRay initial={XRAY_STATIC} />
      <WorkStack />
      <Spotlight />
      <Founders />
      <Faq items={FAQ_ITEMS} />
      <Close />
    </>
  );
}
