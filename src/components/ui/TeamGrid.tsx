'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaLinkedinIn } from 'react-icons/fa6';
import { HiMagnifyingGlass, HiChevronDown } from 'react-icons/hi2';
import {
  type TeamMember,
  type Country,
  type Department,
  countries,
  departments,
} from '@/config/team';
import styles from './TeamGrid.module.scss';

interface TeamGridProps {
  members: TeamMember[];
}

export default function TeamGrid({ members }: TeamGridProps) {
  const [activeCountry, setActiveCountry] = useState<Country>('Canada');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<'all' | Department>('all');

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (m.country !== activeCountry) return false;
      if (departmentFilter !== 'all' && m.department !== departmentFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !m.name.toLowerCase().includes(q) &&
          !m.title.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [members, activeCountry, searchQuery, departmentFilter]);

  const handleTabChange = (country: Country) => {
    setActiveCountry(country);
    setSearchQuery('');
    setDepartmentFilter('all');
  };

  return (
    <div className={styles.wrapper}>
      {/* Country Tabs */}
      <div className={styles.tabs} role="tablist" aria-label="Team by region">
        {countries.map((country) => (
          <button
            key={country}
            role="tab"
            aria-selected={activeCountry === country}
            className={`${styles.tab} ${activeCountry === country ? styles.tabActive : ''}`}
            onClick={() => handleTabChange(country)}
          >
            {country}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <HiMagnifyingGlass size={16} className={styles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            aria-label="Search team members by name"
          />
        </div>

        <div className={styles.selectWrap}>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value as 'all' | Department)}
            className={styles.select}
            aria-label="Filter by department"
          >
            <option value="all">All Positions</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          <HiChevronDown size={16} className={styles.selectIcon} aria-hidden="true" />
        </div>
      </div>

      {/* Grid */}
      <div
        role="tabpanel"
        aria-label={`${activeCountry} team members`}
        className={styles.grid}
      >
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((member) => (
              <motion.div
                key={`${member.name}-${member.country}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className={styles.card}>
                  <div className={styles.cardAvatar}>
                    <span className={styles.cardInitials}>
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardName}>{member.name}</h3>
                    <p className={styles.cardTitle}>{member.title}</p>
                    <div className={styles.cardMeta}>
                      <span className={styles.regionBadge}>{member.country}</span>
                      <span className={styles.deptBadge}>{member.department}</span>
                    </div>
                    <p className={styles.cardBio}>{member.bio}</p>
                  </div>
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkedinBtn}
                      aria-label={`${member.name} on LinkedIn`}
                    >
                      <FaLinkedinIn size={14} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={styles.emptyState}
            >
              <p>No team members match your filters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
