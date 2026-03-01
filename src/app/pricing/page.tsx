import type { Metadata } from 'next';
import { HiCheck, HiArrowRight } from 'react-icons/hi2';
import MagneticButton from '@/components/ui/MagneticButton';
import SectionHeading from '@/components/ui/SectionHeading';
import BlurReveal from '@/components/ui/BlurReveal';
import { pricing } from '@/config/site';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'MAPL TECH pricing for automation & AI workflows, custom internal tools, and systems-focused web development. Transparent pricing with retainer and partnership options.',
  openGraph: {
    title: 'Pricing | MAPL TECH',
    description:
      'Transparent pricing for agency automation, internal tools, and web development services.',
  },
};

export default function PricingPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <BlurReveal>
            <span className={styles.heroLabel}>Pricing</span>
            <h1 className={styles.heroTitle}>
              Honest Pricing. No Hidden Fees. No Surprises.
            </h1>
            <p className={styles.heroSubtitle}>
              We&apos;re your engineering partner, not a vendor with a confusing rate card.
              Pick a project tier, ongoing retainer, or agency bundle — and know exactly what you&apos;re getting.
            </p>
          </BlurReveal>

          <BlurReveal delay={0.15}>
            <div className={styles.quickNav}>
              <a href="#automation" className={styles.quickNavLink}>
                Automation & AI
              </a>
              <span className={styles.quickNavDivider} />
              <a href="#internal-tools" className={styles.quickNavLink}>
                Internal Tools
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

      {/* Automation & AI */}
      <section id="automation" className={styles.category}>
        <div className={styles.categoryInner}>
          <SectionHeading
            label="Automation & AI"
            title="Automation & AI Workflow Setup"
            subtitle="From foundational CRM automation to enterprise-grade AI agents — choose the level that fits."
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
                  <MagneticButton href="/contact">Get Started</MagneticButton>
                </div>
              </BlurReveal>
            ))}
          </div>

          <div className={styles.retainersSection}>
            <h3 className={styles.retainersTitle}>
              Need ongoing support after launch?
            </h3>
            <p className={styles.retainersSubtitle}>
              Keep your automations optimized and evolving with a monthly retainer.
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
            title="Custom Internal Tools"
            subtitle="Dashboards, portals, and operational platforms built around how your agency actually works."
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
                  <MagneticButton href="/contact">Get Started</MagneticButton>
                </div>
              </BlurReveal>
            ))}
          </div>

          <div className={styles.retainersSection}>
            <h3 className={styles.retainersTitle}>
              Need ongoing support after launch?
            </h3>
            <p className={styles.retainersSubtitle}>
              Keep your tools maintained and evolving with a monthly retainer.
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

      {/* Partner Bundles */}
      <section id="bundles" className={styles.bundlesSection}>
        <div className={styles.bundlesInner}>
          <SectionHeading
            label="Best Value"
            title="Agency Partner Bundles"
            subtitle="One monthly price. Full engineering support. No scope anxiety."
          />
          <p className={styles.bundlesDescription}>
            For agencies that need a dedicated engineering partner — not just a one-off project.
            Bundles combine automation, tools, and web development into a single predictable monthly cost.
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
                  <MagneticButton href="/contact">
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
            title="Need Something Custom?"
            subtitle="For one-off tasks or projects that don't fit neatly into a tier."
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
              Hourly works for quick fixes, but agencies prefer predictable costs.
              For ongoing work, our partner bundles deliver better value.
            </p>
          </BlurReveal>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <BlurReveal>
            <h2>Not Sure Where to Start?</h2>
            <p>
              Walk us through your agency&apos;s needs — we&apos;ll recommend the right
              engagement model and scope. No pressure, no sales pitch.
            </p>
            <MagneticButton href="/contact" size="large">
              Schedule a Free Consultation <HiArrowRight />
            </MagneticButton>
          </BlurReveal>
        </div>
      </section>
    </>
  );
}
