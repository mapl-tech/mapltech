import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Accordion from '@/components/ui/Accordion';
import JsonLd from '@/components/seo/JsonLd';
import { faqPage, howTo, pageGraph } from '@/lib/schema';
import ReferralEstimator from '@/components/convert/ReferralEstimator';
import ReferralSignup from '@/components/convert/ReferralSignup';
import { PROOF } from '@/components/pricing/content';
import {
  REFERRAL_DESCRIPTION,
  REFERRAL_ESTIMATOR,
  REFERRAL_FORM,
  REFERRAL_HERO,
  REFERRAL_PATH,
  REFERRAL_STEPS,
  REFERRAL_TERMS,
  REFERRAL_TERMS_COPY,
  REFERRAL_THEY_GET,
  REFERRAL_TITLE,
} from '@/components/pricing/referralContent';
import hero from '@/components/pricing/PricingHero.module.scss';
import sections from '@/components/pricing/PricingSections.module.scss';
import styles from '@/components/pricing/ReferralPage.module.scss';

/*
 * /referral, flagship redesign (Nov 2026). What it is and how the bonus
 * works in the first screen (the live page's three steps, drawn as a
 * timeline), the calculator as the page's one interaction, what the agency
 * you introduce gets with the one approved client quote beside it, the terms
 * as FAQ, and the form. Metadata (title, description, canonical, Open Graph)
 * lives in ./layout.tsx. No bonus amount is published, so none is stated.
 */

const referralGraph = pageGraph({
  path: REFERRAL_PATH,
  name: REFERRAL_TITLE,
  description: REFERRAL_DESCRIPTION,
  nodes: [
    howTo(
      REFERRAL_STEPS.map((step) => ({ name: step.name, text: step.text })),
      { name: 'How to refer an agency to MAPL TECH', path: REFERRAL_PATH },
    ),
    faqPage(REFERRAL_TERMS, { path: REFERRAL_PATH, name: REFERRAL_TERMS_COPY.title }),
  ],
});

export default function ReferralPage() {
  return (
    <>
      <JsonLd data={referralGraph} />

      {/* What it is, and how the bonus works, before the first scroll. */}
      <section className={hero.hero} aria-labelledby="referral-title">
        <div className={hero.inner}>
          <div className={hero.head}>
            <div className={hero.eyebrowRow}>
              <span className={hero.tick} aria-hidden="true" />
              <p className={hero.eyebrow}>{REFERRAL_HERO.eyebrow}</p>
            </div>
            <h1 id="referral-title" className={styles.title}>
              {REFERRAL_HERO.titleLines.map((line) => (
                <span key={line} className={styles.titleLine}>
                  {line}
                </span>
              ))}
            </h1>
          </div>

          <div className={hero.intro}>
            <p className={hero.lede}>{REFERRAL_HERO.lede}</p>
            <div className={hero.actions}>
              <a href="#signup" className={hero.primary} data-hero-cta="" data-cta-placement="referral_hero_primary">
                Refer an agency
              </a>
            </div>
            <p className={hero.trust}>{REFERRAL_HERO.trust}</p>
          </div>

          <div id="how" className={hero.schedule}>
            <h2 className={hero.scheduleTitle}>How the referral bonus works</h2>
            <ol className={styles.steps} role="list">
              {REFERRAL_STEPS.map((step, index) => (
                <li key={step.name} className={styles.step} style={{ '--i': index } as CSSProperties}>
                  <p className={styles.stepIndex}>Step {index + 1}</p>
                  <h3 className={styles.stepName}>{step.name}</h3>
                  <p className={styles.stepText}>{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* The one interaction. */}
      <section id="estimator" className={styles.estimator} aria-labelledby="estimator-title">
        <div className={styles.inner}>
          <div className={styles.head}>
            <h2 id="estimator-title" className={styles.h2}>
              {REFERRAL_ESTIMATOR.title}
            </h2>
            <p className={styles.lede}>{REFERRAL_ESTIMATOR.lede}</p>
          </div>
          <ReferralEstimator signupId="signup" />
        </div>
      </section>

      {/* What your contact is offered, with the one approved client quote beside it. */}
      <section id="what-they-get" className={styles.theyGet} aria-labelledby="they-get-title">
        <div className={styles.split}>
          <div className={styles.splitHead}>
            <h2 id="they-get-title" className={styles.h2}>
              {REFERRAL_THEY_GET.title}
            </h2>
            <p className={styles.answer}>{REFERRAL_THEY_GET.answer}</p>
            <p className={styles.note}>{REFERRAL_THEY_GET.note}</p>
            <p className={styles.links}>
              <Link href="/pricing" className={styles.textLink}>
                See the full price list<span aria-hidden="true"> →</span>
              </Link>
              <Link href="/our-work" className={styles.textLink}>
                See the work<span aria-hidden="true"> →</span>
              </Link>
            </p>
          </div>

          {PROOF ? (
            <figure className={styles.proof}>
              <blockquote className={styles.proofQuote}>
                <p>{PROOF.quote}</p>
              </blockquote>
              <figcaption className={styles.proofBy}>
                {PROOF.image ? <Image src={PROOF.image} alt="" width={56} height={56} className={styles.avatar} /> : null}
                <span>
                  <span className={styles.proofName}>{PROOF.name}</span>
                  <span className={styles.proofRole}>
                    {PROOF.role}, {PROOF.company}
                  </span>
                </span>
              </figcaption>
            </figure>
          ) : null}
        </div>
      </section>

      {/* Terms as FAQ: native accordion in the /pricing FAQ's hairline rows, FAQPage JSON-LD from the same array. */}
      <section id="terms" className={styles.terms} aria-labelledby="terms-title">
        <div className={styles.split}>
          <div className={styles.splitHead}>
            <h2 id="terms-title" className={styles.h2}>
              {REFERRAL_TERMS_COPY.title}
            </h2>
            <p className={styles.lede}>{REFERRAL_TERMS_COPY.lede}</p>
          </div>
          <Accordion
            name="referral-terms"
            defaultOpen={0}
            className={sections.faqList}
            items={REFERRAL_TERMS.map((item, index) => ({ id: `terms-${index + 1}`, question: item.question, answer: item.answer }))}
          />
        </div>
      </section>

      {/* The close: the form itself (data-page-close hides the footer's pricing ask). */}
      <section id="signup" className={styles.signup} aria-labelledby="signup-title" data-page-close="">
        <div className={styles.split}>
          <div className={styles.splitHead}>
            <h2 id="signup-title" className={styles.h2}>
              {REFERRAL_FORM.title}
            </h2>
            <p className={styles.lede}>{REFERRAL_FORM.lede}</p>
            {/* What the form asks for, beside it: the effort question answered before the first field. */}
            <dl className={styles.needs}>
              {REFERRAL_FORM.needs.map((row) => (
                <div key={row.term} className={styles.needsRow}>
                  <dt className={styles.needsTerm}>{row.term}</dt>
                  <dd className={styles.needsDetail}>{row.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={styles.formCard}>
            <ReferralSignup />
          </div>
        </div>
      </section>
    </>
  );
}
