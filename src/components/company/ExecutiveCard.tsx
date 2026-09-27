import Image from 'next/image';
import { FaLinkedinIn } from 'react-icons/fa6';
import type { Executive } from '@/config/team';
import { slugify } from '@/lib/schema';
import styles from '@/app/company.module.scss';

export interface ExecutiveCardProps {
  exec: Executive;
  /** Give the card the `/team#slug` id that Person JSON-LD points at (only on /team). */
  anchor?: boolean;
}

function initialsOf(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('');
}

export default function ExecutiveCard({ exec, anchor = false }: ExecutiveCardProps) {
  const slug = slugify(exec.name);
  return (
    <article className={styles.execCard} id={anchor ? slug : undefined}>
      <div className={styles.avatar} aria-hidden={exec.image ? undefined : 'true'}>
        {exec.image ? (
          <Image src={exec.image} alt={exec.name} width={96} height={96} sizes="96px" className={styles.avatarImg} />
        ) : (
          <span className={styles.initials}>{initialsOf(exec.name)}</span>
        )}
      </div>
      <div className={styles.execBody}>
        <div className={styles.execHead}>
          <h3 className={styles.execName}>{exec.name}</h3>
          <a
            href={exec.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkedin}
            aria-label={`${exec.name} on LinkedIn`}
            data-cursor="external"
          >
            <FaLinkedinIn size={14} aria-hidden="true" />
            <span className={styles.externalChip} aria-hidden="true">
              Opens site
            </span>
          </a>
        </div>
        <p className={styles.execTitle}>{exec.title}</p>
        <p className={styles.execBio}>{exec.bio}</p>
      </div>
    </article>
  );
}
