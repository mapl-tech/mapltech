import type { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/data/blog-posts';
import { listedProjects, siteConfig } from '@/config/site';
import { SERVICE_META } from '@/lib/estimate';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import { SERVICE_KEYS, SERVICE_NAMES } from '@/components/editorial/services';
import NotFoundHint, { BrokenLinkReport, type HintPage } from '@/components/editorial/NotFoundHint';
import styles from '@/components/editorial/NotFound.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * The site-wide 404 (any unmatched URL and every notFound() call), kept light:
 * no WebGL and no script beyond the path-aware hint and the report link. Very
 * large numerals under the page light (smaller on phones, so a destination is
 * in the first screen), a plain sentence as the H1, the path-aware hint in a
 * reserved line, the one primary action and the way home, then the six places
 * people usually want, as plain rows, and a way to report the broken link.
 * The ask is the page's own close (`data-page-close`): the footer drops its
 * ask and the phone bar stands down beside it. The hint gets the real service
 * and case study pages (slug and name only), so a mistyped /services/... or
 * /our-work/... link can point to the page it nearly was. Next.js marks the
 * response noindex.
 */

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'This page does not exist or has moved. Find MAPL TECH services, work, public pricing, the blog, or send a project brief.',
  // Replace the root layout's "index, follow" and homepage canonical: a 404 has neither.
  robots: { index: false, follow: true },
  alternates: { canonical: null },
};

const PLACES = [
  { href: '/services', name: 'Services', note: `${SERVICE_NAMES.join(', ')}.` },
  { href: '/our-work', name: 'Work', note: 'Projects we can show.' },
  { href: '/pricing', name: 'Pricing', note: 'The public price list and the estimator.' },
  { href: '/blog', name: 'Blog', note: `${blogPosts.length} practical articles for agencies.` },
  { href: '/about-us', name: 'About', note: 'Who we are, in Toronto, Lagos and Kingston.' },
  { href: '/contact-us', name: 'Contact', note: 'Send a brief, email or call.' },
] as const;

/** The pages a mistyped link most likely meant: the four services and every listed case study. */
const SERVICE_PAGES: HintPage[] = SERVICE_KEYS.map((key) => ({ slug: SERVICE_META[key].slug, name: SERVICE_META[key].label }));
const CASE_PAGES: HintPage[] = listedProjects().map((project) => ({ slug: project.slug, name: project.title }));

export default function NotFound() {
  return (
    <section className={styles.page} aria-labelledby="nf-title">
      <div className={styles.light} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.stage}>
          <p className={styles.numerals} aria-hidden="true">
            <span>4</span>
            <span className={styles.zero}>0</span>
            <span>4</span>
          </p>

          <div className={styles.copy}>
            <p className={styles.label}>Error 404</p>
            <h1 id="nf-title" className={styles.title}>
              We can&rsquo;t find that page.
            </h1>
            <p className={styles.lede}>
              The link may be out of date, or the page has moved. These are the places most people are looking for.
            </p>
            <NotFoundHint services={SERVICE_PAGES} cases={CASE_PAGES} />
            <div className={styles.actions} data-hero-cta="" data-page-close="">
              <Link href={PROJECT_HREF} className={styles.primary} data-cta-placement="not_found_project">
                {PROJECT_LABEL}
                <span aria-hidden="true" className={styles.arrow}>
                  <Arrow />
                </span>
              </Link>
              <Link href="/" className={styles.textLink} data-cta-placement="not_found_home">
                Back to the homepage
              </Link>
            </div>
          </div>
        </div>

        <nav className={styles.places} aria-labelledby="nf-places">
          <h2 id="nf-places" className={styles.placesTitle}>
            Where to next
          </h2>
          <ul className={styles.list} role="list">
            {PLACES.map((place) => (
              <li key={place.href} className={styles.place}>
                <span className={styles.placeText}>
                  <Link href={place.href} className={styles.placeName} data-cta-placement={`not_found_${place.name.toLowerCase()}`}>
                    {place.name}
                  </Link>
                  <span className={styles.placeNote}>{place.note}</span>
                </span>
                <span className={styles.placeArrow} aria-hidden="true">
                  <Arrow />
                </span>
              </li>
            ))}
          </ul>
        </nav>
        <BrokenLinkReport email={siteConfig.email} />
      </div>
    </section>
  );
}
