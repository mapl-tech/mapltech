import { useId, type ReactNode } from 'react';
import styles from './Accordion.module.scss';

/**
 * Interaction #11: native accordion on <details name><summary>.
 *
 * No client JS: works as a Server Component. Every answer is in the SSR HTML
 * (crawlable, no mount-on-click). Open/close motion lives in styles/_motion.scss
 * (interpolate-size + ::details-content transition, red rule drawing in).
 */

export interface AccordionItem {
  /** Question text (FAQ style). `title` is accepted as an alias. */
  question?: string;
  title?: string;
  /** Answer body. `content` is accepted as an alias. Strings render as a <p>. */
  answer?: ReactNode;
  content?: ReactNode;
  /** Optional anchor id for deep links (#faq-pricing). */
  id?: string;
}

export interface AccordionProps {
  items: AccordionItem[];
  /**
   * Shared <details name> so only one item is open at a time.
   * Defaults to a unique name per instance; pass `multiple` to allow several.
   */
  name?: string;
  multiple?: boolean;
  /** Index of the item rendered open on first paint. */
  defaultOpen?: number;
  /**
   * An index (1, 2…) before each question, and each answer set under its
   * question rather than under the index. Decorative: hidden from assistive
   * tech, so each question's name is unchanged.
   */
  numbered?: boolean;
  className?: string;
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export default function Accordion({
  items,
  name,
  multiple = false,
  defaultOpen,
  numbered = false,
  className = '',
}: AccordionProps) {
  const autoName = useId();
  const groupName = multiple ? undefined : (name ?? `accordion-${autoName}`);

  return (
    <div className={[styles.accordion, numbered ? styles.numbered : '', className].filter(Boolean).join(' ')}>
      {items.map((item, i) => {
        const question = item.question ?? item.title ?? '';
        const answer = item.answer ?? item.content;
        return (
          <details
            key={item.id ?? `${i}-${question}`}
            id={item.id}
            name={groupName}
            className={`${styles.item} accordion-item`}
            open={defaultOpen === i || undefined}
          >
            <summary className={`${styles.trigger} accordion-summary`}>
              {numbered ? (
                <span className={styles.number} aria-hidden="true">
                  {i + 1}
                </span>
              ) : null}
              <span className={styles.question}>{question}</span>
              <span className={styles.icon} aria-hidden="true">
                <PlusIcon />
              </span>
            </summary>
            <div className={`${styles.content} accordion-content`}>
              {typeof answer === 'string' ? (
                <p className={styles.answer}>{answer}</p>
              ) : (
                <div className={styles.answer}>{answer}</div>
              )}
            </div>
          </details>
        );
      })}
    </div>
  );
}
