import type { Metadata } from 'next';
import { OG_IMAGE } from '@/lib/og';
import JsonLd from '@/components/seo/JsonLd';
import { pageGraph, person } from '@/lib/schema';
import { PRICING_HREF, PRICING_LABEL, PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import PageHeader from '@/components/ui/PageHeader';
import CloseBand from '@/components/flagship/CloseBand';
import FactsBand from '@/components/company/FactsBand';
import HeroActions from '@/components/company/HeroActions';
import TeamDirectory from '@/components/company/TeamDirectory';
import TeamFounders from '@/components/company/team/TeamFounders';
import WorkingHours from '@/components/company/team/WorkingHours';
import { FOUNDERS, TEAM } from '@/components/company/content';

const URL = 'https://mapltech.com/team';

export const metadata: Metadata = {
  title: TEAM.title,
  description: TEAM.description,
  alternates: { canonical: URL },
  openGraph: {
    images: [OG_IMAGE],
    type: 'website',
    url: URL,
    title: 'Leadership & Global Team | MAPL TECH',
    description: TEAM.description,
  },
  twitter: { card: 'summary_large_image', title: 'Leadership & Global Team | MAPL TECH', description: TEAM.description },
};

/*
 * /team, Nov 5, 2026 redesign. Written for an agency director deciding
 * whether to trust us as the engineering team that works with theirs: who
 * leads it, when we are working against their own day, and who is on the
 * team, then the ask.
 *
 * 1. Hero (dark): "The team that works with yours.", the founders and the
 *    three countries in the lede, "Start a project" with the quote line and
 *    the Google rating under it, and the facts aside (headquarters, the
 *    published experience, the public price).
 * 2. Leadership (paper): the two founders side by side, numbered, with their
 *    team.ts bios and LinkedIn; the `/team#slug` anchors the Person nodes
 *    point at.
 * 3. Office hours (dark): the page's one interaction. The three offices'
 *    published 9 to 6 drawn on the visitor's own day, from the browser's
 *    time zone, with a line to drag through it (team/DayPlanner).
 * 4. The team (paper): everyone in team.ts by country, beside each office's
 *    live clock, ending on "Start a project" and one line for job seekers.
 * 5. The close (crimson).
 *
 * Structured data (unchanged): AboutPage + BreadcrumbList + one Person node
 * per founder, from the same records the page renders. No other staff.
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
        title={hero.title.map((run) => (run.accent ? <em key={run.text}>{run.text}</em> : run.text))}
        lede={<p>{hero.lede}</p>}
        actions={
          <HeroActions
            primary={{ label: PROJECT_LABEL, href: PROJECT_HREF, placement: 'team_hero_primary' }}
            secondary={{ label: PRICING_LABEL, href: PRICING_HREF, placement: 'team_hero_secondary' }}
          />
        }
        trust={hero.trust}
        asideAlign="body"
        aside={<FactsBand facts={TEAM.facts} label="The team at a glance" placement="aside" />}
      />

      <TeamFounders />

      <WorkingHours />

      <TeamDirectory />

      <CloseBand title={TEAM.close.title} placement="team_close" />
    </>
  );
}
