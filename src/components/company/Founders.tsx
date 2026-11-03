import Image from 'next/image';
import Link from 'next/link';
import { PROJECT_HREF, PROJECT_LABEL } from '@/components/layout/chrome';
import { ABOUT, FOUNDERS, TEAM, type Founder } from './content';
import ed from './Company.module.scss';
import styles from './Founders.module.scss';
import Arrow from '@/components/ui/Arrow';

/**
 * The two founders, the only people on the site with photographs, in the
 * homepage's treatment (4:5, grayscale, a slow drift inside the frame as the
 * page scrolls).
 *
 * - `FoundersSpread` (/about-us): on paper, beside the decision to get in
 *   touch: names, titles, one line from each bio, LinkedIn, and the ask
 *   itself ("Start a project" first, the team page beside it). The ask
 *   follows the two people in the DOM and on screen at every width (wide
 *   screens set it under them), so the eye and the Tab key meet the people
 *   first and the ask last.
 * - `FounderProfiles` (/team): one entry each with the team.ts bios (less
 *   the opening sentence that restates the name and title set right above
 *   them) and the `/team#slug` anchors their Person JSON-LD points at.
 *
 * On phones both set the name and role beside the photo and the words full
 * width under them, so no column is a sliver.
 */

// Both uses put the founder's name and role in visible text right after the
// photo, so the photo is decorative (alt=""): no name read out twice.
function Portrait({ founder, sizes, className }: { founder: Founder; sizes: string; className?: string }) {
  return (
    <div className={[styles.photo, className].filter(Boolean).join(' ')}>
      <Image
        src={founder.image}
        alt=""
        width={400}
        height={400}
        sizes={sizes}
        className={styles.img}
        style={{ objectPosition: founder.objectPosition }}
      />
    </div>
  );
}

const escapeRe = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The bio as a profile shows it. Each team.ts bio opens by restating the
 * name and title ("Leshan Patterson is Co-Founder and Director of MAPL
 * TECH."), which the profile sets right above it, so that one sentence is
 * left out here; a bio that opens any other way is shown whole. team.ts and
 * the Person JSON-LD keep the full text.
 */
function profileBio({ name, title, bio }: Founder): string {
  const titleWords = title
    .split(/\s*(?:&|\band\b)\s*/)
    .map(escapeRe)
    .join('\\s+(?:&|and)\\s+');
  const intro = new RegExp(`^${escapeRe(name)}\\s+is\\s+(?:the\\s+)?${titleWords}\\s+of\\s+MAPL\\s+TECH\\.\\s+`, 'i');
  return bio.replace(intro, '') || bio;
}

function LinkedIn({ founder, placement }: { founder: Founder; placement: string }) {
  return (
    <a href={founder.linkedin} className={styles.linkedin} target="_blank" rel="noopener noreferrer" data-cta-placement={placement}>
      {founder.name.split(' ')[0]} on LinkedIn
      <span className="visually-hidden"> (opens in a new tab)</span>
      <span aria-hidden="true" className={styles.external}>
        <Arrow direction="up-right" />
      </span>
    </a>
  );
}

export function FoundersSpread() {
  return (
    <section id="founders" className={ed.paper} aria-labelledby="founders-title">
      <div className={`${ed.inner} ${styles.spread}`}>
        <div className={styles.spreadText}>
          <p className={ed.label}>{ABOUT.founders.label}</p>
          <h2 id="founders-title" className={ed.title}>
            {TEAM.founders.title}
          </h2>
          <p className={ed.lede}>{TEAM.founders.lede}</p>
        </div>

        <ul className={styles.people} role="list">
          {FOUNDERS.map((founder) => (
            <li key={founder.slug} className={styles.person}>
              <Portrait founder={founder} sizes="(min-width: 1024px) 340px, (min-width: 640px) 44vw, 38vw" className={styles.personPhoto} />
              <div className={styles.personHead}>
                <h3 className={styles.personName}>{founder.name}</h3>
                <p className={styles.personRole}>{founder.title}</p>
              </div>
              <div className={styles.personBody}>
                <p className={styles.personFocus}>{founder.focus}</p>
                <LinkedIn founder={founder} placement="about_founders_linkedin" />
              </div>
            </li>
          ))}
        </ul>

        {/* One filled ask on screen at a time: while this one is in view the header's is an
            outline (data-header-quiet) and the phone bar steps aside (data-bar-stand-down). */}
        <div className={`${ed.actions} ${styles.spreadActions}`} data-header-quiet="" data-bar-stand-down="">
          <Link href={PROJECT_HREF} className={ed.primary} data-cta-placement="about_founders_primary">
            {PROJECT_LABEL}
            <span aria-hidden="true" className={ed.arrow}>
              <Arrow />
            </span>
          </Link>
          <Link href="/team" className={ed.action} data-cta-placement="about_founders_team">
            Meet the team
            <span aria-hidden="true" className={ed.arrow}>
              <Arrow />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FounderProfiles() {
  return (
    <section id="founders" className={ed.dark} aria-labelledby="founders-title">
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{TEAM.founders.label}</p>
          <h2 id="founders-title" className={ed.title}>
            {TEAM.founders.title}
          </h2>
          <p className={ed.lede}>{TEAM.founders.lede}</p>
        </header>

        <ol className={styles.profiles} role="list">
          {FOUNDERS.map((founder) => (
            <li key={founder.slug} id={founder.slug} className={styles.profile}>
              <Portrait founder={founder} sizes="(min-width: 1024px) 320px, 40vw" className={styles.profilePhoto} />
              <div className={styles.profileHead}>
                <h3 className={styles.profileName}>{founder.name}</h3>
                <p className={styles.profileRole}>{founder.title}</p>
              </div>
              <div className={styles.profileBody}>
                <p className={styles.profileBio}>{profileBio(founder)}</p>
                <LinkedIn founder={founder} placement="team_founders_linkedin" />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
