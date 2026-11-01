'use client';

import { useEffect, useRef } from 'react';
import { useFinePointer, usePrefersReducedMotion } from '@/components/ui/useMediaQuery';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './lightFieldShader';
import styles from './LightField.module.scss';

/**
 * A real-time crimson light field (raw WebGL, no library). Renders at half
 * resolution (the light is soft, so nobody can tell) with the pixel ratio
 * capped, pauses whenever it is off screen or the tab is hidden, and follows
 * the pointer with an eased bloom on mice.
 *
 * Degrades in layers: reduced motion (and touch, when `liveOnTouch` is false)
 * draws one still frame; no WebGL, a shader
 * failure or a lost context leaves the CSS gradient behind the canvas, which
 * is styled to read as the same light. Decorative only (aria-hidden).
 */
export interface LightFieldProps {
  /** Where the light gathers on landscape screens, 0..1 from the top-left. */
  focusX?: number;
  focusY?: number;
  /** Where it gathers on portrait screens. */
  portraitX?: number;
  portraitY?: number;
  /** Overall brightness multiplier. */
  intensity?: number;
  /**
   * Animate on touch devices too (default). Pass false for a section that
   * reads just as well still, to spare phone GPUs and batteries.
   */
  liveOnTouch?: boolean;
  className?: string;
}

const MAX_PIXEL_RATIO = 1.5;
const RENDER_SCALE = 0.5;
/**
 * The clock starts here rather than at 0: this moment has the richest folds,
 * so the first paint and the reduced-motion still frame are the same picture.
 */
const START_TIME = 60;
const QUAD = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);

function compile(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  const program = vertex && fragment ? gl.createProgram() : null;
  if (program && vertex && fragment) {
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
  }
  if (vertex) gl.deleteShader(vertex);
  if (fragment) gl.deleteShader(fragment);
  if (program && gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  if (program) gl.deleteProgram(program);
  return null;
}

export default function LightField({
  focusX = 0.72,
  focusY = 0.42,
  portraitX = 0.5,
  portraitY = 0.72,
  intensity = 1,
  liveOnTouch = true,
  className,
}: LightFieldProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const finePointer = useFinePointer();
  // One still frame: what reduced motion gets, and touch devices when asked.
  const still = reduceMotion || (!liveOnTouch && !finePointer);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return;
    const program = createProgram(gl);
    if (!program) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, QUAD, gl.STATIC_DRAW);
    gl.useProgram(program);
    const position = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    const uResolution = gl.getUniformLocation(program, 'u_resolution');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uPointer = gl.getUniformLocation(program, 'u_pointer');
    const uFocus = gl.getUniformLocation(program, 'u_focus');
    const uIntensity = gl.getUniformLocation(program, 'u_intensity');

    let frame = 0;
    let visible = true;
    let portrait = false;
    const start = performance.now();
    // Target and eased pointer, 0..1 from the top-left; -1 until a mouse moves.
    const pointer = { x: -1, y: -1, targetX: -1, targetY: -1 };

    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO) * RENDER_SCALE;
      const width = Math.max(1, Math.round(canvas.clientWidth * scale));
      const height = Math.max(1, Math.round(canvas.clientHeight * scale));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      portrait = canvas.clientHeight > canvas.clientWidth;
    };

    const draw = (now: number) => {
      if (pointer.targetX >= 0) {
        // Trails like light, not like a cursor.
        pointer.x = pointer.x < 0 ? pointer.targetX : pointer.x + (pointer.targetX - pointer.x) * 0.06;
        pointer.y = pointer.y < 0 ? pointer.targetY : pointer.y + (pointer.targetY - pointer.y) * 0.06;
      }
      const fx = portrait ? portraitX : focusX;
      const fy = portrait ? portraitY : focusY;
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, still ? START_TIME : START_TIME + (now - start) / 1000);
      // GL's y axis points up; ours points down.
      gl.uniform2f(uPointer, pointer.x, pointer.x < 0 ? -1 : 1 - pointer.y);
      gl.uniform2f(uFocus, fx, 1 - fy);
      gl.uniform1f(uIntensity, intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const loop = (now: number) => {
      frame = 0;
      draw(now);
      schedule();
    };
    const schedule = () => {
      if (!frame && visible && !still && document.visibilityState === 'visible') {
        frame = requestAnimationFrame(loop);
      }
    };

    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = canvas.getBoundingClientRect();
      pointer.targetX = (event.clientX - rect.left) / rect.width;
      pointer.targetY = (event.clientY - rect.top) / rect.height;
    };
    const onVisibility = () => schedule();
    const onContextLost = (event: Event) => {
      event.preventDefault();
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      delete root.dataset.live; // the CSS light takes over
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (still) draw(performance.now());
    });
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    resizeObserver.observe(canvas);
    intersection.observe(canvas);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    canvas.addEventListener('webglcontextlost', onContextLost);

    resize();
    draw(performance.now());
    root.dataset.live = '';
    schedule();

    return () => {
      if (frame) cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      delete root.dataset.live;
    };
  }, [focusX, focusY, portraitX, portraitY, intensity, still]);

  return (
    <div ref={rootRef} className={`${styles.field} ${className ?? ''}`.trim()} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
