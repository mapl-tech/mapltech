'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMapPin, HiBriefcase, HiArrowRight, HiMagnifyingGlass, HiChevronDown } from 'react-icons/hi2';
import MagneticButton from '@/components/ui/MagneticButton';
import { siteConfig } from '@/config/site';
import filterStyles from './CareersFilter.module.scss';
import cardStyles from '@/styles/page-common.module.scss';

interface Job {
  title: string;
  type: string;
  location: string;
  country: string;
  description: string;
}

interface CareersFilterProps {
  jobs: Job[];
}

export default function CareersFilter({ jobs }: CareersFilterProps) {
  const countries = ['All', ...Array.from(new Set(jobs.map((j) => j.country)))];
  const jobTypes = ['All Types', ...Array.from(new Set(jobs.map((j) => j.type)))];

  const [activeCountry, setActiveCountry] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');

  const filtered = useMemo(() => {
    return jobs.filter((j) => {
      if (activeCountry !== 'All' && j.country !== activeCountry) return false;
      if (typeFilter !== 'All Types' && j.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !j.title.toLowerCase().includes(q) &&
          !j.location.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [jobs, activeCountry, searchQuery, typeFilter]);

  const handleTabChange = (country: string) => {
    setActiveCountry(country);
    setSearchQuery('');
    setTypeFilter('All Types');
  };

  return (
    <div className={filterStyles.wrapper}>
      {/* Country Tabs */}
      <div className={filterStyles.tabs} role="tablist" aria-label="Jobs by region">
        {countries.map((country) => (
          <button
            key={country}
            role="tab"
            aria-selected={activeCountry === country}
            className={`${filterStyles.tab} ${activeCountry === country ? filterStyles.tabActive : ''}`}
            onClick={() => handleTabChange(country)}
          >
            {country}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className={filterStyles.filters}>
        <div className={filterStyles.searchWrap}>
          <HiMagnifyingGlass size={16} className={filterStyles.searchIcon} aria-hidden="true" />
          <input
            type="text"
            placeholder="Search by title or location"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={filterStyles.searchInput}
            aria-label="Search jobs by title or location"
          />
        </div>

        <div className={filterStyles.selectWrap}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={filterStyles.select}
            aria-label="Filter by job type"
          >
            <option value="All Types">All Types</option>
            {jobTypes.filter((t) => t !== 'All Types').map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <HiChevronDown size={16} className={filterStyles.selectIcon} aria-hidden="true" />
        </div>
      </div>

      {/* Grid */}
      <div
        role="tabpanel"
        aria-label={`${activeCountry} job listings`}
        className={filterStyles.grid}
      >
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((job) => (
              <motion.div
                key={`${job.title}-${job.location}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className={cardStyles.jobCard}>
                  <div className={cardStyles.jobHeader}>
                    <h3 className={cardStyles.jobTitle}>{job.title}</h3>
                    <span className={cardStyles.jobBadge}>{job.country}</span>
                  </div>
                  <p className={cardStyles.jobDescription}>{job.description}</p>
                  <div className={cardStyles.jobMeta}>
                    <span>
                      <HiMapPin size={14} />
                      {job.location}
                    </span>
                    <span>
                      <HiBriefcase size={14} />
                      {job.type}
                    </span>
                  </div>
                  <MagneticButton
                    href={`mailto:${siteConfig.email}?subject=Application: ${job.title} (${job.country})`}
                    variant="secondary"
                    size="small"
                    external
                  >
                    Apply Now <HiArrowRight />
                  </MagneticButton>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={filterStyles.emptyState}
            >
              <p>No positions match your filters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
