'use client';

import { useEffect, useState } from 'react';
import BookButton from './BookButton';
import styles from './Bio.module.scss';

/**
 * Phones only (CSS): one full-width "Book my call" pinned in the thumb zone
 * once the hero's button has scrolled away, gone again when the closing ask
 * comes into view (it is the page's own last ask, and the bar would sit on
 * the footer after it). While the form is open the bar is hidden too (CSS).
 * Hidden means `inert`: never a stray tab stop. The bar owns that attribute
 * (data-own-inert), so the open form, which makes the rest of the page inert,
 * leaves it alone and never gives a hidden bar its tab stop back.
 */
export default function StickyBar() {
  const [heroPassed, setHeroPassed] = useState(false);
  const [closeReached, setCloseReached] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('[data-bio-hero-cta]');
    const close = document.querySelector('[data-bio-close]');
    const observers: IntersectionObserver[] = [];
    if (hero) {
      const io = new IntersectionObserver(([entry]) => {
        // Passed = above the viewport, not merely off screen below it.
        setHeroPassed(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      });
      io.observe(hero);
      observers.push(io);
    }
    if (close) {
      const io = new IntersectionObserver(([entry]) => {
        setCloseReached(entry.isIntersecting || entry.boundingClientRect.top < 0);
      });
      io.observe(close);
      observers.push(io);
    }
    return () => observers.forEach((io) => io.disconnect());
  }, []);

  const visible = heroPassed && !closeReached;

  return (
    <div className={styles.stickyBar} data-visible={visible ? '' : undefined} inert={!visible} data-own-inert="">
      <BookButton placement="bio_sticky_bar" className={styles.stickyButton} arrowClassName={styles.arrow} />
    </div>
  );
}
