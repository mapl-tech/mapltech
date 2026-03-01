'use client';

import { useState } from 'react';
import Image from 'next/image';
import { HiArrowRight } from 'react-icons/hi2';
import MagneticButton from '@/components/ui/MagneticButton';
import SectionHeading from '@/components/ui/SectionHeading';
import BlurReveal from '@/components/ui/BlurReveal';
import { portfolioProjects } from '@/config/site';
import styles from '@/styles/page-common.module.scss';

const categories = [
  'All',
  'Web Development',
  'Automation and AI Workflows',
  'Custom Internal Tools',
];

export default function OurWorkPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered =
    activeFilter === 'All'
      ? portfolioProjects
      : portfolioProjects.filter((p) => p.category === activeFilter);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroGrid}>
            <div>
              <BlurReveal>
                <span className={styles.heroLabel}>Our Work</span>
              </BlurReveal>
              <BlurReveal delay={0.1}>
                <h1 className={styles.heroTitle}>
                  Real Work. Real Agencies. Real Results.
                </h1>
              </BlurReveal>
              <BlurReveal delay={0.2}>
                <p className={styles.heroSubtitle}>
                  Systems, automation, and infrastructure we&apos;ve shipped for agencies
                  across industries - from staffing to e-commerce to non-profits.
                </p>
              </BlurReveal>
            </div>
            <BlurReveal delay={0.3}>
              <div className={styles.imageBlock}>
                <Image
                  src="/images/hero-our-work.jpg"
                  alt="Team brainstorming and reviewing project results"
                  width={600}
                  height={450}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  priority
                />
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.navy}`}>
        <div className={styles.sectionInner}>
          <div className={styles.filterBar} role="tablist" aria-label="Filter projects by category">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.filterButton} ${activeFilter === cat ? styles.active : ''}`}
                onClick={() => setActiveFilter(cat)}
                role="tab"
                aria-selected={activeFilter === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className={styles.cardsGrid}>
            {filtered.map((project, i) => (
              <BlurReveal key={project.title} delay={i * 0.06}>
                <div className={styles.portfolioCard}>
                  <div className={styles.portfolioImage}>
                    <Image
                      src={project.image}
                      alt={`${project.title} project preview`}
                      width={600}
                      height={400}
                    />
                  </div>
                  <div className={styles.portfolioContent}>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <div className={styles.portfolioTags}>
                      {project.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaContent}>
            <BlurReveal>
              <h2>Want Results Like These?</h2>
              <p>
                Tell us about your project. We&apos;ll tell you exactly how we&apos;d approach it.
              </p>
              <div style={{ marginTop: 30 }}>
                <MagneticButton href="/contact" size="large">
                  Start Your Project <HiArrowRight />
                </MagneticButton>
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>
    </>
  );
}
