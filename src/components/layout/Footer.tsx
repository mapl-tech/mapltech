import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { CLOSE_BAND } from '@/components/flagship/content';
import MagneticButton from '@/components/ui/MagneticButton';
import FooterLink from './FooterLink';
import NewsletterForm from './NewsletterForm';
import SocialLinks from './SocialLinks';
import { FOOTER_COMPANY, FOOTER_SERVICES, OFFICE_LINKS, PRICING_HREF, PRICING_LABEL, PROJECT_HREF, PROJECT_LABEL, telHref } from './chrome';
import styles from './Footer.module.scss';

/**
 * Footer (flagship redesign). Server Component; the only client islands are
 * the newsletter form and the social icons.
 *
 * Order: the one ask (same label as everywhere; hidden on pages that end on
 * their own close section, marked `data-page-close`) → four plainly named
 * link columns (Services, Company, Offices, Contact) → newsletter → the
 * social row → legal →
 * the wordmark set at composition scale, the last thing on every page.
 * One step darker than the page ground; on phones the bottom padding clears
 * the sticky action bar.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.ask}>
          {/* The homepage close's line (flagship/content.ts CLOSE_BAND), on pages without a close of their own. */}
          <p className={styles.askLine}>{CLOSE_BAND.title}</p>
          <div className={styles.askActions}>
            <span data-cta-placement="footer_project">
              <MagneticButton href={PROJECT_HREF} size="medium" placement="footer_project">
                {PROJECT_LABEL}
              </MagneticButton>
            </span>
            <Link href={PRICING_HREF} className={styles.askLink} data-cta-placement="footer_pricing">
              {PRICING_LABEL}
            </Link>
          </div>
        </div>

        <div className={styles.columns}>
          <nav className={styles.column} aria-labelledby="footer-services">
            <h2 id="footer-services" className={styles.heading}>
              Services
            </h2>
            <ul role="list">
              {FOOTER_SERVICES.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.column} aria-labelledby="footer-company">
            <h2 id="footer-company" className={styles.heading}>
              Company
            </h2>
            <ul role="list">
              {FOOTER_COMPANY.map((link) => (
                <li key={link.href}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.column} aria-labelledby="footer-offices">
            <h2 id="footer-offices" className={styles.heading}>
              Offices
            </h2>
            <ul role="list">
              {OFFICE_LINKS.map((link) => (
                <li key={link.label}>
                  <FooterLink href={link.href}>{link.label}</FooterLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className={styles.column}>
            <h2 className={styles.heading}>Contact</h2>
            <ul role="list">
              <li>
                {/* On a phone's half-width column the address breaks after the @, never mid-domain. */}
                <a href={`mailto:${siteConfig.email}`}>
                  {siteConfig.email.split('@')[0]}@<wbr />
                  {siteConfig.email.split('@')[1]}
                </a>
              </li>
              <li>
                <a href={telHref(siteConfig.phone)}>{siteConfig.phone}</a>
              </li>
              <li>
                <FooterLink href="/contact-us">Contact form</FooterLink>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.newsletter}>
          <div>
            <h2 className={styles.newsTitle}>Get our newsletter</h2>
            <p className={styles.newsText}>Practical notes on websites, automation and software, written for agency teams.</p>
          </div>
          <NewsletterForm />
        </div>

        {/* A full-width row of its own, so the five rings stay on one line at every width. */}
        <div className={styles.follow}>
          <h2 className={styles.heading}>Follow MAPL TECH</h2>
          <SocialLinks links={siteConfig.social} />
        </div>

        <div className={styles.legal}>
          <p>
            © {year} MAPL TECH Inc. <span className={styles.nowrap}>Toronto · Lagos · Kingston</span>
          </p>
          <ul role="list">
            <li>
              <FooterLink href="/privacy">Privacy</FooterLink>
            </li>
            <li>
              <FooterLink href="/terms">Terms</FooterLink>
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
