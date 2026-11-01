/**
 * Old service paths that some blog posts (and so possibly other sites) still
 * link to; each 404s. next.config.ts redirects them permanently, and the blog
 * template rewrites them in post HTML so the site never links through a
 * redirect. No imports: next.config.ts reads this at build time.
 */
export const LEGACY_LINKS: Readonly<Record<string, string>> = {
  '/services/automation-ai': '/services/automation-ai-workflow-setup',
  '/services/automation': '/services/automation-ai-workflow-setup',
  '/services/internal-tools': '/services/custom-internal-tools',
  '/services/internal-tools-portals': '/services/custom-internal-tools',
};
