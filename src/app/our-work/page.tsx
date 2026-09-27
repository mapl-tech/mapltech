import JsonLd from '@/components/seo/JsonLd';
import Cta, { TextCta } from '@/components/work/Cta';
import WorkIndex from '@/components/work/WorkIndex';
import {
  activeServiceLines,
  estimateLinkFor,
  startingPriceLabel,
  workEntries,
  workFilters,
} from '@/components/work/work-data';
import { routeLastModified } from '@/config/routes';
import { SERVICE_META } from '@/lib/estimate';
import { creativeWork, itemList, pageGraph } from '@/lib/schema';
import { portfolioProjects } from '@/config/site';
import styles from './work.module.scss';

// Title, description and canonical live in ./layout.tsx (unchanged).
const PAGE_NAME = 'Our Work';
const PAGE_DESCRIPTION =
  "Explore MAPL TECH's portfolio of systems, automation, and infrastructure projects. Web development, AI workflows, and custom internal tools delivered for agency clients.";

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const asWord = (n: number) => NUMBER_WORDS[n] ?? String(n);
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function OurWorkPage() {
  const entries = workEntries();
  const filters = workFilters(entries);
  const lines = activeServiceLines(entries);
  const lineLabels = lines.map((key) => SERVICE_META[key].label);

  const webFrom = startingPriceLabel('web');
  const automationFrom = startingPriceLabel('automation');
  const lastModified = routeLastModified('/our-work');
  const reviewed = lastModified ? lastModified.slice(0, 7) : undefined;

  const graph = pageGraph({
    path: '/our-work',
    name: PAGE_NAME,
    description: PAGE_DESCRIPTION,
    type: 'CollectionPage',
    breadcrumbs: [{ name: PAGE_NAME, path: '/our-work' }],
    nodes: [
      itemList(
        entries.map((entry) => {
          const project = portfolioProjects.find((p) => p.slug === entry.slug)!;
          return {
            name: entry.title,
            path: entry.path,
            description: entry.description,
            item: creativeWork(project, { path: entry.path }),
          };
        }),
        { path: '/our-work', name: 'Client work by MAPL TECH' },
      ),
    ],
  });

  return (
    <>
      <JsonLd data={graph} />

      {/* 01 · Hero: H1 → lede → key facts → CTAs. Nothing here is wrapped in a reveal. */}
      <section className={styles.hero} aria-labelledby="work-title">
        <div className={styles.heroInner}>
          <div>
            <p className="eyebrow">Our work · /our-work</p>
            <h1 id="work-title" className={styles.title}>
              Real Work. Real Agencies. Real Results.
            </h1>
            <p className={styles.lede}>
              Systems, automation and infrastructure MAPL TECH has shipped for agencies and their clients across
              staffing, e-commerce and non-profits. {capitalize(asWord(entries.length))} projects are listed below
              across {asWord(lines.length)} service lines; every row links to the live site or the case study, and
              the client&apos;s brand stays on every deliverable.
            </p>
          </div>

          <dl className={`kv ${styles.facts}`}>
            <div>
              <dt>Projects listed</dt>
              <dd>{entries.length}</dd>
            </div>
            <div>
              <dt>Service lines</dt>
              <dd>
                {lines.length} — {lineLabels.join(' · ')}
              </dd>
            </div>
            <div>
              <dt>Starting price</dt>
              <dd>
                {webFrom} (Web Development)
                {automationFrom ? ` · ${automationFrom.toLowerCase()} (Automation & AI)` : null}
              </dd>
            </div>
            <div>
              <dt>Offices</dt>
              <dd>Toronto (HQ) · Lagos · Kingston</dd>
            </div>
            {reviewed ? (
              <div>
                <dt>Last reviewed</dt>
                <dd>
                  <time dateTime={lastModified}>{reviewed}</time>
                </dd>
              </div>
            ) : null}
          </dl>

          <div className={styles.ctas}>
            <Cta href="/pricing#estimator" size="large" placement="work_hero_primary" hero>
              Get a 60-second estimate
            </Cta>
            <Cta href="/contact-us" variant="secondary" size="large" placement="work_hero_secondary">
              Book a 20-min scoping call
            </Cta>
          </div>
        </div>
      </section>

      {/* 02 + 03 · Filter, layout toggle and the work rows (PEAK island). All rows are SSR'd. */}
      <section className={styles.listSection} aria-labelledby="work-list-heading">
        <div className={styles.listHead}>
          <p className="eyebrow">Client work</p>
          <h2 id="work-list-heading">
            {capitalize(asWord(entries.length))} projects, {asWord(lines.length)} service lines
          </h2>
          <p>Filter by service line. Rows open the case study; “View live site” opens the client&apos;s site.</p>
        </div>

        <WorkIndex entries={entries} filters={filters} cloudPricingHref={estimateLinkFor('cloud')} />

        <div className={styles.listFoot}>
          <p>Own products, built and operated in-house, live under MAPL Labs.</p>
          <TextCta href="/labs" placement="work_list_labs" className={styles.textLink} cursor="view">
            See MAPL Labs
          </TextCta>
        </div>
      </section>

      {/* 04 · Inline CTA band: below the fold, revealed on scroll. */}
      <section className={`${styles.band} reveal`} data-below-fold aria-labelledby="work-band-heading">
        <div className={styles.bandInner}>
          <div>
            <h2 id="work-band-heading">Want results like these?</h2>
            <p>
              Tell us about your project. We&apos;ll tell you exactly how we&apos;d approach it — fixed quote after
              a 20-min scoping call, your brand on every deliverable.
            </p>
          </div>
          <div className={styles.bandActions}>
            <Cta href="/pricing#estimator" size="large" placement="work_band_primary">
              Get a 60-second estimate
            </Cta>
            <Cta href="/contact-us" variant="secondary" size="large" placement="work_band_secondary">
              Book a 20-min scoping call
            </Cta>
          </div>
        </div>
      </section>
    </>
  );
}
