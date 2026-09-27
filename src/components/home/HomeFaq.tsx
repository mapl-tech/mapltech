import Accordion from '@/components/ui/Accordion';
import type { FaqEntry } from './data';

/**
 * 08 FAQ: five white-label objections on the native <details name="faq">
 * accordion (interaction #11). Answers are always in the HTML; the same array
 * feeds the FAQPage JSON-LD in page.tsx.
 */
export default function HomeFaq({ items }: { items: readonly FaqEntry[] }) {
  return (
    <Accordion
      name="faq"
      items={items.map((item, i) => ({ id: `faq-${i + 1}`, question: item.question, answer: item.answer }))}
    />
  );
}
