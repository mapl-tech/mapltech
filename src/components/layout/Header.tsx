'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FaInstagram,
  FaXTwitter,
  FaFacebookF,
  FaLinkedinIn,
  FaTiktok,
} from 'react-icons/fa6';
import { HiOutlineBars3, HiXMark, HiEnvelope } from 'react-icons/hi2';
import { siteConfig } from '@/config/site';
import styles from './Header.module.scss';

const socialIcons: Record<string, React.ComponentType<{ size?: number }>> = {
  instagram: FaInstagram,
  x: FaXTwitter,
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
  tiktok: FaTiktok,
};

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <header
      className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}
      role="banner"
    >
      {/* Top bar — email + socials */}
      <div className={`${styles.topBar} ${scrolled ? styles.topBarHidden : ''}`}>
        <div className={styles.topBarInner}>
          <a
            href={`mailto:${siteConfig.email}`}
            className={styles.contactLink}
            aria-label={`Email ${siteConfig.email}`}
          >
            <HiEnvelope />
            {siteConfig.email}
          </a>
          <div className={styles.socialLinks} aria-label="Social media links">
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
                  <Icon size={14} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main nav bar */}
      <div className={styles.navBar}>
        <div className={styles.navBarInner}>
          <Link href="/" className={styles.logo} aria-label="MAPL TECH Home">
            <Image src="/images/mapl-tech-logo.svg" alt="MAPL TECH" width={160} height={35} priority />
          </Link>

          <nav className={styles.nav} aria-label="Main navigation">
            {siteConfig.nav.map((item) => (
              <div key={item.href} className={styles.navItem}>
                <Link
                  href={item.href}
                  className={`${styles.navLink} ${
                    pathname === item.href ? styles.active : ''
                  }`}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className={styles.dropdown} role="menu">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={styles.dropdownLink}
                        role="menuitem"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <Link href="/contact" className={styles.ctaButton}>
            Contact Us
          </Link>

          <button
            className={styles.menuButton}
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={mobileOpen}
          >
            <HiOutlineBars3 />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className={styles.mobileMenu} role="dialog" aria-label="Mobile navigation">
          <div className={styles.mobileMenuHeader}>
            <Link href="/" className={styles.logo} aria-label="MAPL TECH Home">
              <Image src="/images/mapl-tech-logo.svg" alt="MAPL TECH" width={160} height={35} priority />
            </Link>
            <button
              className={styles.closeButton}
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
            >
              <HiXMark />
            </button>
          </div>

          <nav className={styles.mobileNav} aria-label="Mobile navigation">
            {siteConfig.nav.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`${styles.mobileNavLink} ${
                    pathname === item.href ? styles.active : ''
                  }`}
                >
                  {item.label}
                </Link>
                {item.children?.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={styles.mobileSubLink}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <div className={styles.mobileSocial}>
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
                  <Icon size={20} />
                </a>
              );
            })}
          </div>

          <Link href="/contact" className={styles.mobileCta}>
            Contact Us
          </Link>
        </div>
      )}
    </header>
  );
}
