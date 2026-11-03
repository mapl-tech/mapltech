import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { REDESIGN_DATE } from '@/config/routes';
import { careers, siteConfig } from '@/config/site';
import { jobPosting, pageGraph, slugify } from '@/lib/schema';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import FactsBand from '@/components/company/FactsBand';
import HeroActions from '@/components/company/HeroActions';
import OfficeMap from '@/components/company/OfficeMap';
import { CAREERS } from '@/components/company/content';
import ed from '@/components/company/Company.module.scss';
import CareersBoard, { type BoardRole } from '@/components/convert/CareersBoard';
import CareersApply from '@/components/convert/CareersApply';
import TalentListForm from '@/components/convert/TalentListForm';
import Steps from '@/components/services/Steps';
import styles from './careers.module.scss';

const PATH = '/careers';
const URL = 'https://mapltech.com/careers';
/** The apply form's card: the phone bar's "Apply" lands here. */
const APPLY_FORM_ID = 'apply-form';

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
 * /careers, Nov 2026 award pass. Every role comes from `careers` in site.ts
 * and is rendered three ways from that one list: the board (server HTML,
 * URL-synced filters), the apply form's role picker, and one JobPosting node
 * per role. No role, salary or date is invented: `careers` carries no posting
 * date, so datePosted is the date the board went live in the redesign
 * (REDESIGN_DATE) and no salary is published.
 *
 * Order: the hero (roles first) -> the facts -> the board -> how to apply,
 * with the form (paper; the talent list for people with no listed role sits
 * one click away beside it) -> the close, which speaks to the agency owner
 * who came to see who would be doing the work. The form leads the apply
 * section's DOM, so phones and tablets meet it right under "How to apply.";
 * wide screens place the rail (steps, the team and work pages, email, the
 * talent list) beside it, on the right. Once the hero is gone, the phone bar
 * offers "Apply" (to the form), not the roles the reader is already in, and
 * steps aside over the roles list, where every row has its own Apply. The
 * one email fallback is the rail's (the form's button row holds only the
 * send).
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
  const { hero, roles: rolesCopy, apply, talent } = CAREERS;
  const { evidence } = apply;
  return (
    <>
      <JsonLd data={careersGraph} />

      <PageHeader
        size="l"
        crumbs={[{ label: 'About', href: '/about-us' }, { label: 'Careers' }]}
        label={hero.label}
        title={hero.title.map((run) => (run.accent ? <em key={run.text}>{run.text}</em> : run.text))}
        lede={<p>{hero.lede}</p>}
        actions={
          <HeroActions
            primary={{
              label: 'See open roles',
              href: '#roles',
              placement: 'careers_hero_primary',
              bar: { label: 'Apply', href: `#${APPLY_FORM_ID}` },
            }}
            secondary={{ label: 'How to apply', href: '#apply', placement: 'careers_hero_secondary' }}
          />
        }
        aside={
          <div className={ed.wideOnly}>
            <OfficeMap notes={CAREERS.map.notes} caption={CAREERS.map.caption} draw="load" />
          </div>
        }
      />

      <FactsBand facts={CAREERS.facts} label="Hiring at a glance" />

      <section id="roles" className={ed.dark} aria-labelledby="roles-title">
        <div className={ed.inner}>
          <header className={ed.head}>
            <p className={ed.label}>{rolesCopy.label}</p>
            <h2 id="roles-title" className={ed.title}>
              {rolesCopy.title}
            </h2>
            <p className={ed.lede}>{rolesCopy.lede}</p>
          </header>
          <div className={ed.offset}>
            <CareersBoard roles={roles} />
          </div>
        </div>
      </section>

      <section id="apply" className={ed.paper} aria-labelledby="apply-title">
        <div className={ed.inner}>
          <header className={ed.head}>
            <p className={ed.label}>{apply.label}</p>
            <h2 id="apply-title" className={ed.title}>
              {apply.title}
            </h2>
            <p className={ed.lede}>{apply.lede}</p>
          </header>

          <div className={styles.applyGrid}>
            <div id={APPLY_FORM_ID} className={`${ed.card} ${styles.formCard} ${styles.applyForm}`}>
              <CareersApply roles={roles} contactEmail={siteConfig.email} />
            </div>
            <div className={styles.applyRail}>
              <Steps steps={apply.steps.map(({ name, text }) => ({ title: name, text }))} tone="paper" />
              <p className={styles.evidence}>
                {evidence.before}
                <Link href={evidence.team.href} data-cta-placement="careers_apply_team">
                  {evidence.team.label}
                </Link>
                {evidence.between}
                <Link href={evidence.work.href} data-cta-placement="careers_apply_work">
                  {evidence.work.label}
                </Link>
                {evidence.after}
              </p>
              <p className={styles.fallback}>
                Prefer email? Write to{' '}
                <a
                  href={`mailto:${siteConfig.email}?subject=${encodeURIComponent('Job application')}`}
                  data-cta-placement="careers_apply_mailto"
                >
                  {siteConfig.email}
                </a>{' '}
                with the role, a link to your work and a few lines about you.
              </p>
              {/* No listed role yet: the talent list, one click away (native <details>, the form is in the HTML). */}
              <details id="talent" className={styles.talent}>
                <summary className={styles.talentSummary}>
                  {talent.summary}
                  <span aria-hidden="true" className={styles.talentIcon} />
                </summary>
                <div className={styles.talentBody}>
                  <p className={styles.talentLede}>{talent.lede}</p>
                  <div className={`${ed.card} ${styles.formCard}`}>
                    <TalentListForm contactEmail={siteConfig.email} />
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </section>

      <CloseBand title={CAREERS.close.title} placement="careers_close" />
    </>
  );
}
