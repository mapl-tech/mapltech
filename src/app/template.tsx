/// <reference types="react/canary" />
import { ViewTransition } from 'react';
import type { ReactNode } from 'react';

/**
 * Root template = the page-transition boundary (Next 16.3 App Router, React
 * <ViewTransition>; no config flag exists or is needed in this version).
 *
 * The App Router keys this template by the top-level route segment, so a
 * navigation across segments (/ -> /pricing) unmounts the old instance
 * (`exit`) and mounts the new one (`enter`); a navigation inside one segment
 * (/blog/a -> /blog/b, /our-work -> /our-work/x) keeps the instance and
 * animates as an `update`. The classes are styled in styles/_transitions.scss;
 * the header is anchored there via `view-transition-name: site-header`, and
 * reduced motion zeroes every duration.
 *
 * Server Component: no JS, no wrapper element, no transform (the homepage
 * Backbone is position: fixed). The first paint is not a transition, so
 * nothing is ever shipped hidden. This replaces the Framer opacity fade; the
 * two never run together.
 */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" update="page-update" default="none">
      {children}
    </ViewTransition>
  );
}
