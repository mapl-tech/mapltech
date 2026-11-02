'use client';

import { useState, type MouseEvent } from 'react';
import { placeWords } from '@/components/company/places';
import { usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import { useUrlParams } from './useUrlState';
import styles from './CareersBoard.module.scss';

/**
 * The open roles from `careers` in site.ts, every one in the server HTML.
 * Filters are native radio chips synced to the URL (?loc=, plus ?type= when
 * the roles have more than one type), so a filtered view is shareable and
 * filtering only toggles `hidden`, never unmounts. "Apply" is a real link
 * (?role=slug#apply, works without JavaScript); with JavaScript it selects
 * the role in the apply form in place and moves focus to it.
 */

export interface BoardRole {
  /** Matches the JobPosting @id fragment: slugify(`${title} ${country}`). */
  slug: string;
  title: string;
  type: string;
  location: string;
  country: string;
  description: string;
}

export interface CareersBoardProps {
  roles: BoardRole[];
  /** id of the apply section. */
  applyId?: string;
  /** id of the role field in the apply form; it receives focus after "Apply". */
  applyFieldId?: string;
  /** id of the talent-list section, offered when a filter matches nothing. */
  talentId?: string;
}

const ALL = 'all';

const isRemote = (role: BoardRole) => /remote/i.test(role.location);


export default function CareersBoard({ roles, applyId = 'apply', applyFieldId = 'apply-role', talentId = 'talent' }: CareersBoardProps) {
  const [params, setParams] = useUrlParams();
  const reduceMotion = usePrefersReducedMotion();
  // Counts filter changes made here; its parity swaps the rows' entrance
  // animation name, which restarts it, so a filter change is visible.
  const [changes, setChanges] = useState(0);

  const countries = Array.from(new Set(roles.map((role) => role.country)));
  const types = Array.from(new Set(roles.map((role) => role.type)));
  const remoteCount = roles.filter(isRemote).length;

  const locOptions = [
    { key: ALL, label: 'All', count: roles.length },
    ...countries.map((country) => ({ key: country.toLowerCase(), label: country, count: roles.filter((r) => r.country === country).length })),
    ...(remoteCount ? [{ key: 'remote', label: 'Remote', count: remoteCount }] : []),
  ];
  const typeOptions =
    types.length > 1
      ? [
          { key: ALL, label: 'All types', count: roles.length },
          ...types.map((type) => ({ key: type.toLowerCase(), label: type, count: roles.filter((r) => r.type === type).length })),
        ]
      : [];

  const rawLoc = (params.get('loc') ?? ALL).toLowerCase();
  const loc = locOptions.some((o) => o.key === rawLoc) ? rawLoc : ALL;
  const rawType = (params.get('type') ?? ALL).toLowerCase();
  const type = typeOptions.some((o) => o.key === rawType) ? rawType : ALL;

  const matches = (role: BoardRole) => {
    if (loc !== ALL && (loc === 'remote' ? !isRemote(role) : role.country.toLowerCase() !== loc)) return false;
    if (type !== ALL && role.type.toLowerCase() !== type) return false;
    return true;
  };
  const visible = roles.filter(matches).length;
  const locLabel = locOptions.find((o) => o.key === loc)?.label ?? 'All';

  const setFilter = (key: 'loc' | 'type', value: string) => {
    setChanges((n) => n + 1);
    setParams((next) => {
      if (value === ALL) next.delete(key);
      else next.set(key, value);
    });
  };

  // The link keeps the current filter, so "open in new tab" lands on the same view.
  const applyHref = (role: BoardRole) => {
    const next = new URLSearchParams(params);
    next.set('role', role.slug);
    return `?${next.toString()}#${applyId}`;
  };

  const apply = (event: MouseEvent<HTMLAnchorElement>, role: BoardRole) => {
    event.preventDefault();
    setParams((next) => next.set('role', role.slug), { hash: applyId });
    // Land on the form itself: on phones the section's rail stacks above it.
    const field = document.getElementById(applyFieldId);
    const target = (field instanceof HTMLSelectElement && field.form) || document.getElementById(applyId);
    target?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    field?.focus({ preventScroll: true });
  };

  return (
    <div className={styles.board}>
      <div className={styles.filters}>
        <fieldset className={styles.group}>
          <legend className={styles.legend}>Show roles in</legend>
          <div className={styles.chips}>
            {locOptions.map((option) => (
              <label key={option.key} className={styles.chip}>
                <input
                  type="radio"
                  name="careers-loc"
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

        {typeOptions.length ? (
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Type</legend>
            <div className={styles.chips}>
              {typeOptions.map((option) => (
                <label key={option.key} className={styles.chip}>
                  <input
                    type="radio"
                    name="careers-type"
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
        ) : null}

        <p className={styles.showing} aria-live="polite" aria-atomic="true">
          {visible === roles.length ? `All ${roles.length} open roles` : `${visible} of ${roles.length} roles: ${locLabel}`}
        </p>
      </div>

      <ul className={styles.list} role="list" data-flip={changes === 0 ? undefined : changes % 2 ? 'a' : 'b'}>
        {roles.map((role) => (
          <li key={role.slug} id={role.slug} className={styles.role} hidden={!matches(role)}>
            <div className={styles.roleMain}>
              <h3 className={styles.roleTitle}>{role.title}</h3>
              <p className={styles.roleMeta}>
                <span>{role.country}</span>
                <span aria-hidden="true" className={styles.sep}>
                  ·
                </span>
                <span>{placeWords(role.location)}</span>
                <span aria-hidden="true" className={styles.sep}>
                  ·
                </span>
                <span>{role.type}</span>
                <span className="visually-hidden">.</span>
              </p>
              <p className={styles.roleText}>{role.description}</p>
            </div>
            <a
              href={applyHref(role)}
              className={styles.apply}
              aria-label={`Apply for ${role.title}, ${role.country}`}
              onClick={(event) => apply(event, role)}
              data-cta-placement="careers_role_apply"
            >
              Apply
              <span aria-hidden="true" className={styles.applyArrow}>
                →
              </span>
            </a>
          </li>
        ))}
      </ul>

      <div className={styles.empty} hidden={visible > 0}>
        <p>No open roles match this filter right now.</p>
        <p>
          <button type="button" className={styles.reset} onClick={() => setFilter('loc', ALL)}>
            Show all roles
          </button>{' '}
          or <a href={`#${talentId}`}>join the talent list</a> and we&apos;ll write when one opens.
        </p>
      </div>
    </div>
  );
}
