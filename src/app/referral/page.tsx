import JsonLd from '@/components/seo/JsonLd';
import Accordion from '@/components/ui/Accordion';
import { faqPage, getServiceLine, pageGraph, startingPrice, type FaqItem } from '@/lib/schema';
import { testimonials } from '@/config/site';
import ConvertHero, { LastReviewed } from '@/components/convert/ConvertHero';
import Cta from '@/components/convert/Cta';
import ReferralEstimator from '@/components/convert/ReferralEstimator';
import ReferralSignup from '@/components/convert/ReferralSignup';
import shared from '@/app/convert.module.scss';

// Metadata lives in ./layout.tsx (title, description, canonical) and is untouched.

const PATH = '/referral';

const STEPS = [
  {
    index: '01 · Introduce',
    title: 'Submit a Referral',
    body: "Fill out the form below with the agency or partner's details and their needs.",
  },
  {
    index: '02 · We reach out',
    title: 'We Reach Out',
    body: 'Our team contacts the referral, mentioning your introduction, and discusses their needs.',
  },
  {
    index: '03 · You get rewarded',
    title: 'Get Rewarded',
    body: 'When the referral becomes a client, we thank you with a referral bonus.',
  },
];

export default function ReferralPage() {
  const webFrom = startingPrice(getServiceLine('web-development'));
  const automationFrom = startingPrice(getServiceLine('automation-ai-workflow-setup'));
  const toolsFrom = startingPrice(getServiceLine('custom-internal-tools'));
  const cloudFrom = startingPrice(getServiceLine('cloud-engineering'));
  const proof = testimonials[0];

  // Terms as FAQ: every answer is composed from copy already published on the site.
  const terms: FaqItem[] = [
    {
      question: 'How do I refer an agency?',
      answer:
        "Fill out the referral form with the agency or partner's details and their needs. Our team contacts the referral, mentioning your introduction, and discusses their needs.",
    },
    {
      question: 'When do I receive the referral bonus?',
      answer: 'When the referral becomes a client, we thank you with a referral bonus for making the introduction.',
    },
    {
      question: 'Who can I refer?',
      answer:
        'Agencies and partners that need systems, automation, and infrastructure support: web development, automation and AI workflows, custom internal tools, or cloud engineering.',
    },
    {
      question: 'What does the agency I refer get?',
      answer: `A 20-minute scoping call and a fixed quote after it. Web builds start at ${webFrom}, automation at ${automationFrom}, custom internal tools at ${toolsFrom} and cloud engineering at ${cloudFrom}.`,
    },
    {
      question: 'Where does MAPL TECH work?',
      answer:
        'MAPL TECH is headquartered in Canada with branches in Nigeria and Jamaica, and works with agencies in Canada, Nigeria, Jamaica and beyond.',
    },
  ];

  return (
    <>
      <JsonLd
        data={pageGraph({
          path: PATH,
          name: 'Referral Program',
          description:
            'Refer agencies to MAPL TECH and earn rewards. Our referral program thanks you for connecting us with agencies that need systems, automation, and infrastructure support.',
          nodes: [faqPage(terms, { path: PATH, name: 'Referral program terms' })],
        })}
      />

      <ConvertHero
        eyebrow="Referral Program"
        title="Know an Agency Struggling With Tech?"
        wideTitle
        lede={`Send them MAPL TECH's way. When an agency or partner you introduce becomes a client, you earn a referral bonus for making the introduction. They get what every MAPL TECH client gets: a 20-minute scoping call and a fixed quote, with web builds from ${webFrom} and automation from ${automationFrom}.`}
        facts={[
          { label: 'Reward', value: 'A referral bonus when they become a client' },
          { label: 'Who to refer', value: 'Agencies and partners that need systems, automation or infrastructure' },
          { label: 'Starting price', value: `Web ${webFrom} · Automation ${automationFrom}` },
          { label: 'Offices', value: 'Toronto (HQ) · Lagos · Kingston' },
          { label: 'Last reviewed', value: <LastReviewed path={PATH} /> },
        ]}
        actions={
          <>
            <Cta placement="referral_hero_primary" hero href="#signup" size="large">
              Refer an agency
            </Cta>
            <Cta placement="referral_hero_secondary" href="#how" variant="secondary" size="large">
              How it works
            </Cta>
          </>
        }
      />

      {/* 02 — Earnings estimator (PEAK, interaction #7) */}
      <section id="estimator" className={shared.section} aria-labelledby="estimator-title">
        <div className={shared.inner}>
          <div className={shared.sectionHead}>
            <p className="eyebrow">02 · Two inputs, one live figure</p>
            <h2 id="estimator-title" className={shared.sectionTitle}>
              How much project value would you introduce?
            </h2>
            <p className={shared.sectionSub}>
              Pick how many introductions you could make in a year and the kind of work those agencies need. The
              figure is the project value you would bring to MAPL TECH, not your payout.
            </p>
          </div>
          <ReferralEstimator />
        </div>
      </section>

      {/* 03 — How it works */}
      <section id="how" className={`${shared.section} reveal`} aria-labelledby="how-title">
        <div className={shared.inner}>
          <div className={shared.sectionHead}>
            <p className="eyebrow">03 · How it works</p>
            <h2 id="how-title" className={shared.sectionTitle}>
              Three steps to a referral bonus
            </h2>
            <p className={shared.sectionSub}>Simple process, real reward.</p>
          </div>
          <ol className={shared.steps}>
            {STEPS.map((step) => (
              <li key={step.title} className={shared.step}>
                <span className={shared.stepIndex}>{step.index}</span>
                <h3 className={shared.stepTitle}>{step.title}</h3>
                <p className={shared.stepBody}>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 — Dual-sided offer */}
      <section className={`${shared.section} reveal`} aria-labelledby="offer-title">
        <div className={shared.inner}>
          <div className={shared.sectionHead}>
            <p className="eyebrow">04 · What each side gets</p>
            <h2 id="offer-title" className={shared.sectionTitle}>
              Good for you, good for the agency you introduce
            </h2>
          </div>
          <div className={shared.twoColEven}>
            <article className={shared.card}>
              <div className={shared.stack}>
                <p className="eyebrow">For you</p>
                <h3 className={shared.cardTitle}>A referral bonus when they become a client</h3>
                <p className={shared.cardBody}>
                  Make the introduction, and our team takes it from there: we contact the referral, mention you,
                  and scope their needs. When they become a client, we thank you with a referral bonus.
                </p>
              </div>
            </article>
            <article className={shared.card}>
              <div className={shared.stack}>
                <p className="eyebrow">For the agency you introduce</p>
                <h3 className={shared.cardTitle}>A fixed quote before any commitment</h3>
                <p className={shared.cardBody}>
                  A 20-minute scoping call, then a fixed quote. Web builds from {webFrom}, automation from{' '}
                  {automationFrom}, custom internal tools from {toolsFrom}, cloud engineering from {cloudFrom}.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 05 — Proof: client quote (referrer quotes stay hidden until a real one exists) */}
      <section className={`${shared.section} reveal`} data-below-fold aria-labelledby="proof-title">
        <div className={shared.innerNarrow}>
          <p className="eyebrow">05 · What the agency you introduce gets</p>
          <h2 id="proof-title" className="visually-hidden">
            Client proof
          </h2>
          <figure style={{ margin: '1.5rem 0 0' }}>
            <blockquote className={shared.quote}>&ldquo;{proof.quote}&rdquo;</blockquote>
            <figcaption className={shared.cite}>
              {proof.name} — {proof.role}, {proof.company}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* 06 — Terms as FAQ (native accordion, FAQPage JSON-LD) */}
      <section className={`${shared.section} reveal`} data-below-fold aria-labelledby="terms-title">
        <div className={shared.innerNarrow}>
          <div className={shared.sectionHead}>
            <p className="eyebrow">06 · Program terms</p>
            <h2 id="terms-title" className={shared.sectionTitle}>
              Questions referrers ask
            </h2>
          </div>
          <Accordion items={terms} name="terms" defaultOpen={0} />
        </div>
      </section>

      {/* 07 — Refer an agency */}
      <section id="signup" className={`${shared.section} reveal`} aria-labelledby="signup-title">
        <div className={shared.inner}>
          <div className={shared.twoCol}>
            <div className={shared.stack}>
              <p className="eyebrow">07 · Submit a referral</p>
              <h2 id="signup-title" className={shared.sectionTitle}>
                Refer an agency or partner
              </h2>
              <p className={shared.sectionSub}>
                Tell us about the agency you&apos;d like to refer. We contact them, mention your introduction, and
                keep you posted.
              </p>
            </div>
            <div className={shared.card}>
              <ReferralSignup />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
