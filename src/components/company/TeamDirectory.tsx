import Image from 'next/image';
import Link from 'next/link';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import { countries, teamMembers } from '@/config/team';
import { slugify } from '@/lib/schema';
import OfficeClock from './OfficeClock';
import { TEAM, keepBrand } from './content';
import { regions } from './regions';
import { officeOf } from './team/offices';
import ed from './Company.module.scss';
import styles from './TeamDirectory.module.scss';
import Arrow from '@/components/ui/Arrow';

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

/** LinkedIn's mark, drawn (no icon library on a server page). */
function LinkedInMark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <circle cx="3.6" cy="3.4" r="1.6" />
      <rect x="2.1" y="6" width="3" height="8.2" rx="0.4" />
      <path d="M7 6h2.85v1.2c.46-.8 1.4-1.42 2.7-1.42 2.06 0 2.95 1.3 2.95 3.47v4.95h-3V9.9c0-1-.34-1.6-1.18-1.6-.9 0-1.32.66-1.32 1.6v4.3H7z" />
    </svg>
  );
}

/**
 * The rest of the team exactly as config/team.ts lists it, on paper, set like
 * a credits roll: grouped by country, each group headed by its office's live
 * local time and whether it is open (the headquarters marked), then one row
 * a person: initials (or a real photo, once team.ts has one), the name, the
 * role in a column of its own so every role reads at a glance down the
 * sheet, and LinkedIn where the record has it. Nothing is added to the
 * records here (no bios, no Person JSON-LD, no claims). The Nigeria and
 * Jamaica groups link to their branch pages. The sheet ends on the buyer's
 * ask, with one small line for job seekers under it. The `/team#canada`-style
 * and `/team#name` anchors keep older deep links working.
 */
export default function TeamDirectory() {
  const groups = countries
    .map((country) => ({ country, slug: country.toLowerCase(), members: teamMembers.filter((m) => m.country === country) }))
    .filter((group) => group.members.length > 0);
  const { directory } = TEAM;

  return (
    <section id="team" className={ed.paper} aria-labelledby="team-title">
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{directory.label}</p>
          <h2 id="team-title" className={ed.title}>
            {directory.title}
          </h2>
          <p className={ed.lede}>{directory.lede}</p>
        </header>

        <div className={styles.groups}>
          {groups.map((group) => {
            const office = officeOf(group.country);
            const branch = branchOf(group.country);
            return (
              <div key={group.slug} id={group.slug} className={styles.group}>
                <div className={styles.groupHead}>
                  <div className={styles.countryLine}>
                    <h3 className={styles.country}>{group.country}</h3>
                    {office?.hq ? <span className={styles.tag}>Headquarters</span> : null}
                  </div>
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
                          <Image src={photo} alt="" width={56} height={56} className={styles.photo} />
                        ) : (
                          <span className={styles.initials} aria-hidden="true">
                            {initialsOf(member.name)}
                          </span>
                        )}
                        <span className={styles.name}>{member.name}</span>
                        {member.title ? (
                          <span className={styles.role}>
                            <span className="visually-hidden">, </span>
                            {member.title}
                          </span>
                        ) : null}
                        {member.linkedin ? (
                          <a
                            href={member.linkedin}
                            className={styles.profile}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-cta-placement="team_directory_linkedin"
                          >
                            <LinkedInMark />
                            <span className="visually-hidden">{`${member.name} on LinkedIn (opens in a new tab)`}</span>
                          </a>
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
            {directory.careers.before}
            <Link href={directory.careers.href} data-cta-placement="team_directory_careers">
              {directory.careers.label}
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
