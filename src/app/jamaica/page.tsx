import type { Metadata } from 'next';
import {
  HiCodeBracket,
  HiCpuChip,
  HiWrenchScrewdriver,
  HiArrowRight,
  HiCheck,
  HiGlobeAlt,
  HiClock,
  HiShieldCheck,
  HiChatBubbleLeftRight,
} from 'react-icons/hi2';
import Image from 'next/image';
import MagneticButton from '@/components/ui/MagneticButton';
import SectionHeading from '@/components/ui/SectionHeading';
import BlurReveal from '@/components/ui/BlurReveal';
import ContactForm from '@/components/ui/ContactForm';
import styles from '@/styles/page-common.module.scss';

export const metadata: Metadata = {
  title: 'MAPL TECH Jamaica | Systems, Automation & Web Development for Jamaican Agencies',
  description:
    'MAPL TECH Jamaica delivers systems, automation, AI workflows, web development, and custom internal tools for agencies in Kingston, Montego Bay, and across Jamaica. Canadian engineering, Caribbean connection.',
  keywords: 'MAPL TECH Jamaica, web development Jamaica, automation Jamaica, AI workflows Kingston, agency infrastructure Caribbean, custom tools Jamaica',
  openGraph: {
    title: 'MAPL TECH Jamaica | Engineering Partner for Jamaican Agencies',
    description:
      'Canadian-headquartered engineering partner with a Jamaica branch. Systems, automation, and infrastructure for Caribbean agencies.',
    url: 'https://mapltech.com/jamaica',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAPL TECH Jamaica',
    description: 'Systems, automation, and infrastructure for Jamaican agencies.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MAPL TECH Jamaica',
  description: 'Systems, automation, and infrastructure partner for Jamaican agencies.',
  url: 'https://mapltech.com/jamaica',
  parentOrganization: {
    '@type': 'Organization',
    name: 'MAPL TECH',
    url: 'https://mapltech.com',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Jamaica',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@mapltech.com',
    contactType: 'sales',
    areaServed: 'JM',
    availableLanguage: 'English',
  },
};

const services = [
  {
    icon: <HiCodeBracket size={22} />,
    title: 'Web Development',
    description:
      'Custom-coded sites built for Caribbean audiences - fast load times optimized for local network conditions, mobile-first design, and SEO tailored for regional search.',
    href: '/services/web-development',
  },
  {
    icon: <HiCpuChip size={22} />,
    title: 'Automation & AI Workflows',
    description:
      'Eliminate manual processes across your agency. Automated CRM pipelines, AI-powered client intake, and smart workflows that connect every tool your team uses.',
    href: '/services/automation-ai-workflow-setup',
  },
  {
    icon: <HiWrenchScrewdriver size={22} />,
    title: 'Custom Internal Tools',
    description:
      'Client portals, project dashboards, and reporting systems designed for Caribbean agencies - with integrations for local payment providers and business tools.',
    href: '/services/custom-internal-tools',
  },
];

const whyChoose = [
  {
    icon: <HiGlobeAlt size={20} />,
    title: 'Canadian Quality, Caribbean Heart',
    description:
      'Headquartered in Canada with a dedicated Jamaica branch and deep ties to the Caribbean community. International standards with local understanding.',
  },
  {
    icon: <HiClock size={20} />,
    title: 'Same Time Zone Collaboration',
    description:
      'Our Jamaica team works in EST/AST - the same time zone as your agency. Real-time collaboration, fast responses, and no overnight delays.',
  },
  {
    icon: <HiShieldCheck size={20} />,
    title: 'Optimized for Caribbean Markets',
    description:
      'We build for local realities - mobile-heavy audiences, Caribbean payment gateways, regional SEO, and performance optimization for island connectivity.',
  },
  {
    icon: <HiChatBubbleLeftRight size={20} />,
    title: 'Transparent & Reliable',
    description:
      'Weekly project updates, documented decisions, and clean handoffs. We communicate clearly so your team always knows where things stand.',
  },
];

const caseStudy = {
  company: 'Caribbean Digital Agency',
  location: 'Kingston, Jamaica',
  challenge:
    'Outdated WordPress sites for multiple clients running on slow shared hosting, resulting in poor page speeds and high bounce rates across the Caribbean market.',
  solution:
    'Rebuilt the agency\'s client portfolio on custom-coded, performance-optimized architecture with CDN distribution, mobile-first design, and automated deployment pipelines.',
  results: [
    'Average page load time reduced from 8s to under 2s',
    'Mobile bounce rate decreased by 55%',
    'Client satisfaction scores improved across the board',
    'Agency won 3 new retainer clients within 90 days of launch',
  ],
};

const stats = [
  { value: '83%', label: 'Internet penetration across Jamaica' },
  { value: '2.5M+', label: 'Active internet users on the island' },
  { value: '$500M+', label: 'Jamaica\'s growing digital economy' },
];

export default function JamaicaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroGrid}>
            <div>
              <BlurReveal>
                <span className={styles.heroLabel}>MAPL TECH Jamaica</span>
              </BlurReveal>
              <BlurReveal delay={0.1}>
                <h1 className={styles.heroTitle}>
                  Caribbean Agencies Deserve Engineering That Delivers
                </h1>
              </BlurReveal>
              <BlurReveal delay={0.2}>
                <p className={styles.heroSubtitle}>
                  From Kingston to Montego Bay - we provide the systems, automation, and
                  infrastructure Jamaican agencies need to compete regionally and globally.
                  Canadian engineering standards. Caribbean connection.
                </p>
              </BlurReveal>
              <BlurReveal delay={0.3}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: 30 }}>
                  <MagneticButton href="/contact-us" size="large">
                    Start a Project <HiArrowRight />
                  </MagneticButton>
                  <MagneticButton href="/services/web-development" variant="secondary" size="large">
                    Explore Services
                  </MagneticButton>
                </div>
              </BlurReveal>
            </div>
            <BlurReveal delay={0.4}>
              <div className={styles.imageBlock}>
                <Image
                  src="/images/jamaica-hero.jpg"
                  alt="Black business professionals collaborating in a meeting"
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

      {/* Local Context — Jamaica's Digital Landscape */}
      <section className={`${styles.section} ${styles.navy}`}>
        <div className={styles.sectionInner}>
          <SectionHeading
            label="The Opportunity"
            title="Jamaica's Digital Transformation Is Accelerating"
            subtitle="A connected, mobile-first population ready for agencies that can deliver modern digital experiences."
          />
          <div className={styles.referralSteps}>
            {stats.map((stat, i) => (
              <BlurReveal key={stat.label} delay={i * 0.1}>
                <div className={styles.referralStep}>
                  <div className={styles.referralNumber} style={{ fontSize: '1.5rem' }}>
                    {stat.value}
                  </div>
                  <p className={styles.referralStepDesc}>{stat.label}</p>
                </div>
              </BlurReveal>
            ))}
          </div>
          <BlurReveal delay={0.3}>
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <p style={{ maxWidth: 700, margin: '0 auto', opacity: 0.8 }}>
                Jamaica&apos;s digital economy is growing rapidly. With 83% internet penetration
                and a mobile-first population, agencies need engineering partners who can
                build fast, reliable, and scalable systems. That&apos;s where MAPL TECH comes in.
              </p>
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* Services */}
      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.sectionInner}>
          <SectionHeading
            label="Our Services"
            title="What We Build for Jamaican Agencies"
            subtitle="Solutions tailored for Caribbean audiences, local infrastructure, and island connectivity."
          />
          <div className={styles.cardsGrid}>
            {services.map((service, i) => (
              <BlurReveal key={service.title} delay={i * 0.1}>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>{service.icon}</div>
                  <h3 className={styles.cardTitle}>{service.title}</h3>
                  <p className={styles.cardDescription}>{service.description}</p>
                  <MagneticButton href={service.href} variant="secondary" size="small">
                    Learn More <HiArrowRight />
                  </MagneticButton>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose MAPL TECH */}
      <section className={`${styles.section} ${styles.navy}`}>
        <div className={styles.sectionInner}>
          <SectionHeading
            label="Why MAPL TECH"
            title="Built for How Caribbean Agencies Actually Work"
            subtitle="International quality. Caribbean understanding. Zero compromise."
          />
          <div className={`${styles.cardsGrid} ${styles.twoCol}`}>
            {whyChoose.map((item, i) => (
              <BlurReveal key={item.title} delay={i * 0.08}>
                <div className={styles.card}>
                  <div className={styles.cardIcon}>{item.icon}</div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDescription}>{item.description}</p>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Case Study */}
      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.sectionInner}>
          <SectionHeading
            label="Case Study"
            title="Real Results in the Caribbean"
            subtitle={`How we helped a ${caseStudy.location} agency transform their client portfolio.`}
          />
          <div className={styles.contentGrid}>
            <BlurReveal>
              <div className={styles.textContent}>
                <h3 style={{ marginBottom: '0.5rem' }}>{caseStudy.company}</h3>
                <p style={{ opacity: 0.6, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                  {caseStudy.location}
                </p>
                <h4 style={{ marginBottom: '0.5rem' }}>The Challenge</h4>
                <p style={{ marginBottom: '1.5rem' }}>{caseStudy.challenge}</p>
                <h4 style={{ marginBottom: '0.5rem' }}>Our Solution</h4>
                <p>{caseStudy.solution}</p>
              </div>
            </BlurReveal>
            <BlurReveal delay={0.15}>
              <div className={styles.textContent}>
                <h4 style={{ marginBottom: '1rem' }}>Results</h4>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {caseStudy.results.map((result) => (
                    <li
                      key={result}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        marginBottom: '1rem',
                        lineHeight: 1.5,
                      }}
                    >
                      <HiCheck size={18} style={{ color: '#33F0D0', flexShrink: 0, marginTop: 2 }} />
                      {result}
                    </li>
                  ))}
                </ul>
                <MagneticButton href="/our-work" variant="secondary" size="small">
                  View More Projects <HiArrowRight />
                </MagneticButton>
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className={`${styles.section} ${styles.navy}`}>
        <div className={styles.sectionInner}>
          <div className={styles.contentGrid}>
            <BlurReveal>
              <div className={styles.textContent}>
                <SectionHeading
                  label="Our Team"
                  title="Dedicated Jamaica Branch"
                  align="left"
                />
                <p>
                  MAPL TECH&apos;s Jamaica branch brings together engineers and project
                  managers with deep Caribbean roots. We understand the local business
                  culture, infrastructure landscape, and what it takes to deliver
                  technology that works for this market.
                </p>
                <p>
                  Backed by our Canadian headquarters with 25+ years of combined
                  engineering experience, our Jamaica team delivers international-grade
                  systems built with a Caribbean perspective - from tourism tech to
                  financial services to creative agency workflows.
                </p>
              </div>
            </BlurReveal>
            <BlurReveal delay={0.15}>
              <div className={styles.imageBlock}>
                <Image
                  src="/images/jamaica-team.jpg"
                  alt="Black professional leading a team discussion"
                  width={600}
                  height={400}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>

      {/* CTA with Contact Form */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaContent}>
            <BlurReveal>
              <h2>Ready to Build With MAPL TECH Jamaica?</h2>
              <p>
                Tell us about your project. Whether you&apos;re in Kingston, Montego Bay,
                or anywhere in Jamaica - we&apos;ll respond within 24 hours.
              </p>
            </BlurReveal>
          </div>
          <BlurReveal delay={0.1}>
            <ContactForm submitLabel="Start Your Project" />
          </BlurReveal>
        </div>
      </section>
    </>
  );
}
