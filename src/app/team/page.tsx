import type { Metadata } from 'next';
import JsonLd from '@/components/seo/JsonLd';
import { pageGraph, person } from '@/lib/schema';
import Close from '@/components/company/Close';
import { FounderProfiles } from '@/components/company/Founders';
import PageHero from '@/components/company/PageHero';
import ShippedWork from '@/components/company/ShippedWork';
import TeamDirectory from '@/components/company/TeamDirectory';
import { CALL_CTA, FOUNDERS, PRICE_CTA, TEAM, TRUST_LINE } from '@/components/company/content';

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
 * /team, flagship redesign (Nov 2026). Founders first and large: real photos,
 * full bios from team.ts, LinkedIn, and the `/team#slug` anchors their Person
 * nodes point at. Then the wider team exactly as team.ts lists it, names and
 * titles only, with initials (those records are unconfirmed and carry
 * placeholder photos, so they get no photos, no bios and no Person nodes).
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
  return (
    <>
      <JsonLd data={teamGraph} />

      <PageHero
        crumbs={[{ name: 'About', href: '/about-us' }, { name: 'Team' }]}
        eyebrow={TEAM.hero.eyebrow}
        titleLines={TEAM.hero.titleLines}
        lede={TEAM.hero.lede}
        primary={{ ...PRICE_CTA, placement: 'team_hero_primary' }}
        secondary={{ ...CALL_CTA, placement: 'team_hero_call' }}
        trust={TRUST_LINE}
        facts={TEAM.facts}
      />

      <FounderProfiles />

      <ShippedWork id="team-work-title" title={TEAM.work.title} lede={TEAM.work.lede} placement="team" />

      <TeamDirectory />

      <Close id="close-title" title={TEAM.close.title} lede={TEAM.close.lede} placement="team" />
    </>
  );
}
