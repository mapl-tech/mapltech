'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './HeroLight.module.scss';

/** The homepage's shared WebGL light field, code-split out of the page bundle. */
const LightField = dynamic(() => import('@/components/flagship/LightField'), { ssr: false });

type IdleWindow = Window & {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  cancelIdleCallback?: (id: number) => void;
};

type DeviceNavigator = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

/**
 * The hero atmosphere, paid for only when it cannot get in the way: CSS paints
 * the light immediately (no JavaScript), and the WebGL field mounts on idle
 * after the load event, so it never competes with the H1 (the LCP element) or
 * with the first interaction. Visitors who ask for less data, or devices with
 * little memory, keep the CSS light and never download the shader.
 */
export default function HeroLight() {
  const [live, setLive] = useState(false);

  useEffect(() => {
    const nav = navigator as DeviceNavigator;
    const lean =
      nav.connection?.saveData === true ||
      window.matchMedia('(prefers-reduced-data: reduce)').matches ||
      (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4);
    if (lean) return;

    const win = window as IdleWindow;
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = () => setLive(true);
    const schedule = () => {
      if (win.requestIdleCallback) idleId = win.requestIdleCallback(start, { timeout: 2500 });
      else timer = setTimeout(start, 1200);
    };

    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule, { once: true });

    return () => {
      window.removeEventListener('load', schedule);
      if (idleId !== undefined) win.cancelIdleCallback?.(idleId);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className={styles.light} aria-hidden="true">
      {live ? (
        <LightField className={styles.field} focusX={0.9} focusY={0.12} portraitX={0.9} portraitY={0.04} intensity={0.7} />
      ) : null}
    </div>
  );
}
