import type { ReactNode } from 'react';
import SiteChrome from '@/components/layout/SiteChrome';

/**
 * Every page of mapltech.com sits in this route group, inside the site's
 * header and footer. The group adds no URL segment. The page transition
 * boundary is this group's template.tsx, so it still wraps the page only,
 * never the header or footer.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
