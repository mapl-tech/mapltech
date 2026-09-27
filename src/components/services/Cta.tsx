import MagneticButton, { type MagneticButtonProps } from '@/components/ui/MagneticButton';

export interface CtaProps extends Omit<MagneticButtonProps, 'placement'> {
  /** Analytics slot, e.g. "web-development_hero_primary". Rendered as data-cta-placement. */
  placement: string;
  /** Marks the hero primary CTA the mobile action bar watches (data-hero-cta). */
  hero?: boolean;
  boxClassName?: string;
}

/**
 * MagneticButton with the redesign's data contract on a wrapping box:
 * `data-cta-placement` on every CTA and `data-hero-cta` on the hero primary.
 * (MagneticButton itself does not forward data attributes; see report.)
 */
export default function Cta({ placement, hero = false, boxClassName, ...button }: CtaProps) {
  return (
    <span className={boxClassName} data-cta-placement={placement} data-hero-cta={hero ? '' : undefined}>
      <MagneticButton placement={placement} {...button} />
    </span>
  );
}
