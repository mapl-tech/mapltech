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
  title: 'Automation & AI Workflow Setup',
  description:
    'MAPL TECH builds intelligent automation that connects your CRM, project tools, invoicing, and client intake into seamless pipelines. AI agents and workflows that eliminate manual busywork.',
  openGraph: {
    title: 'Automation & AI Workflow Setup | MAPL TECH',
    description:
      'Intelligent automation and AI workflows that eliminate manual busywork for agencies.',
  },
};

const features = [
  {
    icon: <HiCog8Tooth size={22} />,
    title: 'CRM That Works for You',
    description:
      'We configure your CRM to route leads, trigger follow-ups, and manage pipelines automatically — so your team focuses on closing, not data entry.',
  },
  {
    icon: <HiCircleStack size={22} />,
    title: 'Multi-System Pipelines',
    description:
      'Your website, CRM, project tools, invoicing, and internal systems — all connected into one automated pipeline that doesn\'t break.',
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

export default function AutomationPage() {
  const { tiers, retainers } = pricing.automation;

  return (
    <>
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
              <MagneticButton href="/contact" size="large">
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

      <section className={styles.pricing}>
        <div className={styles.pricingInner}>
          <SectionHeading
            label="Pricing"
            title="Automation & AI Pricing Tiers"
            subtitle="Scalable solutions from foundation setup to enterprise-grade AI workflows."
          />
          <div className={styles.pricingGrid}>
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
            subtitle="Keep your automations running smoothly with dedicated support."
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
