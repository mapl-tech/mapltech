import Link from 'next/link';
import { siteConfig } from '@/config/site';
import MagneticButton from '@/components/ui/MagneticButton';
import NewsletterForm from './NewsletterForm';
import SocialLinks from './SocialLinks';
import { CALL_HREF, CALL_LABEL, ESTIMATE_HREF, ESTIMATE_LABEL, FOOTER_JOIN, FOOTER_START, OFFICE_LINKS, telHref } from './chrome';
import styles from './Footer.module.scss';

/**
 * Footer (flagship redesign). Server Component; the only client islands are
 * the newsletter form and the social icons.
 *
 * Order: the one ask (same label as everywhere; hidden on pages that end on
 * their own close section, marked `data-page-close`) → sitemap columns for the
 * diligent and the lost (Sentinel mega-footer) → newsletter → legal → the
 * wordmark set at composition scale, the last thing on every page.
 * One step darker than the page ground; on phones the bottom padding clears
 * the sticky action bar.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.ask}>
          <p className={styles.askLine}>Have a build your clients are waiting on?</p>
          <div className={styles.askActions}>
            <span data-cta-placement="footer_estimate">
              <MagneticButton href={ESTIMATE_HREF} size="medium" placement="footer_estimate">
                {ESTIMATE_LABEL}
              </MagneticButton>
            </span>
            <Link href={CALL_HREF} className={styles.askLink} data-cta-placement="footer_call">
              {CALL_LABEL}
            </Link>
          </div>
        </div>

        <div className={styles.columns}>
          <nav className={styles.column} aria-labelledby="footer-services">
            <h2 id="footer-services" className={styles.heading}>
              Build with us
            </h2>
            <ul role="list">
              {FOOTER_START.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.column} aria-labelledby="footer-company">
            <h2 id="footer-company" className={styles.heading}>
              Company
            </h2>
            <ul role="list">
              {FOOTER_JOIN.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
              <li>
                <Link href="/blog">Blog</Link>
              </li>
            </ul>
          </nav>

          <nav className={styles.column} aria-labelledby="footer-offices">
            <h2 id="footer-offices" className={styles.heading}>
              Where we work
            </h2>
            <ul role="list">
              {OFFICE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.column}>
            <h2 className={styles.heading}>Say hello</h2>
            <ul role="list">
              <li>
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </li>
              <li>
                <a href={telHref(siteConfig.phone)}>{siteConfig.phone}</a>
              </li>
              <li>
                <Link href="/contact-us">Contact form</Link>
              </li>
            </ul>
            <SocialLinks links={siteConfig.social} className={styles.social} />
          </div>
        </div>

        <div className={styles.newsletter}>
          <div>
            <h2 className={styles.newsTitle}>Engineering notes, monthly</h2>
            <p className={styles.newsText}>What we shipped, what broke, and what we would do differently. No fluff.</p>
          </div>
          <NewsletterForm />
        </div>

        <div className={styles.legal}>
          <p>
            © {year} MAPL TECH Inc. Toronto · Lagos · Kingston
          </p>
          <ul role="list">
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
            <li>
              <a href="/llms.txt">llms.txt</a>
            </li>
            <li>
              <a href="/sitemap.xml">Sitemap</a>
            </li>
          </ul>
        </div>
      </div>

      {/* A logotype, set as generated content: decoration has no text in the
          DOM (WCAG exempts logotypes from contrast; automated checks then agree). */}
      <div className={styles.wordmark} aria-hidden="true" data-text={siteConfig.name} />
    </footer>
  );
}
