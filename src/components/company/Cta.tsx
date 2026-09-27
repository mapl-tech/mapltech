import MagneticButton, { type MagneticButtonProps } from '@/components/ui/MagneticButton';
import styles from '@/app/company.module.scss';

export interface CtaProps extends Omit<MagneticButtonProps, 'placement'> {
  /** `<page>_<slot>`; emitted on click as `cta_click{placement}` and written as data-cta-placement. */
  placement: string;
}

/**
 * Tactile CTA (interaction #5) with the placement contract. MagneticButton
 * owns the motion; this wrapper carries `data-cta-placement` so the slot is
 * queryable in the DOM and stretches the button to the row on phones.
 */
export default function Cta({ placement, ...rest }: CtaProps) {
  return (
    <span data-cta-placement={placement} className={styles.ctaSlot}>
      <MagneticButton placement={placement} {...rest} />
    </span>
  );
}
