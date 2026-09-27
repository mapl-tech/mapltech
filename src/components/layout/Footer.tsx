import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site';
import { LiveClocks } from '@/components/ui/TimezoneOverlap';
import MagneticButton from '@/components/ui/MagneticButton';
import NewsletterForm from './NewsletterForm';
import SocialLinks from './SocialLinks';
import {
  CALL_HREF,
  CALL_LABEL,
  ESTIMATE_HREF,
  ESTIMATE_LABEL,
  FOOTER_JOIN,
  FOOTER_START,
  OFFICE_LINKS,
  sentenceCase,
  telHref,
} from './chrome';
import styles from './Footer.module.scss';

/**
 * Destination footer (brief: "Footer CTA / contacts / clocks / Where we work /
 * legal"). Server Component: the only client islands are the three live
 * clocks (interaction #10), the newsletter form and the social icons.
 *
 * Brand block (tagline, description, clocks) → intent columns "Start a
 * project" / "Join the team" / "Say hello" → newsletter → bottom bar.
 * One step darker than the page ground; on phones the bottom padding clears
 * the sticky action bar.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand */}
          <div className={styles.brand}>
            <Link href="/" className={styles.logo} aria-label="MAPL TECH home">
              <Image src="/images/mapl-tech-logo.svg" alt="MAPL TECH" width={150} height={33} sizes="150px" />
            </Link>
            <p className={styles.tagline}>{sentenceCase(siteConfig.tagline)}.</p>
            <p className={styles.description}>{siteConfig.description}</p>
            <div className={styles.clocksBlock}>
              <p className={styles.clocksLabel}>Office hours 09:00–18:00 local, Monday to Friday. Teal dot = open now.</p>
              <LiveClocks className={styles.clocks} />
            </div>
          </div>

          {/* Start a project */}
          <nav className={styles.column} aria-labelledby="footer-start">
            <h2 id="footer-start" className={styles.heading}>
              Start a project
            </h2>
            <div className={styles.columnCta} data-cta-placement="footer_estimate">
              <MagneticButton href={ESTIMATE_HREF} size="small" placement="footer_estimate" className={styles.btn}>
                {ESTIMATE_LABEL}
              </MagneticButton>
            </div>
            <ul className={styles.links}>
              {FOOTER_START.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Join the team */}
          <nav className={styles.column} aria-labelledby="footer-join">
            <h2 id="footer-join" className={styles.heading}>
              Join the team
            </h2>
            <ul className={styles.links}>
              {FOOTER_JOIN.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Say hello */}
          <div className={styles.column}>
            <h2 id="footer-hello" className={styles.heading}>
              Say hello
            </h2>
            <dl className={styles.contact}>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={telHref(siteConfig.phone)}>{siteConfig.phone}</a>
                </dd>
              </div>
            </dl>
            <div className={styles.columnCta} data-cta-placement="footer_call">
              <MagneticButton
                href={CALL_HREF}
                variant="secondary"
                size="small"
                placement="footer_call"
                className={styles.btn}
              >
                {CALL_LABEL}
              </MagneticButton>
            </div>
            <SocialLinks links={siteConfig.social} className={styles.social} />
            <h3 id="footer-where" className={styles.subheading}>
              Where we work
            </h3>
            <nav aria-labelledby="footer-where">
              <ul className={styles.links}>
                {OFFICE_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        {/* Newsletter (existing /api/newsletter) */}
        <section className={styles.newsletter} aria-labelledby="footer-newsletter">
          <div className={styles.newsletterText}>
            <h2 id="footer-newsletter" className={styles.newsletterHeading}>
              Stay in the loop
            </h2>
            <p>Engineering insights, automation tips, and agency infrastructure updates.</p>
          </div>
          <NewsletterForm />
        </section>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {year} MAPL TECH · Toronto · Lagos · Kingston
          </p>
          <ul className={styles.bottomLinks} aria-label="Legal">
            <li>
              <Link href="/privacy">Privacy</Link>
            </li>
            <li>
              <Link href="/terms">Terms</Link>
            </li>
            <li>
              <Link href="/blog">Blog</Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
