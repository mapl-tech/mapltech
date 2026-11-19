import type { ReactNode } from 'react';
import Accordion from '@/components/ui/Accordion';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import { CLIENTS_LINE } from '@/components/flagship/content';
import JsonLd from '@/components/seo/JsonLd';
import { siteConfig } from '@/config/site';
import { faqPage, howTo, pageGraph } from '@/lib/schema';
import ReferralSignup from '@/components/convert/ReferralSignup';
import Steps from '@/components/services/Steps';
import { keepNumberWords } from '@/components/pricing/content';
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
 * /referral (Nov 2026 award pass, simplified). The page is the form: it sits
 * in the hero, beside what the program is from 1024px and right under it
 * below that, with the approved client quote beside the ask. Then how it
 * works (the live page's three steps, as numbered columns), the questions
 * with a way back to the form, and the crimson close for visitors with a
 * project of their own. Sections sit on a tighter rhythm than the long pages
 * (48-104px). Metadata (title, description, canonical, Open Graph) lives in
 * ./layout.tsx. No bonus amount is published, so none is stated, and the
 * questions say so.
 */

/** On screen, the site's address in an answer is a link; the FAQPage JSON-LD keeps the plain text. */
function linkEmail(text: string): ReactNode {
  const at = text.indexOf(siteConfig.email);
  if (at < 0) return text;
  return (
    <>
      {text.slice(0, at)}
      <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
      {text.slice(at + siteConfig.email.length)}
    </>
  );
}

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
            {/* The condition in crimson: a styled span (not <em>, which would say "stressed" to assistive tech). */}
            <span className={styles.titleLine}>{titleLead}</span>{' '}
            <span className={`${styles.titleLine} ${styles.titleAccent}`}>{titleCondition}</span>
          </>
        }
        lede={<p>{REFERRAL_HERO.lede}</p>}
        actions={
          <>
            {/* The jump to the form below 1024px (beside the copy from there, it
                is not needed); the mobile bar repeats it (data-hero-cta). */}
            <a href="#signup" className={styles.primary} data-hero-cta="" data-cta-placement="referral_hero_primary">
              Refer an agency
            </a>
            <p className={styles.trust}>{REFERRAL_HERO.trust}</p>
          </>
        }
        // What a client says about working with us, beside the introduction you are about to make.
        proof
        aside={
          // The jump target: focusable for the jump only (no ring), named by its
          // heading, so focus lands on "Refer an agency" and Tab goes on to the first field.
          <section id="signup" className={styles.formCard} aria-labelledby="signup-title" tabIndex={-1} data-anchor-target="">
            <h2 id="signup-title" className={styles.formTitle}>
              {REFERRAL_FORM.title}
            </h2>
            <p className={styles.formLede}>{REFERRAL_FORM.lede}</p>
            <ReferralSignup />
          </section>
        }
      />

      {/* How it works: three numbered columns. */}
      <section id="how" className={styles.how} aria-labelledby="how-title">
        <div className={styles.howInner}>
          <h2 id="how-title" className={styles.howLabel}>
            How it works
          </h2>
          <Steps steps={REFERRAL_STEPS.map(({ name, text }) => ({ title: name, text }))} />
        </div>
      </section>

      {/* Questions: the homepage's accordion; FAQPage JSON-LD from the same array
          (on screen "20-minute" takes a no-break hyphen, U+2011; the JSON-LD
          keeps the plain one, as on /pricing). Then back to the form. */}
      <section id="terms" className={`${sections.faq} ${styles.terms}`} aria-labelledby="terms-title">
        <div className={`${sections.faqInner} ${styles.termsInner}`}>
          <div className={sections.faqHead}>
            <p className={sections.label}>{REFERRAL_TERMS_COPY.label}</p>
            <h2 id="terms-title" className={sections.title}>
              {REFERRAL_TERMS_COPY.title}
            </h2>
            <p className={sections.lede}>{REFERRAL_TERMS_COPY.lede}</p>
          </div>
          <div className={styles.termsBody}>
            <Accordion
              name="referral-terms"
              defaultOpen={0}
              className={sections.faqList}
              items={REFERRAL_TERMS.map((item, index) => ({
                id: `terms-${index + 1}`,
                question: item.question,
                answer: linkEmail(keepNumberWords(item.answer)),
              }))}
            />
            <a href="#signup" className={styles.termsAction} data-cta-placement="referral_terms_refer">
              Refer an agency
            </a>
          </div>
        </div>
      </section>

      {/* The hero already has the quote beside the form, so the close names the
          clients instead, as the homepage and the service pages do. */}
      <CloseBand
        id="referral-close-title"
        placement="referral_close"
        title={REFERRAL_CLOSE.title}
        lede={keepNumberWords(REFERRAL_CLOSE.lede)}
        proofLine={CLIENTS_LINE}
      />
    </>
  );
}
