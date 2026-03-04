import type { Metadata } from 'next';
import { HiEnvelope, HiPhone, HiMapPin } from 'react-icons/hi2';
import SectionHeading from '@/components/ui/SectionHeading';
import BlurReveal from '@/components/ui/BlurReveal';
import ContactForm from '@/components/ui/ContactForm';
import { siteConfig, testimonials } from '@/config/site';
import styles from '@/styles/page-common.module.scss';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Start a project with MAPL TECH. Phone: +1 (647) 375-6724, Email: contact@mapltech.com. We respond within 24 hours.',
  openGraph: {
    title: 'Contact Us | MAPL TECH',
    description:
      'Start a conversation about your next project. We respond within 24 hours.',
  },
};

export default function ContactPage() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <BlurReveal>
            <span className={styles.heroLabel}>Contact Us</span>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <h1 className={styles.heroTitle}>Tell Us What You&apos;re Building</h1>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <p className={styles.heroSubtitle}>
              Whether it&apos;s a complex web build, an automation pipeline, or a custom tool -
              describe the project and we&apos;ll respond within 24 hours.
            </p>
          </BlurReveal>
        </div>
      </section>

      <section className={styles.formSection}>
        <div className={styles.formGrid}>
          <BlurReveal>
            <div className={styles.formInfo}>
              <h2>Let&apos;s Talk</h2>
              <p>
                Fill out the form and we&apos;ll get back to you within 24 hours.
                Or reach out directly - we&apos;re always happy to jump on a call.
              </p>

              <div className={styles.contactDetails}>
                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <HiEnvelope size={18} />
                  </div>
                  <div className={styles.contactText}>
                    <h4>Email</h4>
                    <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <HiPhone size={18} />
                  </div>
                  <div className={styles.contactText}>
                    <h4>Phone</h4>
                    <a href={`tel:${siteConfig.phone}`}>
                      {siteConfig.phone}
                    </a>
                  </div>
                </div>

                <div className={styles.contactItem}>
                  <div className={styles.contactIcon}>
                    <HiMapPin size={18} />
                  </div>
                  <div className={styles.contactText}>
                    <h4>Locations</h4>
                    <p>Canada (HQ) &bull; Nigeria &bull; Jamaica</p>
                  </div>
                </div>
              </div>

              {/* Testimonials */}
              <div className={styles.testimonialSidebar}>
                {testimonials.slice(0, 2).map((t) => (
                  <div key={t.name} className={styles.testimonialMini}>
                    <p className={styles.testimonialQuote}>&ldquo;{t.quote}&rdquo;</p>
                    <div className={styles.testimonialFooter}>
                      <div>
                        <div className={styles.testimonialAuthor}>{t.name}</div>
                        <div className={styles.testimonialRole}>
                          {t.role}, {t.company}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BlurReveal>

          <BlurReveal delay={0.15}>
            <ContactForm />
          </BlurReveal>
        </div>
      </section>
    </>
  );
}
