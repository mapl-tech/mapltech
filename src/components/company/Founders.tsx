import Image from 'next/image';
import Link from 'next/link';
import { ABOUT, FOUNDERS, TEAM, indexOf, type Founder } from './content';
import ed from './Company.module.scss';
import styles from './Founders.module.scss';

/**
 * The two founders, the only people on the site with photographs, in the
 * homepage's treatment (4:5, grayscale, a slow drift inside the frame as the
 * page scrolls).
 *
 * - `FoundersSpread` (/about-us): on paper, beside the decision to get in
 *   touch: names, titles, one line from each bio, LinkedIn.
 * - `FounderProfiles` (/team): numbered entries with the full team.ts bios
 *   and the `/team#slug` anchors their Person JSON-LD points at.
 */

function Portrait({ founder, sizes, className }: { founder: Founder; sizes: string; className?: string }) {
  return (
    <div className={[styles.photo, className].filter(Boolean).join(' ')}>
      <Image
        src={founder.image}
        alt={`${founder.name}, ${founder.title} of MAPL TECH`}
        width={400}
        height={400}
        sizes={sizes}
        className={styles.img}
        style={{ objectPosition: founder.objectPosition }}
      />
    </div>
  );
}

function LinkedIn({ founder, placement }: { founder: Founder; placement: string }) {
  return (
    <a href={founder.linkedin} className={styles.linkedin} target="_blank" rel="noopener noreferrer" data-cta-placement={placement}>
      {founder.name.split(' ')[0]} on LinkedIn
      <span className="visually-hidden"> (opens in a new tab)</span>
      <span aria-hidden="true" className={styles.external}>
        ↗
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
          <Link href="/team" className={ed.action} data-cta-placement="about_founders_team">
            Meet the team
            <span aria-hidden="true" className={ed.arrow}>
              →
            </span>
          </Link>
        </div>

        <ul className={styles.people} role="list">
          {FOUNDERS.map((founder) => (
            <li key={founder.slug} className={styles.person}>
              <Portrait founder={founder} sizes="(min-width: 1024px) 340px, (min-width: 640px) 44vw, 38vw" />
              <div className={styles.personText}>
                <h3 className={styles.personName}>{founder.name}</h3>
                <p className={styles.personRole}>{founder.title}</p>
                <p className={styles.personFocus}>{founder.focus}</p>
                <LinkedIn founder={founder} placement="about_founders_linkedin" />
              </div>
            </li>
          ))}
        </ul>
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
          {FOUNDERS.map((founder, i) => (
            <li key={founder.slug} id={founder.slug} className={styles.profile}>
              <span className={styles.profileNo} aria-hidden="true">
                {indexOf(i)}
              </span>
              <Portrait founder={founder} sizes="(min-width: 1024px) 320px, 40vw" className={styles.profilePhoto} />
              <div className={styles.profileHead}>
                <h3 className={styles.profileName}>{founder.name}</h3>
                <p className={styles.profileRole}>{founder.title}</p>
              </div>
              <div className={styles.profileBody}>
                <p className={styles.profileBio}>{founder.bio}</p>
                <LinkedIn founder={founder} placement="team_founders_linkedin" />
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
