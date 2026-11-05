'use client';

import { FaInstagram, FaXTwitter, FaFacebookF, FaLinkedinIn, FaTiktok } from 'react-icons/fa6';
import { SOCIAL_LABELS } from './chrome';
import styles from './Footer.module.scss';

/**
 * Social icon links: ringed circles with the icon in the brand's pink-red,
 * filled crimson on hover (48px targets, 52px from 768px; Footer.module.scss
 * .social). A client island only because react-icons reads an IconContext,
 * which is not available to Server Components.
 */

const ICONS = {
  instagram: FaInstagram,
  x: FaXTwitter,
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
  tiktok: FaTiktok,
} as const;

type SocialKey = keyof typeof ICONS;

export interface SocialLinksProps {
  links: Record<string, string>;
  className?: string;
}

export default function SocialLinks({ links, className = '' }: SocialLinksProps) {
  const keys = (Object.keys(ICONS) as SocialKey[]).filter((key) => links[key]);
  return (
    <ul className={`${styles.social} ${className}`.trim()} aria-label="MAPL TECH on social media">
      {keys.map((key) => {
        const Icon = ICONS[key];
        return (
          <li key={key}>
            <a
              href={links[key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`MAPL TECH on ${SOCIAL_LABELS[key] ?? key}`}
            >
              <Icon size={20} aria-hidden="true" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
