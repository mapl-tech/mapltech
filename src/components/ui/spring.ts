/**
 * A one-dimensional spring stepped on requestAnimationFrame: the small piece
 * of framer-motion the site actually used (magnetic buttons, live numbers),
 * without shipping the library to every page.
 *
 * `set` animates toward a target, `jump` snaps there, and the loop stops on
 * its own once the value is at rest, so an idle spring costs nothing.
 */
export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
  /** Distance and speed below which the spring counts as at rest. */
  restDelta?: number;
}

export interface Spring {
  set(target: number): void;
  jump(value: number): void;
  stop(): void;
}

const SUBSTEPS = 4;
const MAX_DT = 0.064;

export function createSpring(
  initial: number,
  { stiffness = 120, damping = 22, mass = 0.6, restDelta = 0.01 }: SpringOptions,
  onUpdate: (value: number) => void,
): Spring {
  let value = initial;
  let velocity = 0;
  let target = initial;
  let frame = 0;
  let last = 0;

  const step = (now: number) => {
    const dt = Math.min(MAX_DT, last ? (now - last) / 1000 : 1 / 60);
    last = now;
    const h = dt / SUBSTEPS;
    for (let i = 0; i < SUBSTEPS; i++) {
      const force = -stiffness * (value - target) - damping * velocity;
      velocity += (force / mass) * h;
      value += velocity * h;
    }
    if (Math.abs(value - target) < restDelta && Math.abs(velocity) < restDelta) {
      value = target;
      velocity = 0;
      frame = 0;
      last = 0;
      onUpdate(value);
      return;
    }
    onUpdate(value);
    frame = requestAnimationFrame(step);
  };

  return {
    set(next) {
      target = next;
      if (!frame) frame = requestAnimationFrame(step);
    },
    jump(next) {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      target = next;
      value = next;
      velocity = 0;
      onUpdate(value);
    },
    stop() {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
    },
  };
}
