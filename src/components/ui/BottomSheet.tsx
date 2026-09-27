'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { Drawer } from 'vaul';
import { usePrefersReducedMotion } from './useMediaQuery';

/**
 * Interaction #9: brand-styled bottom sheet over vaul's Drawer.
 *
 * Snap points default to ['220px', 0.65, 1] (peek / half / full); inputs are
 * repositioned when the keyboard opens. Body content scrolls only at the last
 * snap point so drags never fight the scroll. Under reduced motion the sheet
 * opens instantly (styles/_motion.scss zeroes vaul's transitions).
 */

export type SnapPoint = number | string;

export const SHEET_SNAP_POINTS: SnapPoint[] = ['220px', 0.65, 1];

export interface BottomSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  /** Rendered as the Drawer trigger (asChild), e.g. a <button>. */
  trigger?: ReactNode;
  /** Required for screen readers; visually shown in the sheet head. */
  title: string;
  description?: string;
  /** Pinned above the scrolling body: e.g. the live estimate range. */
  header?: ReactNode;
  children: ReactNode;
  snapPoints?: SnapPoint[];
  activeSnapPoint?: SnapPoint | null;
  setActiveSnapPoint?: (point: SnapPoint | null) => void;
  modal?: boolean;
  dismissible?: boolean;
  className?: string;
}

const OVERLAY: CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 399,
  background: 'rgba(0, 0, 0, 0.6)',
};

const CONTENT: CSSProperties = {
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 400,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  maxHeight: '97%',
  background: '#0a0a0a',
  color: '#ffffff',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  outline: 'none',
};

const HANDLE: CSSProperties = {
  marginTop: 10,
  background: 'rgba(255, 255, 255, 0.28)',
};

const HEAD: CSSProperties = {
  flex: '0 0 auto',
  padding: '12px 20px 8px',
};

const TITLE: CSSProperties = {
  margin: 0,
  fontSize: 18,
  fontWeight: 600,
  lineHeight: 1.2,
};

const DESCRIPTION: CSSProperties = {
  margin: '6px 0 0',
  fontSize: 15,
  color: '#999999',
};

export default function BottomSheet({
  open,
  onOpenChange,
  defaultOpen,
  trigger,
  title,
  description,
  header,
  children,
  snapPoints = SHEET_SNAP_POINTS,
  activeSnapPoint,
  setActiveSnapPoint,
  modal = true,
  dismissible = true,
  className = '',
}: BottomSheetProps) {
  const reduceMotion = usePrefersReducedMotion();
  const [internalSnap, setInternalSnap] = useState<SnapPoint | null>(snapPoints[0] ?? null);
  const snap = activeSnapPoint !== undefined ? activeSnapPoint : internalSnap;
  const setSnap = setActiveSnapPoint ?? setInternalSnap;
  const expanded = snap === snapPoints[snapPoints.length - 1];

  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      defaultOpen={defaultOpen}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      repositionInputs
      modal={modal}
      dismissible={dismissible}
    >
      {trigger ? <Drawer.Trigger asChild>{trigger}</Drawer.Trigger> : null}
      <Drawer.Portal>
        <Drawer.Overlay className="bottom-sheet__overlay" style={OVERLAY} />
        <Drawer.Content
          className={`bottom-sheet ${className}`.trim()}
          style={CONTENT}
          data-reduced-motion={reduceMotion ? '' : undefined}
          aria-describedby={undefined}
        >
          <Drawer.Handle className="bottom-sheet__handle" style={HANDLE} />
          <div className="bottom-sheet__head" style={HEAD}>
            <Drawer.Title style={TITLE}>{title}</Drawer.Title>
            {description ? <Drawer.Description style={DESCRIPTION}>{description}</Drawer.Description> : null}
            {header}
          </div>
          <div
            className="bottom-sheet__body"
            style={{
              flex: '1 1 auto',
              minHeight: 0,
              padding: '0 20px 24px',
              overflowY: expanded ? 'auto' : 'hidden',
              overscrollBehavior: 'contain',
            }}
          >
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
