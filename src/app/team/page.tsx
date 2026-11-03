import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { pageGraph, person } from '@/lib/schema';
import { PRICING_HREF, PRICING_LABEL, PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import FactsBand from '@/components/company/FactsBand';
import { FounderProfiles } from '@/components/company/Founders';
import HeroActions from '@/components/company/HeroActions';
import TeamDirectory from '@/components/company/TeamDirectory';
import { FOUNDERS, TEAM } from '@/components/company/content';

const URL = 'https://mapltech.com/team';

export const metadata: Metadata = {
  title: TEAM.title,
  description: TEAM.description,
  alternates: { canonical: URL },
  openGraph: {
    type: 'website',
    url: URL,
    title: 'Leadership & Global Team | MAPL TECH',
    description: TEAM.description,
  },
  twitter: { card: 'summary_large_image', title: 'Leadership & Global Team | MAPL TECH', description: TEAM.description },
};

/*
 * /team, Nov 2026 award pass. An editorial directory, founders first: the
 * two founders as numbered entries with real photos, full bios from team.ts,
 * LinkedIn and the `/team#slug` anchors their Person nodes point at. Then the
 * wider team exactly as team.ts lists it, on paper: names and titles only,
 * with initials (those records are unconfirmed and carry placeholder photos,
 * so they get no photos, no bios and no Person nodes), under the office
 * hours, with the Nigeria and Jamaica groups linked to their branch pages.
 * The page talks to buyers (the facts end on the public price); job seekers
 * get one small line at the directory's foot. Then the close.
 *
 * Structured data (unchanged): AboutPage + BreadcrumbList + one Person node
 * per founder, from the same records the page renders.
 */
const teamGraph = pageGraph({
  path: '/team',
  name: TEAM.title,
  description: TEAM.description,
  type: 'AboutPage',
  breadcrumbs: [
    { name: 'About Us', path: '/about-us' },
    { name: 'Team', path: '/team' },
  ],
  nodes: FOUNDERS.map((founder) => person(founder)),
});

export default function TeamPage() {
  const { hero } = TEAM;
  return (
    <>
      <JsonLd data={teamGraph} />

      <PageHeader
        crumbs={[{ label: 'About', href: '/about-us' }, { label: 'Team' }]}
        label={hero.label}
        title={hero.title.map((run) => (run.accent ? <em key={run.text}>{run.text}</em> : run.text))}
        lede={<p>{hero.lede}</p>}
        actions={
          <HeroActions
            primary={{ label: PROJECT_LABEL, href: PROJECT_HREF, placement: 'team_hero_primary' }}
            secondary={{ label: PRICING_LABEL, href: PRICING_HREF, placement: 'team_hero_secondary' }}
          />
        }
      />

      <FactsBand facts={TEAM.facts} label="The team at a glance" />

      <FounderProfiles />

      <TeamDirectory />

      <CloseBand title={TEAM.close.title} placement="team_close" />
    </>
  );
}
