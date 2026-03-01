import type { Metadata } from 'next';
import {
  HiWrenchScrewdriver,
  HiTableCells,
  HiUserCircle,
  HiDocumentChartBar,
  HiLockClosed,
  HiArrowPath,
  HiArrowRight,
  HiCheck,
} from 'react-icons/hi2';
import MagneticButton from '@/components/ui/MagneticButton';
import SectionHeading from '@/components/ui/SectionHeading';
import BlurReveal from '@/components/ui/BlurReveal';
import ContactForm from '@/components/ui/ContactForm';
import { pricing } from '@/config/site';
import styles from '@/styles/service-page.module.scss';

export const metadata: Metadata = {
  title: 'Custom Internal Tools for Agencies',
  description:
    'Custom dashboards, client portals, and operations platforms built around how your agency actually works - not how a SaaS product thinks you should.',
  openGraph: {
    title: 'Custom Internal Tools | MAPL TECH',
    description:
      'Internal tools built for your agency - not adapted from someone else\'s workflow.',
  },
};

const features = [
  {
    icon: <HiTableCells size={22} />,
    title: 'Internal Dashboards',
    description:
      'Real-time data visualization with role-based access. Your team sees exactly what they need - nothing more, nothing less.',
  },
  {
    icon: <HiUserCircle size={22} />,
    title: 'Client Portals',
    description:
      'Branded, white-label portals where clients track projects, share documents, communicate with your team, and pay invoices.',
  },
  {
    icon: <HiDocumentChartBar size={22} />,
    title: 'Ops & Reporting Systems',
    description:
      'End-to-end operations platforms with automated reports, multi-team coordination, and analytics engines your leadership team actually uses.',
  },
  {
    icon: <HiLockClosed size={22} />,
    title: 'Security Built In',
    description:
      'Encryption, authentication, role-based permissions, and compliance - baked into every tool from the start, not bolted on later.',
  },
  {
    icon: <HiArrowPath size={22} />,
    title: 'Grows With You',
    description:
      'Modern architecture that scales. Add features, users, and integrations without rewriting the foundation.',
  },
  {
    icon: <HiWrenchScrewdriver size={22} />,
    title: 'Plugs Into Your Stack',
    description:
      'Custom integrations with your existing platforms, APIs, and data sources. One unified operational experience.',
  },
];

export default function CustomInternalToolsPage() {
  const { tiers, retainers } = pricing.internalTools;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <BlurReveal>
            <span className={styles.heroLabel}>Internal Tools</span>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <h1 className={styles.heroTitle}>
              Internal Tools Built Around Your Agency - Not the Other Way Around
            </h1>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <p className={styles.heroSubtitle}>
              Dashboards, client portals, and reporting systems designed for how your
              team actually operates - not how a SaaS platform thinks you should.
            </p>
          </BlurReveal>
          <BlurReveal delay={0.3}>
            <div className={styles.heroCta}>
              <MagneticButton href="/contact" size="large">
                Build Your Tools <HiArrowRight />
              </MagneticButton>
              <MagneticButton href="/pricing" variant="secondary" size="large">
                View Pricing
              </MagneticButton>
            </div>
          </BlurReveal>
        </div>
      </section>

      <section className={styles.features}>
        <div className={styles.featuresInner}>
          <SectionHeading
            label="What We Build"
            title="Your Agency Deserves Its Own Tools"
            subtitle="Off-the-shelf software forces you to adapt. We build tools that adapt to you."
          />
          <div className={styles.featuresGrid}>
            {features.map((feature, i) => (
              <BlurReveal key={feature.title} delay={i * 0.08}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>{feature.icon}</div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.pricing}>
        <div className={styles.pricingInner}>
          <SectionHeading
            label="Pricing"
            title="Internal Tools Pricing"
            subtitle="From dashboards to full operational platforms, we have a solution for every scale."
          />
          <div className={styles.pricingGrid}>
            {tiers.map((tier, i) => (
              <BlurReveal key={tier.name} delay={i * 0.1}>
                <div className={`${styles.pricingCard} ${i === 1 ? styles.featured : ''}`}>
                  {i === 1 && <span className={styles.pricingLabel}>Most Popular</span>}
                  <h3 className={styles.pricingName}>{tier.name}</h3>
                  <div className={styles.pricingPrice}>{tier.price}</div>
                  <ul className={styles.pricingFeatures}>
                    {tier.features.map((feature) => (
                      <li key={feature}>
                        <HiCheck size={16} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <MagneticButton href="/contact">
                    Get Started
                  </MagneticButton>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.retainers}>
        <div className={styles.retainersInner}>
          <SectionHeading
            label="Ongoing Support"
            title="Retainer Options"
            subtitle="Keep your tools evolving with dedicated development support."
          />
          <div className={styles.retainerGrid}>
            {retainers.map((retainer, i) => (
              <BlurReveal key={retainer.name} delay={i * 0.1}>
                <div className={styles.retainerCard}>
                  <h3>{retainer.name}</h3>
                  <div className={styles.retainerPrice}>{retainer.price}</div>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaContent}>
            <BlurReveal>
              <h2>Tired of Workarounds and Spreadsheets?</h2>
              <p>
                Tell us what&apos;s slowing your team down. We&apos;ll build the tool
                that fixes it - for good.
              </p>
            </BlurReveal>
          </div>
          <BlurReveal delay={0.1}>
            <ContactForm submitLabel="Let's Build" />
          </BlurReveal>
        </div>
      </section>
    </>
  );
}
