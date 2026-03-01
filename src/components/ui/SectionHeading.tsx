import Link from 'next/link';
import styles from './SectionHeading.module.scss';

interface SectionHeadingProps {
  label?: string;
  labelHref?: string;
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}

export default function SectionHeading({
  label,
  labelHref,
  title,
  subtitle,
  align = 'center',
}: SectionHeadingProps) {
  return (
    <div className={`${styles.heading} ${align === 'left' ? styles.left : ''}`}>
      {label && (
        labelHref ? (
          <Link href={labelHref} target="_blank" rel="noopener noreferrer" className={`${styles.label} ${styles.labelLink}`}>
            {label}
          </Link>
        ) : (
          <span className={styles.label}>{label}</span>
        )
      )}
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
}
