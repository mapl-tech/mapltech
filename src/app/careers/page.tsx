import type { Metadata } from 'next';
import { HiArrowRight, HiEnvelope } from 'react-icons/hi2';
import MagneticButton from '@/components/ui/MagneticButton';
import SectionHeading from '@/components/ui/SectionHeading';
import BlurReveal from '@/components/ui/BlurReveal';
import CareersFilter from '@/components/ui/CareersFilter';
import { careers, siteConfig } from '@/config/site';
import styles from '@/styles/page-common.module.scss';

export const metadata: Metadata = {
  title: 'Careers',
  description:
    'Join MAPL TECH — we\'re hiring across Canada, Nigeria, and Jamaica. Remote and on-site roles in Ottawa, Toronto, Lagos, Abuja, Kingston, and Montego Bay.',
  openGraph: {
    title: 'Careers | MAPL TECH',
    description: 'Work with leading agencies. Ship real systems. Join MAPL TECH.',
  },
};

export default function CareersPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <BlurReveal>
            <span className={styles.heroLabel}>Careers</span>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <h1 className={styles.heroTitle}>Work That Matters. Ship Things That Last.</h1>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <p className={styles.heroSubtitle}>
              We&apos;re growing our team across Canada, Nigeria, and Jamaica —
              specialists who help agencies build real systems, real automation,
              and real infrastructure.
            </p>
          </BlurReveal>
        </div>
      </section>

      {/* Open Positions */}
      <section className={`${styles.section} ${styles.navy}`}>
        <div className={styles.sectionInner}>
          <SectionHeading
            label="Open Positions"
            title="Find Your Role"
            subtitle="Filter by country to find opportunities near you."
          />

          <CareersFilter jobs={careers} />
        </div>
      </section>

      {/* How to Apply */}
      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.sectionNarrow}>
          <SectionHeading
            label="How to Apply"
            title="Ready to Join Us?"
            subtitle="Send us an email with the following information."
          />

          <BlurReveal>
            <div className={styles.card} style={{ maxWidth: 600, margin: '0 auto' }}>
              <div className={styles.cardDescription} style={{ lineHeight: 2 }}>
                Email <a href={`mailto:${siteConfig.email}`} style={{ color: '#F03350' }}>{siteConfig.email}</a> with:
                <br />
                1. The job title you&apos;re applying for
                <br />
                2. How you found MAPL TECH
                <br />
                3. Your qualifications and relevant experience
                <br />
                4. Why you&apos;d be a great fit for the role
                <br />
                5. Your contact information
              </div>
              <MagneticButton
                href={`mailto:${siteConfig.email}?subject=Job Application`}
                external
              >
                <HiEnvelope /> Send Application
              </MagneticButton>
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaContent}>
            <BlurReveal>
              <h2>Don&apos;t See Your Fit?</h2>
              <p>
                We&apos;re always open to exceptional people. Tell us what you do
                best and how you&apos;d make our agency partners better.
              </p>
              <MagneticButton
                href={`mailto:${siteConfig.email}?subject=General Application`}
                size="large"
                external
              >
                Get in Touch <HiArrowRight />
              </MagneticButton>
            </BlurReveal>
          </div>
        </div>
      </section>
    </>
  );
}
