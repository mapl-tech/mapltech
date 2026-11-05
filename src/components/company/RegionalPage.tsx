import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import Accordion from '@/components/ui/Accordion';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import { TRUST_ITEMS } from '@/components/flagship/content';
import { PRICING_HREF, PRICING_LABEL, PROJECT_HREF, PROJECT_LABEL, telHref } from '@/components/layout/chrome';
import { keepNumberWords } from '@/components/pricing/content';
import { siteConfig } from '@/config/site';
import { faqPage, getServiceLine, itemList, pageGraph, serviceId } from '@/lib/schema';
import { SERVICE_META } from '@/lib/estimate';
import FactsBand from './FactsBand';
import HeroActions from './HeroActions';
import LocalTime from './LocalTime';
import OfficeMap from './OfficeMap';
import { OFFICE_HOURS_FACT, PRICE_FACT, countWord, keepBrand } from './content';
import { REPLY_TIME, rolesIn, startingFrom, type RegionConfig, type RegionFaq } from './regions';
import ed from './Company.module.scss';
import place from './PlaceReadout.module.scss';
import styles from './RegionalPage.module.scss';
import Arrow from '@/components/ui/Arrow';

export interface RegionalPageProps {
  region: RegionConfig;
  /** The page's metadata title, verbatim (becomes WebPage.name). */
  title: string;
  /** The page's metadata description, verbatim. */
  description: string;
}

/**
 * The regional template for /nigeria and /jamaica (Nov 2026 simplify pass,
 * review fixes).
 *
 * A sense of place without stock photography: the branch city's live local
 * time (and when the office next opens) under a to-scale drawing of the
 * three offices, under the site's reassurance line; the card is the page's
 * one home for the zone. Then three facts a director needs first and that
 * the page says nowhere else (the office hours, the lowest public price, the
 * reply time), what the local team builds with each service's own "from"
 * price and a direct way to start each one (paper), a real local project
 * where one exists (no stand-in section where none does), the market
 * questions (the Toronto overlap is worked out there) with the branch's
 * contact lines, and the close: the site's own lede and the approved client
 * quote. regions.ts lists where each fact lives.
 *
 * Schema (unchanged): WebPage + BreadcrumbList + ItemList of the four
 * services + FAQPage, all built from the same arrays the page renders. No
 * LocalBusiness and no street address: none is published.
 */
export default function RegionalPage({ region, title, description }: RegionalPageProps) {
  const prefix = region.slug;
  const roles = rolesIn(region.country);
  const services = region.services.rows.map((row) => ({ row, line: getServiceLine(row.slug), from: startingFrom(row.service) }));
  const typeSet = Array.from(new Set(roles.map((role) => role.type.toLowerCase())));

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
  /** Display only: "3 pm" keeps its number on the line, as "20‑minute" does (the JSON-LD keeps plain text). */
  const display = (text: string) => keepNumberWords(text).replace(/(\d) (am|pm)\b/g, '$1\u00a0$2');
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
        fill
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
            secondary={{ label: PRICING_LABEL, href: PRICING_HREF, placement: `${prefix}_hero_secondary` }}
          />
        }
        trust={TRUST_ITEMS}
        aside={
          <div className={styles.place}>
            <OfficeMap focus={region.officeCity} captionHidden axes={false} draw="load" className={styles.placeMap} />
            <div className={place.readout}>
              <p className={place.city}>
                {region.officeCity}, {region.country}
              </p>
              <LocalTime timeZone={region.timeZone} zoneAbbr={region.zoneAbbr} />
              <p className={place.zone}>
                {region.zoneName} · {region.utcLabel}
              </p>
              <p className={place.coords}>{region.coordinates}</p>
            </div>
          </div>
        }
      />

      <FactsBand facts={[OFFICE_HOURS_FACT, PRICE_FACT, { term: 'Reply time', detail: REPLY_TIME }]} label={`${region.brandName} at a glance`} />

      {/* What the local team builds, on paper: the four services with real prices, then the local realities. */}
      <section id="services" className={ed.paper} aria-labelledby="services-title">
        <div className={ed.inner}>
          <header className={ed.head}>
            <p className={ed.label}>What we build</p>
            <h2 id="services-title" className={ed.title}>
              {keepBrand(region.team.heading)}
            </h2>
            <p className={ed.lede}>{region.team.body}</p>
          </header>

          {/* Each row: the service page (its link covers the name, words and arrow), then the price and a brief that opens with that service chosen.
              Every row has its own "Start a project", so the phone bar steps aside over the list (data-bar-stand-down). */}
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
                    <p className={styles.rowMeta}>From {from}</p>
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

          <div className={styles.realities}>
            <h3 className={styles.realitiesTitle}>{region.team.realitiesHeading}</h3>
            <ul className={styles.realitiesList} role="list">
              {region.team.realities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* A real local project where one exists; none is shown in its place where none does (the close carries the quote). */}
      {region.work ? (
        <section id="work" className={`${ed.dark} ${ed.ruled}`} aria-labelledby="work-title">
          <div className={ed.inner}>
            <header className={ed.head}>
              <p className={ed.label}>{region.work.label}</p>
              <h2 id="work-title" className={ed.title}>
                Work we run in {region.country}.
              </h2>
              <p className={ed.lede}>Most of what we build ships under our partners’ names. This one carries ours.</p>
            </header>

            <article className={`${ed.card} ${styles.work}`} aria-labelledby="region-work-client">
              <div className={styles.workCopy}>
                <h3 id="region-work-client" className={styles.workClient}>
                  {region.work.client}
                </h3>
                <p className={styles.workText}>{region.work.text}</p>
                <Link href={region.work.href} className={ed.action} data-cta-placement={`${prefix}_work`}>
                  Read the case study<span className="visually-hidden">: {region.work.client}</span>
                  <span aria-hidden="true" className={ed.arrow}>
                    <Arrow />
                  </span>
                </Link>
              </div>
              <div className={styles.workMedia}>
                <figure className={styles.browser}>
                  <div className={styles.chrome} aria-hidden="true">
                    <span className={styles.lights}>
                      <i />
                      <i />
                      <i />
                    </span>
                    <span className={styles.url}>{region.work.url}</span>
                  </div>
                  <Image
                    src={region.work.image.src}
                    alt={region.work.image.alt}
                    width={region.work.image.width}
                    height={region.work.image.height}
                    sizes="(min-width: 1024px) 46vw, 92vw"
                    className={styles.shot}
                  />
                </figure>
                {region.work.mobile ? (
                  <div className={styles.phone} aria-hidden="true">
                    <Image src={region.work.mobile} alt="" width={780} height={1688} sizes="(min-width: 1024px) 12vw, 26vw" className={styles.phoneShot} />
                  </div>
                ) : null}
              </div>
            </article>
          </div>
        </section>
      ) : null}

      {/* Market questions: native <details>, every answer in the HTML; FAQPage JSON-LD from the same items. Ruled only after the dark work section.
          Display only: number words and times keep their parts on one line (`display`); the JSON-LD keeps the plain text. */}
      <section id="faq" className={region.work ? `${ed.dark} ${ed.ruled}` : ed.dark} aria-labelledby="faq-title">
        <div className={`${ed.inner} ${styles.faqGrid}`}>
          <div className={styles.faqHead}>
            <p className={ed.label}>Before you sign</p>
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
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={telHref(siteConfig.phone)} data-cta-placement={`${prefix}_branch_phone`}>
                    {siteConfig.phone}
                  </a>{' '}
                  <span className={styles.line}>Toronto line</span>
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
            {/* For job seekers: one small line, away from the buyer's contact lines. */}
            {roles.length ? (
              <p className={styles.hiring}>
                Looking for work? See our{' '}
                <Link href={`/careers?loc=${region.country.toLowerCase()}#roles`} data-cta-placement={`${prefix}_careers_all`}>
                  {countWord(roles.length).toLowerCase()} open {typeSet.length === 1 ? `${typeSet[0]} ` : ''}
                  role{roles.length === 1 ? '' : 's'} in {region.country}
                </Link>
                .
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* The site's close lede, and the approved client quote under the last ask (the hero has the reassurance line, not the quote). */}
      <CloseBand title={region.close.title} placement={`${prefix}_close`} />
    </>
  );
}
