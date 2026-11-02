import Image from 'next/image';
import Link from 'next/link';
import { findStory } from '@/components/case/stories';
import { listedProjects } from '@/config/site';
import styles from './ShippedWork.module.scss';

export interface ShippedWorkProps {
  id?: string;
  title: string;
  lede: string;
  /** Case-study slugs, lead project first. Hidden projects are dropped. */
  slugs?: readonly string[];
  placement: string;
}

/**
 * Real product UI, not illustrations: live screenshots of shipped work (the
 * case template's capture set), each linking to its case study. One lead
 * project and two beside it. Copy is each story's own one-line outcome.
 */
export default function ShippedWork({
  id = 'work-title',
  title,
  lede,
  slugs = ['lro-staffing', 'mapl-tours', 'chha-ncr'],
  placement,
}: ShippedWorkProps) {
  const listed = new Set(listedProjects().map((p) => p.slug));
  const items = slugs
    .filter((slug) => listed.has(slug))
    .map((slug) => findStory(slug))
    .filter((story): story is NonNullable<typeof story> => Boolean(story?.media));

  if (!items.length) return null;

  return (
    <section className={styles.work} aria-labelledby={id}>
      <div className={styles.inner}>
        <header className={styles.head}>
          <h2 id={id} className={styles.h2}>
            {title}
          </h2>
          <p className={styles.lede}>{lede}</p>
        </header>

        <ul className={styles.grid} role="list">
          {items.map((story, index) => (
            <li key={story.slug} className={styles.item} data-lead={index === 0 ? 'true' : undefined}>
              <Link
                href={`/our-work/${story.slug}`}
                className={styles.card}
                aria-labelledby={`work-${story.slug}-client work-${story.slug}-read`}
                data-cta-placement={`${placement}_work_${story.slug}`}
              >
                <span className={styles.media}>
                  <Image
                    src={story.media!.desktop}
                    alt={story.media!.alt}
                    fill
                    sizes={index === 0 ? '(min-width: 1024px) 56vw, 92vw' : '(min-width: 1024px) 38vw, 92vw'}
                    className={styles.img}
                  />
                </span>
                <span className={styles.text}>
                  <span className={styles.tag}>{story.tags.slice(0, 2).join(' · ')}</span>{' '}
                  <span id={`work-${story.slug}-client`} className={styles.client}>
                    {story.client}
                  </span>{' '}
                  <span className={styles.line}>{story.headline}</span>{' '}
                  <span id={`work-${story.slug}-read`} className={styles.read}>
                    Read the case study<span aria-hidden="true"> →</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <p className={styles.all}>
          <Link href="/our-work" className={styles.allLink} data-cta-placement={`${placement}_work_all`}>
            See all our work<span aria-hidden="true"> →</span>
          </Link>
        </p>
      </div>
    </section>
  );
}
