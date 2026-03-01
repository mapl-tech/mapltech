'use client';

import { useState, FormEvent } from 'react';
import { HiArrowRight } from 'react-icons/hi2';
import SectionHeading from '@/components/ui/SectionHeading';
import BlurReveal from '@/components/ui/BlurReveal';
import styles from '@/styles/page-common.module.scss';
import formStyles from '@/components/ui/ContactForm.module.scss';

export default function ReferralPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <>
      <section className={styles.hero}>
        <div className={`${styles.heroInner} ${styles.heroCentered}`}>
          <BlurReveal>
            <span className={styles.heroLabel}>Referral Program</span>
          </BlurReveal>
          <BlurReveal delay={0.1}>
            <h1 className={styles.heroTitle}>
              Know an Agency Struggling With Tech?
            </h1>
          </BlurReveal>
          <BlurReveal delay={0.2}>
            <p className={styles.heroSubtitle}>
              Send them our way. When they become a client,
              you earn a referral bonus for making the introduction.
            </p>
          </BlurReveal>
        </div>
      </section>

      {/* How It Works */}
      <section className={`${styles.section} ${styles.navy}`}>
        <div className={styles.sectionInner}>
          <SectionHeading
            label="How It Works"
            title="Three Steps to a Referral Bonus"
            subtitle="Simple process, real reward."
          />
          <div className={styles.referralSteps}>
            <BlurReveal delay={0}>
              <div className={styles.referralStep}>
                <div className={styles.referralNumber}>1</div>
                <h3 className={styles.referralStepTitle}>Submit a Referral</h3>
                <p className={styles.referralStepDesc}>
                  Fill out the form below with the agency or partner&apos;s details and their needs.
                </p>
              </div>
            </BlurReveal>
            <BlurReveal delay={0.1}>
              <div className={styles.referralStep}>
                <div className={styles.referralNumber}>2</div>
                <h3 className={styles.referralStepTitle}>We Reach Out</h3>
                <p className={styles.referralStepDesc}>
                  Our team contacts the referral, mentioning your introduction, and discusses their needs.
                </p>
              </div>
            </BlurReveal>
            <BlurReveal delay={0.2}>
              <div className={styles.referralStep}>
                <div className={styles.referralNumber}>3</div>
                <h3 className={styles.referralStepTitle}>Get Rewarded</h3>
                <p className={styles.referralStepDesc}>
                  When the referral becomes a client, we thank you with a referral bonus.
                </p>
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>

      {/* Referral Form */}
      <section className={`${styles.section} ${styles.dark}`}>
        <div className={styles.sectionNarrow}>
          <SectionHeading
            label="Submit a Referral"
            title="Refer an Agency or Partner"
            subtitle="Tell us about the agency you'd like to refer."
          />

          <BlurReveal>
            {submitted ? (
              <div className={`${formStyles.message} ${formStyles.success}`} role="alert">
                Thank you for your referral! We&apos;ll reach out to them soon.
              </div>
            ) : (
              <form className={formStyles.form} onSubmit={handleSubmit} aria-label="Referral form">
                <div className={formStyles.row}>
                  <div className={formStyles.field}>
                    <label className={formStyles.label} htmlFor="yourName">
                      Your Name <span className={formStyles.required}>*</span>
                    </label>
                    <input
                      id="yourName"
                      type="text"
                      className={formStyles.input}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label} htmlFor="yourEmail">
                      Your Email <span className={formStyles.required}>*</span>
                    </label>
                    <input
                      id="yourEmail"
                      type="email"
                      className={formStyles.input}
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>

                <div className={formStyles.row}>
                  <div className={formStyles.field}>
                    <label className={formStyles.label} htmlFor="refName">
                      Referral&apos;s Name <span className={formStyles.required}>*</span>
                    </label>
                    <input
                      id="refName"
                      type="text"
                      className={formStyles.input}
                      placeholder="Contact person or agency name"
                      required
                    />
                  </div>
                  <div className={formStyles.field}>
                    <label className={formStyles.label} htmlFor="refEmail">
                      Referral&apos;s Email <span className={formStyles.required}>*</span>
                    </label>
                    <input
                      id="refEmail"
                      type="email"
                      className={formStyles.input}
                      placeholder="referral@agency.com"
                      required
                    />
                  </div>
                </div>

                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="refCompany">
                    Referral&apos;s Company
                  </label>
                  <input
                    id="refCompany"
                    type="text"
                    className={formStyles.input}
                    placeholder="Agency or company name"
                  />
                </div>

                <div className={formStyles.field}>
                  <label className={formStyles.label} htmlFor="refNotes">
                    Additional Notes
                  </label>
                  <textarea
                    id="refNotes"
                    className={formStyles.textarea}
                    placeholder="Tell us about their needs or any context that would help us reach out..."
                    rows={4}
                  />
                </div>

                <button type="submit" className={formStyles.submit}>
                  Submit Referral <HiArrowRight />
                </button>
              </form>
            )}
          </BlurReveal>
        </div>
      </section>
    </>
  );
}
