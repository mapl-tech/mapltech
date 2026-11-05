import { TEAM } from '../content';
import ed from '../Company.module.scss';
import DayPlanner from './DayPlanner';
import styles from './WorkingHours.module.scss';

/**
 * /team, "Our hours, in your day": the section head (the published office
 * hours, said once) and the planner card, the page's one interactive piece.
 * Server Component; only DayPlanner hydrates.
 */
export default function WorkingHours() {
  const { hours } = TEAM;
  return (
    <section id="hours" className={ed.dark} aria-labelledby="hours-title">
      <div className={ed.inner}>
        <header className={ed.head}>
          <p className={ed.label}>{hours.label}</p>
          <h2 id="hours-title" className={ed.title}>
            {hours.title}
          </h2>
          <p className={ed.lede}>{hours.lede}</p>
        </header>
        <div className={`${ed.card} ${styles.card}`}>
          <DayPlanner />
        </div>
      </div>
    </section>
  );
}
