import type { Metadata } from 'next';
import Image from 'next/image';
import { FaLinkedinIn } from 'react-icons/fa6';
import SectionHeading from '@/components/ui/SectionHeading';
import BlurReveal from '@/components/ui/BlurReveal';
import TeamGrid from '@/components/ui/TeamGrid';
import { executives, teamMembers } from '@/config/team';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Leadership & Global Team',
  description:
    'Meet the executive leadership and global team behind MAPL TECH. Operating across Canada, Nigeria, and Jamaica, we build scalable web infrastructure and AI-powered digital systems.',
  openGraph: {
    title: 'Leadership & Global Team | MAPL TECH',
    description:
      'Meet the executive leadership and global team behind MAPL TECH. Operating across Canada, Nigeria, and Jamaica.',
  },
};

export default function TeamPage() {
  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <BlurReveal>
            <span className={styles.heroLabel}>Leadership & Team</span>
          </BlurReveal>
          <BlurReveal delay={0.08}>
            <h1 className={styles.heroTitle}>
              Global Leadership. Engineered Execution.
            </h1>
          </BlurReveal>
          <BlurReveal delay={0.16}>
            <p className={styles.heroSubtitle}>
              MAPL TECH is led by a cross-border executive team focused on building
              scalable digital infrastructure, AI-powered systems, and enterprise-grade
              web platforms across North America, Africa, and the Caribbean.
            </p>
          </BlurReveal>
        </div>
      </section>

      {/* Executive Leadership */}
      <section className={styles.executives}>
        <div className={styles.executivesInner}>
          <SectionHeading
            label="Executive Leadership"
            title="The People Behind the Platform"
          />
          <div className={styles.executiveGrid}>
            {executives.map((exec, i) => (
              <BlurReveal key={exec.name} delay={i * 0.1}>
                <div className={styles.executiveCard}>
                  <div className={styles.executiveAvatar}>
                    {exec.image ? (
                      <Image
                        src={exec.image}
                        alt={exec.name}
                        width={144}
                        height={144}
                        className={styles.executiveImage}
                      />
                    ) : (
                      <span className={styles.executiveInitials}>
                        {exec.name.split(' ').map((n) => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  <div className={styles.executiveHeader}>
                    <div>
                      <h2 className={styles.executiveName}>{exec.name}</h2>
                      <p className={styles.executiveTitle}>{exec.title}</p>
                    </div>
                    <a
                      href={exec.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.executiveLinkedin}
                      aria-label={`${exec.name} on LinkedIn`}
                    >
                      <FaLinkedinIn size={15} />
                    </a>
                  </div>
                  <p className={styles.executiveBio}>{exec.bio}</p>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section with Filters */}
      <section className={styles.teamSection}>
        <div className={styles.teamInner}>
          <SectionHeading
            label="Global Team"
            title="The Engineers, Strategists, and Operators"
            subtitle="Our team spans three continents, delivering technical excellence and operational precision across every engagement."
          />
          <TeamGrid members={teamMembers} />
        </div>
      </section>
    </>
  );
}
