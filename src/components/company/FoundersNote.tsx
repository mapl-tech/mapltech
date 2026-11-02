import Image from 'next/image';
import Link from 'next/link';
import { FOUNDERS, FOUNDER_NAMES } from './content';
import styles from './FoundersNote.module.scss';

/** "co-founders and directors" when both share the title in team.ts, otherwise each name keeps its own. */
function titleLine(): string {
  const titles = Array.from(new Set(FOUNDERS.map((f) => f.title)));
  if (titles.length === 1 && /co-founder & director/i.test(titles[0])) return 'co-founders and directors';
  return FOUNDERS.map((f) => `${f.name}, ${f.title}`).join('; ');
}

/**
 * The people behind the company, beside the decision to apply: the founders'
 * own photos (decorative here, their names are in the sentence), the titles
 * team.ts gives them and a route to the team page. It makes no claim about
 * who reads applications.
 */
export default function FoundersNote({ placement }: { placement: string }) {
  if (!FOUNDERS.length) return null;
  return (
    <div className={styles.note}>
      <span className={styles.faces} aria-hidden="true">
        {FOUNDERS.map((founder) => (
          <Image
            key={founder.slug}
            src={founder.avatar}
            alt=""
            width={52}
            height={52}
            sizes="52px"
            className={styles.face}
          />
        ))}
      </span>
      <p className={styles.text}>
        Founded and led by <span className={styles.names}>{FOUNDER_NAMES}</span>, {titleLine()}.
      </p>
      <Link href="/team" className={styles.link} data-cta-placement={`${placement}_founders_team`}>
        Meet the team<span aria-hidden="true"> →</span>
      </Link>
    </div>
  );
}
