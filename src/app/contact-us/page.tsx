import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumb, contactPage, contactPoint, graph } from '@/lib/schema';
import { absoluteUrl } from '@/config/routes';
import { siteConfig, testimonials } from '@/config/site';
import { telHref } from '@/components/layout/chrome';
import PageHeader from '@/components/ui/PageHeader';
import QuoteLine from '@/components/flagship/QuoteLine';
import ProjectBrief from '@/components/convert/ProjectBrief';
import Steps from '@/components/services/Steps';
import styles from '@/components/convert/ContactLayout.module.scss';

/**
 * /contact-us (Nov 2026, simplified): the site's primary destination. Every
 * "Start a project" button lands here, so the page is the ask: a compact hero,
 * then the project brief on a paper sheet that rises to meet it (the first
 * answers are on the first screen), four questions, one at a time
 * (ProjectBrief; fields, validation, submission and analytics unchanged).
 * Beside it (under it on phones), three things only: what happens after you
 * send it, one client in her own words (the approved LRO Staffing quote), and
 * the email and phone number. Below 1024px, where all of that follows the
 * whole form, the quote moves up as one line under the brief's button. No
 * close band: the sheet carries `data-page-close`, so the footer drops its
 * own ask.
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

/** After the brief: the steps the site already publishes (fixed quote after a 20-minute call). */
const NEXT_STEPS = [
  {
    // The live contact page's own promise ("We respond within 24 hours"), also quoted in llms.txt.
    name: 'We reply within 24 hours',
    text: 'By email or phone, whichever you chose, with questions or a time to talk.',
  },
  {
    name: 'A 20-minute call',
    text: 'We agree what is included and what is not, so the quote matches the real work.',
  },
  {
    name: 'A fixed quote',
    text: 'You get a written proposal with a fixed price, so you know the cost before work starts.',
  },
] as const;

/**
 * Below 1024px, "What happens next" follows the whole form: one line under the
 * brief's button says it first, in the steps' own words (the reply step's
 * timing awaits the owner, so the line starts at the call).
 */
const AFTER_LINE = 'After you send it: a 20-minute call, then a fixed quote.';

/** The one approved client quote (site.ts `testimonials`), beside the decision. */
const PROOF = testimonials.find((entry) => entry.company === 'LRO Staffing') ?? null;

/** The hero's NDA promise, said again beside "Send the brief" (confidential detail comes after it). */
const NDA_LINE = 'We sign an NDA before you share anything confidential.';

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
        size="l"
        lede={
          <p>
            Answer four short questions about your project. After a 20-minute call, you get a fixed quote. {NDA_LINE}
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
            <ProjectBrief reassure={NDA_LINE} after={AFTER_LINE} />
            {/* Below 1024px the aside (and its quote) follows the whole form: the quote moves up to the brief's button. */}
            <QuoteLine tone="paper" className={styles.formProof} />
          </div>

          <div className={styles.aside}>
            <section className={styles.block} aria-labelledby="next-title">
              <h2 id="next-title" className={styles.blockLabel}>
                What happens next
              </h2>
              <Steps steps={NEXT_STEPS.map(({ name, text }) => ({ title: name, text }))} tone="paper" />
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
                Talk to us
              </h2>
              <p className={styles.directLede}>Prefer to talk it through first? Email or call.</p>
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
              <p className={styles.hoursText}>
                Our offices in Toronto, Lagos and Kingston are open 9&nbsp;am to 6&nbsp;pm local time, Monday to Friday.
              </p>
            </section>
          </div>

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
