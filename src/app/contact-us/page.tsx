import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumb, contactPage, contactPoint, graph } from '@/lib/schema';
import { absoluteUrl } from '@/config/routes';
import { siteConfig, testimonials } from '@/config/site';
import { ESTIMATE_HREF, ESTIMATE_LABEL, telHref } from '@/components/layout/chrome';
import { LiveClocks } from '@/components/ui/TimezoneOverlap';
import ProjectBrief from '@/components/convert/ProjectBrief';
import styles from '@/components/convert/ContactLayout.module.scss';

/**
 * /contact-us (flagship redesign). The brief is the page: four questions, one
 * at a time, in a single-column form (ProjectBrief), with the plain routes
 * beside it for people who would rather not fill in a form: email, phone, the
 * three offices' hours with their live local time, and "Price your project"
 * for anyone who wants a number first, and one client in her own words right
 * beside the decision. No response times are promised. Below: what happens
 * after you send it. Structured data: ContactPage + BreadcrumbList + ContactPoint.
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

const STAGES = [
  {
    name: 'We read your brief',
    text: `It lands in our inbox at ${siteConfig.email}, laid out the way you saw it before you sent it.`,
  },
  {
    name: 'We reply',
    text: 'By email or with a call, whichever you chose, with questions or a time to talk.',
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

export default function ContactPage() {
  // The one approved client quote (LRO Staffing).
  const proof = testimonials.find((entry) => entry.company === 'LRO Staffing');

  return (
    <>
      <JsonLd
        data={graph([
          contactPage({ name: 'Contact MAPL TECH', description: DESCRIPTION }),
          breadcrumb([{ name: 'Contact', path: PATH }]),
          contactPoint(),
        ])}
      />

      {/* ---------------------------------------------------------- brief */}
      <section className={styles.contact} aria-labelledby="contact-title">
        <div className={styles.grid}>
          <div className={styles.intro}>
            <p className={styles.eyebrow}>
              <span>Contact · White-label engineering for agencies</span>
            </p>
            <h1 id="contact-title" className={styles.title}>
              Brief us like your own team.
            </h1>
            <p className={styles.lede}>Four short questions, one at a time. Or call, email or see a price first.</p>
          </div>

          <div className={styles.panelWrap}>
            <div className={styles.panel}>
              <noscript>
                <p className={styles.noscript}>
                  This form needs JavaScript. Email <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a> or call{' '}
                  <a href={telHref(siteConfig.phone)}>{siteConfig.phone}</a> instead.
                </p>
              </noscript>
              <ProjectBrief />
            </div>
            <span className={styles.structure} aria-hidden="true" />
          </div>

          {proof ? (
            <figure className={styles.proof}>
              <blockquote className={styles.proofQuote}>
                <p>{proof.quote}</p>
              </blockquote>
              <figcaption className={styles.proofBy}>
                {proof.image ? (
                  <Image src={proof.image} alt="" width={44} height={44} className={styles.avatar} />
                ) : null}
                <span>
                  <span className={styles.person}>{proof.name}</span>
                  <span className={styles.role}>
                    {proof.role}, {proof.company}
                  </span>
                </span>
              </figcaption>
              <Link href="/our-work/lro-staffing" className={styles.proofLink}>
                Read the LRO Staffing case study<span aria-hidden="true">→</span>
              </Link>
            </figure>
          ) : null}

          <aside className={styles.alt} aria-labelledby="alt-title">
            <h2 id="alt-title" className={styles.altTitle}>
              Or reach us directly
            </h2>
            <dl className={styles.channels}>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${siteConfig.email}`} className={styles.channel} data-cta-placement="contact_email">
                    {siteConfig.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={telHref(siteConfig.phone)} className={styles.channel} data-cta-placement="contact_phone">
                    {siteConfig.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Office hours</dt>
                <dd>
                  <p className={styles.hours}>
                    09:00 to 18:00 local time, Monday to Friday, in Toronto, Lagos and Kingston.
                  </p>
                  <LiveClocks className={styles.clocks} />
                </dd>
              </div>
            </dl>

            <div className={styles.priceFirst}>
              <p className={styles.priceFirstText}>Want a number before you write anything?</p>
              <p className={styles.priceFirstNote}>Our prices are public. You see the range before we ask for anything.</p>
              <Link href={ESTIMATE_HREF} className={styles.secondary} data-cta-placement="contact_price_first">
                {ESTIMATE_LABEL}
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------------------------------------------------------- next */}
      <section className={styles.next} aria-labelledby="next-title">
        <div className={styles.nextGrid}>
          <div className={styles.nextHead}>
            <h2 id="next-title" className={styles.h2}>
              What happens after you send it.
            </h2>
            <p className={styles.nextLede}>Four steps, from your brief to a fixed price.</p>
          </div>
          <ol className={styles.stages} role="list">
            {STAGES.map((stage) => (
              <li key={stage.name} className={styles.stage}>
                <h3 className={styles.stageName}>{stage.name}</h3>
                <p className={styles.stageText}>{stage.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

    </>
  );
}
