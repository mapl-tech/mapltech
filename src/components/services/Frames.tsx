import type { ReactNode } from 'react';
import Image from 'next/image';
import styles from './Frames.module.scss';

/**
 * The homepage's device frames (flagship/Work.module.scss), shared by the
 * services index preview and the service pages' proof block: a browser with
 * its address bar, and a phone. Captures are the real live sites
 * (public/images/cases, desktop 1800x1125, phone 780x1688).
 */
export function BrowserFrame({
  url,
  className,
  children,
}: {
  url?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={[styles.browser, className].filter(Boolean).join(' ')}>
      <div className={styles.chrome} aria-hidden="true">
        <span className={styles.lights}>
          <i />
          <i />
          <i />
        </span>
        {url ? <span className={styles.url}>{url}</span> : null}
      </div>
      {children}
    </div>
  );
}

export function DesktopShot({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  return <Image src={src} alt={alt} width={1800} height={1125} sizes={sizes} className={styles.shot} />;
}

export function PhoneFrame({ src, sizes, className }: { src: string; sizes: string; className?: string }) {
  return (
    <div className={[styles.phone, className].filter(Boolean).join(' ')}>
      <Image src={src} alt="" width={780} height={1688} sizes={sizes} className={styles.shot} />
    </div>
  );
}
