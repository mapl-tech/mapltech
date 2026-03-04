import type { Metadata } from 'next';
import {
  HiCpuChip,
  HiCircleStack,
  HiBolt,
  HiCog8Tooth,
  HiChartBar,
  HiUserGroup,
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
  title: 'Automation & AI Workflow Setup for Agencies',
  description:
    'MAPL TECH builds intelligent automation and AI workflows that connect your CRM, project tools, invoicing, and client intake into seamless pipelines. Custom AI agents, predictive analytics, and multi-system integrations that eliminate manual busywork for agencies.',
  keywords: [
    'automation for agencies',
    'AI workflow setup',
    'CRM automation',
    'business process automation',
    'AI agents for agencies',
    'workflow automation partner',
    'custom API integrations',
    'predictive analytics',
    'intelligent automation',
    'agency operations automation',
    'MAPL TECH automation',
  ],
  openGraph: {
    title: 'Automation & AI Workflow Setup for Agencies | MAPL TECH',
    description:
      'Intelligent automation and AI workflows that connect your CRM, tools, and client intake into seamless pipelines. Built for agencies.',
  },
  alternates: {
    canonical: 'https://mapltech.com/services/automation-ai-workflow-setup',
  },
};

const features = [
  {
    icon: <HiCog8Tooth size={22} />,
    title: 'CRM That Works for You',
    description:
      'We configure your CRM to route leads, trigger follow-ups, and manage pipelines automatically - so your team focuses on closing, not data entry.',
  },
  {
    icon: <HiCircleStack size={22} />,
    title: 'Multi-System Pipelines',
    description:
      'Your website, CRM, project tools, invoicing, and internal systems - all connected into one automated pipeline that doesn\'t break.',
  },
  {
    icon: <HiCpuChip size={22} />,
    title: 'AI-Powered Intake & Assistants',
    description:
      'Intelligent forms that qualify leads before they hit your inbox. AI assistants that handle routine inquiries so your team handles the rest.',
  },
  {
    icon: <HiBolt size={22} />,
    title: 'Custom API Integrations',
    description:
      'If two tools need to talk, we make it happen. Custom API bridges that keep data flowing across your entire tech stack.',
  },
  {
    icon: <HiChartBar size={22} />,
    title: 'AI Agents & Predictive Analytics',
    description:
      'Custom AI agents that take action, not just report data. Predictive analytics that surface what matters before you have to ask.',
  },
  {
    icon: <HiUserGroup size={22} />,
    title: 'Enterprise Orchestration',
    description:
      'Cross-department automation with governance, compliance, and full audit trails. Built for agencies managing multiple teams and clients.',
  },
];

const processSteps = [
  {
    phase: 'Phase 01',
    title: 'Discovery',
    description:
      'We audit your current tools, map every manual workflow, and identify where automation will have the highest impact on your team\'s time and revenue.',
  },
  {
    phase: 'Phase 02',
    title: 'Design',
    description:
      'We architect your automation blueprint: triggers, logic paths, data flows, and fallback scenarios. You approve the system design before we build anything.',
  },
  {
    phase: 'Phase 03',
    title: 'Development',
    description:
      'We wire your tools together with custom integrations, configure AI agents, and build the pipelines that turn hours of manual work into seconds of automation.',
  },
  {
    phase: 'Phase 04',
    title: 'Test & Launch',
    description:
      'Stress-tested with real data, edge cases, and failure scenarios. We deploy, monitor, train your team, and stay on to fine-tune performance.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Automation & AI Workflow Setup for Agencies',
  description: 'Intelligent automation and AI workflows that connect your CRM, project tools, invoicing, and client intake into seamless pipelines.',
  provider: {
    '@type': 'Organization',
    name: 'MAPL TECH',
    url: 'https://mapltech.com',
  },
  url: 'https://mapltech.com/services/automation-ai-workflow-setup',
  serviceType: 'Automation and AI Workflows',
  areaServed: ['Canada', 'Nigeria', 'Jamaica'],
};

export default function AutomationPage() {
  const { tiers, retainers } = pricing.automation;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <BlurReveal>
            <span className={styles.heroLabel}>Automation & AI</span>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <h1 className={styles.heroTitle}>
              Stop Doing Manually What Should Happen Automatically
            </h1>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <p className={styles.heroSubtitle}>
              We connect your CRM, project tools, invoicing, and client intake into
              one seamless pipeline. From simple automations to custom AI agents.
            </p>
          </BlurReveal>
          <BlurReveal delay={0.3}>
            <div className={styles.heroCta}>
              <MagneticButton href="/contact-us" size="large">
                Automate Your Workflows <HiArrowRight />
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
            label="Capabilities"
            title="Automation That Actually Saves Time"
            subtitle="Not just Zapier connections. Real engineering that connects your entire operational stack."
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

      <section className={styles.process} aria-label="Our automation and AI workflow process">
        <div className={styles.processInner}>
          <SectionHeading
            label="Our Process"
            title="From Manual Chaos to Automated Clarity"
            subtitle="A structured approach to replacing repetitive work with intelligent systems."
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
            title="Automation & AI Pricing Tiers"
            subtitle="Scalable solutions from foundation setup to enterprise-grade AI workflows."
          />
          <div className={`${styles.pricingGridThree} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8`}>
            {tiers.map((tier, i) => (
              <BlurReveal key={tier.name} delay={i * 0.1}>
                <div className={`${styles.pricingCard} ${i === 1 ? styles.featured : ''}`}>
                  {i === 1 && <span className={styles.pricingLabel}>Most Popular</span>}
                  <h3 className={styles.pricingName}>{tier.name}</h3>
                  <div className={styles.pricingPrice}>{tier.price}</div>
                  <p className={styles.pricingDescription}>{tier.description}</p>
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
            subtitle="Keep your automations running smoothly with dedicated support."
          />
          <div className={`${styles.retainerGrid} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6`}>
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
              <h2>Ready to Stop Copy-Pasting Between Tools?</h2>
              <p>
                Tell us what you&apos;re tired of doing manually. We&apos;ll build the
                automation that makes it disappear.
              </p>
            </BlurReveal>
          </div>
          <BlurReveal delay={0.1}>
            <ContactForm submitLabel="Let's Automate" />
          </BlurReveal>
        </div>
      </section>
    </>
  );
}
