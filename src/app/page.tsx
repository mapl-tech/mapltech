import JsonLd from '@/components/seo/JsonLd';
import { faqPage, itemList, pageGraph } from '@/lib/schema';
import { FAQ_ITEMS, HOME_PAGE_DESCRIPTION, HOME_PAGE_NAME } from '@/components/home/data';
import Hero from '@/components/flagship/Hero';
import Statement from '@/components/flagship/Statement';
import ServiceIndex from '@/components/flagship/ServiceIndex';
import Work from '@/components/flagship/Work';
import Approach from '@/components/flagship/Approach';
import Proof from '@/components/flagship/Proof';
import CloseBand from '@/components/flagship/CloseBand';
import { Faq, Founders } from '@/components/flagship/Acts';
import { LAYERS, WORK } from '@/components/flagship/content';

/*
 * Homepage (Nov 2026 award pass). The live site's purpose and sections,
 * restaged: the Backbone hero, the launch-week statement, the services index,
 * selected work, how we embed, proof, the founders, answers, and the ask.
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

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeGraph} />
      <Hero />
      <Statement />
      <ServiceIndex />
      <Work />
      <Approach />
      <Proof />
      <Founders />
      <Faq items={FAQ_ITEMS} />
      <CloseBand />
    </>
  );
}
