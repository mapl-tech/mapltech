import type { ReactNode } from 'react';
import styles from './FieldError.module.scss';

/**
 * One field's error, the brief's pattern for every form: a drawn "!" disc (so
 * the state never rests on colour alone), then a sentence that says how to
 * fix it. Give the field `aria-describedby={id}` and `aria-invalid`. `alert`
 * announces it as it appears: for errors that come from an action (a refused
 * file, a refused send), not for ones read when focus moves to the field.
 */
export default function FieldError({
  id,
  children,
  alert = false,
  className,
}: {
  id: string;
  children: ReactNode;
  alert?: boolean;
  className?: string;
}) {
  return (
    <p id={id} className={[styles.error, className].filter(Boolean).join(' ')} role={alert ? 'alert' : undefined}>
      <span className={styles.icon} aria-hidden="true">
        !
      </span>
      <span>{children}</span>
    </p>
  );
}
