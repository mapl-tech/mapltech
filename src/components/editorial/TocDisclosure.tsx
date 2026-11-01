import type { TocItem } from './ArticleToc';
import styles from './Toc.module.scss';

/**
 * The contents list for phones and tablets: a native disclosure in the flow,
 * closed by default so the opening paragraph stays near the top. Server
 * rendered, no script; the desktop rail (ArticleToc) takes over on wide screens.
 */
export default function TocDisclosure({ items, label = 'In this article' }: { items: readonly TocItem[]; label?: string }) {
  return (
    <details className={styles.disclosure}>
      <summary className={styles.summary}>
        <span className={styles.summaryLabel}>{label}</span>
        <span className={styles.summaryCount}>
          {items.length} sections
          <span className={styles.chevron} aria-hidden="true" />
        </span>
      </summary>
      <ol className={styles.disclosureList} role="list">
        {items.map((item, index) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className={styles.disclosureLink}>
              <span className={styles.disclosureIndex} aria-hidden="true">
                {index + 1}
              </span>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
