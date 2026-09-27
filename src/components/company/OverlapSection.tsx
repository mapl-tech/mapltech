import SectionHead from './SectionHead';
import OverlapExplorer from './OverlapExplorer';
import styles from '@/app/company.module.scss';

export interface OverlapSectionProps {
  id?: string;
  eyebrow: string;
  heading: string;
  body: string;
  /** Static time-zone facts rendered as text beneath the strip (SSR, no JS needed). */
  footnote?: string;
  /** Initial axis for the explorer; defaults to the visitor's zone. */
  defaultZone?: string;
}

/** Section wrapper for the page's single signature interaction (PEAK). */
export default function OverlapSection({ id = 'overlap', eyebrow, heading, body, footnote, defaultZone }: OverlapSectionProps) {
  const titleId = `${id}-title`;
  return (
    <section id={id} className={`${styles.section} ${styles.peak} reveal`} aria-labelledby={titleId}>
      <div className={styles.sectionInner}>
        <SectionHead eyebrow={eyebrow} title={heading} id={titleId} intro={body} />
        <OverlapExplorer defaultZone={defaultZone} />
        {footnote ? <p className={styles.tzFoot}>{footnote}</p> : null}
      </div>
    </section>
  );
}
