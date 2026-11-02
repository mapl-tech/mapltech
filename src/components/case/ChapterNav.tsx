'use client';

import { useEffect, useState } from 'react';
import styles from './Case.module.scss';

/**
 * Sticky chapter index for the case story (desktop). The chapter nearest the
 * middle of the viewport is marked current; links are plain fragment anchors
 * (the site's smooth-scroll handler clears the fixed header).
 */
export default function ChapterNav({ chapters }: { chapters: readonly { id: string; label: string }[] }) {
  const [active, setActive] = useState(chapters[0]?.id);

  useEffect(() => {
    const targets = chapters.map((c) => document.getElementById(c.id)).filter((el): el is HTMLElement => !!el);
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [chapters]);

  return (
    <nav className={styles.chapters} aria-label="Case study chapters">
      <ol>
        {chapters.map((chapter, i) => (
          <li key={chapter.id}>
            <a href={`#${chapter.id}`} aria-current={active === chapter.id ? 'location' : undefined}>
              <span className={styles.chapterIndex} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              {chapter.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
