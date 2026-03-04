'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  HiCodeBracket,
  HiCpuChip,
  HiWrenchScrewdriver,
  HiArrowRight,
  HiChevronLeft,
  HiChevronRight,
} from 'react-icons/hi2';
import SectionHeading from '@/components/ui/SectionHeading';
import BlurReveal from '@/components/ui/BlurReveal';
import TextReveal from '@/components/ui/TextReveal';
import FloatingOrbs from '@/components/ui/FloatingOrbs';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import MagneticButton from '@/components/ui/MagneticButton';
import ScrollOrb from '@/components/ui/ScrollOrb';
import ParallaxOrb from '@/components/ui/ParallaxOrb';
import ContactForm from '@/components/ui/ContactForm';
import HeroSection from '@/components/ui/glassmorphism-trust-hero';
import { testimonials, portfolioProjects } from '@/config/site';
import styles from './page.module.scss';

export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const services = [
    {
      icon: <HiCodeBracket size={24} />,
      title: 'Web Development',
      description:
        'Custom-coded sites engineered for speed, accessibility, and maintainability. No page builders, no shortcuts - just clean architecture your team can own.',
      href: '/services/web-development',
    },
    {
      icon: <HiCpuChip size={24} />,
      title: 'Automation & AI Workflows',
      description:
        'Connect your CRM, project tools, invoicing, and client intake into one seamless pipeline. We build AI agents and intelligent workflows that eliminate manual busywork.',
      href: '/services/automation-ai-workflow-setup',
    },
    {
      icon: <HiWrenchScrewdriver size={24} />,
      title: 'Custom Internal Tools',
      description:
        'Dashboards, client portals, and reporting systems built around how your agency actually works - not how a SaaS product thinks you should.',
      href: '/services/custom-internal-tools',
    },
  ];

  const whyUsCards = [
    {
      title: 'Built for Agency Workflows',
      description:
        'We know how agencies run - multi-client juggling, tight turnarounds, evolving scopes. Our solutions fit the way you already work.',
    },
    {
      title: 'Engineering, Not Templates',
      description:
        'Every system is custom-built. No cookie-cutter themes, no fragile plugin stacks. Just clean, purpose-built code your team can actually maintain.',
    },
    {
      title: 'We Don\'t Disappear After Launch',
      description:
        'Retainer and partnership models keep your systems maintained, optimized, and evolving. We\'re in it for the long run.',
    },
    {
      title: 'Transparent From Day One',
      description:
        'Regular updates, documented code, clean handoffs. You always know where things stand - and your team can pick up right where we left off.',
    },
  ];

  const featuredProjects = portfolioProjects.filter((project) =>
    ['LRO Staffing', 'Akuma Patterson Holdings', 'UNSVCC'].includes(project.title)
  );

  return (
    <>
      {/* Hero Section */}
      <HeroSection />

      {/* How We Support Agencies */}
      <section id="services" className={styles.services} aria-label="Services">
        <div className={styles.servicesInner}>
          <SectionHeading
            label="What We Do"
            title="The Technical Work Agencies Can't Afford to Get Wrong"
            subtitle="Systems, automation, and infrastructure - built by engineers who understand agency life."
          />
          <div className={styles.servicesGrid}>
            {services.map((service, i) => (
              <BlurReveal key={service.title} delay={i * 0.12}>
                <div className={styles.serviceCard}>
                  <div className={styles.serviceIcon}>{service.icon}</div>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.serviceDescription}>{service.description}</p>
                  <Link href={service.href} className={styles.serviceLink}>
                    Learn more <HiArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
        <ParallaxOrb
          className={styles.bgOrbRight}
          side="right"
          variant="mixed"
          rotationMultiplier={1.5}
        />
      </section>

      {/* Our Approach */}
      <section className={styles.approach} aria-label="Our Approach">
        <div className={styles.approachInner}>
          <BlurReveal>
            <div className={styles.approachContent}>
              <SectionHeading
                label="Our Approach"
                title="We Embed Into Your Team"
                align="left"
              />
              <p>
                Most vendors hand off a deliverable and disappear. We join your Slack,
                attend your standups, and ship code like we sit in your office.
              </p>
              <p>
                The result: clean implementation, maintainable systems, and zero
                lost-in-translation moments between design and development.
              </p>
              <div className={styles.approachSteps}>
                {[
                  { title: 'Discover & Scope', desc: 'We learn your agency, your clients, and your pain points' },
                  { title: 'Architect & Plan', desc: 'We design systems around your workflow, not ours' },
                  { title: 'Build & Iterate', desc: 'Transparent development with weekly check-ins' },
                  { title: 'Deploy & Support', desc: 'Smooth launches with ongoing maintenance built in' },
                ].map((step, i) => (
                  <div key={i} className={styles.approachStep}>
                    <div className={styles.stepNumber}>{i + 1}</div>
                    <div className={styles.approachStepContent}>
                      <h4>{step.title}</h4>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BlurReveal>

          <BlurReveal delay={0.15}>
            <div className={styles.approachImage}>
              <Image
                src="/images/homepage-approach.jpg"
                alt="Diverse tech professionals collaborating at a laptop"
                width={600}
                height={440}
                sizes="(max-width: 1024px) 100vw, 50vw"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* Why Agencies Choose Us */}
      <section className={styles.whyUs} aria-label="Why Agencies Choose Us">
        <div className={styles.whyUsInner}>
          <SectionHeading
            label="Why Agencies Choose Us"
            title="The Numbers Speak. The Work Speaks Louder."
            subtitle="Real results from real agency partnerships."
          />

          <div className={`${styles.metrics} grid grid-cols-1 sm:grid-cols-3 gap-8`}>
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                <AnimatedCounter target={200} suffix="+" delay={0} />
              </div>
              <div className={styles.metricLabel}>Projects Supported</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                <AnimatedCounter target={25} suffix="+" delay={0.3} />
              </div>
              <div className={styles.metricLabel}>Years Combined Experience</div>
            </div>
            <div className={styles.metric}>
              <div className={styles.metricValue}>
                <AnimatedCounter target={100} suffix="%" delay={0.6} />
              </div>
              <div className={styles.metricLabel}>Client Satisfaction</div>
            </div>
          </div>

          <div className={styles.whyUsGrid}>
            {whyUsCards.map((card, i) => (
              <BlurReveal key={card.title} delay={i * 0.1}>
                <div className={styles.whyUsCard}>
                  <span className={styles.whyUsNumber}>{String(i + 1).padStart(2, '0')}</span>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </BlurReveal>
            ))}
          </div>

        </div>
        <ParallaxOrb
          className={styles.bgOrbLeft}
          side="left"
          variant="red"
          rotationMultiplier={2}
        />
      </section>

      {/* Portfolio Teaser */}
      <section className={styles.portfolio} aria-label="Selected Projects">
        <div className={styles.portfolioInner}>
          <SectionHeading
            label="Featured on DesignRush's Best Designs"
            labelHref="https://www.designrush.com/best-designs"
            title="Selected Projects & Technical Deliveries"
          />

          <div className={styles.portfolioGrid}>
            {featuredProjects.map((project, i) => {
              const card = (
                <div className={styles.portfolioCard}>
                  <div className={styles.portfolioImage}>
                    <Image
                      src={project.image}
                      alt={`${project.title} project preview`}
                      width={600}
                      height={400}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    <span className={styles.portfolioCategory}>{project.category}</span>
                  </div>
                  <div className={styles.portfolioContent}>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                </div>
              );

              return (
                <BlurReveal key={project.title} delay={i * 0.08}>
                  {project.url ? (
                    <a href={project.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'block', height: '100%' }}>
                      {card}
                    </a>
                  ) : (
                    card
                  )}
                </BlurReveal>
              );
            })}
          </div>

          <BlurReveal>
            <div className={styles.portfolioCta}>
              <MagneticButton href="/our-work" variant="secondary">
                View All Projects
              </MagneticButton>
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* Testimonials */}
      <section className={styles.testimonials} aria-label="Client Testimonials">
        <div className={styles.testimonialsInner}>
          <SectionHeading
            label="Testimonials"
            title="Don't Take Our Word for It"
            subtitle="Hear directly from the agencies and teams we've partnered with."
          />

          <div className={styles.testimonialSlider} role="region" aria-label="Testimonial carousel">
            <BlurReveal>
              <div className={styles.testimonialCard} role="tabpanel" aria-label={`Testimonial from ${testimonials[activeTestimonial].name}`}>
                <p className={styles.quote}>{testimonials[activeTestimonial].quote}</p>
                <div className={styles.author}>
                  <div>
                    <div className={styles.authorName}>
                      {testimonials[activeTestimonial].name}
                    </div>
                    <div className={styles.authorRole}>
                      {testimonials[activeTestimonial].role},{' '}
                      {testimonials[activeTestimonial].company}
                    </div>
                  </div>
                </div>
              </div>
            </BlurReveal>

            <div className={styles.testimonialControls} role="tablist" aria-label="Testimonial navigation">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  className={`${styles.testimonialDot} ${i === activeTestimonial ? styles.activeDot : ''}`}
                  onClick={() => setActiveTestimonial(i)}
                  aria-label={`View testimonial ${i + 1}`}
                  aria-selected={i === activeTestimonial}
                  role="tab"
                />
              ))}
            </div>

            <div className={styles.testimonialArrows}>
              <button
                className={styles.arrowButton}
                onClick={() =>
                  setActiveTestimonial((prev) =>
                    prev === 0 ? testimonials.length - 1 : prev - 1
                  )
                }
                aria-label="Previous testimonial"
              >
                <HiChevronLeft size={20} />
              </button>
              <button
                className={styles.arrowButton}
                onClick={() =>
                  setActiveTestimonial((prev) =>
                    prev === testimonials.length - 1 ? 0 : prev + 1
                  )
                }
                aria-label="Next testimonial"
              >
                <HiChevronRight size={20} />
              </button>
            </div>
          </div>

        </div>
        <ParallaxOrb
          className={styles.bgOrbRight}
          side="right"
          variant="teal"
          rotationMultiplier={0.6}
        />
      </section>

      {/* CTA Section */}
      <section className={styles.cta} aria-label="Get in Touch">
        <FloatingOrbs />
        <div className={styles.ctaInner}>
          <BlurReveal>
            <TextReveal as="h2" className={styles.ctaTitle}>
              Your Next Project Deserves Real Engineering
            </TextReveal>
            <p className={styles.ctaSubtitle}>
              Tell us what you&apos;re building. We&apos;ll tell you exactly how we can help.
            </p>
          </BlurReveal>
          <BlurReveal delay={0.15}>
            <div className={styles.ctaActions}>
              <MagneticButton href="/contact-us" size="large">
                Start a Conversation <HiArrowRight aria-hidden="true" style={{ marginLeft: 8 }} />
              </MagneticButton>
              <MagneticButton href="/pricing" variant="secondary" size="large">
                View Pricing
              </MagneticButton>
            </div>
          </BlurReveal>
        </div>
        <ParallaxOrb
          className={styles.bgOrbLeft}
          side="left"
          variant="red"
          rotationMultiplier={1.8}
        />
      </section>
    </>
  );
}
