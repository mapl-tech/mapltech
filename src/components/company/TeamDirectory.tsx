import Link from 'next/link';
import { countries, teamMembers } from '@/config/team';
import { slugify } from '@/lib/schema';
import OfficeClock from './OfficeClock';
import { TEAM, keepBrand } from './content';
import { regions } from './regions';
import ed from './Company.module.scss';
import styles from './TeamDirectory.module.scss';

/** Each country's office (Toronto, Lagos, Kingston): Toronto is headquarters. */
const OFFICE_OF: Record<string, { city: string; timeZone: string }> = {
  Canada: { city: 'Toronto', timeZone: 'America/Toronto' },
  Nigeria: { city: 'Lagos', timeZone: 'Africa/Lagos' },
  Jamaica: { city: 'Kingston', timeZone: 'America/Jamaica' },
};

/** The branch page of a country with one (/nigeria, /jamaica). */
const branchOf = (country: string) => Object.values(regions).find((region) => region.country === country);

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * The rest of the team as listed in config/team.ts, set like a credits roll
 * on paper: grouped by country beside each office's live local time and the
 * office hours, name and title only, initials instead of photos. These
 * records carry placeholder photos and are not yet confirmed by the owner,
 * so nothing is added to them here (no bios, no Person JSON-LD, no claims)
 * and none of them is featured anywhere else on the site. The Nigeria and
 * Jamaica groups link to their branch pages; job seekers get one small line
 * at the foot. The `/team#canada`-style and `/team#name` anchors keep older
 * deep links working.
 */
export default function TeamDirectory() {
  const groups = countries
    .map((country) => ({ country, slug: country.toLowerCase(), members: teamMembers.filter((m) => m.country === country) }))
    .filter((group) => group.members.length > 0);
  const { careers } = TEAM.directory;

  return (
    <section id="team" className={ed.paper} aria-labelledby="team-title">
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{TEAM.directory.label}</p>
          <h2 id="team-title" className={ed.title}>
            {TEAM.directory.title}
          </h2>
          <p className={ed.lede}>{TEAM.directory.lede}</p>
        </header>

        <div className={styles.groups}>
          {groups.map((group) => {
            const office = OFFICE_OF[group.country];
            const branch = branchOf(group.country);
            return (
              <div key={group.slug} id={group.slug} className={styles.group}>
                <div className={styles.groupHead}>
                  <h3 className={styles.country}>{group.country}</h3>
                  {office ? <OfficeClock city={office.city} timeZone={office.timeZone} /> : null}
                  {branch ? (
                    <div className={styles.branch}>
                      <Link href={branch.path} className={ed.action} data-cta-placement={`team_directory_${branch.slug}`}>
                        {keepBrand(branch.brandName)}
                        <span aria-hidden="true" className={ed.arrow}>
                          →
                        </span>
                      </Link>
                    </div>
                  ) : null}
                </div>
                <ul className={styles.people} role="list">
                  {group.members.map((member) => (
                    <li key={member.name} id={slugify(member.name)} className={styles.member}>
                      <span className={styles.initials} aria-hidden="true">
                        {initialsOf(member.name)}
                      </span>
                      <span className={styles.name}>{member.name}</span>
                      <span className="visually-hidden">, </span>
                      <span className={styles.role}>{member.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        <p className={styles.careers}>
          {careers.before}
          <Link href={careers.href} data-cta-placement="team_directory_careers">
            {careers.label}
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
