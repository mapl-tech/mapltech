import type { Metadata } from 'next';
import {
  HiCheck,
  HiArrowRight,
  HiBolt,
  HiCpuChip,
  HiMagnifyingGlass,
  HiArrowsPointingOut,
  HiShieldCheck,
  HiCursorArrowRays,
} from 'react-icons/hi2';
import MagneticButton from '@/components/ui/MagneticButton';
import SectionHeading from '@/components/ui/SectionHeading';
import BlurReveal from '@/components/ui/BlurReveal';
import Accordion from '@/components/ui/Accordion';
import { pricing } from '@/config/site';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'MAPL TECH pricing for web development, automation & AI workflows, custom internal tools, cloud engineering, and agency partnerships. Transparent pricing with retainer options.',
  openGraph: {
    title: 'Pricing | MAPL TECH',
    description:
      'Transparent pricing for web development, agency automation, internal tools, cloud engineering, and partnership bundles.',
  },
};

const webDevFaq = [
  {
    question: 'How long does a typical web development project take?',
    answer:
      'Starter sites typically ship in 3-4 weeks. Growth/E-Commerce projects run 5-8 weeks. Advanced and Enterprise builds are scoped individually, but most launch within 8-14 weeks. We give you a clear timeline during discovery and stick to it.',
  },
  {
    question: 'Do you work with our existing designs, or do you handle design too?',
    answer:
      'Both. Most agencies bring their own designs and we build pixel-perfect from Figma, Sketch, or XD files. If you need design support, we can collaborate with your team or connect you with a design partner.',
  },
  {
    question: 'What technologies do you build with?',
    answer:
      'We use the right tool for each project - React, Next.js, WordPress (custom themes, not page builders), Node.js, Python, and more. Every decision is based on your project requirements, not our preferences.',
  },
  {
    question: 'What happens after the site launches?',
    answer:
      'Every plan includes post-launch support (30-90 days depending on tier). After that, our monthly maintenance plans keep your site secure, fast, and updated. Most clients choose a maintenance plan because it costs far less than fixing problems later.',
  },
  {
    question: 'Can you rebuild our existing site without downtime?',
    answer:
      'Yes. We build the new site on a staging environment, migrate content, test everything, and do a zero-downtime cutover. Your visitors never see a broken page.',
  },
  {
    question: 'Do you offer payment plans?',
    answer:
      'Yes. We typically split projects into milestone-based payments - a deposit to start, a mid-project payment, and a final payment at launch. We will work out a structure that fits your cash flow.',
  },
];

const differentiators = [
  {
    icon: <HiBolt size={22} />,
    title: 'Performance-First',
    description: '90+ Lighthouse scores out of the box. Every site ships fast because performance is built into our process, not bolted on after.',
  },
  {
    icon: <HiCpuChip size={22} />,
    title: 'AI-Ready Architecture',
    description: 'Your site is built to integrate with AI tools, chatbots, and intelligent automation from day one - not retrofitted later.',
  },
  {
    icon: <HiMagnifyingGlass size={22} />,
    title: 'SEO Architecture',
    description: 'Technical SEO is baked into every build - semantic HTML, structured data, crawl optimization, and Core Web Vitals tuning.',
  },
  {
    icon: <HiArrowsPointingOut size={22} />,
    title: 'Built for Scale',
    description: 'Clean, documented code with scalable architecture. Your site grows with your business instead of becoming technical debt.',
  },
  {
    icon: <HiShieldCheck size={22} />,
    title: 'Security-Focused',
    description: 'Security headers, input validation, dependency auditing, and best practices built in. Your site is hardened from the start.',
  },
  {
    icon: <HiCursorArrowRays size={22} />,
    title: 'Conversion-Optimized UX',
    description: 'Every interaction is designed to guide visitors toward action. Fast load times, clear CTAs, and friction-free user flows.',
  },
];

export default function PricingPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <BlurReveal>
            <span className={styles.heroLabel}>Pricing</span>
            <h1 className={styles.heroTitle}>
              Invest in Systems That Pay for Themselves
            </h1>
            <p className={styles.heroSubtitle}>
              Every dollar you spend on manual work, broken workflows, or patchwork tools is money left on the table.
              Our clients typically see ROI within the first 90 days. Pick the engagement that fits your agency and start reclaiming your time.
            </p>
          </BlurReveal>

          <BlurReveal delay={0.15}>
            <div className={styles.quickNav}>
              <a href="#web-development" className={styles.quickNavLink}>
                Web Development
              </a>
              <span className={styles.quickNavDivider} />
              <a href="#automation" className={styles.quickNavLink}>
                Automation & AI
              </a>
              <span className={styles.quickNavDivider} />
              <a href="#internal-tools" className={styles.quickNavLink}>
                Internal Tools
              </a>
              <span className={styles.quickNavDivider} />
              <a href="#cloud-engineering" className={styles.quickNavLink}>
                Cloud Engineering
              </a>
              <span className={styles.quickNavDivider} />
              <a href="#bundles" className={styles.quickNavLink}>
                Agency Bundles
              </a>
              <span className={styles.quickNavDivider} />
              <a href="#hourly" className={styles.quickNavLink}>
                Hourly Rates
              </a>
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* Web Development */}
      <section id="web-development" className={styles.category}>
        <div className={styles.categoryInner}>
          <SectionHeading
            label="Web Development"
            title="Websites That Work as Hard as You Do"
            subtitle="Custom-coded, performance-optimized sites that convert visitors into clients. No templates. No page builders. No compromises."
          />
          <div className={styles.webDevGrid}>
            {pricing.webDevelopment.tiers.map((tier, i) => (
              <BlurReveal key={tier.name} delay={i * 0.08}>
                <div className={`${styles.tierCard} ${i === 1 ? styles.featured : ''}`}>
                  {i === 1 && <span className={styles.tierBadge}>Most Popular</span>}
                  <h3 className={styles.tierName}>{tier.name}</h3>
                  <p className={styles.tierDescription}>{tier.description}</p>
                  <div className={styles.tierPrice}>
                    {tier.price === 'Custom' ? (
                      <span className={styles.customPrice}>Custom</span>
                    ) : (
                      <>
                        {tier.price}
                        <span className={styles.tierPriceLabel}>starting at</span>
                      </>
                    )}
                  </div>
                  <div className={styles.tierDivider} />
                  <p className={styles.includedLabel}>What&apos;s included:</p>
                  <ul className={styles.tierFeatures}>
                    {tier.features.map((f) => (
                      <li key={f}><HiCheck size={16} />{f}</li>
                    ))}
                  </ul>
                  <MagneticButton href="/contact-us">
                    {tier.price === 'Custom' ? 'Talk to Us' : 'Get Started'}
                  </MagneticButton>
                </div>
              </BlurReveal>
            ))}
          </div>

          {/* Maintenance Add-ons */}
          <div className={styles.retainersSection}>
            <h3 className={styles.retainersTitle}>
              Your site needs care after launch day
            </h3>
            <p className={styles.retainersSubtitle}>
              Security patches, performance monitoring, and ongoing updates keep your site fast, safe, and growing.
            </p>
            <div className={styles.retainersGrid}>
              {pricing.webDevelopment.maintenance.map((m, i) => (
                <BlurReveal key={m.name} delay={i * 0.1}>
                  <div className={styles.retainerCard}>
                    <h4>{m.name}</h4>
                    <div className={styles.retainerPrice}>{m.price}</div>
                    <p className={styles.retainerDescription}>{m.description}</p>
                  </div>
                </BlurReveal>
              ))}
            </div>
          </div>

          {/* Not sure callout */}
          <BlurReveal delay={0.1}>
            <div className={styles.notSureCallout}>
              <h3>Not sure which plan fits your project?</h3>
              <p>
                Tell us what you need and we will recommend the right scope and budget. No pressure, no hard sell - just honest guidance.
              </p>
              <MagneticButton href="/contact-us" variant="secondary">
                Book a Free Consultation <HiArrowRight />
              </MagneticButton>
            </div>
          </BlurReveal>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className={styles.differentiators}>
        <div className={styles.differentiatorsInner}>
          <SectionHeading
            label="Why MAPL TECH"
            title="What Makes Us Different"
            subtitle="Every agency can build a website. Here is why agencies choose us for the ones that matter."
          />
          <div className={styles.differentiatorsGrid}>
            {differentiators.map((item, i) => (
              <BlurReveal key={item.title} delay={i * 0.06}>
                <div className={styles.differentiatorCard}>
                  <div className={styles.differentiatorIcon} aria-hidden="true">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <div className={styles.faqInner}>
          <SectionHeading
            label="FAQ"
            title="Questions We Get Asked a Lot"
            subtitle="Straight answers so you can make an informed decision."
          />
          <BlurReveal>
            <Accordion items={webDevFaq} />
          </BlurReveal>
        </div>
      </section>

      {/* Automation & AI */}
      <section id="automation" className={styles.category}>
        <div className={styles.categoryInner}>
          <SectionHeading
            label="Automation & AI"
            title="Stop Doing Manually What Should Run on Autopilot"
            subtitle="Agencies that automate their intake, CRM, and ops save 15-20 hours per week. Here's how to get there."
          />
          <div className={styles.tiersGrid}>
            {pricing.automation.tiers.map((tier, i) => (
              <BlurReveal key={tier.name} delay={i * 0.1}>
                <div className={`${styles.tierCard} ${i === 1 ? styles.featured : ''}`}>
                  {i === 1 && <span className={styles.tierBadge}>Most Popular</span>}
                  <h3 className={styles.tierName}>{tier.name}</h3>
                  <p className={styles.tierDescription}>{tier.description}</p>
                  <div className={styles.tierPrice}>
                    {tier.price}
                    <span className={styles.tierPriceLabel}>one-time</span>
                  </div>
                  <div className={styles.tierDivider} />
                  <p className={styles.includedLabel}>What&apos;s included:</p>
                  <ul className={styles.tierFeatures}>
                    {tier.features.map((f) => (
                      <li key={f}><HiCheck size={16} />{f}</li>
                    ))}
                  </ul>
                  <MagneticButton href="/contact-us">Get Started</MagneticButton>
                </div>
              </BlurReveal>
            ))}
          </div>

          <div className={styles.retainersSection}>
            <h3 className={styles.retainersTitle}>
              Automations break when nobody&apos;s watching them
            </h3>
            <p className={styles.retainersSubtitle}>
              A retainer keeps your workflows running, optimized, and evolving as your agency scales.
            </p>
            <div className={styles.retainersGrid}>
              {pricing.automation.retainers.map((r, i) => (
                <BlurReveal key={r.name} delay={i * 0.1}>
                  <div className={styles.retainerCard}>
                    <h4>{r.name}</h4>
                    <div className={styles.retainerPrice}>{r.price}</div>
                  </div>
                </BlurReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Custom Internal Tools */}
      <section id="internal-tools" className={styles.category}>
        <div className={styles.categoryInner}>
          <SectionHeading
            label="Internal Tools"
            title="Replace the Spreadsheets Your Team Actually Runs On"
            subtitle="Custom dashboards, portals, and ops platforms that eliminate the duct-tape systems holding your agency back."
          />
          <div className={styles.tiersGrid}>
            {pricing.internalTools.tiers.map((tier, i) => (
              <BlurReveal key={tier.name} delay={i * 0.1}>
                <div className={`${styles.tierCard} ${i === 1 ? styles.featured : ''}`}>
                  {i === 1 && <span className={styles.tierBadge}>Most Popular</span>}
                  <h3 className={styles.tierName}>{tier.name}</h3>
                  <p className={styles.tierDescription}>{tier.description}</p>
                  <div className={styles.tierPrice}>
                    {tier.price}
                    <span className={styles.tierPriceLabel}>one-time</span>
                  </div>
                  <div className={styles.tierDivider} />
                  <p className={styles.includedLabel}>What&apos;s included:</p>
                  <ul className={styles.tierFeatures}>
                    {tier.features.map((f) => (
                      <li key={f}><HiCheck size={16} />{f}</li>
                    ))}
                  </ul>
                  <MagneticButton href="/contact-us">Get Started</MagneticButton>
                </div>
              </BlurReveal>
            ))}
          </div>

          <div className={styles.retainersSection}>
            <h3 className={styles.retainersTitle}>
              Your tools should grow with your agency
            </h3>
            <p className={styles.retainersSubtitle}>
              New features, bug fixes, and optimizations shipped monthly so your systems never fall behind.
            </p>
            <div className={styles.retainersGrid}>
              {pricing.internalTools.retainers.map((r, i) => (
                <BlurReveal key={r.name} delay={i * 0.1}>
                  <div className={styles.retainerCard}>
                    <h4>{r.name}</h4>
                    <div className={styles.retainerPrice}>{r.price}</div>
                  </div>
                </BlurReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cloud Engineering */}
      <section id="cloud-engineering" className={styles.category}>
        <div className={styles.categoryInner}>
          <SectionHeading
            label="Cloud Engineering"
            title="Infrastructure That Runs Itself"
            subtitle="Production-grade cloud architecture, CI/CD pipelines, and monitoring - so your agency never worries about uptime or scaling."
          />
          <div className={styles.tiersGrid}>
            {pricing.cloudEngineering.tiers.map((tier, i) => (
              <BlurReveal key={tier.name} delay={i * 0.1}>
                <div className={`${styles.tierCard} ${i === 1 ? styles.featured : ''}`}>
                  {i === 1 && <span className={styles.tierBadge}>Most Popular</span>}
                  <h3 className={styles.tierName}>{tier.name}</h3>
                  <p className={styles.tierDescription}>{tier.description}</p>
                  <div className={styles.tierPrice}>
                    {tier.price}
                    <span className={styles.tierPriceLabel}>one-time</span>
                  </div>
                  <div className={styles.tierDivider} />
                  <p className={styles.includedLabel}>What&apos;s included:</p>
                  <ul className={styles.tierFeatures}>
                    {tier.features.map((f) => (
                      <li key={f}><HiCheck size={16} />{f}</li>
                    ))}
                  </ul>
                  <MagneticButton href="/contact-us">Get Started</MagneticButton>
                </div>
              </BlurReveal>
            ))}
          </div>

          <div className={styles.retainersSection}>
            <h3 className={styles.retainersTitle}>
              Your infrastructure needs attention after launch day
            </h3>
            <p className={styles.retainersSubtitle}>
              Ongoing monitoring, cost optimization, and incident response keep your cloud running smoothly as you scale.
            </p>
            <div className={styles.retainersGrid}>
              {pricing.cloudEngineering.retainers.map((r, i) => (
                <BlurReveal key={r.name} delay={i * 0.1}>
                  <div className={styles.retainerCard}>
                    <h4>{r.name}</h4>
                    <div className={styles.retainerPrice}>{r.price}</div>
                  </div>
                </BlurReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partner Bundles */}
      <section id="bundles" className={styles.bundlesSection}>
        <div className={styles.bundlesInner}>
          <SectionHeading
            label="Best Value"
            title="The Smartest Agencies Don't Hire. They Partner."
            subtitle="One predictable monthly cost. A full engineering team on tap. Zero overhead."
          />
          <p className={styles.bundlesDescription}>
            Hiring a senior developer costs $120K+/year before benefits. Our bundles give you an entire engineering
            team for a fraction of the cost - with no recruiting, no onboarding, and no downtime between projects.
          </p>
          <div className={styles.bundlesGrid}>
            {pricing.bundles.map((bundle, i) => (
              <BlurReveal key={bundle.name} delay={i * 0.15}>
                <div className={styles.bundleCard}>
                  {i === 1 && <span className={styles.tierBadge}>Recommended</span>}
                  <h3>{bundle.name}</h3>
                  <p className={styles.bundleDescription}>{bundle.description}</p>
                  <div className={styles.bundlePrice}>
                    {bundle.price}
                    <span className={styles.tierPriceLabel}>per month</span>
                  </div>
                  <div className={styles.tierDivider} />
                  <p className={styles.includedLabel}>What&apos;s included:</p>
                  <ul className={styles.bundleFeatures}>
                    {bundle.features.map((f) => (
                      <li key={f}><HiCheck size={16} />{f}</li>
                    ))}
                  </ul>
                  <MagneticButton href="/contact-us">
                    Become a Partner <HiArrowRight />
                  </MagneticButton>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Hourly Rates */}
      <section id="hourly" className={styles.hourlySection}>
        <div className={styles.hourlyInner}>
          <SectionHeading
            label="Hourly"
            title="Quick Fix? We've Got You."
            subtitle="For urgent fixes, small tasks, or scoping out a bigger engagement."
          />
          <div className={styles.hourlyGrid}>
            <BlurReveal>
              <div className={styles.hourlyCard}>
                <h3>Standard Rate</h3>
                <div className={styles.hourlyPrice}>{pricing.hourlyRates.standard}</div>
                <p>Development, automation, and systems work</p>
              </div>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <div className={styles.hourlyCard}>
                <h3>Emergency / AI Specialist</h3>
                <div className={styles.hourlyPrice}>{pricing.hourlyRates.emergency}</div>
                <p>Urgent fixes, AI agent development, and specialized work</p>
              </div>
            </BlurReveal>
          </div>
          <BlurReveal delay={0.2}>
            <p className={styles.hourlyNote}>
              Hourly is great for a quick win, but most agencies switch to a bundle within 30 days.
              Predictable costs beat surprise invoices every time.
            </p>
          </BlurReveal>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <BlurReveal>
            <h2>Let&apos;s Find the Right Fit for Your Agency</h2>
            <p>
              Tell us what&apos;s eating up your team&apos;s time. We&apos;ll show you exactly where
              automation and better systems will save you money - and build you a plan to get there.
            </p>
            <MagneticButton href="/contact-us" size="large">
              Book Your Free Strategy Call <HiArrowRight />
            </MagneticButton>
          </BlurReveal>
        </div>
      </section>
    </>
  );
}
