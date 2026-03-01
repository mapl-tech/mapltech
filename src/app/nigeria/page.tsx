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
  HiUserGroup,
  HiChartBar,
} from 'react-icons/hi2';
import Image from 'next/image';
import MagneticButton from '@/components/ui/MagneticButton';
import SectionHeading from '@/components/ui/SectionHeading';
import BlurReveal from '@/components/ui/BlurReveal';
import ContactForm from '@/components/ui/ContactForm';
import ScrollOrb from '@/components/ui/ScrollOrb';
import styles from '@/styles/page-common.module.scss';

export const metadata: Metadata = {
  title: 'MAPL TECH Nigeria | Systems, Automation & Web Development for Nigerian Agencies',
  description:
    'MAPL TECH Nigeria delivers systems, automation, AI workflows, web development, and custom internal tools for agencies in Lagos, Abuja, Port Harcourt, and across Nigeria. Canadian engineering standards, local expertise.',
  keywords: 'MAPL TECH Nigeria, web development Nigeria, automation Nigeria, AI workflows Lagos, agency infrastructure Abuja, custom tools Nigeria',
  openGraph: {
    title: 'MAPL TECH Nigeria | Engineering Partner for Nigerian Agencies',
    description:
      'Canadian-headquartered engineering partner with a Nigeria branch. Systems, automation, and infrastructure for agencies in Lagos, Abuja, and beyond.',
    url: 'https://mapltech.com/nigeria',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MAPL TECH Nigeria',
    description: 'Systems, automation, and infrastructure for Nigerian agencies.',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'MAPL TECH Nigeria',
  description: 'Systems, automation, and infrastructure partner for Nigerian agencies.',
  url: 'https://mapltech.com/nigeria',
  parentOrganization: {
    '@type': 'Organization',
    name: 'MAPL TECH',
    url: 'https://mapltech.com',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Nigeria',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'contact@mapltech.com',
    contactType: 'sales',
    areaServed: 'NG',
    availableLanguage: 'English',
  },
};

const services = [
  {
    icon: <HiCodeBracket size={22} />,
    title: 'Web Development',
    description:
      'Custom-coded sites optimized for Nigerian network conditions — fast load times, minimal data usage, and mobile-first design for a market where 80%+ of users browse on mobile.',
    href: '/services/web-development',
  },
  {
    icon: <HiCpuChip size={22} />,
    title: 'Automation & AI Workflows',
    description:
      'Automate lead capture, CRM routing, invoicing, and client onboarding. AI-powered workflows that handle repetitive tasks so your team can focus on high-value work.',
    href: '/services/automation-ai-workflow-setup',
  },
  {
    icon: <HiWrenchScrewdriver size={22} />,
    title: 'Custom Internal Tools',
    description:
      'Dashboards, client portals, and reporting systems tailored for Nigerian agencies — with local payment integrations, multi-currency support, and offline-capable features.',
    href: '/services/custom-internal-tools',
  },
];

const whyChoose = [
  {
    icon: <HiGlobeAlt size={20} />,
    title: 'Canadian Standards, Nigerian Roots',
    description:
      'Headquartered in Canada with a dedicated Nigeria branch. You get international engineering quality with a team that understands the local market.',
  },
  {
    icon: <HiClock size={20} />,
    title: 'WAT-Aligned Working Hours',
    description:
      'Our Nigeria team works in West Africa Time, ensuring real-time collaboration, quick turnarounds, and no overnight communication delays.',
  },
  {
    icon: <HiShieldCheck size={20} />,
    title: 'Built for Nigerian Infrastructure',
    description:
      'We optimize for local realities — variable bandwidth, mobile-first audiences, Paystack/Flutterwave integrations, and NDPR compliance.',
  },
  {
    icon: <HiChatBubbleLeftRight size={20} />,
    title: 'Transparent Communication',
    description:
      'Weekly updates, shared project boards, and documented decisions. You always know project status without having to chase us down.',
  },
];

const caseStudy = {
  company: 'Crowngate Business Enterprises',
  location: 'Lagos, Nigeria',
  challenge:
    'Manual client onboarding process taking 3-5 business days with frequent data entry errors and lost documents.',
  solution:
    'Automated the entire onboarding pipeline — from intake form to CRM entry to document management — with AI-powered data extraction and validation.',
  results: [
    'Onboarding time reduced from 5 days to under 4 hours',
    '95% reduction in data entry errors',
    'Client satisfaction scores increased by 40%',
    'Freed up 20+ hours/week of staff time',
  ],
};

const stats = [
  { value: '80%+', label: 'Nigerian internet users browse on mobile' },
  { value: '122M+', label: 'Internet users across Nigeria' },
  { value: '$4B+', label: 'Nigerian tech ecosystem value' },
];

export default function NigeriaPage() {
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
                <span className={styles.heroLabel}>MAPL TECH Nigeria</span>
              </BlurReveal>
              <BlurReveal delay={0.1}>
                <h1 className={styles.heroTitle}>
                  Nigerian Agencies Deserve World-Class Engineering
                </h1>
              </BlurReveal>
              <BlurReveal delay={0.2}>
                <p className={styles.heroSubtitle}>
                  From Lagos to Abuja to Port Harcourt — we provide the systems, automation,
                  and infrastructure Nigerian agencies need to compete on a global stage.
                  Canadian engineering standards. Local expertise.
                </p>
              </BlurReveal>
              <BlurReveal delay={0.3}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                  <MagneticButton href="/contact" size="large">
                    Start a Project <HiArrowRight />
                  </MagneticButton>
                  <MagneticButton href="/services/web-development" variant="secondary" size="large">
                    Explore Services
                  </MagneticButton>
                </div>
              </BlurReveal>
            </div>
            <div className={styles.heroOrb} aria-hidden="true">
              <BlurReveal delay={0.4}>
                <ScrollOrb variant="mixed" rotationMultiplier={1} />
              </BlurReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Local Context — Nigeria's Digital Landscape */}
      <section className={`${styles.section} ${styles.navy}`}>
        <div className={styles.sectionInner}>
          <SectionHeading
            label="The Opportunity"
            title="Nigeria's Digital Economy Is Booming"
            subtitle="The largest tech ecosystem in Africa — and agencies need engineering partners who can keep up."
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
                Nigerian agencies are building for one of the fastest-growing digital
                populations in the world. MAPL TECH provides the engineering muscle
                to match that ambition — custom systems, AI automation, and scalable
                infrastructure built for the Nigerian market.
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
            title="What We Build for Nigerian Agencies"
            subtitle="Every solution is tailored for local infrastructure, mobile-first audiences, and Nigerian payment ecosystems."
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
            title="Built for How Nigerian Agencies Actually Work"
            subtitle="International quality. Local understanding. Zero compromise."
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
            title="Real Results in Nigeria"
            subtitle={`How we helped ${caseStudy.company} transform their operations.`}
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
                  title="Dedicated Nigeria Branch"
                  align="left"
                />
                <p>
                  MAPL TECH&apos;s Nigeria branch is staffed with engineers and project
                  managers who live and work in Nigeria. They understand the local business
                  landscape, infrastructure realities, and what it takes to build technology
                  that works reliably in this market.
                </p>
                <p>
                  Backed by our Canadian headquarters, our Nigeria team has access to the
                  full depth of MAPL TECH&apos;s 25+ years of combined engineering experience —
                  ensuring every project meets international standards while being
                  purpose-built for Nigerian agencies.
                </p>
              </div>
            </BlurReveal>
            <BlurReveal delay={0.15}>
              <div className={styles.imageBlock}>
                <Image
                  src="/images/team-nigeria.jpg"
                  alt="MAPL TECH Nigeria team"
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
              <h2>Ready to Build With MAPL TECH Nigeria?</h2>
              <p>
                Tell us about your project. Whether you&apos;re in Lagos, Abuja,
                Port Harcourt, or anywhere in Nigeria — we&apos;ll respond within 24 hours.
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
