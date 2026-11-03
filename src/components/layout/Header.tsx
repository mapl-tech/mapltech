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
import { useEstimateBriefHref } from '@/components/ui/useEstimateBriefHref';
import MobileNav from './MobileNav';
import { OFFICE_LINKS, PROJECT_HREF, PROJECT_LABEL } from './chrome';
import styles from './Header.module.scss';

/**
 * Site header (Engineered Editorial).
 *
 * - A 72px bar that sits on the hero photograph at the top of the page and
 *   gains the brand ground, blur and hairline (compressing to 60px) once the
 *   page has scrolled 24px.
 * - Five nav items in DM Sans 15px (siteConfig.nav): Services and About open
 *   inline dropdowns on desktop. Each
 *   dropdown is a disclosure: hover opens it for a mouse, a chevron button with
 *   aria-expanded / aria-controls opens it for keyboards, Arrow keys move
 *   through it, Escape closes it and returns focus, focus or a click leaving
 *   the item closes it. Closed menus are visibility:hidden, so they are never
 *   in the tab order.
 * - Mobile (< 1024px): 56px bar, compact "Start a project" CTA (its accessible
 *   name is its visible label, WCAG 2.5.3), 44px hamburger that opens the vaul
 *   bottom sheet in MobileNav (interaction #9).
 * - While the page's own hero CTA is on screen, the header's CTA steps back to
 *   an outline, so each first viewport leads with one filled button.
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
/** The office pages sit under About (their breadcrumbs say so). */
const UNDER_ABOUT = OFFICE_LINKS.map((link) => link.href.split('#')[0]);

export function isActiveItem(item: NavItem, pathname: string): boolean {
  if (item.href === '/') return pathname === '/';
  const hrefs = [
    item.href,
    ...(item.children?.map((child) => child.href) ?? []),
    ...(item.href === '/about-us' ? UNDER_ABOUT : []),
  ];
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

/**
 * Whether the page's hero CTA (`data-hero-cta`) is on screen: 'in', 'out', or
 * undefined before the first observation (and on pages without one). Keyed by
 * path so a stale answer from the previous page is never used.
 */
function useHeroCtaView(pathname: string): 'in' | 'out' | undefined {
  const [seen, setSeen] = useState<{ path: string; view: 'in' | 'out' } | null>(null);
  useEffect(() => {
    // The hero's CTA, and any other filled ask that should have the stage to
    // itself while it is on screen (the pricing readout, `data-header-quiet`).
    const targets = Array.from(document.querySelectorAll('[data-hero-cta], [data-header-quiet]'));
    if (targets.length === 0) return;
    const onScreen = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) onScreen.add(entry.target);
        else onScreen.delete(entry.target);
      }
      setSeen({ path: pathname, view: onScreen.size > 0 ? 'in' : 'out' });
    });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname]);
  return seen?.path === pathname ? seen.view : undefined;
}

/**
 * The page's own brief link, when its hero CTA (the element marked
 * data-hero-cta) opens the brief with context (`/contact-us?svc=web` on a
 * case or service page): the header's ask then carries the same answer, as
 * the close band and the phone bar do. Keyed by path, so a previous page's
 * link never shows.
 */
function usePageBriefHref(pathname: string): string | null {
  const [found, setFound] = useState<{ path: string; href: string | null } | null>(null);
  useEffect(() => {
    const brief = (href: string | null | undefined) => (href?.startsWith(`${PROJECT_HREF}?`) ? href : null);
    const cta = document.querySelector('[data-hero-cta]');
    const link = cta?.matches('a[href]') ? cta : cta?.querySelector('a[href]');
    // A hero CTA that is not the brief (an article's "Price your project"): the
    // close band's brief link carries the page's line instead.
    const close = document.querySelector(`[data-page-close] a[href^="${PROJECT_HREF}?"]`);
    const href = brief(link?.getAttribute('href')) ?? brief(close?.getAttribute('href'));
    const frame = requestAnimationFrame(() => setFound({ path: pathname, href }));
    return () => cancelAnimationFrame(frame);
  }, [pathname]);
  return found?.path === pathname ? found.href : null;
}

export default function Header() {
  const pathname = usePathname() ?? '/';
  const onProjectPage = pathname === PROJECT_HREF;
  // Pages whose own ask is something else (apply, refer, a privacy request):
  // the header's never fills to compete with it.
  const quietCta = ['/careers', '/referral', '/privacy', '/terms'].some((path) => pathname.startsWith(path));
  const compact = useCompact();
  const heroCtaView = useHeroCtaView(pathname);
  // The header's ask carries what the page knows: on /pricing the visitor's
  // estimate, elsewhere the page's own brief link (a case's or service's line).
  const pageBriefHref = usePageBriefHref(pathname);
  const projectHref = useEstimateBriefHref(pathname) ?? pageBriefHref ?? PROJECT_HREF;
  const [menuOpen, setMenuOpen] = useState(false);
  const sheetId = useId();
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <header
      className={styles.header}
      data-compact={compact ? '' : undefined}
      data-hero-cta-view={heroCtaView}
      data-cta-quiet={quietCta ? '' : undefined}
      style={VIEW_TRANSITION_ANCHOR}
    >
      <div className={styles.bar}>
        <Link href="/" className={styles.logo} aria-label="MAPL TECH home">
          <Image src="/images/mapl-tech-logo.svg" alt="MAPL TECH" width={150} height={33} priority />
        </Link>

        <DesktopNav pathname={pathname} />

        <div className={styles.utility}>
          {/* On the brief itself the ask would point at the page you are on. */}
          {onProjectPage ? null : (
            <>
              <span className={styles.cta} data-cta-placement="header_project">
                <MagneticButton href={projectHref} size="small" placement="header_project" className={styles.headerBtn}>
                  {PROJECT_LABEL}
                </MagneticButton>
              </span>

              <span className={styles.ctaCompact} data-cta-placement="header_project_compact">
                <MagneticButton
                  href={projectHref}
                  size="small"
                  placement="header_project_compact"
                  className={styles.compactBtn}
                >
                  {PROJECT_LABEL}
                </MagneticButton>
              </span>
            </>
          )}

          <button
            ref={menuButtonRef}
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

      <MobileNav
        id={sheetId}
        open={menuOpen}
        onOpenChange={setMenuOpen}
        pathname={pathname}
        projectHref={projectHref}
        returnFocusRef={menuButtonRef}
      />
    </header>
  );
}
