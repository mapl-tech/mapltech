import type { ClientLogo } from '@/components/flagship/HeroClients';

/**
 * The client parade's sizes (ClientParade), kept here so parade.spec.ts can
 * check the seam: the component hands them to its stylesheet as custom
 * properties, so the CSS and the check read the same numbers.
 */

/** A square mark's height in px, smallest (phones) and largest; each logo scales from it. */
export const MARK_MIN = 40;
export const MARK_MAX = 48;
/** The space after every mark, in px, at its smallest. */
export const GAP_MIN = 36;
/**
 * The widest the row gets, in px: the page's 1280px shell less its 40px
 * gutters (ClientParade.module.scss). Below 1024px the row is the screen's
 * width, which is narrower still.
 */
export const ROW_MAX = 1200;
/** One list for assistive tech plus three copies. */
export const COPIES = 4;

/** One list's width at a mark height and gap: every logo at its scale, each followed by the gap. */
export function listWidth(logos: readonly ClientLogo[], mark: number, gap: number): number {
  return logos.reduce((sum, logo) => sum + (mark * logo.scale * logo.width) / logo.height + gap, 0);
}
