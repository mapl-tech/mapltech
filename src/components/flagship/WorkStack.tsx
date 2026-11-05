'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * The work list, measured, so the cards can stack on phones as they do on
 * desktop (Leshan, Nov 5, 2026: "keep the scroll craft animation on mobile").
 * It sets each slot's --h to its card's height and marks the list
 * data-measured; Work.module.scss .slot then sticks a card that is taller
 * than the screen only once its bottom is in view, so every part of it is
 * seen before the next card slides over it. Without JavaScript the list
 * scrolls plainly. A ResizeObserver keeps --h right as images and fonts load
 * and the screen turns.
 */
export default function WorkStack({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const list = ref.current;
    if (!list) return;
    const slots = Array.from(list.children) as HTMLElement[];
    const measure = () => {
      for (const slot of slots) {
        const card = slot.firstElementChild as HTMLElement | null;
        if (card) slot.style.setProperty('--h', `${card.offsetHeight}px`);
      }
      list.dataset.measured = '';
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    for (const slot of slots) if (slot.firstElementChild) observer.observe(slot.firstElementChild);
    return () => observer.disconnect();
  }, []);

  return (
    <ol ref={ref} className={className}>
      {children}
    </ol>
  );
}
