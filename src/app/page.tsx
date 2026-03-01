'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  HiCodeBracket,
  HiCpuChip,
  HiWrenchScrewdriver,
  HiArrowRight,
  HiChatBubbleLeftRight,
  HiShieldCheck,
  HiUserGroup,
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
import { testimonials, portfolioProjects } from '@/config/site';
import styles from './page.module.scss';

export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const services = [
    {
      icon: <HiCodeBracket size={24} />,
      title: 'Web Development',
      description:
        'Custom-coded sites engineered for speed, accessibility, and maintainability. No page builders, no shortcuts — just clean architecture your team can own.',
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
        'Dashboards, client portals, and reporting systems built around how your agency actually works — not how a SaaS product thinks you should.',
      href: '/services/custom-internal-tools',
    },
  ];

  const whyUsCards = [
    {
      title: 'Built for Agency Workflows',
      description:
        'We know how agencies run — multi-client juggling, tight turnarounds, evolving scopes. Our solutions fit the way you already work.',
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
        'Regular updates, documented code, clean handoffs. You always know where things stand — and your team can pick up right where we left off.',
    },
  ];

  const featuredProjects = portfolioProjects.slice(0, 6);

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero} aria-label="Hero">
        <FloatingOrbs />
        <div className={styles.heroGrid}>
          <div className={styles.heroContent}>
            <BlurReveal delay={0.1}>
              <span className={styles.heroLabel}>Systems &bull; Automation &bull; Infrastructure</span>
            </BlurReveal>
            <BlurReveal delay={0.2} yOffset={40}>
              <h1 className={styles.heroTitle}>
                The{' '}
                <span className={styles.highlight}>
                  engineering backbone
                </span>{' '}
                behind agencies that refuse to cut corners on technology
              </h1>
            </BlurReveal>
            <BlurReveal delay={0.35}>
              <p className={styles.heroSubtitle}>
                We partner with agencies to build, ship, and scale the systems, automation,
                and infrastructure their most ambitious projects demand.
              </p>
            </BlurReveal>
            <BlurReveal delay={0.5}>
              <div className={styles.heroCta}>
                <MagneticButton href="/contact" size="large">
                  Start a Project
                </MagneticButton>
                <MagneticButton href="/services/web-development" variant="secondary" size="large">
                  Explore Services
                </MagneticButton>
              </div>
            </BlurReveal>
          </div>
          <div className={styles.heroOrb} aria-hidden="true">
            <BlurReveal delay={0.6}>
              <ScrollOrb variant="red" rotationMultiplier={1} />
            </BlurReveal>
          </div>
        </div>
      </section>

      {/* How We Support Agencies */}
      <section className={styles.services} aria-label="Services">
        <div className={styles.servicesInner}>
          <SectionHeading
            label="What We Do"
            title="The Technical Work Agencies Can't Afford to Get Wrong"
            subtitle="Systems, automation, and infrastructure — built by engineers who understand agency life."
          />
          <div className={styles.servicesGrid}>
            {services.map((service, i) => (
              <BlurReveal key={service.title} delay={i * 0.12}>
                <div className={styles.serviceCard}>
                  <div className={styles.serviceIcon}>{service.icon}</div>
                  <h3 className={styles.serviceTitle}>{service.title}</h3>
                  <p className={styles.serviceDescription}>{service.description}</p>
                  <Link href={service.href} className={styles.serviceLink}>
                    Learn more <HiArrowRight />
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
              <div className={styles.approachPoints}>
                <div className={styles.approachPoint}>
                  <div className={styles.approachIcon}><HiUserGroup size={18} /></div>
                  <div className={styles.approachPointContent}>
                    <h4>Embedded Partnership</h4>
                    <p>Your tools, your channels, your cadence. We adapt to how you work.</p>
                  </div>
                </div>
                <div className={styles.approachPoint}>
                  <div className={styles.approachIcon}><HiChatBubbleLeftRight size={18} /></div>
                  <div className={styles.approachPointContent}>
                    <h4>No Surprises</h4>
                    <p>Regular updates, documented decisions, and honest timelines.</p>
                  </div>
                </div>
                <div className={styles.approachPoint}>
                  <div className={styles.approachIcon}><HiShieldCheck size={18} /></div>
                  <div className={styles.approachPointContent}>
                    <h4>Production-Grade Solutions</h4>
                    <p>Tested, documented, and built to last — not just to demo well.</p>
                  </div>
                </div>
              </div>
            </div>
          </BlurReveal>

          <BlurReveal delay={0.15}>
            <div className={styles.approachVisual}>
              {[
                'Discover & Scope — We learn your agency, your clients, and your pain points',
                'Architect & Plan — We design systems around your workflow, not ours',
                'Build & Iterate — Transparent development with weekly check-ins',
                'Deploy & Support — Smooth launches with ongoing maintenance built in',
              ].map((step, i) => (
                <div key={i} className={styles.approachStep}>
                  <div className={styles.stepNumber}>{i + 1}</div>
                  <span className={styles.stepText}>{step}</span>
                </div>
              ))}
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

          <div className={styles.metrics}>
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
            label="Our Work"
            title="Projects That Went Live — and Stayed Up"
            subtitle="Real systems built for real agencies. Here's a sample of what we've shipped."
          />

          <div className={styles.portfolioGrid}>
            {featuredProjects.map((project, i) => (
              <BlurReveal key={project.title} delay={i * 0.08}>
                <div className={styles.portfolioCard}>
                  <div className={styles.portfolioImage}>
                    <Image
                      src={project.image}
                      alt={`${project.title} project preview`}
                      width={600}
                      height={400}
                    />
                    <span className={styles.portfolioCategory}>{project.category}</span>
                  </div>
                  <div className={styles.portfolioContent}>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                </div>
              </BlurReveal>
            ))}
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
              <div className={styles.testimonialCard}>
                <p className={styles.quote}>{testimonials[activeTestimonial].quote}</p>
                <div className={styles.author}>
                  <Image
                    src={testimonials[activeTestimonial].image}
                    alt={testimonials[activeTestimonial].name}
                    width={56}
                    height={56}
                    className={styles.authorImage}
                  />
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
              <MagneticButton href="/contact" size="large">
                Start a Conversation <HiArrowRight style={{ marginLeft: 8 }} />
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
