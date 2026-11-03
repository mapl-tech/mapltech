import Image from 'next/image';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import Accordion from '@/components/ui/Accordion';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import { PRICING_HREF, PRICING_LABEL, PROJECT_HREF, PROJECT_LABEL, telHref } from '@/components/layout/chrome';
import { siteConfig } from '@/config/site';
import { faqPage, getServiceLine, itemList, pageGraph, serviceId } from '@/lib/schema';
import { SERVICE_META } from '@/lib/estimate';
import FactsBand from './FactsBand';
import HeroActions from './HeroActions';
import LocalTime from './LocalTime';
import OfficeList from './OfficeList';
import OfficeMap from './OfficeMap';
import { PRICE_FACT, keepBrand } from './content';
import { REPLY_TIME, rolesIn, startingFrom, type RegionConfig } from './regions';
import ed from './Company.module.scss';
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
 * The regional template for /nigeria and /jamaica (Nov 2026 simplify pass).
 *
 * A sense of place without stock photography: the branch city's live local
 * time beside a to-scale drawing of the three offices. Then the market facts,
 * what the local team builds with real "from" prices (paper), the three
 * offices' hours with the branch first, a real local project where one
 * exists, the market questions with the branch's contact lines, and the
 * close.
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
            secondary={{ label: PRICING_LABEL, href: PRICING_HREF, placement: `${prefix}_hero_secondary` }}
          />
        }
        aside={
          <div className={styles.place}>
            <OfficeMap focus={region.officeCity} captionHidden axes={false} draw="load" className={styles.placeMap} />
            <div className={place.readout}>
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
        }
      />

      <FactsBand
        facts={[
          ...region.facts,
          PRICE_FACT,
          { term: 'Reply time', detail: REPLY_TIME },
        ]}
        label={`${region.brandName} at a glance`}
      />

      {/* What the local team builds, on paper: the four services with real prices, then the local realities. */}
      <section id="services" className={ed.paper} aria-labelledby="services-title">
        <div className={ed.inner}>
          <header className={ed.head}>
            <p className={ed.label}>What we build</p>
            <h2 id="services-title" className={ed.title}>
              {keepBrand(region.team.heading)}
            </h2>
            <p className={ed.lede}>{region.team.body}</p>
            <div className={ed.headNote}>
              <Link href={PRICING_HREF} className={ed.action} data-cta-placement={`${prefix}_services_pricing`}>
                See all prices
                <span aria-hidden="true" className={ed.arrow}>
                  →
                </span>
              </Link>
            </div>
          </header>

          <ul className={styles.rows} role="list" aria-label={region.services.heading}>
            {services.map(({ row, line, from }) => (
              <li key={line.slug} className={styles.row}>
                <Link href={line.path} className={styles.rowLink} data-cta-placement={`${prefix}_services_${line.slug}`}>
                  <span className={styles.rowName}>{SERVICE_META[row.service].label}</span>{' '}
                  <span className={styles.rowText}>{row.description}</span>{' '}
                  <span className={styles.rowMeta}>From {from}</span>
                  <span className={styles.rowGo} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
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

      {/* The three offices' hours, the branch first. */}
      <section id="overlap" className={ed.dark} aria-labelledby="overlap-title">
        <div className={ed.inner}>
          <header className={ed.head}>
            <p className={ed.label}>Working hours</p>
            <h2 id="overlap-title" className={ed.title}>
              {region.overlap.heading}
            </h2>
            <p className={ed.lede}>{region.overlap.body}</p>
          </header>
          <div className={ed.offset}>
            <OfficeList label="Our offices" focus={region.officeCity} current={region.path} placement={`${prefix}_offices`} />
          </div>
        </div>
      </section>

      {/* A real local project, only where one exists. */}
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
                    →
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

      {/* Market questions: native <details>, every answer in the HTML; FAQPage JSON-LD from the same items. */}
      <section id="faq" className={`${ed.dark} ${ed.ruled}`} aria-labelledby="faq-title">
        <div className={`${ed.inner} ${styles.faqGrid}`}>
          <div className={styles.faqHead}>
            <p className={ed.label}>Before you sign</p>
            <h2 id="faq-title" className={ed.title}>
              {region.faq.heading}
            </h2>
            <p className={ed.lede}>Short answers, with the same prices and hours as the rest of this site.</p>
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
                  </a>
                </dd>
              </div>
              {roles.length ? (
                <div>
                  <dt>Hiring</dt>
                  <dd>
                    <Link href={`/careers?loc=${region.country.toLowerCase()}#roles`} data-cta-placement={`${prefix}_careers_all`}>
                      {roles.length} open {typeSet.length === 1 ? `${typeSet[0]} ` : ''}
                      role{roles.length === 1 ? '' : 's'} in {region.country}
                    </Link>
                  </dd>
                </div>
              ) : null}
            </dl>
          </div>
          <div className={styles.faqList}>
            <Accordion
              name={`${prefix}-faq`}
              items={region.faq.items.map((item, i) => ({ id: `${prefix}-faq-${i + 1}`, question: item.question, answer: item.answer }))}
            />
          </div>
        </div>
      </section>

      <CloseBand title={region.close.title} lede={region.close.lede} placement={`${prefix}_close`} />
    </>
  );
}
