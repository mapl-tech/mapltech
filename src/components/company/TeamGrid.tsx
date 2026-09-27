'use client';

import { useId, useState, useSyncExternalStore, type MouseEvent } from 'react';
import { countries, departments, type Country, type Department, type TeamMember } from '@/config/team';
import styles from './TeamGrid.module.scss';

/**
 * Replacement for ui/TeamGrid (IX team card expand + tabs).
 *
 * - Country tabs are plain anchors (`#canada`, `#nigeria`, `#jamaica`). The
 *   active panel is derived from `location.hash`, so `/team#nigeria` and
 *   `/team#chioma-eze` deep-link without any click handler.
 * - All three panels and every card are in the SSR HTML; inactive panels and
 *   filtered-out cards carry the `hidden` attribute and never unmount.
 * - Cards expand in place: hover / focus-within on fine pointers (CSS only),
 *   tap on touch via one delegated click listener per panel. Bios are always
 *   in the DOM, clipped at rest.
 */

export interface TeamGridMember extends TeamMember {
  /** `slugify(name)` computed on the server; matches Person JSON-LD `/team#slug`. */
  slug: string;
}

const subscribeHash = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
};
const getHash = () => window.location.hash.replace(/^#/, '');
const getServerHash = () => '';

/** Current URL fragment ('' on the server and during hydration). */
function useHash(): string {
  return useSyncExternalStore(subscribeHash, getHash, getServerHash);
}

export function countrySlug(country: Country): string {
  return country.toLowerCase();
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('');
}

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/* -------------------------------------------------------------------------- */
/* Cards                                                                       */
/* -------------------------------------------------------------------------- */

export interface TeamCardsProps {
  members: readonly TeamGridMember[];
  /** Only cards in this department stay visible; others get `hidden`. */
  department?: 'all' | Department;
  /** A slug from the URL fragment: that card renders expanded and scrolls into view once. */
  targetSlug?: string;
  /** Accessible name for the list. */
  label: string;
}

export function TeamCards({ members, department = 'all', targetSlug, label }: TeamCardsProps) {
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(() => new Set());

  // One delegated listener: the card (touch tap) and its button both carry data-toggle.
  const onClick = (event: MouseEvent<HTMLUListElement>) => {
    const control = (event.target as HTMLElement).closest<HTMLElement>('[data-toggle]');
    const slug = control?.dataset.toggle;
    if (!slug) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  // Deep link: bring the targeted card into view once its panel is visible (no state involved).
  const scrollTarget = (node: HTMLElement | null) => {
    if (!node || node.dataset.scrolled === 'true') return;
    node.dataset.scrolled = 'true';
    node.scrollIntoView({ block: 'center', behavior: window.matchMedia(REDUCED_MOTION).matches ? 'auto' : 'smooth' });
  };

  return (
    <ul className={styles.grid} aria-label={label} onClick={onClick}>
      {members.map((member) => {
        const open = expanded.has(member.slug) || member.slug === targetSlug;
        const bioId = `${member.slug}-bio`;
        const visible = department === 'all' || member.department === department;
        return (
          <li key={member.slug} hidden={!visible}>
            <article
              id={member.slug}
              ref={member.slug === targetSlug ? scrollTarget : undefined}
              className={styles.card}
              data-expanded={open ? 'true' : 'false'}
              data-toggle={member.slug}
            >
              <div className={styles.cardAvatar} aria-hidden="true">
                <span>{initialsOf(member.name)}</span>
              </div>
              <h3 className={styles.cardName}>{member.name}</h3>
              <p className={styles.cardRole}>{member.title}</p>
              <p className={styles.cardMeta}>
                {member.country} · {member.department}
              </p>
              <p id={bioId} className={styles.bio}>
                {member.bio}
              </p>
              <button
                type="button"
                className={styles.toggle}
                data-toggle={member.slug}
                aria-expanded={open}
                aria-controls={bioId}
              >
                {open ? 'Show less' : 'Read bio'}
              </button>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

/* -------------------------------------------------------------------------- */
/* Grid with country tabs + department filter                                  */
/* -------------------------------------------------------------------------- */

export interface TeamGridProps {
  members: readonly TeamGridMember[];
}

export default function TeamGrid({ members }: TeamGridProps) {
  const hash = useHash();
  const [department, setDepartment] = useState<'all' | Department>('all');
  const selectId = useId();

  const hashMember = members.find((member) => member.slug === hash);
  const hashCountry = countries.find((country) => countrySlug(country) === hash) ?? hashMember?.country;
  const active: Country = hashCountry ?? countries[0];

  const presentDepartments = departments.filter((dept) => members.some((member) => member.department === dept));

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <nav className={styles.tabs} aria-label="Team by region">
          {countries.map((country) => {
            const count = members.filter((member) => member.country === country).length;
            return (
              <a
                key={country}
                href={`#${countrySlug(country)}`}
                className={styles.tab}
                aria-current={country === active ? 'true' : undefined}
              >
                {country}
                <span className={styles.count}>{count}</span>
              </a>
            );
          })}
        </nav>
        <div className={styles.filter}>
          <label htmlFor={selectId} className={styles.filterLabel}>
            Department
          </label>
          <select
            id={selectId}
            className={styles.select}
            value={department}
            onChange={(event) => setDepartment(event.target.value as 'all' | Department)}
          >
            <option value="all">All departments</option>
            {presentDepartments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {countries.map((country) => {
        const list = members.filter((member) => member.country === country);
        const isActive = country === active;
        const matches = list.filter((member) => department === 'all' || member.department === department).length;
        return (
          <section
            key={country}
            id={countrySlug(country)}
            className={styles.panel}
            hidden={!isActive}
            aria-label={`${country} team`}
          >
            <TeamCards
              members={list}
              department={department}
              targetSlug={hashMember?.country === country ? hashMember.slug : undefined}
              label={`${country} team members`}
            />
            {matches === 0 ? (
              <p className={styles.empty}>
                No {country} team members in {department}. Pick another department or region.
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
