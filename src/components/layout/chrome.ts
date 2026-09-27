/**
 * Shared chrome constants for Header / MobileNav / Footer.
 *
 * CTA vocabulary (brief §2 + WIRE-KIT rulings): primary "Get a 60-second
 * estimate" → /pricing#estimator, secondary "Book a 20-min scoping call" →
 * /contact-us. Every link label below is an existing route label from
 * siteConfig.nav or the current footer; nothing is invented.
 */

export const ESTIMATE_HREF = '/pricing#estimator';
export const ESTIMATE_LABEL = 'Get a 60-second estimate';
/** Compact label for the 56px mobile bar (WIRE-KIT "Shared chrome"). */
export const ESTIMATE_LABEL_COMPACT = 'Estimate';

export const CALL_HREF = '/contact-us';
export const CALL_LABEL = 'Book a 20-min scoping call';

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
