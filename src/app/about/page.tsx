import type { Metadata } from 'next';
import {
  HiUserGroup,
  HiChatBubbleLeftRight,
  HiShieldCheck,
  HiCodeBracket,
  HiCog6Tooth,
  HiArrowRight,
} from 'react-icons/hi2';
import Image from 'next/image';
import MagneticButton from '@/components/ui/MagneticButton';
import SectionHeading from '@/components/ui/SectionHeading';
import BlurReveal from '@/components/ui/BlurReveal';
import styles from '@/styles/page-common.module.scss';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'MAPL TECH is the engineering partner agencies call when projects demand real systems, automation, and infrastructure - not another marketing vendor.',
  openGraph: {
    title: 'About Us | MAPL TECH',
    description:
      'The engineering backbone behind agencies that refuse to cut corners on technology.',
  },
};

export default function AboutPage() {
  const values = [
    {
      icon: <HiUserGroup size={22} />,
      title: 'Embedded Partnership',
      description:
        'We join your Slack, attend your standups, and use your tools. Your team should forget we\'re external.',
    },
    {
      icon: <HiChatBubbleLeftRight size={22} />,
      title: 'Radical Transparency',
      description:
        'No jargon, no ghosting. Weekly updates, documented decisions, and clean handoffs your team can act on immediately.',
    },
    {
      icon: <HiCodeBracket size={22} />,
      title: 'Code That Lasts',
      description:
        'We write code your developers can read, extend, and maintain - not clever hacks that fall apart when we leave.',
    },
    {
      icon: <HiShieldCheck size={22} />,
      title: 'Post-Launch Commitment',
      description:
        'We don\'t ghost after deployment. Retainer models keep your systems secure, optimized, and evolving alongside your agency.',
    },
    {
      icon: <HiCog6Tooth size={22} />,
      title: 'Systems-First Thinking',
      description:
        'Every component we build considers your existing stack, your team\'s capabilities, and where your agency is headed.',
    },
    {
      icon: <HiCog6Tooth size={22} />,
      title: 'Built to Scale',
      description:
        'Whether you\'re serving 10 clients or 100, our architecture decisions ensure your systems grow without breaking.',
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <BlurReveal>
            <span className={styles.heroLabel}>About Us</span>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <h1 className={styles.heroTitle}>
              We&apos;re Not Another Agency. We&apos;re the Team Behind Them.
            </h1>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <p className={styles.heroSubtitle}>
              When your project outgrows templates and plugins, MAPL TECH steps in.
              We handle the systems, automation, and infrastructure that turn ambitious
              agency projects into production-ready reality.
            </p>
          </BlurReveal>
        </div>
      </section>

      {/* Who We Are */}
      <section className={`${styles.section} ${styles.navy}`}>
        <div className={styles.sectionInner}>
          <div className={styles.contentGrid}>
            <BlurReveal>
              <div className={styles.textContent}>
                <SectionHeading
                  label="Who We Are"
                  title="Your Engineering Team - Without the Overhead"
                  align="left"
                />
                <p>
                  MAPL TECH exists because agencies shouldn&apos;t need to hire a full
                  engineering department to take on complex projects. We give you the
                  technical muscle on demand.
                </p>
                <p>
                  Headquartered in Toronto and Ottawa, Canada, with branches in Nigeria
                  and Jamaica - we bring 25+ years of combined experience across systems
                  architecture, automation, web development, and AI to agencies worldwide.
                </p>
                <p>
                  We don&apos;t compete with you. We amplify you. When your clients need
                  custom development, complex integrations, or intelligent automation,
                  we&apos;re the team that makes it ship.
                </p>
              </div>
            </BlurReveal>
            <BlurReveal delay={0.15}>
              <div className={styles.imageBlock}>
                <Image
                  src="/images/homepage-approach.jpg"
                  alt="Diverse tech professionals collaborating at a laptop"
                  width={600}
                  height={400}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.sectionInner}>
          <div className={styles.contentGrid}>
            <BlurReveal>
              <div className={styles.imageBlock}>
                <Image
                  src="/images/about-partnership.jpg"
                  alt="Diverse team collaborating around a laptop in an office"
                  width={600}
                  height={400}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                />
              </div>
            </BlurReveal>
            <BlurReveal delay={0.15}>
              <div className={styles.textContent}>
                <SectionHeading
                  label="Our Approach"
                  title="Partnership, Not Outsourcing"
                  align="left"
                />
                <p>
                  We don&apos;t operate like a vendor behind a ticket queue. We integrate
                  directly into your workflow - using your tools, joining your meetings,
                  communicating the way your team prefers.
                </p>
                <p>
                  Clear communication. Clean implementation. Maintainable systems. The
                  best technical solutions are the ones your own team can understand,
                  extend, and own long after the initial build.
                </p>
                <p>
                  Single project or long-term partnership - every engagement gets the
                  same engineering rigor and attention.
                </p>
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>

      {/* Why Agencies Choose Us */}
      <section className={`${styles.section} ${styles.navy}`}>
        <div className={styles.sectionInner}>
          <SectionHeading
            label="Our Values"
            title="What We Stand For"
            subtitle="The principles behind every line of code we ship."
          />
          <div className={styles.cardsGrid}>
            {values.map((value, i) => (
              <BlurReveal key={value.title} delay={i * 0.08}>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>{value.icon}</div>
                  <h3 className={styles.cardTitle}>{value.title}</h3>
                  <p className={styles.cardDescription}>{value.description}</p>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaContent}>
            <BlurReveal>
              <h2>Ready to Stop Duct-Taping Your Tech Stack?</h2>
              <p>
                Let&apos;s talk about what your agency actually needs - and build it right.
              </p>
              <div style={{ marginTop: '1.5rem' }}>
                <MagneticButton href="/contact" size="large">
                  Start the Conversation <HiArrowRight />
                </MagneticButton>
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>
    </>
  );
}
