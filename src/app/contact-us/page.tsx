import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumb, contactPage, contactPoint, getServiceLine, graph, startingPrice } from '@/lib/schema';
import { siteConfig, testimonials } from '@/config/site';
import { FIXED_QUOTE_NOTE } from '@/lib/estimate';
import { LiveClocks } from '@/components/ui/TimezoneOverlap';
import ConvertHero, { LastReviewed } from '@/components/convert/ConvertHero';
import Cta from '@/components/convert/Cta';
import ScopingWizard from '@/components/convert/ScopingWizard';
import shared from '@/app/convert.module.scss';

export const metadata: Metadata = {
  title: 'Contact',
  alternates: { canonical: 'https://mapltech.com/contact-us' },
  description:
    'Start a project with MAPL TECH. Phone: +1 (647) 375-6724, Email: contact@mapltech.com. We respond within 24 hours.',
  openGraph: {
    title: 'Contact Us | MAPL TECH',
    description:
      'Start a conversation about your next project. We respond within 24 hours.',
  },
};

const PATH = '/contact-us';
const PHONE_E164 = '+16473756724';

const BRIEF_ITEMS = ['The goal', 'Current state', 'Constraints', 'Timeline', 'Budget band'];

export default function ContactPage() {
  const webFrom = startingPrice(getServiceLine('web-development'));
  const automationFrom = startingPrice(getServiceLine('automation-ai-workflow-setup'));
  // Only approved quotes ship: the first testimonial (LRO Staffing). The UNSVCC draft stays out until signed off.
  const proof = testimonials[0];

  return (
    <>
      <JsonLd
        data={graph([
          contactPage({ description: metadata.description ?? undefined }),
          breadcrumb([{ name: 'Contact', path: PATH }]),
          contactPoint(),
        ])}
      />

      <ConvertHero
        eyebrow="Contact"
        title="Tell Us What You're Building"
        lede={`Whether it's a complex web build, an automation pipeline, a custom tool or cloud infrastructure, describe the project and MAPL TECH will respond within 24 hours. Agencies get a fixed quote after one 20-minute scoping call, with web builds starting at ${webFrom} and automation from ${automationFrom}.`}
        facts={[
          { label: 'Reply time', value: 'Within 24 hours' },
          { label: 'Scoping call', value: '20 minutes, then a fixed quote' },
          { label: 'Starting price', value: `Web ${webFrom} · Automation ${automationFrom}` },
          { label: 'Offices', value: 'Toronto (HQ) · Lagos · Kingston' },
          { label: 'Last reviewed', value: <LastReviewed path={PATH} /> },
        ]}
        actions={
          <>
            {/* Highest-intent route: the call CTA takes the red slot here (wireframe 01). */}
            <Cta placement="contact_hero_primary" hero href="#book" size="large">
              Book a 20-min scoping call
            </Cta>
            <Cta placement="contact_hero_secondary" href="/pricing#estimator" variant="secondary" size="large" cursor="estimate">
              Get a 60-second estimate
            </Cta>
          </>
        }
      />

      {/* 02 — Two paths: (A) the scoping wizard, (B) talk first */}
      <section className={shared.section} aria-labelledby="paths-title">
        <div className={shared.inner}>
          <div className={shared.sectionHead}>
            <p className="eyebrow">02 · Two ways in</p>
            <h2 id="paths-title" className={shared.sectionTitle}>
              Scope it in three steps, or talk first
            </h2>
            <p className={shared.sectionSub}>
              Both routes end the same way: a 20-minute scoping call and a fixed quote. Pick the one that fits how
              you work.
            </p>
          </div>

          <div className={shared.twoCol}>
            {/* Path A — PEAK */}
            <article className={shared.card} id="wizard" aria-labelledby="wizard-title">
              <div className={shared.stack}>
                <div className={shared.eyebrowRow}>
                  <p className="eyebrow">Path A · Scoping brief</p>
                </div>
                <h3 id="wizard-title" className={shared.cardTitle}>
                  Three steps, one form
                </h3>
                <p className={shared.cardBody}>
                  What you&apos;re building, the size and budget band, and where to reply. Arrive from the estimator
                  and step two is already filled in.
                </p>
              </div>
              <div style={{ marginTop: '1.5rem' }}>
                <ScopingWizard />
              </div>
            </article>

            {/* Path B — talk first + direct contact */}
            <aside className={shared.stackLg} id="book" aria-labelledby="book-title">
              <div className={shared.card}>
                <div className={shared.stack}>
                  <p className="eyebrow">Path B · Talk first</p>
                  <h3 id="book-title" className={shared.cardTitle}>
                    Book a 20-min scoping call
                  </h3>
                  <p className={shared.cardBody}>
                    Prefer to talk before you write anything down? Call or email and we set up the scoping call. {FIXED_QUOTE_NOTE}.
                  </p>
                  <ul className={shared.rows}>
                    <li>
                      <span className={shared.rowLabel}>Phone</span>
                      <a className={shared.rowValue} href={`tel:${PHONE_E164}`} data-cta-placement="contact_direct_phone">
                        {siteConfig.phone}
                      </a>
                    </li>
                    <li>
                      <span className={shared.rowLabel}>General</span>
                      <a className={shared.rowValue} href={`mailto:${siteConfig.email}`} data-cta-placement="contact_direct_email">
                        {siteConfig.email}
                      </a>
                    </li>
                    <li>
                      <span className={shared.rowLabel}>Offices</span>
                      <span className={shared.rowValue}>Toronto (HQ) · Lagos · Kingston</span>
                    </li>
                  </ul>
                  {/* Interaction #10: live office clocks (SSR placeholder, minute ticks) */}
                  <LiveClocks />
                  <div className={shared.ctaRow}>
                    <Cta placement="contact_book_call" href={`tel:${PHONE_E164}`} external size="medium">
                      Call to book the call
                    </Cta>
                    <Cta placement="contact_book_email" href={`mailto:${siteConfig.email}?subject=Scoping call`} external variant="secondary" size="medium">
                      Email us
                    </Cta>
                  </div>
                </div>
              </div>

              <div className={shared.card}>
                <div className={shared.stack}>
                  <p className="eyebrow">What to include in your brief</p>
                  <ol className={shared.numbered}>
                    {BRIEF_ITEMS.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ol>
                  <p className={shared.small}>
                    Want a call back instead of an email? Choose &ldquo;Phone&rdquo; as your preferred contact method
                    in step three.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* 03 — Proof (real, approved quote only) */}
      <section className={`${shared.section} reveal`} data-below-fold aria-labelledby="proof-title">
        <div className={shared.innerNarrow}>
          <p className="eyebrow">03 · From a client</p>
          <h2 id="proof-title" className="visually-hidden">
            What clients say
          </h2>
          <figure style={{ margin: '1.5rem 0 0' }}>
            <blockquote className={shared.quote}>&ldquo;{proof.quote}&rdquo;</blockquote>
            <figcaption className={shared.cite}>
              {proof.name} — {proof.role}, {proof.company}
            </figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
