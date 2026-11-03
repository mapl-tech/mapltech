import Accordion from '@/components/ui/Accordion';
import type { FaqEntry } from './data';
import styles from './HomeFaq.module.scss';

/**
 * The five questions agencies ask, on the native <details name="faq">
 * accordion (interaction #11), the first one open as on every FAQ on the site. Answers are always in the HTML; the same array
 * feeds the FAQPage JSON-LD in page.tsx (plain `answer` text there, the
 * scannable `list` form here when an answer carries several figures).
 */
function ListAnswer({ list }: { list: NonNullable<FaqEntry['list']> }) {
  return (
    <>
      <p className={styles.lead}>{list.lead}</p>
      <ul className={styles.points} role="list">
        {list.points.map((point) => (
          <li key={point}>{point}</li>
        ))}
      </ul>
      {list.close ? <p className={styles.close}>{list.close}</p> : null}
    </>
  );
}

export default function HomeFaq({ items }: { items: readonly FaqEntry[] }) {
  return (
    <Accordion
      name="faq"
      defaultOpen={0}
      items={items.map((item, i) => ({
        id: `faq-${i + 1}`,
        question: item.question,
        answer: item.list ? <ListAnswer list={item.list} /> : item.answer,
      }))}
    />
  );
}
