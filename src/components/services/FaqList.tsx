import Accordion from '@/components/ui/Accordion';
import { keepTogether } from './keepTogether';
import type { FaqView } from './serviceContent';
import styles from './FaqList.module.scss';

/** The direct answer (first sentence) and the detail after it. Same words, same order as the JSON-LD. */
function splitAnswer(answer: string): [string, string] {
  const match = answer.match(/^([\s\S]+?[.?!])\s+(?=[A-Z0-9$])([\s\S]+)$/);
  return match ? [match[1], match[2]] : [answer, ''];
}

/** Answer first: the first sentence at full ink, the detail at body tone; price answers one figure per line. */
function AnswerText({ item }: { item: FaqView }) {
  if (item.list) {
    return (
      <>
        <p className={styles.lead}>{keepTogether(item.list.lead)}</p>
        <ul className={styles.points} role="list">
          {item.list.points.map((point) => (
            <li key={point}>{keepTogether(point)}</li>
          ))}
        </ul>
        {item.list.close ? <p className={styles.close}>{keepTogether(item.list.close)}</p> : null}
      </>
    );
  }
  const [lead, rest] = splitAnswer(item.answer);
  return (
    <p className={styles.text}>
      <span className={styles.lead}>{keepTogether(lead)}</span>
      {rest ? <> {keepTogether(rest)}</> : null}
    </p>
  );
}

/**
 * A service's FAQ on the homepage's accordion (ui/Accordion: native
 * <details name>, one open at a time, no client JS). Every answer is in the
 * server HTML whether open or closed, and the page builds its FAQPage JSON-LD
 * from the same array, so they cannot disagree. The first answer (the price
 * question) starts open.
 */
export default function FaqList({ items, name }: { items: readonly FaqView[]; name: string }) {
  return (
    <Accordion
      name={name}
      defaultOpen={0}
      items={items.map((item, i) => ({
        id: `${name}-${i + 1}`,
        question: item.question,
        answer: <AnswerText item={item} />,
      }))}
    />
  );
}
