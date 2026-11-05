/**
 * Full-page captures of each live project (public/images/cases/full),
 * taken November 2026 with reduced motion emulated, cookie and preference
 * dialogs dismissed, and the page scrolled end to end first so lazy media
 * loaded. Desktop at 1440px wide (cropped at 7200px tall); phone at 390px,
 * 2x (cropped at 7000px). They drive the case template's "scroll the real
 * site" section and its phone row, so only sites MAPL TECH built belong here
 * (UNSVCC is absent on purpose: we built its internal dashboard, not its site).
 */
export interface FullCapture {
  src: string;
  width: number;
  height: number;
}

export const FULL_PAGES: Partial<Record<string, { desktop: FullCapture; mobile: FullCapture }>> = {
  'lro-staffing': {
    desktop: { src: '/images/cases/full/lro-desktop.jpg', width: 1440, height: 7200 },
    mobile: { src: '/images/cases/full/lro-mobile.jpg', width: 780, height: 7000 },
  },
  'chha-ncr': {
    desktop: { src: '/images/cases/full/chha-desktop.jpg', width: 1440, height: 7200 },
    mobile: { src: '/images/cases/full/chha-mobile.jpg', width: 780, height: 7000 },
  },
  'mapl-tours': {
    desktop: { src: '/images/cases/full/tours-desktop.jpg', width: 1440, height: 7200 },
    mobile: { src: '/images/cases/full/tours-mobile.jpg', width: 780, height: 7000 },
  },
  'lro-salary-guide': {
    desktop: { src: '/images/cases/full/salary-desktop.jpg', width: 1440, height: 4313 },
    mobile: { src: '/images/cases/full/salary-mobile.jpg', width: 780, height: 7000 },
  },
  'focas-canada': {
    desktop: { src: '/images/cases/full/focas-desktop.jpg', width: 1440, height: 5691 },
    mobile: { src: '/images/cases/full/focas-mobile.jpg', width: 780, height: 7000 },
  },
  'dodo-island-discoveries': {
    desktop: { src: '/images/cases/full/dodo-desktop.jpg', width: 1440, height: 4953 },
    mobile: { src: '/images/cases/full/dodo-mobile.jpg', width: 780, height: 7000 },
  },

};
