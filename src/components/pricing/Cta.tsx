import MagneticButton, { type MagneticButtonProps } from '@/components/ui/MagneticButton';
import styles from './Cta.module.scss';

interface CtaProps extends Omit<MagneticButtonProps, 'placement'> {
  /** `<page>_<slot>`, e.g. "pricing_hero_primary". Emitted as `cta_click` and as data-cta-placement. */
  placement: string;
  /** Marks the hero's primary CTA (MobileActionBar shows once it leaves the viewport). */
  hero?: boolean;
  /** Stretch to the container (rails, sheets, mobile stacks). */
  block?: boolean;
  wrapClassName?: string;
}

/**
 * MagneticButton with the site's CTA data contract. MagneticButton does not
 * forward arbitrary data attributes, so the placement lives on this wrapper.
 */
export default function Cta({ placement, hero = false, block = false, wrapClassName = '', ...button }: CtaProps) {
  return (
    <span
      className={`${styles.cta} ${block ? styles.block : ''} ${wrapClassName}`.trim()}
      data-cta-placement={placement}
      data-hero-cta={hero ? '' : undefined}
    >
      <MagneticButton placement={placement} {...button} />
    </span>
  );
}
