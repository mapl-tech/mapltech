import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import Accordion from '@/components/ui/Accordion';
import { telHref } from '@/components/layout/chrome';
import { siteConfig } from '@/config/site';
import { faqPage, getServiceLine, itemList, pageGraph, serviceId } from '@/lib/schema';
import { SERVICE_META } from '@/lib/estimate';
import Close from './Close';
import HoursExplorer from './HoursExplorer';
import LocalTime from './LocalTime';
import OfficeMap from './OfficeMap';
import PageHero from './PageHero';
import { CALL_CTA, PRICE_CTA, TRUST_LINE, keepBrand, listWords } from './content';
import { REPLY_TIME, lowestStartingPrice, rolesIn, startingFrom, type RegionConfig } from './regions';
import place from './PlaceReadout.module.scss';
import styles from './RegionalPage.module.scss';

export interface RegionalPageProps {
  region: RegionConfig;
  /** The page's metadata title, verbatim (becomes WebPage.name). */
  title: string;
  /** The page's metadata description, verbatim. */
  description: string;
}

/**
 * The regional template for /nigeria and /jamaica (flagship redesign).
 *
 * A sense of place without stock photography: the branch city's live local
 * time, its zone and coordinates, and a to-scale drawing of the three offices.
 * Then what the local team builds (with real "from" prices), the page's one
 * interaction (your working day against the branch's hours), a real local
 * project where one exists, the local open roles, the market FAQ and the
 * global ask.
 *
 * Schema: WebPage + BreadcrumbList + ItemList of the four services + FAQPage,
 * all built from the same arrays the page renders. No LocalBusiness and no
 * street address: none is published.
 */
export default function RegionalPage({ region, title, description }: RegionalPageProps) {
  const prefix = region.slug;
  const roles = rolesIn(region.country);
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

  const typeSet = Array.from(new Set(roles.map((role) => role.type.toLowerCase())));

  return (
    <>
      <JsonLd data={graph} />

      <PageHero
        crumbs={[{ name: 'About', href: '/about-us' }, { name: region.brandName }]}
        eyebrow={region.brandName}
        titleLines={region.hero.titleLines}
        lede={region.hero.lede}
        primary={{ ...PRICE_CTA, placement: `${prefix}_hero_primary` }}
        secondary={{ ...CALL_CTA, placement: `${prefix}_hero_call` }}
        trust={TRUST_LINE}
        facts={[
          ...region.facts,
          { term: 'Prices from', detail: `${lowestStartingPrice()} (USD), public` },
          { term: 'Reply time', detail: REPLY_TIME },
        ]}
        aside={
          <div className={styles.place}>
            <OfficeMap focus={region.officeCity} captionHidden draw="load" />
            <div className={place.readout}>
              <span className={place.surface} aria-hidden="true" />
              <div className={place.body}>
                <p className={place.city}>
                  {region.officeCity}, {region.country}
                </p>
                <LocalTime timeZone={region.timeZone} utcLabel={region.utcLabel} />
                <p className={place.zone}>
                  {region.zoneName} · {region.utcLabel}
                </p>
                <p className={place.coords}>{region.coordinates}</p>
              </div>
            </div>
          </div>
        }
      />

      {/* What the local team builds: who they are on the rail, the four services with real prices beside it. */}
      <section id="services" className={styles.section} aria-labelledby="services-title">
        <div className={styles.split}>
          <div className={styles.rail}>
            <h2 id="services-title" className={styles.h2}>
              {keepBrand(region.team.heading)}
            </h2>
            <div className={styles.body}>
              {region.team.body.map((paragraph) => (
                <p key={paragraph.slice(0, 32)}>{paragraph}</p>
              ))}
            </div>
            <div className={styles.realities}>
              <h3 className={styles.realitiesTitle}>{region.team.realitiesHeading}</h3>
              <ul className={styles.realitiesList} role="list">
                {region.team.realities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className={styles.listHead}>{region.services.heading}</h3>
            <ul className={styles.rows} role="list">
              {services.map(({ row, line, from }) => (
                <li key={line.slug}>
                  <Link href={line.path} className={styles.row} data-cta-placement={`${prefix}_services_${line.slug}`}>
                    <span className={styles.rowName}>{SERVICE_META[row.service].label}</span>{' '}
                    <span className={styles.rowMeta}>From {from}</span>{' '}
                    <span className={styles.rowText}>{row.description}</span>{' '}
                    <span className={styles.rowMore}>
                      How we build it
                      <span aria-hidden="true" className={styles.rowArrow}>
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* The one interaction: your working day against the branch's hours. */}
      <section id="overlap" className={styles.section} aria-labelledby="overlap-title">
        <div className={styles.split}>
          <div className={styles.rail}>
            <h2 id="overlap-title" className={styles.h2}>
              {region.overlap.heading}
            </h2>
            <p className={styles.lede}>{region.overlap.body}</p>
            <p className={styles.footnote}>{region.overlap.footnote}</p>
            <Link href="/about-us#offices" className={styles.link} data-cta-placement={`${prefix}_overlap_about`}>
              How our three offices work together<span aria-hidden="true"> →</span>
            </Link>
          </div>
          <HoursExplorer focus={region.officeCity} label={`Your working day against ${region.brandName}'s office hours`} />
        </div>
      </section>

      {/* A real local project, only where one exists. */}
      {region.work ? (
        <section id="work" className={styles.section} aria-labelledby="work-title">
          <div className={styles.split}>
            <div className={styles.rail}>
              <h2 id="work-title" className={styles.h2}>
                Work we run in {region.country}.
              </h2>
              <p className={styles.lede}>
                Most of what we build ships under our partners&apos; names. This one carries ours.
              </p>
            </div>
            <div className={styles.workWrap}>
              <Link
                href={region.work.href}
                className={styles.work}
                aria-labelledby="region-work-client region-work-read"
                data-cta-placement={`${prefix}_work`}
              >
                <span className={styles.workText}>
                  <span className={styles.workLabel}>{region.work.label}</span>{' '}
                  <span id="region-work-client" className={styles.workClient}>
                    {region.work.client}
                  </span>
                  <span className={styles.workCopy}>{region.work.text}</span>{' '}
                  <span id="region-work-read" className={styles.workRead}>
                    Read the case study<span aria-hidden="true"> →</span>
                  </span>
                </span>
                <span className={styles.workMedia}>
                  <Image
                    src={region.work.image.src}
                    alt={region.work.image.alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, 92vw"
                    className={styles.workImg}
                  />
                </span>
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Market FAQ: native <details>, every answer in the HTML; FAQPage JSON-LD from the same items. */}
      <section id="faq" className={styles.section} aria-labelledby="faq-title">
        <div className={styles.split}>
          <div className={styles.rail}>
            <h2 id="faq-title" className={styles.h2}>
              {region.faq.heading}
            </h2>
            <p className={styles.lede}>Answered plainly, with the same prices and hours as everywhere else on this site.</p>
          </div>
          <div className={styles.faq}>
            <Accordion
              name={`${prefix}-faq`}
              items={region.faq.items.map((item, i) => ({ id: `${prefix}-faq-${i + 1}`, question: item.question, answer: item.answer }))}
            />
          </div>
        </div>
      </section>

      <Close id="close-title" title={region.close.title} lede={region.close.lede} placement={prefix}>
        <p>
          {region.brandName} · Regional branch, {region.officeCity}, {region.country} · Serves {listWords([...region.serves])}
        </p>
        <p>
          <a href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a>
        </p>
        <p>
          <a href={telHref(siteConfig.phone)}>{siteConfig.phone}</a>
        </p>
        {/* The hiring link (the brief's ask): one line, so candidates have a route without interrupting the agency sequence. */}
        {roles.length ? (
          <p>
            <Link href={`/careers?loc=${region.country.toLowerCase()}#roles`} data-cta-placement={`${prefix}_careers_all`}>
              Hiring in {region.country}: {roles.length} open {typeSet.length === 1 ? `${typeSet[0]} ` : ''}
              role{roles.length === 1 ? '' : 's'}
            </Link>
          </p>
        ) : null}
      </Close>
    </>
  );
}
