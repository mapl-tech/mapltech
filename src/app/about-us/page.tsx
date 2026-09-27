import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { executives, teamMembers } from '@/config/team';
import { getService } from '@/config/services';
import { aboutPage, breadcrumb, howTo, person } from '@/lib/schema';
import Arrow from '@/components/company/Arrow';
import Cta from '@/components/company/Cta';
import ExecutiveCard from '@/components/company/ExecutiveCard';
import FounderStory from '@/components/company/FounderStory';
import HeroBlock, { ReviewedOn, type HeroFact } from '@/components/company/HeroBlock';
import HowWeWork, { HOW_WE_WORK_NAME, HOW_WE_WORK_STEPS } from '@/components/company/HowWeWork';
import OverlapSection from '@/components/company/OverlapSection';
import SectionHead from '@/components/company/SectionHead';
import ValuesEditorial from '@/components/company/ValuesEditorial';
import { lowestStartingPrice } from '@/components/company/regions';
import styles from '../company.module.scss';

const DESCRIPTION =
  'MAPL TECH is the engineering partner agencies call when projects demand real systems, automation, and infrastructure - not another marketing vendor.';

export const metadata: Metadata = {
  title: 'About Us',
  alternates: { canonical: 'https://mapltech.com/about-us' },
  description: DESCRIPTION,
  openGraph: {
    title: 'About Us | MAPL TECH',
    description:
      'The engineering backbone behind agencies that refuse to cut corners on technology.',
  },
};

const H1 = "We're not another agency. We're the team behind them.";

const LEDE =
  'When your project outgrows templates and plugins, MAPL TECH steps in. We give agencies the systems, automation and infrastructure that turn ambitious projects into production-ready reality — 25+ years of combined engineering experience across Toronto, Lagos and Kingston, without hiring a full engineering department.';

const OVERLAP = {
  heading: 'Awake in your timezone.',
  body:
    'Toronto, Lagos and Kingston working windows plotted against your local day. Every office keeps 09:00–18:00 local hours, Monday to Friday; the teal band is the part of your day with at least one MAPL TECH office open.',
  footnote: 'Lagos is 5 hours ahead of Toronto in summer and 6 in winter; Kingston sits within an hour of Toronto all year.',
};

const CTA_BAND = {
  heading: 'Ready to stop duct-taping your tech stack?',
  body: "Let's talk about what your agency actually needs — and build it right.",
};

export default function AboutPage() {
  const webTimeline = getService('web-development').typicalTimeline;

  const facts: HeroFact[] = [
    { term: 'Offices', detail: 'Toronto (HQ) · Lagos · Kingston' },
    {
      term: 'Team',
      detail: `${executives.length} co-founders · ${teamMembers.length} named engineers, strategists and operators`,
    },
    { term: 'Experience', detail: '25+ years combined' },
    { term: 'Starting price', detail: `From ${lowestStartingPrice()} (USD)` },
    ...(webTimeline ? [{ term: 'Typical timeline', detail: `${webTimeline} (web builds)` }] : []),
    { term: 'Last reviewed', detail: <ReviewedOn path="/about-us" /> },
  ];

  return (
    <div className={styles.page}>
      <JsonLd
        data={[
          aboutPage({ name: 'About Us', description: DESCRIPTION }),
          breadcrumb([{ name: 'About Us', path: '/about-us' }]),
          howTo(
            HOW_WE_WORK_STEPS.map((step) => ({ name: step.name, text: step.text })),
            { name: HOW_WE_WORK_NAME, path: '/about-us' },
          ),
          ...executives.map(person),
        ]}
      />

      <HeroBlock eyebrow="About MAPL TECH" title={H1} lede={LEDE} facts={facts} placementPrefix="about" />

      <FounderStory />

      <HowWeWork />

      {/* PEAK */}
      <OverlapSection
        id="overlap"
        eyebrow="04 · Timezone overlap"
        heading={OVERLAP.heading}
        body={OVERLAP.body}
        footnote={OVERLAP.footnote}
      />

      <ValuesEditorial />

      {/* Team preview: the two executives from team.ts */}
      <section id="leadership" className={`${styles.section} reveal`} aria-labelledby="leadership-title">
        <div className={styles.sectionInner}>
          <SectionHead
            eyebrow="06 · Leadership"
            title="Led by named people, not a bench"
            id="leadership-title"
            action={
              <Link href="/team" className={styles.inlineLink} data-cta-placement="about_team_link">
                Meet the whole team <Arrow />
              </Link>
            }
          />
          <div className={styles.execGrid}>
            {executives.map((exec) => (
              <ExecutiveCard key={exec.name} exec={exec} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section className={`${styles.ctaBand} reveal`} aria-labelledby="cta-title">
        <div className={`${styles.sectionInner} ${styles.ctaBandInner}`}>
          <div>
            <h2 id="cta-title" className={styles.ctaBandTitle}>
              {CTA_BAND.heading}
            </h2>
            <p className={styles.ctaBandBody}>{CTA_BAND.body}</p>
          </div>
          <div className={styles.ctaBandActions}>
            <Cta placement="about_band_primary" href="/pricing#estimator" size="large">
              Get a 60-second estimate
            </Cta>
            <Cta placement="about_band_secondary" href="/contact-us" variant="secondary" size="large">
              Book a 20-min scoping call
            </Cta>
          </div>
        </div>
      </section>
    </div>
  );
}
