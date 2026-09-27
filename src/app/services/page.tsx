import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import Cta from '@/components/services/Cta';
import { prettyPrice, SERVICE_OFFICES } from '@/components/services/serviceCopy';
import { REDESIGN_DATE } from '@/config/routes';
import { services, serviceTiers } from '@/config/services';
import { pricing } from '@/config/site';
import { FIXED_QUOTE_NOTE, parsePriceLabel } from '@/lib/estimate';
import { itemList, pageGraph } from '@/lib/schema';
import styles from './service.module.scss';

const TITLE = 'Services for Agencies';
const DESCRIPTION =
  'MAPL TECH engineering services for digital agencies: custom web development, automation and AI workflows, custom internal tools, and cloud engineering. Published tiers with starting prices, the stack behind each line, and a 60-second estimate.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'MAPL TECH services',
    'engineering services for agencies',
    'web development for agencies',
    'automation and AI workflows',
    'custom internal tools',
    'cloud engineering for agencies',
    'white-label development partner',
  ],
  openGraph: {
    title: `${TITLE} | MAPL TECH`,
    description:
      'Four service lines for digital agencies - web development, automation and AI, custom internal tools, cloud engineering - with published starting prices.',
  },
  alternates: {
    canonical: 'https://mapltech.com/services',
  },
};

/** Lowest starting figure across all four lines, from `pricing`. */
function lowestStart(): string {
  const mins = services
    .map((record) => parsePriceLabel(serviceTiers(record)[0].price).low)
    .filter((n): n is number => n !== null);
  return `$${Math.min(...mins).toLocaleString('en-US')}`;
}

/** Every technology the four lines name, de-duplicated, for the key facts. */
function combinedStack(): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const record of services) {
    for (const item of record.stack) {
      const key = item.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
  }
  return out.slice(0, 7).join(' · ');
}

/**
 * /services hub (was a redirect stub). Server Component: H1, lede, key facts,
 * four service rows with starting prices from `pricing`, the two partner
 * bundles and the two CTAs.
 */
export default function ServicesHubPage() {
  const from = lowestStart();
  const web = services.find((s) => s.slug === 'web-development');

  const graph = pageGraph({
    path: '/services',
    name: TITLE,
    description: DESCRIPTION,
    dateModified: REDESIGN_DATE,
    breadcrumbs: [{ name: 'Services', path: '/services' }],
    nodes: [
      itemList(
        services.map((record) => ({ name: record.name, path: record.path, description: record.oneLiner })),
        { path: '/services', name: 'MAPL TECH services' },
      ),
    ],
  });

  return (
    <div className={styles.page}>
      <JsonLd data={graph} />

      <div className={styles.narrow}>
        {/* HERO — all SSR, never revealed */}
        <section className={styles.hero} aria-labelledby="services-title">
          <nav aria-label="Breadcrumb" className={styles.crumbs}>
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-current="page">Services</li>
            </ol>
          </nav>

          <p className={styles.eyebrow}>Services · {String(services.length).padStart(2, '0')} lines</p>
          <h1 id="services-title" className={styles.hubTitle}>
            Four service lines. One engineering partner.
          </h1>
          <p className={styles.lede}>
            MAPL TECH is the engineering partner agencies call when projects demand real systems, intelligent
            automation, and scalable infrastructure. Four service lines — web development, automation and AI workflows,
            custom internal tools, and cloud engineering — each with published tiers, starting from {from}.{' '}
            {FIXED_QUOTE_NOTE}.
          </p>

          <dl className={`kv ${styles.kv}`}>
            <div>
              <dt>Starting price</dt>
              <dd>From {from} (Foundation Automation)</dd>
            </div>
            <div>
              <dt>Typical timeline</dt>
              <dd>{web?.typicalTimeline ? `Web: ${web.typicalTimeline.split(' · ')[0]}` : 'Set in discovery'} · other lines scoped in a 20-min call</dd>
            </div>
            <div>
              <dt>Stack</dt>
              <dd>{combinedStack()}</dd>
            </div>
            <div>
              <dt>Offices</dt>
              <dd>{SERVICE_OFFICES}</dd>
            </div>
            <div>
              <dt>Last reviewed</dt>
              <dd>
                <time dateTime={REDESIGN_DATE}>{REDESIGN_DATE.slice(0, 7)}</time>
              </dd>
            </div>
          </dl>

          <div className={styles.ctas}>
            <Cta href="/pricing#estimator" size="large" placement="services_hero_primary" cursor="estimate" hero boxClassName={styles.ctaBox}>
              Get a 60-second estimate
            </Cta>
            <Cta href="/contact-us" variant="secondary" size="large" placement="services_hero_secondary" boxClassName={styles.ctaBox}>
              Book a 20-min scoping call
            </Cta>
          </div>
        </section>

        {/* FOUR ROWS — starting prices straight from `pricing` */}
        <section className={styles.section} aria-labelledby="lines-title">
          <div className={`${styles.sectionHead} reveal`}>
            <p className="eyebrow">01 · The four lines</p>
            <h2 id="lines-title" className={styles.h2}>
              Pick the line your project needs.
            </h2>
          </div>
          <ol className={styles.rows}>
            {services.map((record, i) => {
              const tier = serviceTiers(record)[0];
              return (
                <li key={record.slug} className="reveal">
                  <Link href={record.path} className={styles.row} data-cursor="view" data-cta-placement={`services_row_${record.slug}`}>
                    <span className={styles.rowIndex}>{String(i + 1).padStart(2, '0')}</span>
                    <span className={styles.rowTitle}>{record.shortName}</span>
                    <span className={styles.rowDesc}>{record.oneLiner}</span>
                    <span className={styles.rowPrice}>
                      <span>From · {tier.name}</span>
                      <span>{prettyPrice(tier.price)}</span>
                    </span>
                    <span className={styles.rowArrow} aria-hidden="true">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>

        {/* BUNDLES — two or more lines as one monthly partnership */}
        <section className={styles.section} aria-labelledby="bundles-title" data-below-fold>
          <div className={`${styles.sectionHead} reveal`}>
            <p className="eyebrow">02 · Two or more lines</p>
            <h2 id="bundles-title" className={styles.h2}>
              Or one monthly partnership.
            </h2>
            <p className={styles.sub}>
              Select two or more lines in the estimator and the matching partner bundle surfaces as a single monthly
              figure.
            </p>
          </div>
          <ul className={styles.bundles}>
            {pricing.bundles.map((bundle) => (
              <li key={bundle.name} className="reveal">
                <span className={styles.bundleName}>{bundle.name}</span>
                <p className={styles.bundlePrice}>{prettyPrice(bundle.price)}</p>
                <p className={styles.bundleDesc}>{bundle.description}</p>
                <ul className={styles.bundleFeatures}>
                  {bundle.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
          <p className={styles.afterLaunch}>
            <span className={styles.afterLaunchLabel}>Hourly</span>
            {prettyPrice(pricing.hourlyRates.standard)} standard · {prettyPrice(pricing.hourlyRates.emergency)} emergency
          </p>
        </section>
      </div>

      {/* CTA BAND */}
      <section className={styles.band} aria-labelledby="hub-band-title" data-below-fold>
        <div className={styles.bandGrid}>
          <div className={`${styles.bandCopy} reveal`}>
            <p className="eyebrow">03 · Start</p>
            <h2 id="hub-band-title" className={styles.h2}>
              Not sure which line? Scope it in 60 seconds.
            </h2>
            <p>
              The estimator maps your project onto the same tiers published on these pages and hands you a range.
              Prefer to talk it through? Book a 20-min scoping call and we come prepared.
            </p>
            <div className={styles.ctas}>
              <Cta href="/pricing#estimator" size="large" placement="services_band_primary" cursor="estimate" boxClassName={styles.ctaBox}>
                Get a 60-second estimate
              </Cta>
              <Cta href="/contact-us" variant="secondary" size="large" placement="services_band_secondary" boxClassName={styles.ctaBox}>
                Book a 20-min scoping call
              </Cta>
            </div>
            <p className={styles.fine}>{FIXED_QUOTE_NOTE}.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
