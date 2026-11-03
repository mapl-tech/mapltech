/**
 * Shared chrome constants for Header / MobileNav / Footer.
 *
 * CTA vocabulary (Nov 2026, the live site's purpose restored): primary
 * "Start a project" → /contact-us; pricing is the secondary path for visitors
 * who want numbers first. Every link label below is an existing route label;
 * nothing is invented.
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

/** The estimator on /pricing (blog posts link here when no service matches). */
export const ESTIMATE_HREF = '/pricing#estimator';

/** `tel:` href from a display number such as "+1 (647) 375-6724". */
export const telHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, '')}`;

export interface ChromeLink {
  label: string;
  href: string;
}

/** Footer · "Services": the four service lines and their prices. */
export const FOOTER_SERVICES: readonly ChromeLink[] = [
  { label: 'Web Development', href: '/services/web-development' },
  { label: 'Automation & AI', href: '/services/automation-ai-workflow-setup' },
  { label: 'Custom Internal Tools', href: '/services/custom-internal-tools' },
  { label: 'Cloud Engineering', href: '/services/cloud-engineering' },
  { label: 'Pricing', href: '/pricing' },
];

/** Footer · "Company": who we are, the work, and the ways to join or refer. */
export const FOOTER_COMPANY: readonly ChromeLink[] = [
  { label: 'About MAPL TECH', href: '/about-us' },
  { label: 'Our work', href: '/our-work' },
  { label: 'Team', href: '/team' },
  { label: 'Careers', href: '/careers' },
  { label: 'Blog', href: '/blog' },
  { label: 'Referral program', href: '/referral' },
];

/** Footer · "Offices": the three country pages. */
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
