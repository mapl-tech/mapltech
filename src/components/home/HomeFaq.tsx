import Link from 'next/link';
import Accordion from '@/components/ui/Accordion';
import { keepTogether } from '@/components/services/keepTogether';
import type { FaqEntry } from './data';
import styles from './HomeFaq.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * The five questions agencies ask, on the native <details name="faq">
 * accordion (interaction #11), the first one open as on every FAQ on the site. Answers are always in the HTML; the same array
 * feeds the FAQPage JSON-LD in page.tsx (plain `answer` text there, the
 * scannable `list` form here when an answer carries several figures). An
 * answer that points somewhere (the price: the estimator, the brief) ends on
 * those links, so it is never a dead end. "20-minute" and price ranges never
 * split across lines (keepTogether: a no-wrap span, the same characters).
 */
function ListAnswer({ list }: { list: NonNullable<FaqEntry['list']> }) {
  return (
    <>
      <p className={styles.lead}>{keepTogether(list.lead)}</p>
      <ul className={styles.points} role="list">
        {list.points.map((point) => (
          <li key={point}>{keepTogether(point)}</li>
        ))}
      </ul>
      {list.close ? <p className={styles.close}>{keepTogether(list.close)}</p> : null}
    </>
  );
}

function Actions({ actions }: { actions: NonNullable<FaqEntry['actions']> }) {
  return (
    <p className={styles.actions}>
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={styles.action}
          data-cta-placement={`home_faq_${action.href.startsWith('/pricing') ? 'estimate' : 'project'}`}
        >
          {action.label}
          <span aria-hidden="true" className={styles.arrow}>
            <Arrow />
          </span>
        </Link>
      ))}
    </p>
  );
}

export default function HomeFaq({ items }: { items: readonly FaqEntry[] }) {
  return (
    <Accordion
      name="faq"
      defaultOpen={0}
      items={items.map((item, i) => {
        const body = item.list ? <ListAnswer list={item.list} /> : <p className={styles.text}>{keepTogether(item.answer)}</p>;
        return {
          id: `faq-${i + 1}`,
          question: item.question,
          answer: (
            <>
              {body}
              {item.actions ? <Actions actions={item.actions} /> : null}
            </>
          ),
        };
      })}
    />
  );
}
