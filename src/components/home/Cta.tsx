import MagneticButton, { type MagneticButtonProps } from '@/components/ui/MagneticButton';

/**
 * MagneticButton with the analytics contract every homepage CTA carries:
 * `data-cta-placement="<page>_<slot>"` on the box and, for the hero primary,
 * `data-hero-cta` (watched by MobileActionBar). MagneticButton itself emits
 * the `cta_click` event from the same `placement`.
 */
export interface CtaProps extends Omit<MagneticButtonProps, 'placement'> {
  placement: string;
  /** Marks the hero primary CTA (`data-hero-cta`). */
  hero?: boolean;
  /** Class for the wrapping box (layout only; the button styles its own surface). */
  boxClassName?: string;
}

export default function Cta({ placement, hero = false, boxClassName, ...button }: CtaProps) {
  return (
    <span
      className={boxClassName}
      data-cta-placement={placement}
      data-hero-cta={hero ? '' : undefined}
      style={{ display: 'inline-block' }}
    >
      <MagneticButton {...button} placement={placement} />
    </span>
  );
}
