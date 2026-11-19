import JsonLd from '@/components/seo/JsonLd';
import { faqPage, itemList, pageGraph } from '@/lib/schema';
import { FAQ_ITEMS, HOME_PAGE_DESCRIPTION, HOME_PAGE_NAME } from '@/components/home/data';
import Hero from '@/components/flagship/Hero';
import ServiceIndex from '@/components/flagship/ServiceIndex';
import Work from '@/components/flagship/Work';
import Approach from '@/components/flagship/Approach';
import Proof from '@/components/flagship/Proof';
import CloseBand from '@/components/flagship/CloseBand';
import { Faq } from '@/components/flagship/Acts';
import { CLIENTS_LINE, LAYERS, WORK } from '@/components/flagship/content';

/*
 * Homepage (Nov 2026 simplify pass). The live site's purpose in five sections
 * between the Backbone hero and the ask, in the order a visitor's questions
 * come: what you build, proof, how it works, why you, and the common questions.
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
    faqPage(FAQ_ITEMS, { path: '/', name: 'Questions agencies ask' }),
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeGraph} />
      <Hero />
      <ServiceIndex />
      <Work />
      <Approach />
      <Proof />
      <Faq items={FAQ_ITEMS} />
      {/* The hero already carries the approved quote; the close names clients with published case studies. */}
      <CloseBand proofLine={CLIENTS_LINE} />
    </>
  );
}
