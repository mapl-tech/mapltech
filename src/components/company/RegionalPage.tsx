import type { ReactNode } from 'react';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import Accordion from '@/components/ui/Accordion';
import PageHeader from '@/components/ui/PageHeader';
import QuoteLine from '@/components/flagship/QuoteLine';
import RegionalInquiry from '@/components/convert/RegionalInquiry';
import Steps from '@/components/services/Steps';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import { siteConfig } from '@/config/site';
import { faqPage, getServiceLine, itemList, pageGraph, serviceId } from '@/lib/schema';
import { SERVICE_META } from '@/lib/estimate';
import HeroActions from './HeroActions';
import LocalTime from './LocalTime';
import OfficeMap from './OfficeMap';
import { OFFICE_HOURS_FACT } from './content';
import { HERO_TRUST, startingFrom, type RegionConfig, type RegionFaq } from './regions';
import Reasons from './regional/Reasons';
import { display } from './regional/display';
import RegionalProof from './regional/RegionalProof';
import ed from './Company.module.scss';
import place from './PlaceReadout.module.scss';
import styles from './RegionalPage.module.scss';
import Arrow from '@/components/ui/Arrow';

/** What follows an inquiry, in published facts only (the site's close lede, step by step). */
const INQUIRY_STEPS = [
  { title: 'We reply within 24 hours', text: 'By email, to the address you give us.' },
  { title: 'We talk for 20 minutes', text: 'To agree the scope with you.' },
  { title: 'You get a fixed quote', text: 'One price for the scope we agreed.' },
] as const;

export interface RegionalPageProps {
  region: RegionConfig;
  /** The page's metadata title, verbatim (becomes WebPage.name). */
  title: string;
  /** The page's metadata description, verbatim. */
  description: string;
}

/**
 * The regional funnel for /nigeria and /jamaica (Nov 5, 2026: "the nigeria
 * and jamaica pages should act as funnels and speak to the markets").
 *
 * One path, one ask ("Start a project"), in the order a buyer from that
 * market decides:
 *
 * 1. The hero: the market in the H1, the cities and who we work with in the
 *    lede, the ask, then the price floor (in US dollars), the fixed quote,
 *    the reply time and the Google rating under it. Beside it the branch
 *    office's live clock and hours (the page's one home for both), under the
 *    to-scale map on wide screens. The quiet second action stays on the page
 *    (Nigeria: the prices; Jamaica: MAPL Tours).
 * 2. Four local reasons, on paper (regional/Reasons).
 * 3. Proof (regional/RegionalProof): a real local project where one exists
 *    (Jamaica: MAPL Tours and its published results), else the site's own
 *    counts and published results, with no claim of local clients.
 * 4. The price: the four services, each with its own starting price and its
 *    own ask that opens the brief with that service chosen (?svc=), on paper.
 * 5. The market's questions, with the branch's contact lines.
 * 6. The close is the inquiry itself (Nov 5, 2026: "the Nigeria and Jamaica
 *    pages should have forms at the end so people can inquire"): on paper,
 *    the close's title over a short form on the dark card (convert/
 *    RegionalInquiry, tagged with the page so the email says where it came
 *    from), and beside it what happens next (a reply within 24 hours, the
 *    20-minute call, the fixed quote) and the approved client quote. It takes
 *    the crimson band's place rather than following it: a band that sends the
 *    reader to another page, right after a form, would be two asks in a row.
 *    It carries the band's markers: `data-page-close` (the footer drops its
 *    own ask) and `data-header-quiet` (the header's ask is an outline while
 *    the form is on screen, so the send button is the one fill).
 *
 * Taken out (they did not move a buyer to the ask): the facts band (it
 * repeated the price and the reply time; the hours are in the office card),
 * the coordinates, and the careers line (the footer links /careers).
 *
 * Schema (unchanged): WebPage + BreadcrumbList + ItemList of the four
 * services + FAQPage, all built from the same arrays the page renders. No
 * LocalBusiness and no street address: none is published.
 */
export default function RegionalPage({ region, title, description }: RegionalPageProps) {
  const prefix = region.slug;
  const services = region.services.rows.map((row) => ({ row, line: getServiceLine(row.slug), from: startingFrom(row.service) }));

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
        services.map(({ row, line }) => ({
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

  const [lineOne, lineTwo] = region.hero.titleLines;
  /** An answer on screen: `display`, with the words its `link` names set as that link (the JSON-LD keeps them plain). */
  const answer = ({ answer: text, link }: RegionFaq): ReactNode => {
    const at = link ? text.indexOf(link.text) : -1;
    if (!link || at < 0) return display(text);
    return (
      <p>
        {display(text.slice(0, at))}
        <Link href={link.href} data-cta-placement={`${prefix}_faq${link.href.replace(/\W+/g, '_')}`}>
          {link.text}
        </Link>
        {display(text.slice(at + link.text.length))}
      </p>
    );
  };

  return (
    <>
      <JsonLd data={graph} />

      <PageHeader
        size="l"
        crumbs={[{ label: 'About', href: '/about-us' }, { label: region.brandName }]}
        label={region.brandName}
        title={
          <>
            {lineOne} <em>{lineTwo}</em>
          </>
        }
        lede={<p>{region.hero.lede}</p>}
        actions={
          <HeroActions
            primary={{ label: PROJECT_LABEL, href: PROJECT_HREF, placement: `${prefix}_hero_primary` }}
            secondary={{ ...region.hero.secondary, placement: `${prefix}_hero_secondary` }}
          />
        }
        trust={HERO_TRUST}
        aside={
          <div className={styles.place}>
            <OfficeMap focus={region.officeCity} captionHidden axes={false} draw="load" className={styles.placeMap} />
            <div className={place.readout}>
              <p className={place.city}>
                {region.officeCity} office, {region.country}
              </p>
              <LocalTime timeZone={region.timeZone} zoneAbbr={region.zoneAbbr} />
              <p className={`${place.zone} ${styles.hours}`}>{display(OFFICE_HOURS_FACT.detail)}</p>
              <p className={styles.zoneName}>
                {region.zoneName} · {region.utcLabel}
              </p>
            </div>
          </div>
        }
      />

      <Reasons id="reasons" {...region.reasons} />

      <RegionalProof proof={region.proof} prefix={prefix} />

      {/* The price, on paper: each service row links its page, then its price and a brief that opens with that service chosen. */}
      <section id="prices" className={ed.paper} aria-labelledby="prices-title">
        <div className={ed.inner}>
          <header className={ed.head}>
            <p className={ed.label}>{region.services.label}</p>
            <h2 id="prices-title" className={ed.title}>
              {region.services.title}
            </h2>
            <p className={ed.lede}>{region.services.lede}</p>
          </header>

          {/* Every row has its own "Start a project", so the phone bar steps aside over the list (data-bar-stand-down). */}
          <ul className={styles.rows} role="list" aria-label={region.services.heading} data-bar-stand-down="">
            {services.map(({ row, line, from }) => {
              const name = SERVICE_META[row.service].label;
              return (
                <li key={line.slug} className={styles.row}>
                  <div className={styles.rowMain}>
                    <Link href={line.path} className={styles.rowLink} data-cta-placement={`${prefix}_services_${line.slug}`}>
                      <span className={styles.rowName}>{name}</span>
                    </Link>
                    <p className={styles.rowText}>{row.description}</p>
                    <span className={styles.rowGo} aria-hidden="true">
                      <Arrow />
                    </span>
                  </div>
                  <div className={styles.rowFoot}>
                    <p className={styles.rowMeta}>From {from} USD</p>
                    <Link
                      href={`${PROJECT_HREF}?svc=${row.service}`}
                      className={ed.action}
                      data-cta-placement={`${prefix}_services_${row.service}_project`}
                    >
                      {PROJECT_LABEL}
                      <span className="visually-hidden">: {name}</span>
                      <span aria-hidden="true" className={ed.arrow}>
                        <Arrow />
                      </span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Market questions: native <details>, every answer in the HTML; FAQPage JSON-LD from the same items.
          Display only: number words and times keep their parts on one line (`display`); the JSON-LD keeps the plain text. */}
      <section id="faq" className={ed.dark} aria-labelledby="faq-title">
        <div className={`${ed.inner} ${styles.faqGrid}`}>
          <div className={styles.faqHead}>
            <p className={ed.label}>{region.faq.label}</p>
            <h2 id="faq-title" className={ed.title}>
              {region.faq.heading}
            </h2>
            <dl className={styles.branch}>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${siteConfig.email}`} data-cta-placement={`${prefix}_branch_email`}>
                    {siteConfig.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
          <div className={styles.faqList}>
            <Accordion
              name={`${prefix}-faq`}
              defaultOpen={0}
              items={region.faq.items.map((item, i) => ({ id: `${prefix}-faq-${i + 1}`, question: item.question, answer: answer(item) }))}
            />
          </div>
        </div>
      </section>

      {/* The last ask, answered here: the inquiry form first (Sentinel: the form leads its section), then
          what happens next and the approved client quote beside the decision. */}
      <section id="inquire" className={`${ed.paper} ${styles.inquiry}`} aria-labelledby="inquire-title" data-page-close="" data-header-quiet="">
        <div className={ed.inner}>
          <header className={ed.head}>
            <p className={ed.label}>Inquire</p>
            <h2 id="inquire-title" className={ed.title}>
              {region.close.title}
            </h2>
            <p className={ed.lede}>
              For agencies and businesses across {region.country}. Tell us what you need, and we reply within 24 hours.
            </p>
          </header>
          <div className={styles.inquiryGrid}>
            <div className={`${ed.card} ${styles.inquiryCard}`}>
              <RegionalInquiry region={region.slug} country={region.country} contactEmail={siteConfig.email} />
            </div>
            <div className={styles.inquiryRail}>
              <Steps steps={INQUIRY_STEPS} tone="paper" />
              <QuoteLine tone="paper" className={styles.inquiryQuote} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
