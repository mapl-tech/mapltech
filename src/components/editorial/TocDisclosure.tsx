'use client';

import { useRef, type MouseEvent } from 'react';
import type { TocItem } from './ArticleToc';
import styles from './Toc.module.scss';

/**
 * The contents list for phones and tablets: a native disclosure in the flow,
 * closed by default so the opening paragraph stays near the top; the desktop
 * rail (ArticleToc) takes over on wide screens. Server rendered and usable
 * before hydration. Once a link inside is used it closes again, before the
 * jump is measured, so the section lands where it should and the list is not
 * left open above it; the jump itself (scroll and focus) is untouched.
 */
export default function TocDisclosure({
  items,
  label = 'In this article',
  tone = 'dark',
}: {
  items: readonly TocItem[];
  label?: string;
  /** Paper for documents set on the light surface (legal pages). */
  tone?: 'dark' | 'paper';
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  // React's handler runs before the document-level smooth-scroll one, so the
  // glide (or the browser's own jump) starts from the closed layout. A
  // modified click opens a new tab and leaves this page as it is.
  const close = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (ref.current) ref.current.open = false;
  };

  return (
    <details ref={ref} className={styles.disclosure} data-tone={tone}>
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
            <a href={`#${item.id}`} className={styles.disclosureLink} onClick={close}>
              <span className={styles.disclosureIndex} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
