import Image from 'next/image';
import Link from 'next/link';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import { countries, teamMembers } from '@/config/team';
import { slugify } from '@/lib/schema';
import OfficeClock from './OfficeClock';
import { TEAM, keepBrand } from './content';
import { regions } from './regions';
import ed from './Company.module.scss';
import styles from './TeamDirectory.module.scss';
import Arrow from '@/components/ui/Arrow';

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

/** A real photo, not the placeholder the unconfirmed records carry. */
const photoOf = (image?: string) => (image && !image.includes('placeholder') ? image : null);

/**
 * The rest of the team as listed in config/team.ts, set like a credits roll
 * on paper: grouped by country beside each office's live local time and the
 * office hours, name and title only, initials unless the record has a real
 * photo. Nothing is added to the records here (no bios, no Person JSON-LD,
 * no claims) and none of them is featured anywhere else on the site. A
 * member listed before their title is approved (Sahil Banati, Obong Uko,
 * Nov 5, 2026) shows their LinkedIn profile in the title's place. The Nigeria and
 * Jamaica groups link to their branch pages. The sheet ends on the buyer's
 * ask, with one small line in plain ink under it for job seekers. The
 * `/team#canada`-style and `/team#name` anchors keep older deep links
 * working.
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
                          <Arrow />
                        </span>
                      </Link>
                    </div>
                  ) : null}
                </div>
                <ul className={styles.people} role="list">
                  {group.members.map((member) => {
                    const photo = photoOf(member.image);
                    return (
                      <li key={member.name} id={slugify(member.name)} className={styles.member}>
                        {photo ? (
                          <Image src={photo} alt="" width={52} height={52} className={styles.photo} />
                        ) : (
                          <span className={styles.initials} aria-hidden="true">
                            {initialsOf(member.name)}
                          </span>
                        )}
                        <span className={styles.name}>{member.name}</span>
                        {member.title || member.linkedin ? (
                          <span className={styles.role}>
                            <span className="visually-hidden">, </span>
                            {member.title ?? (
                              <a
                                href={member.linkedin}
                                className={styles.profile}
                                target="_blank"
                                rel="noopener noreferrer"
                                data-cta-placement="team_directory_linkedin"
                              >
                                LinkedIn<span className="visually-hidden"> profile (opens in a new tab)</span>
                              </a>
                            )}
                          </span>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        {/* One filled ask on screen at a time: while this one is in view the header's is an
            outline (data-header-quiet) and the phone bar steps aside (data-bar-stand-down). */}
        <div className={styles.foot} data-header-quiet="" data-bar-stand-down="">
          <Link href={PROJECT_HREF} className={ed.primary} data-cta-placement="team_directory_primary">
            {PROJECT_LABEL}
            <span aria-hidden="true" className={ed.arrow}>
              <Arrow />
            </span>
          </Link>
          <p className={styles.careers}>
            {careers.before}
            <Link href={careers.href} data-cta-placement="team_directory_careers">
              {careers.label}
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
