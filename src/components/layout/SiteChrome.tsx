import type { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SmoothScroll from '@/components/ui/SmoothScroll';
import MobileActionBar from '@/components/ui/MobileActionBar';

/**
 * The main site's frame around a page: the skip link, Lenis, the header, the
 * <main> landmark, the footer and the phone action bar. The (site) route
 * group's layout and the site-wide 404 use it; the root layout holds only
 * what every page needs (fonts, analytics, the Organization graph), so a
 * funnel page such as bio.mapltech.com (src/app/bio) can bring its own,
 * quieter frame.
 */
export default function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-to-content">
        Skip to main content
      </a>
      {/* Lenis substrate: desktop, fine pointer, motion allowed. Renders no HTML. */}
      <SmoothScroll />
      <Header />
      <main id="main" tabIndex={-1}>
        {children}
      </main>
      <Footer />
      {/* Mobile sticky action bar (md:hidden): estimate + call, shown once the hero CTA scrolls out. */}
      <MobileActionBar />
    </>
  );
}
