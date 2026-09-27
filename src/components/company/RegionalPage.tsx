import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import Accordion from '@/components/ui/Accordion';
import { careers, siteConfig } from '@/config/site';
import { teamMembers } from '@/config/team';
import { getService } from '@/config/services';
import { faqPage, getServiceLine, itemList, pageGraph, serviceId, slugify, startingPrice } from '@/lib/schema';
import Arrow from './Arrow';
import Cta from './Cta';
import HeroBlock, { ReviewedOn, type HeroFact } from './HeroBlock';
import OverlapSection from './OverlapSection';
import RegionalScoper from './RegionalScoper';
import SectionHead from './SectionHead';
import { TeamCards } from './TeamGrid';
import { lowestStartingPrice, type RegionConfig } from './regions';
import styles from '@/app/company.module.scss';

export interface RegionalPageProps {
  region: RegionConfig;
  /** The page's metadata title, verbatim (becomes WebPage.name). */
  title: string;
  /** The page's metadata description, verbatim. */
  description: string;
}

/**
 * Market homepage template for /nigeria and /jamaica (brief §2.7).
 *
 * DOM order is the phone order: hero → NAP (tap-to-call first; 80%+ of the
 * Nigeria audience is mobile) → PEAK (timezone overlap) → local team → local
 * case study → services → estimator → local careers → market FAQ → CTA band.
 * On desktop CSS `order` moves the NAP block to sit before the CTA band.
 *
 * Schema: WebPage + BreadcrumbList + ItemList of the four services + FAQPage.
 * Organization stays the root-layout node (no LocalBusiness, no invented
 * address: the §3.5 decision gate has not passed).
 */
export default function RegionalPage({ region, title, description }: RegionalPageProps) {
  const prefix = region.slug;
  const members = teamMembers
    .filter((member) => member.country === region.country)
    .map((member) => ({ ...member, slug: slugify(member.name) }));
  const roles = careers.filter((role) => role.country === region.country);
  const phoneHref = `tel:${siteConfig.phone.replace(/[^\d+]/g, '')}`;
  const mailHref = `mailto:${siteConfig.email}`;
  const webTimeline = getService('web-development').typicalTimeline;

  const facts: HeroFact[] = [
    ...region.keyFacts,
    { term: 'Starting price', detail: `From ${lowestStartingPrice()} (USD)` },
    ...(webTimeline ? [{ term: 'Typical timeline', detail: `${webTimeline} (web builds)` }] : []),
    { term: 'Phone', detail: <a href={phoneHref}>{siteConfig.phone}</a> },
    { term: 'Last reviewed', detail: <ReviewedOn path={region.path} /> },
  ];

  const serviceRows = region.services.rows.map((row) => {
    const line = getServiceLine(row.slug);
    return { row, line, from: startingPrice(line) };
  });

  const graph = pageGraph({
    path: region.path,
    name: title,
    description,
    breadcrumbs: [
      { name: 'About Us', path: '/about-us' },
      { name: region.brandName, path: region.path },
    ],
    nodes: [
      itemList(
        serviceRows.map(({ row, line }) => ({
          name: line.shortName,
          path: line.path,
          description: row.description,
          item: { '@id': serviceId(line.slug) },
        })),
        { path: region.path, name: `${region.brandName} services` },
      ),
      faqPage(region.faq.items, { path: region.path, name: region.faq.heading }),
    ],
  });

  const cs = region.caseStudy;

  return (
    <div className={styles.page}>
      <JsonLd data={graph} />

      <HeroBlock eyebrow={region.brandName} title={region.h1} lede={region.lede} facts={facts} placementPrefix={prefix} />

      {/* NAP: plain text with tel:/mailto: links. First on phones, before the CTA band on desktop. */}
      <section className={`${styles.section} ${styles.napSection}`} aria-labelledby="nap-title">
        <div className={styles.sectionInner}>
          <div className={styles.nap}>
            <div>
              <p className={`eyebrow ${styles.sectionEyebrow}`}>Contact the branch</p>
              <h2 id="nap-title" className={styles.napName}>
                {region.brandName}
              </h2>
              <address className={styles.napAddress}>
                {region.nap.branchLine}
                <br />
                Serves {region.nap.serves}
                <br />
                <a href={mailHref}>{siteConfig.email}</a>
                <br />
                <a href={phoneHref}>{siteConfig.phone}</a>
                <br />
                Replies within 24 hours
              </address>
            </div>
            <div className={styles.napActions}>
              <Cta placement={`${prefix}_nap_call`} href={phoneHref} external variant="secondary">
                Call
              </Cta>
              <Cta placement={`${prefix}_nap_email`} href={mailHref} external variant="secondary">
                Email
              </Cta>
            </div>
          </div>
        </div>
      </section>

      {/* PEAK: the page's core argument */}
      <OverlapSection
        id="overlap"
        eyebrow="Timezone overlap"
        heading={region.overlap.heading}
        body={region.overlap.body}
        footnote={region.overlap.footnote}
      />

      {/* Local team */}
      <section id="team" className={`${styles.section} reveal`} aria-labelledby="team-title">
        <div className={styles.sectionInner}>
          <SectionHead eyebrow="Local team" title={region.team.heading} id="team-title" intro={region.team.body} />
          <TeamCards members={members} label={`${region.country} team members`} />
          <p className={styles.after}>
            <Link href={`/team#${region.slug}`} className={styles.inlineLink} data-cta-placement={`${prefix}_team_link`}>
              Meet the whole team <Arrow />
            </Link>
          </p>
        </div>
      </section>

      {/* Local case study */}
      <section className={`${styles.section} reveal`} aria-labelledby="case-title" data-below-fold>
        <div className={styles.sectionInner}>
          <SectionHead eyebrow="Local case study" title={`Real results in ${region.country}`} id="case-title" />
          <div className={styles.case}>
            <div>
              <h3 className={styles.caseCompany}>{cs.company}</h3>
              <p className={styles.caseLocation}>{cs.location}</p>
              <h4 className={styles.caseLabel}>The challenge</h4>
              <p className={styles.caseText}>{cs.challenge}</p>
              <h4 className={styles.caseLabel}>Our solution</h4>
              <p className={styles.caseText}>{cs.solution}</p>
              <p className={styles.after}>
                <Link href="/our-work" className={styles.inlineLink} data-cursor="view" data-cta-placement={`${prefix}_casestudy_work`}>
                  See the work <Arrow />
                </Link>
              </p>
            </div>
            <div>
              <h4 className={`${styles.caseLabel} ${styles.caseLabelFirst}`}>Results</h4>
              <ol className={styles.results}>
                {cs.results.map((result, index) => (
                  <li key={result}>
                    <span className={styles.resultIndex} aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{result}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* Services: four rows → the four service pages */}
      <section id="services" className={`${styles.section} reveal`} aria-labelledby="services-title">
        <div className={styles.sectionInner}>
          <SectionHead eyebrow="Services" title={region.services.heading} id="services-title" intro={region.services.intro} />
          <ul className={styles.rows}>
            {serviceRows.map(({ row, line, from }) => (
              <li key={line.slug}>
                <Link
                  href={line.path}
                  className={styles.row}
                  data-cursor="view"
                  data-cta-placement={`${prefix}_services_${line.slug}`}
                >
                  <span className={styles.rowHead}>
                    <h3 className={styles.rowTitle}>{line.shortName}</h3>
                    <span className={styles.rowMeta}>{from ? `from ${from}` : 'Custom quote'}</span>
                  </span>
                  <span className={styles.rowDesc}>{row.description}</span>
                  <Arrow className={styles.rowArrow} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Estimator entry */}
      <section id="estimate" className={`${styles.section} reveal`} aria-labelledby="scoper-title">
        <div className={styles.sectionInner}>
          <SectionHead
            eyebrow="Estimator"
            title="Get a 60-second estimate"
            id="scoper-title"
            intro="Pick a service line, a size and a support level. The range comes straight from MAPL TECH's published tiers; refine it on the pricing page or take it into a scoping call."
          />
          <RegionalScoper defaultService={region.scoper.defaultService} placementPrefix={prefix} country={region.country} />
        </div>
      </section>

      {/* Local careers */}
      <section id="careers" className={`${styles.section} reveal`} aria-labelledby="careers-title" data-below-fold>
        <div className={styles.sectionInner}>
          <SectionHead eyebrow="Local careers" title={region.careers.heading} id="careers-title" />
          <ul className={styles.rows}>
            {roles.map((role, index) => (
              <li key={`${role.title}-${role.location}`}>
                <Link href="/careers" className={styles.row} data-cta-placement={`${prefix}_careers_${index + 1}`}>
                  <span className={styles.rowHead}>
                    <h3 className={styles.rowTitle}>{role.title}</h3>
                    <span className={styles.rowMeta}>
                      {role.type} · {role.location}
                    </span>
                  </span>
                  <span className={styles.rowDesc}>{role.description}</span>
                  <Arrow className={styles.rowArrow} />
                </Link>
              </li>
            ))}
          </ul>
          <p className={styles.after}>
            <Link href="/careers" className={styles.inlineLink} data-cta-placement={`${prefix}_careers_all`}>
              {region.careers.linkLabel} <Arrow />
            </Link>
          </p>
        </div>
      </section>

      {/* Market FAQ: native <details>, every answer in the HTML */}
      <section id="faq" className={`${styles.section} reveal`} aria-labelledby="faq-title" data-below-fold>
        <div className={`${styles.sectionInner} ${styles.faq}`}>
          <SectionHead eyebrow="Market FAQ" title={region.faq.heading} id="faq-title" />
          <Accordion items={[...region.faq.items]} name="faq" defaultOpen={0} className={styles.faqList} />
        </div>
      </section>

      {/* CTA band */}
      <section className={`${styles.ctaBand} reveal`} aria-labelledby="cta-title">
        <div className={`${styles.sectionInner} ${styles.ctaBandInner}`}>
          <div>
            <h2 id="cta-title" className={styles.ctaBandTitle}>
              {region.cta.heading}
            </h2>
            <p className={styles.ctaBandBody}>{region.cta.body}</p>
          </div>
          <div className={styles.ctaBandActions}>
            <Cta placement={`${prefix}_band_primary`} href="/pricing#estimator" size="large">
              Get a 60-second estimate
            </Cta>
            <Cta placement={`${prefix}_band_secondary`} href="/contact-us" variant="secondary" size="large">
              Book a 20-min scoping call
            </Cta>
          </div>
        </div>
      </section>
    </div>
  );
}
