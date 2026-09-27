/// <reference types="react/canary" />
import * as React from 'react';

/**
 * Guarded <ViewTransition>. The App Router's React build exports
 * `ViewTransition` (canary channel); if a future build does not, the wrapper
 * degrades to rendering its children so the rows still work.
 *
 * Contract for the case-study hero (our-work owner): wrap the hero image in
 * `<WorkTransition name={`work-${slug}`} share="morph" default="none">` — one
 * name per slug per page — and the row thumbnail morphs into it on navigation.
 */
export type WorkTransitionProps = React.ComponentProps<typeof React.ViewTransition>;

const Impl = (React as Partial<typeof React>).ViewTransition;

export default function WorkTransition(props: WorkTransitionProps) {
  if (!Impl) return <>{props.children}</>;
  return <Impl {...props} />;
}
