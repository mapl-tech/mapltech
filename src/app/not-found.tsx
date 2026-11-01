import type { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/data/blog-posts';
import { ESTIMATE_HREF, ESTIMATE_LABEL } from '@/components/layout/chrome';
import LightField from '@/components/flagship/LightField';
import { SERVICE_NAMES } from '@/components/editorial/services';
import NotFoundHint from '@/components/editorial/NotFoundHint';
import styles from '@/components/editorial/NotFound.module.scss';

/**
 * The site-wide 404 (any unmatched URL and every notFound() call). Plain words,
 * the six places people usually want, the primary action, and a way home.
 * Type-led on the dark ground, lit by the homepage's crimson light field: the
 * "404" is the surface and its red outline, offset behind, the structure.
 * Next.js marks the response noindex.
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
  { href: '/our-work', name: 'Work', note: 'Projects that carry our name.' },
  { href: '/pricing', name: 'Pricing', note: 'The public price list and the estimator.' },
  { href: '/blog', name: 'Blog', note: `${blogPosts.length} practical articles for agencies.` },
  { href: '/about-us', name: 'About', note: 'Who we are, in Toronto, Lagos and Kingston.' },
  { href: '/contact-us', name: 'Contact', note: 'Send a brief, email or call.' },
] as const;

export default function NotFound() {
  return (
    <section className={styles.page} aria-labelledby="nf-title">
      <LightField className={styles.light} focusX={0.78} focusY={0.4} portraitX={0.42} portraitY={0.14} intensity={0.85} still />
      <div className={styles.grid}>
        <p className={styles.numerals} aria-hidden="true">
          <span className={styles.surface}>404</span>
          <span className={styles.structure}>404</span>
        </p>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>
            <span>Error 404</span>
          </p>
          <h1 id="nf-title" className={styles.title}>
            We can&rsquo;t find that page.
          </h1>
          <p className={styles.lede}>
            The link may be out of date, or the page has moved. These are the places most people are looking for.
          </p>
          <NotFoundHint />
          <div className={styles.actions}>
            <Link href={ESTIMATE_HREF} className={styles.primary} data-cta-placement="not_found_estimate">
              {ESTIMATE_LABEL}
            </Link>
            <Link href="/" className={styles.textLink}>
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
                <Link href={place.href} className={styles.placeName}>
                  {place.name}
                </Link>
                <span className={styles.placeNote}>{place.note}</span>
              </span>
              <span className={styles.placeArrow} aria-hidden="true">
                →
              </span>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
