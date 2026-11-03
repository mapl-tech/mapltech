import styles from './Arrow.module.scss';

/**
 * The site's arrow: one drawn shape (a straight shaft and an open head with
 * rounded ends) instead of the font's "→", whose weight and size changed with
 * every typeface and fallback. 1em square, so it scales with the text it sits
 * beside and takes its colour; hidden from assistive tech (the link's words
 * are its name). `up-right` marks links that open another site.
 */
const PATHS = {
  right: 'M2.75 8h10.5M9.25 4.25 13 8l-3.75 3.75',
  left: 'M13.25 8H2.75M6.75 4.25 3 8l3.75 3.75',
  down: 'M8 2.75v10.5M4.25 9.25 8 13l3.75-3.75',
  'up-right': 'M4.25 11.75 11.5 4.5M5.75 4.25h6v6',
} as const;

export type ArrowDirection = keyof typeof PATHS;

export default function Arrow({ direction = 'right', className }: { direction?: ArrowDirection; className?: string }) {
  return (
    <svg
      className={[styles.arrow, className].filter(Boolean).join(' ')}
      viewBox="0 0 16 16"
      width="16"
      height="16"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[direction]} />
    </svg>
  );
}
