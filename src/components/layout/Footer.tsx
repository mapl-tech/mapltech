'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FaInstagram,
  FaXTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaTiktok,
} from 'react-icons/fa6';
import { HiEnvelope, HiPhone, HiMapPin } from 'react-icons/hi2';
import { siteConfig } from '@/config/site';
import styles from './Footer.module.scss';

const socialIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  instagram: FaInstagram,
  x: FaXTwitter,
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
  tiktok: FaTiktok,
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleNewsletterSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNewsletterStatus('sending');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const email = formData.get('email') as string;

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error('Failed to subscribe.');
      }

      setNewsletterStatus('success');
      form.reset();
    } catch {
      setNewsletterStatus('error');
    }
  };

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        <div className={styles.grid}>
          {/* Brand column */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <Image src="/images/mapl-tech-logo.svg" alt="MAPL TECH" width={160} height={35} sizes="160px" />
            </div>
            <p className={styles.description}>
              The engineering backbone behind agencies that refuse to cut corners
              on technology. Headquartered in Canada with branches in Nigeria and Jamaica.
            </p>
            <div className={styles.socialLinks}>
              {Object.entries(siteConfig.social).map(([key, url]) => {
                const Icon = socialIcons[key];
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow MAPL TECH on ${key}`}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Services column */}
          <div className={styles.column}>
            <h4>Services</h4>
            <ul>
              <li>
                <Link href="/services/web-development">Web Development</Link>
              </li>
              <li>
                <Link href="/services/automation-ai-workflow-setup">
                  Automation & AI
                </Link>
              </li>
              <li>
                <Link href="/services/custom-internal-tools">
                  Custom Internal Tools
                </Link>
              </li>
              <li>
                <Link href="/pricing">Pricing</Link>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div className={styles.column}>
            <h4>Company</h4>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/team">Team</Link></li>
              <li><Link href="/our-work">Our Work</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="/referral">Referral Program</Link></li>
            </ul>
          </div>

          {/* Contact column */}
          <div className={styles.column}>
            <h4>Contact</h4>
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <HiEnvelope size={16} aria-hidden="true" />
                <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
              </div>
              <div className={styles.contactItem}>
                <HiPhone size={16} aria-hidden="true" />
                <a href={`tel:${siteConfig.phone}`}>
                  {siteConfig.phone}
                </a>
              </div>
              <div className={styles.contactItem}>
                <HiMapPin size={16} aria-hidden="true" />
                <span>Canada &bull; Nigeria &bull; Jamaica</span>
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter */}
        <div className={styles.newsletter}>
          <div className={styles.newsletterInner}>
            <div className={styles.newsletterText}>
              <h3>Stay in the Loop</h3>
              <p>Engineering insights, automation tips, and agency infrastructure updates.</p>
            </div>
            {newsletterStatus === 'success' ? (
              <p className={styles.newsletterSuccess}>Thanks for subscribing!</p>
            ) : (
              <form
                className={styles.newsletterForm}
                onSubmit={handleNewsletterSubmit}
                aria-label="Newsletter signup"
              >
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  aria-label="Email address for newsletter"
                  required
                />
                <button type="submit" disabled={newsletterStatus === 'sending'}>
                  {newsletterStatus === 'sending' ? 'Subscribing...' : newsletterStatus === 'error' ? 'Try Again' : 'Subscribe'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <p>&copy; {currentYear} MAPL TECH. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/terms">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
