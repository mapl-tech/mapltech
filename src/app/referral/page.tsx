import Accordion from '@/components/ui/Accordion';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import JsonLd from '@/components/seo/JsonLd';
import { faqPage, howTo, pageGraph } from '@/lib/schema';
import ReferralSignup from '@/components/convert/ReferralSignup';
import Steps from '@/components/services/Steps';
import {
  REFERRAL_CLOSE,
  REFERRAL_DESCRIPTION,
  REFERRAL_FORM,
  REFERRAL_HERO,
  REFERRAL_PATH,
  REFERRAL_STEPS,
  REFERRAL_TERMS,
  REFERRAL_TERMS_COPY,
  REFERRAL_TITLE,
} from '@/components/pricing/referralContent';
import sections from '@/components/pricing/PricingSections.module.scss';
import styles from '@/components/pricing/ReferralPage.module.scss';

/*
 * /referral (Nov 2026 award pass, simplified). What it is, then how it works
 * (the live page's three steps, as numbered columns), the form, the questions
 * and the crimson close for visitors with a project of their own. Metadata
 * (title, description, canonical, Open Graph) lives in ./layout.tsx. No bonus
 * amount is published, so none is stated.
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

      {/* How it works, before the first scroll: three numbered columns. */}
      <section id="how" className={styles.how} aria-labelledby="how-title">
        <div className={styles.howInner}>
          <h2 id="how-title" className={styles.howLabel}>
            How it works
          </h2>
          <Steps steps={REFERRAL_STEPS.map(({ name, text }) => ({ title: name, text }))} />
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
          </div>
          <div className={styles.formCard}>
            <ReferralSignup />
          </div>
        </div>
      </section>

      {/* Questions: the homepage's accordion; FAQPage JSON-LD from the same array. */}
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

      <CloseBand id="referral-close-title" placement="referral_close" title={REFERRAL_CLOSE.title} lede={REFERRAL_CLOSE.lede} />
    </>
  );
}
