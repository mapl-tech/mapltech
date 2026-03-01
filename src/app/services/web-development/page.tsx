import type { Metadata } from 'next';
import {
  HiCodeBracket,
  HiDevicePhoneMobile,
  HiGlobeAlt,
  HiShieldCheck,
  HiServerStack,
  HiPaintBrush,
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
  title: 'Web Development',
  description:
    'Custom-coded websites engineered for speed, accessibility, and long-term maintainability. MAPL TECH handles the complex builds so your agency can focus on design and strategy.',
  openGraph: {
    title: 'Web Development | MAPL TECH',
    description:
      'Custom-coded, performance-optimized websites built for agencies - not page builders.',
  },
};

const features = [
  {
    icon: <HiCodeBracket size={22} />,
    title: 'Custom-Coded, Not Cobbled Together',
    description:
      'No templates, no page builders, no plugin Frankensteins. Every site is engineered from scratch - custom WordPress themes, headless CMS builds, or full-stack React.',
  },
  {
    icon: <HiGlobeAlt size={22} />,
    title: 'Speed That Ranks',
    description:
      'Sub-second load times through code splitting, image optimization, lazy loading, and SSR. Fast sites convert better and rank higher.',
  },
  {
    icon: <HiShieldCheck size={22} />,
    title: 'Works Everywhere',
    description:
      'Tested across every major browser and device. Your clients\' users get the same experience whether they\'re on Safari, Chrome, or a 5-year-old Android.',
  },
  {
    icon: <HiPaintBrush size={22} />,
    title: 'Accessible by Default',
    description:
      'WCAG 2.1 compliance isn\'t an add-on. ARIA attributes, keyboard navigation, and screen reader support are built in from day one.',
  },
  {
    icon: <HiServerStack size={22} />,
    title: 'Solid Backend Architecture',
    description:
      'APIs, databases, server logic, and caching layers - the invisible infrastructure that makes everything else work reliably.',
  },
  {
    icon: <HiDevicePhoneMobile size={22} />,
    title: 'Mobile-First Responsiveness',
    description:
      'Fluid layouts designed for mobile first, then scaled up. Every breakpoint is intentional, not an afterthought.',
  },
];

const processSteps = [
  {
    title: 'Discovery & Scoping',
    description:
      'We dig into your agency\'s needs, your client\'s goals, and the technical constraints. You get a clear spec and architecture plan before a single line of code.',
  },
  {
    title: 'Design Collaboration',
    description:
      'We work alongside your designers with wireframes and interactive prototypes - making sure every design decision is technically sound and buildable.',
  },
  {
    title: 'Build & QA',
    description:
      'Iterative sprints with weekly demos. Every feature is tested for functionality, performance, accessibility, and cross-browser consistency.',
  },
  {
    title: 'Launch & Support',
    description:
      'Zero-drama deployments with monitoring baked in. Retainer support keeps your site secure, fast, and evolving after launch.',
  },
];

export default function WebDevelopmentPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <BlurReveal>
            <span className={styles.heroLabel}>Web Development</span>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <h1 className={styles.heroTitle}>
              Web Development That Actually Performs
            </h1>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <p className={styles.heroSubtitle}>
              Custom-coded sites engineered for speed, accessibility, and long-term
              maintainability. We handle the complex builds so your agency can focus
              on design and client strategy.
            </p>
          </BlurReveal>
          <BlurReveal delay={0.3}>
            <div className={styles.heroCta} style={{ marginTop: 30 }}>
              <MagneticButton href="/contact" size="large">
                Start Your Project <HiArrowRight />
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
            label="What We Deliver"
            title="Every Layer of the Stack, Done Right"
            subtitle="From pixel-perfect frontends to bulletproof backends - we build what your agency project demands."
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

      <section className={styles.process}>
        <div className={styles.processInner}>
          <SectionHeading
            label="Our Process"
            title="How We Ship"
            subtitle="A proven workflow built around agency timelines and client expectations."
          />
          <div className={styles.processSteps}>
            {processSteps.map((step, i) => (
              <BlurReveal key={step.title} delay={i * 0.1}>
                <div className={styles.processStep}>
                  <div className={styles.processNumber}>{i + 1}</div>
                  <div className={styles.processContent}>
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
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
            title="Transparent Pricing, No Surprises"
            subtitle="Pick the tier that matches your project scope. Every plan includes post-launch support."
          />
          <div className={styles.pricingGrid}>
            {pricing.webDevelopment.tiers.map((tier, i) => (
              <BlurReveal key={tier.name} delay={i * 0.08}>
                <div className={`${styles.pricingCard} ${i === 1 ? styles.featured : ''}`}>
                  {i === 1 && <span className={styles.pricingLabel}>Most Popular</span>}
                  <h3 className={styles.pricingName}>{tier.name}</h3>
                  <p className={styles.pricingDescription}>{tier.description}</p>
                  <div className={styles.pricingPrice}>
                    {tier.price === 'Custom' ? 'Custom' : `${tier.price}+`}
                  </div>
                  <ul className={styles.pricingFeatures}>
                    {tier.features.map((f) => (
                      <li key={f}><HiCheck size={16} />{f}</li>
                    ))}
                  </ul>
                  <MagneticButton href="/contact">
                    {tier.price === 'Custom' ? 'Talk to Us' : 'Get Started'} <HiArrowRight />
                  </MagneticButton>
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
              <h2>Ready to Build Your Next Web Project?</h2>
              <p>
                Tell us about your project requirements and let&apos;s discuss how we can help.
              </p>
            </BlurReveal>
          </div>
          <BlurReveal delay={0.1}>
            <ContactForm submitLabel="Get Started" />
          </BlurReveal>
        </div>
      </section>
    </>
  );
}
