import MagneticButton, { type MagneticButtonProps } from '@/components/ui/MagneticButton';

export interface CtaProps extends Omit<MagneticButtonProps, 'placement'> {
  /** `<page>_<slot>`, e.g. "contact_hero_primary". Emitted on click and stamped on the wrapper. */
  placement: string;
  /** Marks the hero primary CTA for MobileActionBar (`[data-hero-cta]`). */
  hero?: boolean;
  wrapperClassName?: string;
}

/**
 * MagneticButton with the analytics contract every CTA on the convert pages
 * carries: `data-cta-placement` (and `data-hero-cta` on the hero primary).
 * MagneticButton does not pass arbitrary data attributes through, so they sit
 * on an inline-block wrapper; the `placement` prop still fires `cta_click`.
 */
export default function Cta({ placement, hero, wrapperClassName, ...button }: CtaProps) {
  return (
    <span
      className={wrapperClassName}
      style={{ display: 'inline-block' }}
      data-cta-placement={placement}
      data-hero-cta={hero ? '' : undefined}
    >
      <MagneticButton placement={placement} {...button} />
    </span>
  );
}
