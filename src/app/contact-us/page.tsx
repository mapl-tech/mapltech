import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumb, contactPage, contactPoint, graph } from '@/lib/schema';
import { absoluteUrl } from '@/config/routes';
import { siteConfig, testimonials } from '@/config/site';
import { PRICING_HREF, PRICING_LABEL, telHref } from '@/components/layout/chrome';
import { FAQ_ITEMS } from '@/components/home/data';
import PageHeader from '@/components/ui/PageHeader';
import { LiveClocks } from '@/components/ui/TimezoneOverlap';
import ProjectBrief from '@/components/convert/ProjectBrief';
import styles from '@/components/convert/ContactLayout.module.scss';

/**
 * /contact-us (Nov 2026 award pass): the site's primary destination. Every
 * "Start a project" button lands here, so the page is the ask: a short hero,
 * then the project brief on a paper sheet, four questions, one at a time
 * (ProjectBrief; fields, validation, submission and analytics unchanged).
 * Beside it (under it on phones): what happens after you send it, one client
 * in her own words (the approved LRO Staffing quote), the direct line with the
 * three offices' live time, and the two diligence answers agencies ask first,
 * quoted from the homepage FAQ so the wording never drifts. No response time
 * is promised. No close band: the sheet carries
 * `data-page-close`, so the footer drops its own ask.
 *
 * Structured data: ContactPage + BreadcrumbList + ContactPoint.
 */

const PATH = '/contact-us';
const DESCRIPTION =
  'Send MAPL TECH a short project brief, or call +1 (647) 375-6724 or email contact@mapltech.com. White-label engineering for agencies, with public prices.';

export const metadata: Metadata = {
  title: { absolute: 'Contact MAPL TECH: send a project brief' },
  description: DESCRIPTION,
  alternates: { canonical: absoluteUrl(PATH) },
  openGraph: {
    type: 'website',
    title: 'Contact MAPL TECH: send a project brief',
    description: DESCRIPTION,
    url: absoluteUrl(PATH),
    siteName: 'MAPL TECH',
  },
};

/** After the brief: the steps the site already publishes (fixed quote after a 20-minute scoping call). */
const NEXT_STEPS = [
  {
    // The live contact page's own promise ("We respond within 24 hours"), also quoted in llms.txt.
    name: 'We read it and reply',
    text: 'Within 24 hours, by email or with a call, whichever you chose, with questions or a time to talk.',
  },
  {
    name: 'A 20-minute scoping call',
    text: 'We agree what is in scope and what is not, so the quote describes the real job.',
  },
  {
    name: 'A fixed quote',
    text: 'Final pricing is set through scoping and written into a proposal, so you know the number before work starts.',
  },
] as const;

/** The one approved client quote (site.ts `testimonials`), beside the decision. */
const PROOF = testimonials.find((entry) => entry.company === 'LRO Staffing') ?? null;

/** The NDA and ownership answers, word for word from the homepage FAQ (home/data.ts). */
const DILIGENCE = FAQ_ITEMS.filter((item) => /\bNDA\b/.test(item.answer) || /owns the code/i.test(item.question));

export default function ContactPage() {
  return (
    <>
      <JsonLd
        data={graph([
          contactPage({ name: 'Contact MAPL TECH', description: DESCRIPTION }),
          breadcrumb([{ name: 'Contact', path: PATH }]),
          contactPoint(),
        ])}
      />

      <PageHeader
        id="contact-title"
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
        label="Contact"
        title="Start a project."
        lede={
          <p>
            Tell us what you are building in four short questions. You get a fixed quote after a 20-minute scoping call.
          </p>
        }
      />

      {/* The sheet: the brief, then what happens next. data-page-close: the footer's ask stands down. */}
      <section id="brief" className={styles.sheet} aria-label="Your project brief" data-page-close="">
        <div className={styles.inner}>
          <div className={styles.formCol}>
            <noscript>
              <p className={styles.noscript}>
                This form needs JavaScript. Email <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or call{' '}
                <a href={telHref(siteConfig.phone)}>{siteConfig.phone}</a> instead.
              </p>
            </noscript>
            <ProjectBrief />
          </div>

          <div className={styles.aside}>
            <section className={styles.block} aria-labelledby="next-title">
              <h2 id="next-title" className={styles.blockLabel}>
                What happens next
              </h2>
              <ol className={styles.steps} role="list">
                {NEXT_STEPS.map((step, index) => (
                  <li key={step.name} className={styles.stepRow}>
                    <span className={styles.stepNo} aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className={styles.stepName}>{step.name}</h3>
                      <p className={styles.stepText}>{step.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {PROOF ? (
              <figure className={styles.proof}>
                <blockquote className={styles.proofQuote}>
                  <p>{PROOF.quote}</p>
                </blockquote>
                <figcaption className={styles.proofBy}>
                  {PROOF.image ? (
                    <Image src={PROOF.image} alt="" width={48} height={48} className={styles.avatar} />
                  ) : null}
                  <span>
                    <span className={styles.proofName}>{PROOF.name}</span>
                    <span className={styles.proofRole}>
                      {PROOF.role}, {PROOF.company}
                    </span>
                  </span>
                </figcaption>
                <Link href="/our-work/lro-staffing" className={styles.proofLink} data-cta-placement="contact_proof_case">
                  Read the LRO Staffing case study
                </Link>
              </figure>
            ) : null}

            <section className={styles.direct} aria-labelledby="direct-title">
              <h2 id="direct-title" className={styles.directLabel}>
                Direct line
              </h2>
              <p className={styles.directLede}>Rather talk it through first? Write or call.</p>
              <ul className={styles.channels} role="list">
                <li>
                  <a href={`mailto:${siteConfig.email}`} className={styles.channel} data-cta-placement="contact_email">
                    <span className="visually-hidden">Email </span>
                    {siteConfig.email}
                  </a>
                </li>
                <li>
                  <a href={telHref(siteConfig.phone)} className={styles.channel} data-cta-placement="contact_phone">
                    <span className="visually-hidden">Phone </span>
                    {siteConfig.phone}
                  </a>
                </li>
              </ul>
              <div className={styles.hours}>
                <p className={styles.hoursText}>Toronto, Lagos and Kingston keep 09:00 to 18:00 local time, Monday to Friday.</p>
                <LiveClocks className={styles.clocks} />
              </div>
              <p className={styles.priceFirst}>
                Want numbers first?{' '}
                <Link href={PRICING_HREF} className={styles.priceLink} data-cta-placement="contact_price_first">
                  {PRICING_LABEL}
                </Link>
              </p>
            </section>
          </div>

          {DILIGENCE.length ? (
            <section className={styles.diligence} aria-labelledby="diligence-title">
              <h2 id="diligence-title" className={styles.blockLabel}>
                Before you send anything
              </h2>
              <dl className={styles.answers}>
                {DILIGENCE.map((item) => (
                  <div key={item.question} className={styles.answer}>
                    <dt className={styles.question}>{item.question}</dt>
                    <dd className={styles.reply}>{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {/* Phones only: after the reading, a way back up. The mobile bar repeats it
              (data-hero-cta) once the brief is off screen, so it never points at this page. */}
          <a href="#brief" className={styles.back} data-hero-cta="" data-cta-placement="contact_back_to_brief">
            Back to the brief
          </a>
        </div>
      </section>
    </>
  );
}
