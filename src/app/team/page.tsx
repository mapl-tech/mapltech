import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { countries, departments, executives, teamMembers } from '@/config/team';
import { pageGraph, person, slugify } from '@/lib/schema';
import Cta from '@/components/company/Cta';
import ExecutiveCard from '@/components/company/ExecutiveCard';
import HeroBlock, { ReviewedOn, type HeroFact } from '@/components/company/HeroBlock';
import SectionHead from '@/components/company/SectionHead';
import TeamGrid from '@/components/company/TeamGrid';
import shared from '../company.module.scss';
import styles from './page.module.scss';

const TITLE = 'Leadership & Global Team';
const DESCRIPTION =
  'Meet the executive leadership and global team behind MAPL TECH. Operating across Canada, Nigeria, and Jamaica, we build scalable web infrastructure and AI-powered digital systems.';

export const metadata: Metadata = {
  title: TITLE,
  alternates: { canonical: 'https://mapltech.com/team' },
  description: DESCRIPTION,
  openGraph: {
    title: 'Leadership & Global Team | MAPL TECH',
    description:
      'Meet the executive leadership and global team behind MAPL TECH. Operating across Canada, Nigeria, and Jamaica.',
  },
};

const H1 = 'Global leadership. Engineered execution.';

const CTA_HEADING = 'Put senior engineers behind your next client project.';

function ledeFor(memberCount: number): string {
  return `MAPL TECH is led by a cross-border executive team and staffed by ${memberCount} named engineers, strategists and operators across Canada, Nigeria and Jamaica — building scalable digital infrastructure, AI-powered systems and enterprise-grade web platforms for agencies in North America, Africa and the Caribbean.`;
}

export default function TeamPage() {
  const members = teamMembers.map((member) => ({ ...member, slug: slugify(member.name) }));
  const perCountry = countries.map((country) => ({
    country,
    count: teamMembers.filter((member) => member.country === country).length,
  }));

  const facts: HeroFact[] = [
    { term: 'Leadership', detail: `${executives.length} Co-Founders & Directors` },
    {
      term: 'Team',
      detail: `${teamMembers.length} named members — ${perCountry.map(({ country, count }) => `${count} in ${country}`).join(', ')}`,
    },
    { term: 'Departments', detail: departments.join(' · ') },
    { term: 'Offices', detail: 'Toronto (HQ) · Lagos · Kingston' },
    { term: 'Last reviewed', detail: <ReviewedOn path="/team" /> },
  ];

  return (
    <div className={shared.page}>
      <JsonLd
        data={pageGraph({
          path: '/team',
          name: TITLE,
          description: DESCRIPTION,
          type: 'AboutPage',
          breadcrumbs: [
            { name: 'About Us', path: '/about-us' },
            { name: 'Team', path: '/team' },
          ],
          nodes: executives.map(person),
        })}
      />

      <HeroBlock eyebrow="Leadership & team" title={H1} lede={ledeFor(teamMembers.length)} facts={facts} placementPrefix="team" />

      {/* Executive leadership: Person JSON-LD anchors (/team#leshan-patterson) */}
      <section id="leadership" className={`${shared.section} ${styles.leadership} reveal`} aria-labelledby="leadership-title">
        <div className={shared.sectionInner}>
          <SectionHead eyebrow="Executive leadership" title="The people behind the platform" id="leadership-title" />
          <div className={shared.execGrid}>
            {executives.map((exec) => (
              <ExecutiveCard key={exec.name} exec={exec} anchor />
            ))}
          </div>
        </div>
      </section>

      {/* Global team: country tabs are anchors, every panel is in the HTML */}
      <section id="global-team" className={`${shared.section} ${styles.team} reveal`} aria-labelledby="team-title">
        <div className={shared.sectionInner}>
          <SectionHead
            eyebrow="Global team"
            title="The engineers, strategists, and operators"
            id="team-title"
            intro="Our team spans three continents, delivering technical excellence and operational precision across every engagement."
          />
          <TeamGrid members={members} />
        </div>
      </section>

      {/* CTA band */}
      <section className={`${shared.ctaBand} reveal`} aria-labelledby="cta-title">
        <div className={`${shared.sectionInner} ${shared.ctaBandInner}`}>
          <div>
            <h2 id="cta-title" className={shared.ctaBandTitle}>
              {CTA_HEADING}
            </h2>
          </div>
          <div className={shared.ctaBandActions}>
            <Cta placement="team_band_primary" href="/pricing#estimator" size="large">
              Get a 60-second estimate
            </Cta>
            <Cta placement="team_band_secondary" href="/contact-us" variant="secondary" size="large">
              Book a 20-min scoping call
            </Cta>
          </div>
        </div>
      </section>
    </div>
  );
}
