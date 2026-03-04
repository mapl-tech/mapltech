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
    'MAPL TECH builds custom dashboards, client portals, and operations platforms designed around how your agency actually works. Role-based access, real-time analytics, and integrations with your existing stack.',
  keywords: [
    'custom internal tools',
    'agency dashboards',
    'client portal development',
    'custom business tools',
    'internal dashboard development',
    'operations platform',
    'reporting systems for agencies',
    'role-based access tools',
    'custom software development',
    'agency operations tools',
    'MAPL TECH internal tools',
  ],
  openGraph: {
    title: 'Custom Internal Tools for Agencies | MAPL TECH',
    description:
      'Custom dashboards, client portals, and operations platforms built around how your agency actually works. Not adapted from someone else\'s workflow.',
  },
  alternates: {
    canonical: 'https://mapltech.com/services/custom-internal-tools',
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

const processSteps = [
  {
    phase: 'Phase 01',
    title: 'Discovery',
    description:
      'We shadow your team\'s actual workflows, interview stakeholders, and document every pain point. The result is a requirements spec your whole team signs off on.',
  },
  {
    phase: 'Phase 02',
    title: 'Design',
    description:
      'Interactive wireframes and clickable prototypes built around your real data. Your team tests the tool\'s flow and layout before a single line of production code.',
  },
  {
    phase: 'Phase 03',
    title: 'Development',
    description:
      'Modular builds with biweekly demos. We integrate with your existing stack, lock down permissions, and ship features your team can start using immediately.',
  },
  {
    phase: 'Phase 04',
    title: 'Test & Launch',
    description:
      'User acceptance testing with your team, security audits, and load testing. We deploy, onboard your users, and provide hands-on training to drive adoption.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Custom Internal Tools for Agencies',
  description: 'Custom dashboards, client portals, and operations platforms designed around how your agency actually works.',
  provider: {
    '@type': 'Organization',
    name: 'MAPL TECH',
    url: 'https://mapltech.com',
  },
  url: 'https://mapltech.com/services/custom-internal-tools',
  serviceType: 'Custom Internal Tools',
  areaServed: ['Canada', 'Nigeria', 'Jamaica'],
};

export default function CustomInternalToolsPage() {
  const { tiers, retainers } = pricing.internalTools;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
              <MagneticButton href="/contact-us" size="large">
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

      <section className={styles.process} aria-label="Our internal tools development process">
        <div className={styles.processInner}>
          <SectionHeading
            label="Our Process"
            title="Built With Your Team, Not Just for Them"
            subtitle="A collaborative workflow that turns operational friction into purpose-built software."
          />
          <div className={styles.processGrid}>
            <div className={styles.processLine} aria-hidden="true" />
            {processSteps.map((step, i) => (
              <BlurReveal key={step.title} delay={i * 0.1}>
                <div className={styles.processCard}>
                  <div className={styles.processNumber}>{i + 1}</div>
                  <span className={styles.processLabel}>{step.phase}</span>
                  <h3 className={styles.processTitle}>{step.title}</h3>
                  <p className={styles.processDescription}>{step.description}</p>
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
          <div className={`${styles.pricingGridThree} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8`}>
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
                  <MagneticButton href="/contact-us">
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
          <div className={`${styles.retainerGrid} grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto`}>
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
