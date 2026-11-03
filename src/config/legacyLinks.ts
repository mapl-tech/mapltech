/**
 * Old paths that some blog posts (and so possibly other sites) still link to:
 * old service URLs, and /labs, retired in Nov 2026 (its one live product,
 * MAPL Tours, is a case study). next.config.ts redirects them permanently,
 * and the blog template rewrites them in post HTML so the site never links
 * through a redirect. No imports: next.config.ts reads this at build time.
 */
export const LEGACY_LINKS: Readonly<Record<string, string>> = {
  '/services/automation-ai': '/services/automation-ai-workflow-setup',
  '/services/automation': '/services/automation-ai-workflow-setup',
  '/services/internal-tools': '/services/custom-internal-tools',
  '/services/internal-tools-portals': '/services/custom-internal-tools',
  '/labs': '/our-work/mapl-tours',
  // Common guesses at this site's pages (and other sites' conventions), so a
  // typed or remembered address lands on the page instead of the 404.
  '/contact': '/contact-us',
  '/about': '/about-us',
  '/work': '/our-work',
  '/portfolio': '/our-work',
  '/privacy-policy': '/privacy',
  '/terms-of-service': '/terms',
  '/home': '/',
};
