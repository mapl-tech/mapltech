'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type PointerEvent,
  type FocusEvent,
  type CSSProperties,
} from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { siteConfig } from '@/config/site';
import MagneticButton from '@/components/ui/MagneticButton';
import MobileNav from './MobileNav';
import { ESTIMATE_HREF, ESTIMATE_LABEL, ESTIMATE_LABEL_COMPACT } from './chrome';
import styles from './Header.module.scss';

/**
 * Site header (Engineered Editorial).
 *
 * - One 64px bar on the brand ground with a hairline and the only permitted
 *   backdrop-blur; it compresses to 56px once the page has scrolled 24px.
 * - Mono nav labels (12px / 0.12em). The IA is siteConfig.nav unchanged:
 *   Services / Our Work / About Us open inline dropdowns on desktop. Each
 *   dropdown is a disclosure: hover opens it for a mouse, a chevron button with
 *   aria-expanded / aria-controls opens it for keyboards, Arrow keys move
 *   through it, Escape closes it and returns focus, focus or a click leaving
 *   the item closes it. Closed menus are visibility:hidden, so they are never
 *   in the tab order.
 * - Mobile (< 1024px): 56px bar, compact "Estimate" CTA, 44px hamburger that
 *   opens the vaul bottom sheet in MobileNav (interaction #9).
 * - An inline `view-transition-name: site-header` anchors it during page
 *   transitions; styles/_transitions.scss disables its group animation.
 */

type NavItem = (typeof siteConfig.nav)[number];

const COMPACT_AT = 24;

/**
 * Anchors the header during page transitions (styles/_transitions.scss
 * disables the `site-header` group animation). Set inline, as the Next guide
 * does: CSS Modules would hash a `view-transition-name` written in the SCSS,
 * and the global ::view-transition-group(site-header) rules would never match.
 */
const VIEW_TRANSITION_ANCHOR: CSSProperties = { viewTransitionName: 'site-header' };

const subscribeScroll = (onChange: () => void) => {
  window.addEventListener('scroll', onChange, { passive: true });
  return () => window.removeEventListener('scroll', onChange);
};
const getCompact = () => window.scrollY > COMPACT_AT;
const getServerCompact = () => false;

/** True once the page has scrolled past the threshold; false on the server. */
function useCompact(): boolean {
  return useSyncExternalStore(subscribeScroll, getCompact, getServerCompact);
}

const firstSegment = (path: string) => `/${path.split('/')[1] ?? ''}`;

/** A nav item is active on its own route, any child route, or a route in the same section. */
export function isActiveItem(item: NavItem, pathname: string): boolean {
  if (item.href === '/') return pathname === '/';
  const hrefs = [item.href, ...(item.children?.map((child) => child.href) ?? [])];
  return hrefs.some((href) => pathname === href || firstSegment(pathname) === firstSegment(href));
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

const menuLinks = (menu: HTMLElement | null) =>
  menu ? Array.from(menu.querySelectorAll<HTMLAnchorElement>('a[href]')) : [];

function DesktopNav({ pathname }: { pathname: string }) {
  const [openHref, setOpenHref] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const menus = useRef(new Map<string, HTMLUListElement>());
  const idBase = useId();
  const menuId = (href: string) => `${idBase}-menu-${href.replace(/[^a-z0-9]+/gi, '-')}`;

  // A click or tap anywhere outside the nav closes the open menu.
  useEffect(() => {
    if (openHref === null) return;
    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) setOpenHref(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [openHref]);

  const closeAndRefocus = useCallback((href: string) => {
    setOpenHref(null);
    buttons.current.get(href)?.focus();
  }, []);

  const openAndFocus = useCallback((href: string, position: 'first' | 'last') => {
    setOpenHref(href);
    // The menu is already in the DOM (visibility only), so focus can move at once.
    requestAnimationFrame(() => {
      const links = menuLinks(menus.current.get(href) ?? null);
      (position === 'first' ? links[0] : links[links.length - 1])?.focus();
    });
  }, []);

  const onButtonKeyDown = (href: string) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openAndFocus(href, 'first');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openAndFocus(href, 'last');
    } else if (event.key === 'Escape' && openHref === href) {
      event.preventDefault();
      closeAndRefocus(href);
    }
  };

  const onMenuKeyDown = (href: string) => (event: KeyboardEvent<HTMLUListElement>) => {
    const links = menuLinks(event.currentTarget);
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === 'Escape') {
      event.preventDefault();
      closeAndRefocus(href);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      links[(index + 1) % links.length]?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      links[(index - 1 + links.length) % links.length]?.focus();
    } else if (event.key === 'Home') {
      event.preventDefault();
      links[0]?.focus();
    } else if (event.key === 'End') {
      event.preventDefault();
      links[links.length - 1]?.focus();
    }
  };

  // Focus leaving the whole item (Tab out, or click elsewhere) closes its menu.
  const onItemBlur = (href: string) => (event: FocusEvent<HTMLLIElement>) => {
    if (openHref === href && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setOpenHref(null);
    }
  };

  const onItemPointerEnter = (href: string) => (event: PointerEvent<HTMLLIElement>) => {
    if (event.pointerType === 'mouse') setOpenHref(href);
  };
  const onItemPointerLeave = (href: string) => (event: PointerEvent<HTMLLIElement>) => {
    if (event.pointerType === 'mouse' && openHref === href) setOpenHref(null);
  };

  return (
    <nav ref={navRef} className={styles.nav} aria-label="Primary">
      <ul className={styles.list}>
        {siteConfig.nav.map((item) => {
          const active = isActiveItem(item, pathname);
          const current = pathname === item.href;
          if (!item.children) {
            return (
              <li key={item.href} className={styles.item}>
                <Link
                  href={item.href}
                  className={styles.link}
                  aria-current={current ? 'page' : undefined}
                  data-active={active ? '' : undefined}
                >
                  {item.label}
                </Link>
              </li>
            );
          }
          const isOpen = openHref === item.href;
          const id = menuId(item.href);
          return (
            <li
              key={item.href}
              className={styles.item}
              data-open={isOpen ? '' : undefined}
              onPointerEnter={onItemPointerEnter(item.href)}
              onPointerLeave={onItemPointerLeave(item.href)}
              onBlur={onItemBlur(item.href)}
            >
              <Link
                href={item.href}
                className={styles.link}
                aria-current={current ? 'page' : undefined}
                data-active={active ? '' : undefined}
              >
                {item.label}
              </Link>
              <button
                type="button"
                ref={(node) => {
                  if (node) buttons.current.set(item.href, node);
                  else buttons.current.delete(item.href);
                }}
                className={styles.disclosure}
                aria-expanded={isOpen}
                aria-controls={id}
                aria-label={`${item.label} submenu`}
                onClick={() => setOpenHref(isOpen ? null : item.href)}
                onKeyDown={onButtonKeyDown(item.href)}
              >
                <Chevron className={styles.chevron} />
              </button>
              <div className={styles.menuWrap}>
                <ul
                  id={id}
                  ref={(node) => {
                    if (node) menus.current.set(item.href, node);
                    else menus.current.delete(item.href);
                  }}
                  className={styles.menu}
                  aria-label={item.label}
                  onKeyDown={onMenuKeyDown(item.href)}
                >
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className={styles.menuLink}
                        aria-current={pathname === child.href ? 'page' : undefined}
                        onClick={() => setOpenHref(null)}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function Header() {
  const pathname = usePathname() ?? '/';
  const compact = useCompact();
  const [menuOpen, setMenuOpen] = useState(false);
  const sheetId = useId();

  return (
    <header className={styles.header} data-compact={compact ? '' : undefined} style={VIEW_TRANSITION_ANCHOR}>
      <div className={styles.bar}>
        <Link href="/" className={styles.logo} aria-label="MAPL TECH home">
          <Image src="/images/mapl-tech-logo.svg" alt="MAPL TECH" width={150} height={33} priority />
        </Link>

        <DesktopNav pathname={pathname} />

        <div className={styles.utility}>
          <a href={`mailto:${siteConfig.email}`} className={styles.email}>
            {siteConfig.email}
          </a>

          <span className={styles.cta} data-cta-placement="header_estimate">
            <MagneticButton href={ESTIMATE_HREF} size="small" placement="header_estimate" className={styles.headerBtn}>
              {ESTIMATE_LABEL}
            </MagneticButton>
          </span>

          <span className={styles.ctaCompact} data-cta-placement="header_estimate_compact">
            <MagneticButton
              href={ESTIMATE_HREF}
              size="small"
              placement="header_estimate_compact"
              className={styles.compactBtn}
              aria-label={ESTIMATE_LABEL}
            >
              {ESTIMATE_LABEL_COMPACT}
            </MagneticButton>
          </span>

          <button
            type="button"
            className={styles.menuButton}
            aria-label="Open menu"
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            aria-controls={sheetId}
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      <MobileNav id={sheetId} open={menuOpen} onOpenChange={setMenuOpen} pathname={pathname} />
    </header>
  );
}
