import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Accordion from '@/components/ui/Accordion';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import JsonLd from '@/components/seo/JsonLd';
import { faqPage, howTo, pageGraph } from '@/lib/schema';
import ReferralEstimator from '@/components/convert/ReferralEstimator';
import ReferralSignup from '@/components/convert/ReferralSignup';
import { PROOF } from '@/components/pricing/content';
import {
  REFERRAL_CLOSE,
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
import sections from '@/components/pricing/PricingSections.module.scss';
import styles from '@/components/pricing/ReferralPage.module.scss';

/*
 * /referral (Nov 2026 award pass). What it is and how the bonus works first
 * (the live page's three steps, as numbered columns), the calculator as the
 * page's one interaction, what the agency you introduce gets on paper with
 * the one approved client quote, the terms as FAQ, the form, and the crimson
 * close for visitors with a build of their own. Metadata (title, description,
 * canonical, Open Graph) lives in ./layout.tsx. No bonus amount is published,
 * so none is stated.
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
  const [titleLead, titleCondition] = REFERRAL_HERO.titleLines;

  return (
    <>
      <JsonLd data={referralGraph} />

      <PageHeader
        id="referral-title"
        size="l"
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Referral program' }]}
        label={REFERRAL_HERO.eyebrow}
        title={
          <>
            <span className={styles.titleLine}>{titleLead}</span> <em className={styles.titleLine}>{titleCondition}</em>
          </>
        }
        lede={<p>{REFERRAL_HERO.lede}</p>}
        actions={
          <>
            {/* The page's own action; the mobile bar repeats it (data-hero-cta). */}
            <a href="#signup" className={styles.primary} data-hero-cta="" data-cta-placement="referral_hero_primary">
              Refer an agency
            </a>
            <p className={styles.trust}>{REFERRAL_HERO.trust}</p>
          </>
        }
      />

      {/* How the bonus works, before the first scroll: three numbered columns. */}
      <section id="how" className={styles.how} aria-labelledby="how-title">
        <div className={styles.howInner}>
          <h2 id="how-title" className={styles.howLabel}>
            How the referral bonus works
          </h2>
          <ol className={sections.steps} style={{ '--cols': 3 } as CSSProperties} role="list">
            {REFERRAL_STEPS.map((step, index) => (
              <li key={step.name} className={sections.step}>
                <span className={sections.stepNo} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className={sections.stepName}>{step.name}</h3>
                  <p className={sections.stepText}>{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The one interaction. */}
      <section id="estimator" className={styles.estimator} aria-labelledby="estimator-title">
        <div className={styles.estimatorInner}>
          <header className={sections.head}>
            <p className={sections.label}>{REFERRAL_ESTIMATOR.label}</p>
            <h2 id="estimator-title" className={sections.title}>
              {REFERRAL_ESTIMATOR.title}
            </h2>
            <p className={sections.lede}>{REFERRAL_ESTIMATOR.lede}</p>
          </header>
          <ReferralEstimator signupId="signup" />
        </div>
      </section>

      {/* Paper: what your contact is offered, with the one approved client quote beside it. */}
      <section id="what-they-get" className={styles.theyGet} aria-labelledby="they-get-title">
        <div className={styles.theyGetInner}>
          <div className={styles.theyGetHead}>
            <p className={styles.paperLabel}>{REFERRAL_THEY_GET.label}</p>
            <h2 id="they-get-title" className={styles.paperTitle}>
              {REFERRAL_THEY_GET.title}
            </h2>
            <p className={styles.answer}>{REFERRAL_THEY_GET.answer}</p>
            <p className={styles.note}>{REFERRAL_THEY_GET.note}</p>
            <p className={styles.links}>
              <Link href="/pricing" className={styles.paperLink} data-cta-placement="referral_theyget_pricing">
                See the full price list<span aria-hidden="true"> →</span>
              </Link>
              <Link href="/our-work" className={styles.paperLink} data-cta-placement="referral_theyget_work">
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

      {/* Terms as FAQ: the homepage's accordion; FAQPage JSON-LD from the same array. */}
      <section id="terms" className={sections.faq} aria-labelledby="terms-title">
        <div className={sections.faqInner}>
          <div className={sections.faqHead}>
            <p className={sections.label}>{REFERRAL_TERMS_COPY.label}</p>
            <h2 id="terms-title" className={sections.title}>
              {REFERRAL_TERMS_COPY.title}
            </h2>
            <p className={sections.lede}>{REFERRAL_TERMS_COPY.lede}</p>
          </div>
          <Accordion
            name="referral-terms"
            defaultOpen={0}
            className={sections.faqList}
            items={REFERRAL_TERMS.map((item, index) => ({ id: `terms-${index + 1}`, question: item.question, answer: item.answer }))}
          />
        </div>
      </section>

      {/* The form. */}
      <section id="signup" className={styles.signup} aria-labelledby="signup-title">
        <div className={styles.signupInner}>
          <div className={styles.signupHead}>
            <p className={styles.signupLabel}>{REFERRAL_FORM.label}</p>
            <h2 id="signup-title" className={sections.title}>
              {REFERRAL_FORM.title}
            </h2>
            <p className={sections.lede}>{REFERRAL_FORM.lede}</p>
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

      <CloseBand id="referral-close-title" placement="referral_close" title={REFERRAL_CLOSE.title} lede={REFERRAL_CLOSE.lede} />
    </>
  );
}
