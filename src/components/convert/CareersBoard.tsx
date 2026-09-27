'use client';

import { useState } from 'react';
import { usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import Cta from './Cta';
import { useUrlParams } from './useUrlState';
import forms from './forms.module.scss';
import styles from './CareersBoard.module.scss';

/**
 * Careers §2.8: URL-synced filters (?loc=&type=) over roles rendered from
 * `careers` in site.ts. Every role is in the SSR HTML as a native
 * <details name="role"> (interaction #11, one open at a time); filtering
 * toggles the `hidden` attribute and never unmounts. "Apply for this role"
 * writes ?role= to the URL (shared with CareersApply) and moves focus to the
 * apply form.
 */

export interface BoardRole {
  /** Matches the JobPosting @id anchor (slugify(`${title} ${country}`)). */
  slug: string;
  title: string;
  type: string;
  location: string;
  country: string;
  description: string;
}

export interface CareersBoardProps {
  roles: BoardRole[];
  /** id of the apply section (default "apply"). */
  applyId?: string;
  /** id of the first field in the apply form, focused after "Apply for this role". */
  applyFieldId?: string;
}

const ALL = 'all';

function isRemote(role: BoardRole): boolean {
  return /remote/i.test(role.location);
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">
      <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export default function CareersBoard({ roles, applyId = 'apply', applyFieldId = 'apply-role' }: CareersBoardProps) {
  const [params, setParams] = useUrlParams();
  const reduceMotion = usePrefersReducedMotion();
  const [query, setQuery] = useState('');

  const loc = (params.get('loc') ?? ALL).toLowerCase();
  const type = (params.get('type') ?? ALL).toLowerCase();

  const countries = Array.from(new Set(roles.map((role) => role.country)));
  const types = Array.from(new Set(roles.map((role) => role.type)));
  const remoteCount = roles.filter(isRemote).length;

  const locationOptions = [
    { key: ALL, label: 'All', count: roles.length },
    ...countries.map((country) => ({
      key: country.toLowerCase(),
      label: country,
      count: roles.filter((role) => role.country === country).length,
    })),
    ...(remoteCount > 0 ? [{ key: 'remote', label: 'Remote', count: remoteCount }] : []),
  ];

  const typeOptions = [
    { key: ALL, label: 'All types', count: roles.length },
    ...types.map((entry) => ({
      key: entry.toLowerCase(),
      label: entry,
      count: roles.filter((role) => role.type === entry).length,
    })),
  ];

  const q = query.trim().toLowerCase();
  const matches = (role: BoardRole) => {
    if (loc !== ALL && (loc === 'remote' ? !isRemote(role) : role.country.toLowerCase() !== loc)) return false;
    if (type !== ALL && role.type.toLowerCase() !== type) return false;
    if (q && ![role.title, role.location, role.country].some((value) => value.toLowerCase().includes(q))) return false;
    return true;
  };

  const visible = roles.filter(matches).length;

  const setFilter = (key: 'loc' | 'type', value: string) =>
    setParams((next) => {
      if (value === ALL) next.delete(key);
      else next.set(key, value);
    });

  const clearFilters = () => {
    setQuery('');
    setParams((next) => {
      next.delete('loc');
      next.delete('type');
    });
  };

  const apply = (role: BoardRole) => {
    setParams((next) => next.set('role', role.slug), { hash: applyId });
    const target = document.getElementById(applyId);
    target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    const fieldEl = document.getElementById(applyFieldId);
    fieldEl?.focus({ preventScroll: true });
  };

  return (
    <div className={styles.board}>
      <div className={styles.filters}>
        <fieldset className={styles.filterGroup}>
          <legend className={forms.legend}>Location</legend>
          <div className={styles.chipRow}>
            {locationOptions.map((option) => (
              <label key={option.key} className={`${forms.chip} ${styles.filterChip}`}>
                <input
                  type="radio"
                  name="loc"
                  value={option.key}
                  className="visually-hidden"
                  checked={loc === option.key}
                  onChange={() => setFilter('loc', option.key)}
                />
                {option.label}
                <span className={styles.count}>{option.count}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className={styles.filterGroup}>
          <legend className={forms.legend}>Type</legend>
          <div className={styles.chipRow}>
            {typeOptions.map((option) => (
              <label key={option.key} className={`${forms.chip} ${styles.filterChip}`}>
                <input
                  type="radio"
                  name="type"
                  value={option.key}
                  className="visually-hidden"
                  checked={type === option.key}
                  onChange={() => setFilter('type', option.key)}
                />
                {option.label}
                <span className={styles.count}>{option.count}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className={styles.searchRow}>
          <label className="visually-hidden" htmlFor="careers-search">
            Search by title or location
          </label>
          <input
            id="careers-search"
            type="search"
            className={`${forms.input} ${styles.search}`}
            placeholder="Search by title or location"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="off"
          />
          <p className={styles.showing} aria-live="polite" aria-atomic="true">
            Showing {visible} of {roles.length}
          </p>
        </div>
      </div>

      <ul className={styles.list}>
        {roles.map((role) => {
          const shown = matches(role);
          return (
            <li key={role.slug} hidden={!shown}>
              <details id={role.slug} name="role" className={`${styles.role} accordion-item`}>
                <summary className={`${styles.summary} accordion-summary`} data-cursor="view">
                  <span className={styles.roleTitle}>{role.title}</span>
                  <span className={styles.metaGroup}>
                    <span className={`${styles.meta} ${styles.metaLocation}`}>{role.location}</span>
                    <span className={`${styles.meta} ${styles.metaCountry}`}>{role.country}</span>
                    <span className={`${styles.meta} ${styles.metaType}`}>{role.type}</span>
                  </span>
                  <span className={styles.icon} aria-hidden="true">
                    <PlusIcon />
                  </span>
                </summary>
                <div className={`${styles.body} accordion-content`}>
                  <p className={styles.description}>{role.description}</p>
                  <dl className={`kv kv--stack ${styles.roleFacts}`}>
                    <div>
                      <dt>Location</dt>
                      <dd>{role.location}</dd>
                    </div>
                    <div>
                      <dt>Country</dt>
                      <dd>{role.country}</dd>
                    </div>
                    <div>
                      <dt>Type</dt>
                      <dd>{role.type}</dd>
                    </div>
                  </dl>
                  <div className={styles.roleActions}>
                    <Cta placement="careers_role_apply" size="small" onClick={() => apply(role)}>
                      Apply for this role
                    </Cta>
                  </div>
                </div>
              </details>
            </li>
          );
        })}
      </ul>

      <p className={styles.empty} hidden={visible > 0}>
        No positions match your filters.{' '}
        <button type="button" className={forms.textButton} onClick={clearFilters}>
          Clear filters
        </button>
      </p>
    </div>
  );
}
