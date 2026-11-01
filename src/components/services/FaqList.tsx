import { keepTogether } from './keepTogether';
import styles from './ServicePage.module.scss';

export interface FaqEntry {
  question: string;
  /** Plain text: what the FAQPage JSON-LD carries, and the visible answer unless `list` is set. */
  answer: string;
  /** The same words in the homepage FAQ's list form: a lead sentence, one figure per line, a close. */
  list?: { lead: string; points: readonly string[]; close?: string };
}

/** The direct answer (first sentence) and the detail after it. Same words, same order as the JSON-LD. */
function splitAnswer(answer: string): [string, string] {
  const match = answer.match(/^([\s\S]+?[.?!])\s+(?=[A-Z0-9$])([\s\S]+)$/);
  return match ? [match[1], match[2]] : [answer, ''];
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Service FAQ on native <details name> (one open at a time, no client JS).
 * Every answer is in the server HTML whether open or closed, and the page
 * builds its FAQPage JSON-LD from the same array, so they cannot disagree.
 * The first answer (always the price question) starts open. Open/close motion
 * and the red rule come from the global `accordion-*` hooks in _motion.scss.
 */
/** Answer first: the first sentence at full ink, the detail at body tone. */
function AnswerText({ item }: { item: FaqEntry }) {
  if (item.list) {
    return (
      <div className={styles.faqAnswer}>
        <p className={styles.faqLead}>{keepTogether(item.list.lead)}</p>
        <ul className={styles.faqPoints} role="list">
          {item.list.points.map((point) => (
            <li key={point}>{keepTogether(point)}</li>
          ))}
        </ul>
        {item.list.close ? <p>{keepTogether(item.list.close)}</p> : null}
      </div>
    );
  }
  const [lead, rest] = splitAnswer(item.answer);
  return (
    <p className={styles.faqAnswer}>
      <span className={styles.faqLead}>{keepTogether(lead)}</span>
      {rest ? <> {keepTogether(rest)}</> : null}
    </p>
  );
}

export default function FaqList({ items, name = 'faq' }: { items: readonly FaqEntry[]; name?: string }) {
  return (
    <div className={styles.faqList}>
      {items.map((item, i) => (
        <details
          key={item.question}
          id={`${name}-${i + 1}`}
          name={name}
          className={`${styles.faqItem} accordion-item`}
          open={i === 0 || undefined}
        >
          <summary className={`${styles.faqSummary} accordion-summary`}>
            <h3 className={styles.faqQuestion}>{item.question}</h3>
            <span className={styles.faqIcon} aria-hidden="true">
              <PlusIcon />
            </span>
          </summary>
          <div className="accordion-content">
            <AnswerText item={item} />
          </div>
        </details>
      ))}
    </div>
  );
}
