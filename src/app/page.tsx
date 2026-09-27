import JsonLd from '@/components/seo/JsonLd';
import { faqPage, howTo, itemList, pageGraph } from '@/lib/schema';
import Backbone from '@/components/ui/Backbone';
import { LiveClocks } from '@/components/ui/TimezoneOverlap';
import Cta from '@/components/home/Cta';
import LogoMarquee from '@/components/home/LogoMarquee';
import TrustWall from '@/components/home/TrustWall';
import PinnedPlugIn from '@/components/home/PinnedPlugIn';
import ServiceRows from '@/components/home/ServiceRows';
import WorkRows from '@/components/home/WorkRows';
import TestimonialRow from '@/components/home/TestimonialRow';
import EstimateTeaser from '@/components/home/EstimateTeaser';
import HomeFaq from '@/components/home/HomeFaq';
import {
  BACKBONE_SECTIONS,
  CTA,
  ESTIMATE_SECTION,
  FAQ_ITEMS,
  FAQ_SECTION,
  HERO,
  HOME_PAGE_DESCRIPTION,
  HOME_PAGE_NAME,
  KEY_FACTS,
  PLUG_IN,
  PROOF_ITEMS,
  PROOF_SECTION,
  SERVICES_SECTION,
  SERVICE_ROWS,
  START,
  WORK_ROWS,
  WORK_SECTION,
} from '@/components/home/data';
import styles from './page.module.scss';

/*
 * Homepage — Server Component (synthesis §2.1).
 *
 * Metadata: none exported on purpose. The title, description, Open Graph and
 * canonical (https://mapltech.com) are inherited unchanged from the root
 * layout, exactly as before this rewrite.
 *
 * Anatomy: H1 → lede → key facts <dl> → CTAs, all in the SSR HTML, no reveal.
 * The Backbone (interaction #1) is the page signature; "How we plug in" is the
 * single engineered peak. Every other section reveals with the CSS view()
 * timeline and skips paint until it is near (data-below-fold).
 */

const homeGraph = pageGraph({
  path: '/',
  name: HOME_PAGE_NAME,
  description: HOME_PAGE_DESCRIPTION,
  nodes: [
    howTo(
      PLUG_IN.steps.map((step) => ({ name: step.name, text: step.text, url: `/#${step.id}` })),
      { name: PLUG_IN.heading, description: PLUG_IN.description, path: '/' },
    ),
    itemList(
      SERVICE_ROWS.map((row) => ({ name: row.name, path: row.href, description: row.situation })),
      { path: '/', name: 'Services' },
    ),
    faqPage(FAQ_ITEMS, { path: '/', name: FAQ_SECTION.heading }),
  ],
});

function Eyebrow({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <p className="eyebrow">
      <span className={styles.idx}>{index}</span>
      {children}
    </p>
  );
}

export default function HomePage() {
  return (
    <div className={styles.page}>
      <JsonLd data={homeGraph} />
      {/* Backbone: position: fixed, so this wrapper (and its ancestors) carry no transform. */}
      <Backbone sections={[...BACKBONE_SECTIONS]} />

      {/* 01 Hero */}
      <section id="hero" className={styles.hero} aria-labelledby="home-h1">
        <div className={styles.heroInner}>
          <div className={styles.heroMain}>
            <p className={`eyebrow ${styles.heroEyebrow}`}>
              <span className={styles.eyebrowRule} aria-hidden="true" />
              {HERO.eyebrow}
            </p>
            <h1 id="home-h1" className={`display ${styles.heroTitle}`}>
              {HERO.title}
            </h1>
            <p className={`lede ${styles.heroLede}`}>{HERO.lede}</p>
          </div>

          <aside className={styles.heroAside} aria-label="Key facts">
            <dl className={`kv kv--stack ${styles.heroFacts}`}>
              {KEY_FACTS.map((fact) => (
                <div key={fact.term}>
                  <dt>{fact.term}</dt>
                  <dd>{fact.dateTime ? <time dateTime={fact.dateTime}>{fact.detail}</time> : fact.detail}</dd>
                </div>
              ))}
            </dl>
            <div className={styles.heroClocks}>
              <LiveClocks />
              <p className={styles.heroClocksCaption}>{HERO.clocksCaption}</p>
            </div>
          </aside>

          <div className={styles.heroCtas}>
            <Cta placement="home_hero_primary" hero href={CTA.primary.href} size="large">
              {CTA.primary.label}
            </Cta>
            <Cta placement="home_hero_secondary" href={CTA.secondary.href} variant="secondary" size="large">
              {CTA.secondary.label}
            </Cta>
          </div>
        </div>
      </section>

      {/* 01b Client logo marquee */}
      <LogoMarquee />

      {/* 02 Trust wall */}
      <section id="trust" className={styles.section} aria-labelledby="h-trust" data-below-fold="">
        <div className={`${styles.inner} reveal`}>
          <div className={styles.sectionEyebrow}>
            <Eyebrow index="02">Trust wall</Eyebrow>
          </div>
          <TrustWall />
        </div>
      </section>

      {/* 03 How we plug in — PEAK */}
      <PinnedPlugIn id="how" eyebrow="Process" heading={PLUG_IN.heading} steps={PLUG_IN.steps} />

      {/* 04 Services */}
      <section id="services" className={styles.section} aria-labelledby="h-services" data-below-fold="">
        <div className={styles.inner}>
          <header className={`${styles.sectionHead} reveal`}>
            <Eyebrow index="04">{SERVICES_SECTION.eyebrow}</Eyebrow>
            <h2 id="h-services">{SERVICES_SECTION.heading}</h2>
            <p className={styles.sectionSub}>{SERVICES_SECTION.subtitle}</p>
          </header>
          <div className="reveal">
            <ServiceRows rows={SERVICE_ROWS} />
          </div>
        </div>
      </section>

      {/* 05 Selected work */}
      <section id="work" className={styles.section} aria-labelledby="h-work" data-below-fold="">
        <div className={styles.inner}>
          <header className={`${styles.sectionHead} ${styles.sectionHeadRow} reveal`}>
            <div>
              <Eyebrow index="05">Work</Eyebrow>
              <h2 id="h-work">{WORK_SECTION.heading}</h2>
            </div>
            <Cta placement="home_work_all" href={WORK_SECTION.allHref} variant="secondary" size="small">
              {WORK_SECTION.allLabel}
            </Cta>
          </header>
          <div className="reveal">
            <WorkRows rows={WORK_ROWS} />
          </div>
        </div>
      </section>

      {/* 06 Proof */}
      <section id="proof" className={styles.section} aria-labelledby="h-proof" data-below-fold="">
        <div className={styles.inner}>
          <header className={`${styles.sectionHead} reveal`}>
            <Eyebrow index="06">{PROOF_SECTION.eyebrow}</Eyebrow>
            <h2 id="h-proof">{PROOF_SECTION.heading}</h2>
          </header>
          <div className="reveal">
            <TestimonialRow items={PROOF_ITEMS} />
          </div>
        </div>
      </section>

      {/* 07 Estimate teaser */}
      <section id="estimate" className={styles.section} aria-labelledby="h-est" data-below-fold="">
        <div className={styles.inner}>
          <header className={`${styles.sectionHead} reveal`}>
            <Eyebrow index="07">Estimate</Eyebrow>
            <h2 id="h-est">{ESTIMATE_SECTION.heading}</h2>
            <p className={styles.sectionSub}>{ESTIMATE_SECTION.subtitle}</p>
          </header>
          <EstimateTeaser />
        </div>
      </section>

      {/* 08 FAQ */}
      <section id="faq" className={styles.section} aria-labelledby="h-faq" data-below-fold="">
        <div className={`${styles.inner} ${styles.faqGrid}`}>
          <header className={`${styles.sectionHead} ${styles.faqHead} reveal`}>
            <Eyebrow index="08">FAQ</Eyebrow>
            <h2 id="h-faq">{FAQ_SECTION.heading}</h2>
            <p className={styles.sectionSub}>{FAQ_SECTION.intro}</p>
          </header>
          <div className="reveal">
            <HomeFaq items={FAQ_ITEMS} />
          </div>
        </div>
      </section>

      {/* 09 Start a project */}
      <section id="start" className={`${styles.section} ${styles.start}`} aria-labelledby="h-start" data-below-fold="">
        <div className={`${styles.inner} ${styles.startGrid}`}>
          <div className={`${styles.startMain} reveal`}>
            <Eyebrow index="09">Start a project</Eyebrow>
            <h2 id="h-start" className={styles.startTitle}>
              {START.heading}
            </h2>
            <p className={styles.startSub}>{START.subtitle}</p>

            <div className={styles.include}>
              <p className={styles.includeLabel}>{START.includeLabel}</p>
              <ul className={styles.includeList}>
                {START.include.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className={styles.startCtas}>
              <Cta placement="home_footer_primary" href={CTA.primary.href} size="large">
                {CTA.primary.label}
              </Cta>
              <Cta placement="home_footer_secondary" href={CTA.secondary.href} variant="secondary" size="large">
                {CTA.secondary.label}
              </Cta>
            </div>
            <p className={styles.microcopy}>{START.microcopy}</p>
            <ul className={styles.reassurance}>
              {START.reassurance.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <aside className={`${styles.startAside} reveal`} aria-label="Contact">
            <dl className="kv kv--stack">
              <div>
                <dt>General</dt>
                <dd>
                  <a href={`mailto:${START.contact.email}`} data-cta-placement="home_footer_email">
                    {START.contact.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={START.contact.phoneHref} data-cta-placement="home_footer_phone">
                    {START.contact.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Offices</dt>
                <dd>{START.contact.offices}</dd>
              </div>
            </dl>
            <LiveClocks className={styles.startClocks} />
          </aside>
        </div>
      </section>
    </div>
  );
}
