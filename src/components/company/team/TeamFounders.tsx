import Link from 'next/link';
import Arrow from '@/components/ui/Arrow';
import { Portrait, profileBio } from '../Founders';
import { FOUNDERS, TEAM } from '../content';
import ed from '../Company.module.scss';
import styles from './TeamFounders.module.scss';

/**
 * /team, the leadership: the two founders side by side on paper (stacked
 * below 1024px), each a numbered entry with the homepage's portrait, the name
 * and title, the team.ts bio (less the sentence that restates the name and
 * title right above it), and LinkedIn under their own name. The section head
 * says once why they are here: both are directors, named and on record. The
 * `/team#leshan-patterson` and `/team#mercy-akuma` anchors are the ones the
 * Person JSON-LD points at. After the two people, the route to the work.
 * Server Component.
 */
export default function TeamFounders() {
  const { founders } = TEAM;
  return (
    <section id="founders" className={ed.paper} aria-labelledby="founders-title">
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{founders.label}</p>
          <h2 id="founders-title" className={ed.title}>
            {founders.title}
          </h2>
          <p className={ed.lede}>{founders.lede}</p>
        </header>

        <ol className={styles.list} role="list">
          {FOUNDERS.map((founder, i) => (
            <li key={founder.slug} id={founder.slug} className={styles.founder}>
              <Portrait founder={founder} sizes="(min-width: 768px) 280px, 40vw" className={styles.photo} />
              <div className={styles.head}>
                <span className={styles.index} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className={styles.name}>{founder.displayName}</h3>
                  <p className={styles.role}>{founder.title}</p>
                </div>
              </div>
              <div className={styles.body}>
                <p className={styles.bio}>{profileBio(founder)}</p>
                <a
                  href={founder.linkedin}
                  className={styles.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta-placement="team_founders_linkedin"
                >
                  {founder.name.split(' ')[0]} on LinkedIn
                  <span className="visually-hidden"> (opens in a new tab)</span>
                  <span aria-hidden="true" className={styles.external}>
                    <Arrow direction="up-right" />
                  </span>
                </a>
              </div>
            </li>
          ))}
        </ol>

        <p className={styles.foot}>
          <Link href={founders.work.href} className={ed.action} data-cta-placement="team_founders_work">
            {founders.work.label}
            <span aria-hidden="true" className={ed.arrow}>
              <Arrow />
            </span>
          </Link>
        </p>
      </div>
    </section>
  );
}
