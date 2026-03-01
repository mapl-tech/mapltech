'use client';

import { useState } from 'react';
import { HiMapPin, HiBriefcase, HiArrowRight } from 'react-icons/hi2';
import MagneticButton from '@/components/ui/MagneticButton';
import BlurReveal from '@/components/ui/BlurReveal';
import { siteConfig } from '@/config/site';
import styles from '@/styles/page-common.module.scss';

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
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? jobs : jobs.filter((j) => j.country === active);

  return (
    <>
      <div className={styles.filterBar}>
        {countries.map((c) => (
          <button
            key={c}
            className={`${styles.filterButton} ${active === c ? styles.active : ''}`}
            onClick={() => setActive(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className={styles.cardsGrid}>
        {filtered.map((job, i) => (
          <BlurReveal key={`${job.title}-${job.location}`} delay={i * 0.06}>
            <div className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <h3 className={styles.jobTitle}>{job.title}</h3>
                <span className={styles.jobBadge}>{job.country}</span>
              </div>
              <p className={styles.jobDescription}>{job.description}</p>
              <div className={styles.jobMeta}>
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
          </BlurReveal>
        ))}
      </div>
    </>
  );
}
