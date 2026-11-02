import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { REDESIGN_DATE } from '@/config/routes';
import { careers, siteConfig } from '@/config/site';
import { jobPosting, pageGraph, slugify } from '@/lib/schema';
import FoundersNote from '@/components/company/FoundersNote';
import OfficeMap from '@/components/company/OfficeMap';
import PageHero from '@/components/company/PageHero';
import ShippedWork from '@/components/company/ShippedWork';
import { CAREERS } from '@/components/company/content';
import CareersBoard, { type BoardRole } from '@/components/convert/CareersBoard';
import CareersApply from '@/components/convert/CareersApply';
import TalentListForm from '@/components/convert/TalentListForm';
import styles from './careers.module.scss';

const PATH = '/careers';
const URL = 'https://mapltech.com/careers';

export const metadata: Metadata = {
  title: CAREERS.title,
  description: CAREERS.description,
  alternates: { canonical: URL },
  openGraph: {
    type: 'website',
    url: URL,
    title: 'Careers | MAPL TECH',
    description: CAREERS.description,
  },
  twitter: { card: 'summary_large_image', title: 'Careers | MAPL TECH', description: CAREERS.description },
};

/*
 * /careers, flagship redesign (Nov 2026). Every role comes from `careers` in
 * site.ts and is rendered three ways from that one list: the board (server
 * HTML, URL-synced filters), the apply form's role picker, and one JobPosting
 * node per role. No role, salary or date is invented: `careers` carries no
 * posting date, so datePosted is the date the board went live in the
 * redesign (REDESIGN_DATE) and no salary is published.
 */
/** Display only: a spaced hyphen used as a dash in the source copy reads as a colon. */
const tidy = (text: string) => text.replace(/\s+-\s+/, ': ');

const roles: BoardRole[] = careers.map((role) => ({
  slug: slugify(`${role.title} ${role.country}`),
  title: role.title,
  type: role.type,
  location: role.location,
  country: role.country,
  description: tidy(role.description),
}));

const careersGraph = pageGraph({
  path: PATH,
  name: CAREERS.title,
  description: CAREERS.description,
  breadcrumbs: [
    { name: 'About Us', path: '/about-us' },
    { name: 'Careers', path: PATH },
  ],
  nodes: careers.map((role) => jobPosting(role, { datePosted: REDESIGN_DATE, directApply: true })),
});

export default function CareersPage() {
  return (
    <>
      <JsonLd data={careersGraph} />

      <PageHero
        crumbs={[{ name: 'About', href: '/about-us' }, { name: 'Careers' }]}
        eyebrow={CAREERS.hero.eyebrow}
        titleLines={CAREERS.hero.titleLines}
        lede={CAREERS.hero.lede}
        primary={{ label: 'See open roles', href: '#roles', placement: 'careers_hero_primary' }}
        secondary={{ label: 'Join the talent list', href: '#talent', placement: 'careers_hero_talent' }}
        facts={CAREERS.facts}
        aside={<OfficeMap notes={CAREERS.map.notes} caption={CAREERS.map.caption} draw="load" />}
        asideOn="wide"
      />

      <section id="roles" className={styles.section} aria-labelledby="roles-title">
        <div className={styles.split}>
          <div className={styles.rail}>
            <h2 id="roles-title" className={styles.h2}>
              {CAREERS.roles.title}
            </h2>
            <p className={styles.lede}>{CAREERS.roles.lede}</p>
          </div>
          <CareersBoard roles={roles} />
        </div>
      </section>

      <ShippedWork id="careers-work-title" title={CAREERS.work.title} lede={CAREERS.work.lede} placement="careers" />

      <section id="apply" className={styles.section} aria-labelledby="apply-title">
        <div className={styles.split}>
          <div className={styles.rail}>
            <h2 id="apply-title" className={styles.h2}>
              {CAREERS.apply.title}
            </h2>
            <p className={styles.lede}>{CAREERS.apply.lede}</p>
            <ol className={styles.steps} role="list">
              {CAREERS.apply.steps.map((step) => (
                <li key={step.name}>
                  <span className={styles.stepName}>{step.name}</span>
                  <span className={styles.stepText}>{step.text}</span>
                </li>
              ))}
            </ol>
            <p className={styles.fallback}>
              Prefer email? Write to{' '}
              <a href={`mailto:${siteConfig.email}?subject=${encodeURIComponent('Job application')}`}>{siteConfig.email}</a> with the role,
              a link to your work and a few lines about you.
            </p>
            <FoundersNote placement="careers_apply" />
          </div>
          <div className={styles.panel}>
            <CareersApply roles={roles} contactEmail={siteConfig.email} />
          </div>
        </div>
      </section>

      {/* data-page-close: the page ends on the candidate ask, so the footer drops its agency ask. */}
      <section id="talent" className={styles.talentSection} aria-labelledby="talent-title" data-page-close>
        <div className={styles.split}>
          <div className={styles.rail}>
            <h2 id="talent-title" className={styles.h2}>
              {CAREERS.talent.title}
            </h2>
            <p className={styles.lede}>{CAREERS.talent.lede}</p>
          </div>
          <div className={styles.panel}>
            <TalentListForm contactEmail={siteConfig.email} />
          </div>
        </div>
      </section>
    </>
  );
}
