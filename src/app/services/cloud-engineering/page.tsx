import type { Metadata } from 'next';
import {
  HiCloud,
  HiServerStack,
  HiShieldCheck,
  HiCpuChip,
  HiArrowPath,
  HiGlobeAlt,
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
  title: 'Cloud Engineering for Agencies',
  description:
    'MAPL TECH designs, deploys, and manages cloud infrastructure that scales with your agency. From CI/CD pipelines and Infrastructure as Code to multi-region deployments and cost optimization - we handle the cloud so you can focus on your clients.',
  keywords: [
    'cloud engineering',
    'cloud infrastructure',
    'AWS for agencies',
    'GCP cloud setup',
    'Azure infrastructure',
    'CI/CD pipelines',
    'Infrastructure as Code',
    'DevOps for agencies',
    'cloud migration',
    'cloud cost optimization',
    'MAPL TECH cloud engineering',
  ],
  openGraph: {
    title: 'Cloud Engineering for Agencies | MAPL TECH',
    description:
      'Scalable cloud infrastructure designed, deployed, and managed for agencies. CI/CD pipelines, IaC, monitoring, and security built right.',
  },
  alternates: {
    canonical: 'https://mapltech.com/services/cloud-engineering',
  },
};

const features = [
  {
    icon: <HiCpuChip size={22} />,
    title: 'Infrastructure as Code',
    description:
      'Every server, database, and network rule defined in version-controlled Terraform or Pulumi modules. Reproducible, auditable, and never configured by hand.',
  },
  {
    icon: <HiCloud size={22} />,
    title: 'Cloud Architecture & Migration',
    description:
      'We design the right architecture for your workloads on AWS, GCP, or Azure - and migrate you there with zero downtime and zero data loss.',
  },
  {
    icon: <HiArrowPath size={22} />,
    title: 'CI/CD Pipeline Engineering',
    description:
      'Automated build, test, and deploy pipelines that ship your code to production in minutes. No more manual deployments or broken releases.',
  },
  {
    icon: <HiServerStack size={22} />,
    title: 'Monitoring & Observability',
    description:
      'Full-stack observability with structured logging, distributed tracing, and alerting. Know exactly what\'s happening in your infrastructure before your clients do.',
  },
  {
    icon: <HiShieldCheck size={22} />,
    title: 'Security & Compliance',
    description:
      'IAM policies, network isolation, encryption at rest and in transit, and compliance readiness for SOC 2, HIPAA, and GDPR. Security built in, not bolted on.',
  },
  {
    icon: <HiGlobeAlt size={22} />,
    title: 'Cost Optimization & Scaling',
    description:
      'Right-sized resources, reserved capacity planning, and auto-scaling policies that keep your cloud bill predictable while handling traffic spikes.',
  },
];

const processSteps = [
  {
    phase: 'Phase 01',
    title: 'Audit',
    description:
      'We assess your current infrastructure, hosting environment, and deployment workflows. You get a clear report of risks, bottlenecks, and opportunities before we touch anything.',
  },
  {
    phase: 'Phase 02',
    title: 'Architecture',
    description:
      'We design your cloud architecture blueprint - provider selection, networking, security boundaries, and scaling strategy. You approve the plan before we provision a single resource.',
  },
  {
    phase: 'Phase 03',
    title: 'Build',
    description:
      'Infrastructure provisioned as code, CI/CD pipelines configured, monitoring deployed, and applications migrated. Every change is version-controlled and repeatable.',
  },
  {
    phase: 'Phase 04',
    title: 'Monitor & Optimize',
    description:
      'Post-launch monitoring, cost reviews, and performance tuning. We stay on to ensure your infrastructure runs reliably and your cloud spend stays under control.',
  },
];

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Cloud Engineering for Agencies',
  description: 'Scalable cloud infrastructure designed, deployed, and managed for agencies. CI/CD pipelines, IaC, monitoring, and security.',
  provider: {
    '@type': 'Organization',
    name: 'MAPL TECH',
    url: 'https://mapltech.com',
  },
  url: 'https://mapltech.com/services/cloud-engineering',
  serviceType: 'Cloud Engineering',
  areaServed: ['Canada', 'Nigeria', 'Jamaica'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Cloud Engineering Pricing',
    itemListElement: pricing.cloudEngineering.tiers.map((tier) => ({
      '@type': 'Offer',
      name: tier.name,
      description: tier.description,
      price: tier.price.replace(/[^0-9]/g, ''),
      priceCurrency: 'USD',
    })),
  },
};

export default function CloudEngineeringPage() {
  const { tiers, retainers } = pricing.cloudEngineering;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <BlurReveal>
            <span className={styles.heroLabel}>Cloud Engineering</span>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <h1 className={styles.heroTitle}>
              Infrastructure That Scales When Your Clients Do
            </h1>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <p className={styles.heroSubtitle}>
              We design, deploy, and manage cloud infrastructure so your agency
              never worries about uptime, scaling, or deployment again.
            </p>
          </BlurReveal>
          <BlurReveal delay={0.3}>
            <div className={styles.heroCta}>
              <MagneticButton href="/contact-us" size="large">
                Start Your Cloud Project <HiArrowRight />
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
            title="Cloud Done Right, From Day One"
            subtitle="Production-grade infrastructure engineering - not just spinning up servers and hoping for the best."
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

      <section className={styles.process} aria-label="Our cloud engineering process">
        <div className={styles.processInner}>
          <SectionHeading
            label="Our Process"
            title="From Audit to Always-On"
            subtitle="A methodical approach to building infrastructure you can trust."
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
            title="Cloud Engineering Pricing Tiers"
            subtitle="From first cloud setup to enterprise-grade multi-region platforms."
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
            subtitle="Keep your infrastructure running smoothly with dedicated cloud operations support."
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
              <h2>Ready to Move to the Cloud?</h2>
              <p>
                Tell us about your infrastructure challenges and let&apos;s build
                something that scales.
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
