'use client';

import { useEffect, useRef, useState } from 'react';
import { setMotionPaused, useMotionPaused } from '@/components/ui/motionPause';
import { usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import type { BackboneHandle } from './scene';
import styles from './Backbone.module.scss';

/**
 * Mounts the Backbone scene (scene.ts) behind the homepage hero.
 *
 * Speed first: three.js is a separate chunk, fetched only after the page has
 * painted and gone idle (or at the first pointer, touch, scroll or key, which
 * ever comes first), and the shaders compile asynchronously. Until then, and
 * forever without WebGL, the hero's CSS light is the whole picture.
 *
 * The pointer is read from window, so the copy and buttons layered over the
 * canvas never block it. Motion can be paused (WCAG 2.2.2); the choice is
 * shared with the rest of the page and remembered (motionPause.ts). Under
 * prefers-reduced-motion the scene is a single still frame.
 */

/** Matches the hero's portrait layout (Hero.module.scss $portrait). */
const PORTRAIT = '(max-aspect-ratio: 21/20)';
/** Desktop starts almost at once; phones wait so the scene never competes with first paint. */
const IDLE_DELAY_FINE = 250;
const IDLE_DELAY_COARSE = 2200;

export default function Backbone({ className, toggleClassName }: { className?: string; toggleClassName?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handleRef = useRef<BackboneHandle | null>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [live, setLive] = useState(false);
  const paused = useMotionPaused();
  const pausedRef = useRef(paused);

  // The choice can change anywhere on the page (the logo loop has its own control).
  useEffect(() => {
    pausedRef.current = paused;
    handleRef.current?.setPaused(paused);
  }, [paused]);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    // Data saver on: no 3D download; the CSS light stays the hero's art.
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData || window.matchMedia('(prefers-reduced-data: reduce)').matches) return;

    let cancelled = false;
    let started = false;
    let timer = 0;
    let idle = 0;

    const start = () => {
      if (started || cancelled) return;
      started = true;
      removeTriggers();
      import('./scene')
        .then(({ createBackbone }) =>
          createBackbone({
            canvas,
            still: reduceMotion,
            narrow: portrait.matches,
            onReady: () => {
              if (!cancelled) setLive(true);
            },
          }),
        )
        .then((handle) => {
          if (cancelled) {
            handle.dispose();
            return;
          }
          handleRef.current = handle;
          if (pausedRef.current) handle.setPaused(true);
          sync();
        })
        .catch(() => {
          // No WebGL (or the chunk failed): the CSS light stays as the hero's art.
        });
    };

    const triggers = ['pointermove', 'pointerdown', 'touchstart', 'scroll', 'keydown'] as const;
    const onTrigger = () => start();
    const removeTriggers = () => {
      triggers.forEach((type) => window.removeEventListener(type, onTrigger));
      window.clearTimeout(timer);
      if (idle && 'cancelIdleCallback' in window) window.cancelIdleCallback(idle);
    };
    triggers.forEach((type) => window.addEventListener(type, onTrigger, { passive: true, once: true }));

    const schedule = () => {
      const fine = window.matchMedia('(pointer: fine)').matches;
      timer = window.setTimeout(
        () => {
          if ('requestIdleCallback' in window) idle = window.requestIdleCallback(start, { timeout: 1200 });
          else start();
        },
        fine ? IDLE_DELAY_FINE : IDLE_DELAY_COARSE,
      );
    };
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    const portrait = window.matchMedia(PORTRAIT);
    const onLayout = () => handleRef.current?.setNarrow(portrait.matches);
    portrait.addEventListener('change', onLayout);

    /* Pointer, scroll, visibility and size, all forwarded to the scene. */
    let rect = canvas.getBoundingClientRect();
    let inView = true;

    const sync = () => {
      const handle = handleRef.current;
      if (!handle) return;
      rect = canvas.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -host.getBoundingClientRect().top / Math.max(1, rect.height)));
      handle.setScroll(progress);
    };

    const onPointerMove = (event: PointerEvent) => {
      const handle = handleRef.current;
      if (!handle || !inView) return;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
        handle.pointer(null, 0);
        return;
      }
      handle.pointer(x, y);
    };
    const onPointerDown = (event: PointerEvent) => {
      const handle = handleRef.current;
      if (!handle || !inView) return;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      handle.shock(x, y);
      setTouched(true);
    };
    const onLeave = () => handleRef.current?.pointer(null, 0);
    const onScroll = () => sync();
    const onVisibility = () => handleRef.current?.setVisible(inView && document.visibilityState === 'visible');

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      onVisibility();
      if (!inView) handleRef.current?.pointer(null, 0);
    });
    io.observe(host);

    const ro = new ResizeObserver(() => {
      rect = canvas.getBoundingClientRect();
      handleRef.current?.resize(rect.width, rect.height);
      sync();
    });
    ro.observe(canvas);

    return () => {
      cancelled = true;
      removeTriggers();
      window.removeEventListener('load', schedule);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      portrait.removeEventListener('change', onLayout);
      io.disconnect();
      ro.disconnect();
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [reduceMotion]);

  // Once anyone has moved through it, the hero's hint has done its job (data-touched).
  useEffect(() => {
    if (!live || touched) return;
    const onMove = () => setTouched(true);
    const timer = window.setTimeout(() => window.addEventListener('pointermove', onMove, { once: true }), 2500);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('pointermove', onMove);
    };
  }, [live, touched]);

  const toggle = () => setMotionPaused(!paused);

  const interactive = live && !reduceMotion;

  return (
    <div
      ref={hostRef}
      className={[styles.stage, className].filter(Boolean).join(' ')}
      data-live={live ? '' : undefined}
      data-touched={touched ? '' : undefined}
    >
      <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
      {interactive ? (
        // The label says what a press does, so no aria-pressed (it would announce "Play motion, pressed").
        <button type="button" className={[styles.toggle, toggleClassName].filter(Boolean).join(' ')} onClick={toggle}>
          <span className={styles.toggleIcon} data-paused={paused ? '' : undefined} aria-hidden="true" />
          {paused ? 'Play motion' : 'Pause motion'}
        </button>
      ) : null}
    </div>
  );
}
