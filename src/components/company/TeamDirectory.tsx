import Link from 'next/link';
import { careers } from '@/config/site';
import { countries, teamMembers } from '@/config/team';
import { slugify } from '@/lib/schema';
import OfficeClock from './OfficeClock';
import { TEAM, countWord, listWords } from './content';
import ed from './Company.module.scss';
import styles from './TeamDirectory.module.scss';

/** Each country's office (Toronto, Lagos, Kingston): Toronto is headquarters. */
const OFFICE_OF: Record<string, { city: string; timeZone: string }> = {
  Canada: { city: 'Toronto', timeZone: 'America/Toronto' },
  Nigeria: { city: 'Lagos', timeZone: 'Africa/Lagos' },
  Jamaica: { city: 'Kingston', timeZone: 'America/Jamaica' },
};

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
 * on paper: grouped by country beside each office's live local time, name
 * and title only, initials instead of photos. These records carry
 * placeholder photos and are not yet confirmed by the owner, so nothing is
 * added to them here (no bios, no Person JSON-LD, no claims) and none of
 * them is featured anywhere else on the site. The `/team#canada`-style and
 * `/team#name` anchors keep older deep links working.
 */
export default function TeamDirectory() {
  const groups = countries
    .map((country) => ({ country, slug: country.toLowerCase(), members: teamMembers.filter((m) => m.country === country) }))
    .filter((group) => group.members.length > 0);
  const roleCountries = Array.from(new Set(careers.map((role) => role.country)));

  return (
    <section id="team" className={ed.paper} aria-labelledby="team-title">
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{TEAM.directory.label}</p>
          <h2 id="team-title" className={ed.title}>
            {TEAM.directory.title}
          </h2>
          <div className={styles.hiring}>
            <p className={ed.lede}>
              {countWord(careers.length)} open roles across {listWords(roleCountries)}.
            </p>
            <Link href="/careers" className={ed.action} data-cta-placement="team_directory_careers">
              See open roles
              <span aria-hidden="true" className={ed.arrow}>
                →
              </span>
            </Link>
          </div>
        </header>

        <div className={styles.groups}>
          {groups.map((group) => {
            const office = OFFICE_OF[group.country];
            return (
              <div key={group.slug} id={group.slug} className={styles.group}>
                <div className={styles.groupHead}>
                  <h3 className={styles.country}>{group.country}</h3>
                  {office ? <OfficeClock city={office.city} timeZone={office.timeZone} /> : null}
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
      </div>
    </section>
  );
}
