import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/seo/JsonLd';
import { jobPosting, pageGraph, slugify } from '@/lib/schema';
import { REDESIGN_DATE } from '@/config/routes';
import { careers, siteConfig } from '@/config/site';
import { teamMembers } from '@/config/team';
import SnapRow from '@/components/ui/SnapRow';
import ConvertHero, { LastReviewed } from '@/components/convert/ConvertHero';
import Cta from '@/components/convert/Cta';
import CareersBoard, { type BoardRole } from '@/components/convert/CareersBoard';
import CareersApply from '@/components/convert/CareersApply';
import TalentListForm from '@/components/convert/TalentListForm';
import shared from '@/app/convert.module.scss';
import styles from './careers.module.scss';

export const metadata: Metadata = {
  title: 'Careers',
  alternates: { canonical: 'https://mapltech.com/careers' },
  description:
    'Join MAPL TECH - we\'re hiring across Canada, Nigeria, and Jamaica. Remote and on-site roles in Ottawa, Toronto, Lagos, Abuja, Kingston, and Montego Bay.',
  openGraph: {
    title: 'Careers | MAPL TECH',
    description: 'Work with leading agencies. Ship real systems. Join MAPL TECH.',
  },
};

const PATH = '/careers';

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

function countWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

/** "Canada (Remote) · Nigeria (Lagos, Abuja, Remote) · Jamaica (Kingston, Montego Bay, Remote)" from careers[]. */
function locationSummary(): string {
  const byCountry = new Map<string, string[]>();
  for (const role of careers) {
    const list = byCountry.get(role.country) ?? [];
    for (const part of role.location.split('/').map((p) => p.trim())) {
      if (part && !list.includes(part)) list.push(part);
    }
    byCountry.set(role.country, list);
  }
  return Array.from(byCountry.entries())
    .map(([country, places]) => `${country} (${places.join(', ')})`)
    .join(' · ');
}

/** Cities named in on-site roles (for the lede), in source order. */
function onSiteCities(): string[] {
  const cities: string[] = [];
  for (const role of careers) {
    for (const part of role.location.split('/').map((p) => p.trim())) {
      if (part && !/remote/i.test(part) && !cities.includes(part)) cities.push(part);
    }
  }
  return cities;
}

function listWords(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

export default function CareersPage() {
  const roles: BoardRole[] = careers.map((role) => ({
    slug: slugify(`${role.title} ${role.country}`),
    title: role.title,
    type: role.type,
    location: role.location,
    country: role.country,
    description: role.description,
  }));

  const countries = Array.from(new Set(careers.map((role) => role.country)));
  const types = Array.from(new Set(careers.map((role) => role.type)));
  const allSameType = types.length === 1;
  const cities = onSiteCities();
  const remoteCountries = Array.from(new Set(careers.filter((r) => /remote/i.test(r.location)).map((r) => r.country)));

  const lede = `MAPL TECH is growing its team across ${listWords(countries)}: specialists who help agencies build real systems, real automation, and real infrastructure. ${countWord(roles.length).replace(/^\w/, (c) => c.toUpperCase())} ${allSameType ? `${types[0].toLowerCase()} ` : ''}roles are open today, from remote seats in ${listWords(remoteCountries)} to on-site work in ${listWords(cities)}.`;

  return (
    <>
      <JsonLd
        data={pageGraph({
          path: PATH,
          name: 'Careers',
          description: metadata.description ?? undefined,
          nodes: careers.map((role) => jobPosting(role, { datePosted: REDESIGN_DATE, directApply: true })),
        })}
      />

      <ConvertHero
        eyebrow="Careers"
        title="Work That Matters. Ship Things That Last."
        wideTitle
        lede={lede}
        facts={[
          { label: 'Open roles', value: `${roles.length}${allSameType ? ` · all ${types[0]}` : ''}` },
          { label: 'Locations', value: locationSummary() },
          { label: 'To apply', value: 'Name, email, a link, a short note' },
          { label: 'Offices', value: 'Toronto (HQ) · Lagos · Kingston' },
          { label: 'Last reviewed', value: <LastReviewed path={PATH} /> },
        ]}
        actions={
          <>
            <Cta placement="careers_hero_primary" hero href="#roles" size="large">
              See open roles
            </Cta>
            <Cta placement="careers_hero_secondary" href="#talent" variant="secondary" size="large">
              Join the talent list
            </Cta>
          </>
        }
      />

      {/* 02 — Open roles (URL-synced filters, native <details>, JobPosting per role) */}
      <section id="roles" className={shared.section} aria-labelledby="roles-title">
        <div className={shared.inner}>
          <div className={shared.sectionHead}>
            <p className="eyebrow">02 · Open roles</p>
            <h2 id="roles-title" className={shared.sectionTitle}>
              Find your role
            </h2>
            <p className={shared.sectionSub}>
              Filter by country or type. Every role here is rendered from the same list that feeds the job
              schema, so what you read is what we post.
            </p>
          </div>
          <CareersBoard roles={roles} />
        </div>
      </section>

      {/* 03 — Apply (PEAK: two clicks from landing to a role, four fields to apply) */}
      <section id="apply" className={`${shared.section} reveal`} aria-labelledby="apply-title">
        <div className={shared.inner}>
          <div className={shared.twoCol}>
            <div className={shared.stack}>
              <p className="eyebrow">03 · Apply</p>
              <h2 id="apply-title" className={shared.sectionTitle}>
                Ready to join us?
              </h2>
              <p className={shared.sectionSub}>
                Pick the role, tell us who you are and where to find your work. No cover letter, no upload: a link
                and a short note are enough to start the conversation.
              </p>
              <div className={styles.emailFallback}>
                <p className="eyebrow">Prefer email?</p>
                <p className={shared.cardBody}>
                  Email{' '}
                  <a className={shared.link} href={`mailto:${siteConfig.email}?subject=Job Application`}>
                    {siteConfig.email}
                  </a>{' '}
                  with:
                </p>
                <ol className={shared.numbered}>
                  <li>The job title you&apos;re applying for</li>
                  <li>How you found MAPL TECH</li>
                  <li>Your qualifications and relevant experience</li>
                  <li>Why you&apos;d be a great fit for the role</li>
                  <li>Your contact information</li>
                </ol>
              </div>
            </div>
            <div className={shared.card}>
              <CareersApply roles={roles} contactEmail={siteConfig.email} />
            </div>
          </div>
        </div>
      </section>

      {/* 04 — Talent list */}
      <section id="talent" className={`${shared.section} reveal`} data-below-fold aria-labelledby="talent-title">
        <div className={shared.inner}>
          <div className={shared.twoCol}>
            <div className={shared.stack}>
              <p className="eyebrow">04 · Talent list</p>
              <h2 id="talent-title" className={shared.sectionTitle}>
                Don&apos;t see your fit?
              </h2>
              <p className={shared.sectionSub}>
                We&apos;re always open to exceptional people. Tell us what you do best and how you&apos;d make our
                agency partners better.
              </p>
            </div>
            <div className={shared.card}>
              <TalentListForm />
            </div>
          </div>
        </div>
      </section>

      {/* 05 — Team (snap / drag row from team.ts) */}
      <section className={`${shared.section} reveal`} data-below-fold aria-labelledby="team-title">
        <div className={shared.inner}>
          <div className={shared.sectionHead}>
            <p className="eyebrow">05 · The team you&apos;d join</p>
            <h2 id="team-title" className={shared.sectionTitle}>
              {teamMembers.length} engineers, strategists and specialists across three countries
            </h2>
          </div>
          <SnapRow label="MAPL TECH team">
            {teamMembers.map((member) => (
              <Link key={member.name} href={`/team#${slugify(member.name)}`} className={styles.teamCard} data-cursor="view">
                <span className={styles.teamName}>{member.name}</span>
                <span className={styles.teamTitle}>{member.title}</span>
                <span className={styles.teamMeta}>
                  {member.department} · {member.country}
                </span>
              </Link>
            ))}
          </SnapRow>
          <p className={shared.small} style={{ marginTop: '1rem' }}>
            <Link className={shared.link} href="/team">
              Meet the whole team
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
