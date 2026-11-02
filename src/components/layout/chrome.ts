/**
 * Shared chrome constants for Header / MobileNav / Footer.
 *
 * CTA vocabulary (Nov 2026, the live site's purpose restored): primary
 * "Start a project" → /contact-us; the estimator ("Price your project" →
 * /pricing#estimator) is a secondary path for visitors who want numbers first. Every link label below is an existing route label from
 * siteConfig.nav or the current footer; nothing is invented.
 */

/**
 * The one primary action, as on the live site: start a project (the project
 * brief on /contact-us). Same words everywhere: header, drawer, footer, the
 * mobile bar's fallback and the homepage hero.
 */
export const PROJECT_HREF = '/contact-us';
export const PROJECT_LABEL = 'Start a project';

/** Secondary: the public price ranges (estimator on /pricing). */
export const PRICING_HREF = '/pricing';
export const PRICING_LABEL = 'See pricing';

export const ESTIMATE_HREF = '/pricing#estimator';
/** The one primary action, the same words everywhere (Sentinel copy pass, Nov 2026). */
export const ESTIMATE_LABEL = 'Price your project';
/** Compact label for the 56px mobile bar; the accessible name stays the full label. */
export const ESTIMATE_LABEL_COMPACT = 'Price it';

export const CALL_HREF = '/contact-us';
export const CALL_LABEL = 'Book a call';

/** `tel:` href from a display number such as "+1 (647) 375-6724". */
export const telHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, '')}`;

/**
 * siteConfig.tagline is Title Case ("The Engineering Backbone Behind Leading
 * Agencies"); the direction sets display copy in sentence case, as the home H1
 * does. Same words, no proper nouns, so lowercasing the tail is lossless.
 */
export const sentenceCase = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();

export interface ChromeLink {
  label: string;
  href: string;
}

/** Footer · "Start a project" — the four service lines, pricing and the work. */
export const FOOTER_START: readonly ChromeLink[] = [
  { label: 'Web Development', href: '/services/web-development' },
  { label: 'Automation & AI', href: '/services/automation-ai-workflow-setup' },
  { label: 'Custom Internal Tools', href: '/services/custom-internal-tools' },
  { label: 'Cloud Engineering', href: '/services/cloud-engineering' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Client Work', href: '/our-work' },
  { label: 'MAPL Labs', href: '/labs' },
];

/** Footer · "Join the team". */
export const FOOTER_JOIN: readonly ChromeLink[] = [
  { label: 'Careers', href: '/careers' },
  { label: 'Team', href: '/team' },
  { label: 'About MAPL TECH', href: '/about-us' },
  { label: 'Referral Program', href: '/referral' },
];

/** Footer · "Where we work" hub (synthesis §3.5): the three country pages. */
export const OFFICE_LINKS: readonly ChromeLink[] = [
  { label: 'Toronto (HQ)', href: '/about-us' },
  { label: 'MAPL TECH Nigeria', href: '/nigeria' },
  { label: 'MAPL TECH Jamaica', href: '/jamaica' },
];

export const SOCIAL_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  x: 'X',
  facebook: 'Facebook',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
};
