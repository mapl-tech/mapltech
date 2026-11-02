/**
 * The Backbone: the homepage hero's real-time scene.
 *
 * The bar in the MA|PL wordmark, multiplied into a spine of glossy capsules
 * (crimson, graphite, bone) that twists slowly in space. Every capsule is a
 * rigid body on a spring to its place in the spine: the pointer (or a finger)
 * pushes through them, a click or tap sends a shockwave, they collide with
 * each other and then settle back into line. The metaphor is the brand line,
 * "the engineering backbone behind agencies": push it, it holds.
 *
 * Plain three.js, no physics engine: capsules are symmetric, so each body is a
 * position plus an axis, collisions are segment-to-segment closest points, and
 * the whole simulation is a few hundred lines with zero allocations per frame.
 * The module is imported dynamically by Backbone.tsx after the page has
 * painted, so none of this is in the first-load JavaScript.
 *
 * Rendering stops whenever nothing can change: off screen, tab hidden, motion
 * paused with the bodies at rest, or reduced motion after the single frame.
 */
import {
  ACESFilmicToneMapping,
  CapsuleGeometry,
  CatmullRomCurve3,
  Color,
  DirectionalLight,
  DynamicDrawUsage,
  InstancedMesh,
  Matrix4,
  MeshPhysicalMaterial,
  PerspectiveCamera,
  PMREMGenerator,
  Quaternion,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface BackboneOptions {
  canvas: HTMLCanvasElement;
  /** No intro, no idle motion, no physics: one still frame. */
  still: boolean;
  /** Portrait layout: the stage is a band above the copy, not the whole hero. */
  narrow: boolean;
  /** Called once the first frame is on screen. */
  onReady?: () => void;
}

export interface BackboneHandle {
  /** Pointer position in canvas pixels, or null when it leaves. */
  pointer(x: number | null, y: number): void;
  /** A click or tap at canvas pixels: radial impulse. */
  shock(x: number, y: number): void;
  /** Idle motion on or off (WCAG 2.2.2). Interaction still works while paused. */
  setPaused(paused: boolean): void;
  /** 0 with the hero fully in view, 1 once it has scrolled away. */
  setScroll(progress: number): void;
  setVisible(visible: boolean): void;
  setNarrow(narrow: boolean): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

/* ------------------------------------------------------------------ */
/* Tuning                                                               */
/* ------------------------------------------------------------------ */

// Thin rods, not pills: the proportions of the bar in the MA|PL wordmark.
const RADIUS = 0.105;
const SHAFT = 2.9; // the cylinder between the caps
const HALF = SHAFT / 2;
const CONTACT = RADIUS * 2;
const SPACING = 0.31; // along the spine, centre to centre
const FOV = 30;
const STEP = 1 / 120;
const MAX_STEPS = 4;

const SPRING = 16; // position spring to the spine
const DAMP = 3.6;
const TURN_SPRING = 20; // axis spring to the spine
const TURN_DAMP = 4.2;
const RESTITUTION = 0.35;
const SPIN = 0.9; // how much contact turns a body
const PUSH_RADIUS = 0.95; // pointer, world units
const PUSH = 26;
const DRAG = 0.55; // share of the pointer's velocity handed to what it touches
const SHOCK_RADIUS = 3.4;
const SHOCK = 10;

const INTRO_MS = 1900;
const STILL = 1e-8; // squared movement per frame (world units) that counts as rest: far under a pixel
const QUIET_FRAMES = 30; // consecutive frames (or settle steps) at rest before stopping
const SETTLE_STEPS = 600; // reduced motion: at most 5s of simulation before the one frame
const WAVE = 0.2; // idle undulation amplitude
const WAVE_SPEED = 0.85;
const TWIST_SPEED = 0.32; // radians per second, the slow turn of the whole spine

/**
 * Finish per rod along the spine: graphite carries it, crimson is the accent,
 * chrome catches the light. 0 crimson, 1 graphite, 2 chrome.
 */
const PATTERN: readonly (0 | 1 | 2)[] = [1, 1, 0, 1, 2, 1, 1, 0, 1, 1, 2, 1, 0, 1, 1, 2];

interface Composition {
  cameraZ: number;
  /** Spine control points: x, y as fractions of the half-frustum at z = 0; z in world units. */
  points: readonly (readonly [number, number, number])[];
  twist: number;
  /** A soft wall (x as a fraction of the half-frustum) that keeps rods off the copy, or null. */
  wall: number | null;
}

/**
 * Landscape: the spine rises out of the bottom edge on the right half and
 * leaves through the right edge, clear of the copy and of the header.
 */
const WIDE: Composition = {
  cameraZ: 15,
  points: [
    [0.2, -1.42, -2.2],
    [0.42, -0.64, 0.2],
    [0.44, 0.0, 0.6],
    [0.72, 0.46, -0.1],
    [1.34, 0.8, -2.2],
  ],
  twist: Math.PI * 1.7,
  wall: 0.1,
};

/** Portrait: a diagonal through the band above the copy, past both side edges. */
const NARROW: Composition = {
  cameraZ: 17,
  wall: null,
  points: [
    [1.3, 0.74, -1.8],
    [0.6, 0.4, 0.2],
    [0.0, 0.04, 0.6],
    [-0.6, -0.28, 0.1],
    [-1.3, -0.6, -1.8],
  ],
  twist: Math.PI * 1.4,
};

/* ------------------------------------------------------------------ */
/* Bodies                                                               */
/* ------------------------------------------------------------------ */

interface Body {
  p: Vector3; // centre
  v: Vector3;
  a: Vector3; // unit axis (the capsule is symmetric about it)
  w: Vector3; // angular velocity
  home: Vector3;
  homeAxis: Vector3;
  /** Spine frame at rest, before the idle wave and twist. */
  base: Vector3;
  tangent: Vector3;
  side: Vector3;
  binormal: Vector3;
  u: number;
  theta: number;
  finish: 0 | 1 | 2;
  slot: number;
}

const Y_AXIS = new Vector3(0, 1, 0);
const Z_AXIS = new Vector3(0, 0, 1);

/** Deterministic pseudo-random, so the intro scatter is the same every visit. */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/**
 * Hands the main thread back between setup steps. The GL context, the
 * environment bake and the scene build each cost tens of milliseconds on a
 * phone; run back to back they are one long task that a tap could land in.
 */
function yieldToMain(): Promise<void> {
  const { scheduler } = globalThis as { scheduler?: { yield?: () => Promise<void> } };
  if (scheduler?.yield) return scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}

const noop: BackboneHandle = {
  pointer() {},
  shock() {},
  setPaused() {},
  setScroll() {},
  setVisible() {},
  setNarrow() {},
  resize() {},
  dispose() {},
};

/* ------------------------------------------------------------------ */
/* Scene                                                                */
/* ------------------------------------------------------------------ */

export async function createBackbone({ canvas, still, narrow, onReady }: BackboneOptions): Promise<BackboneHandle> {
  // This chunk's own evaluation just ran; start the setup in a fresh task.
  await yieldToMain();
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  await yieldToMain();
  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04).texture;
  room.dispose();
  scene.environment = environment;
  scene.environmentIntensity = 0.85;

  await yieldToMain();

  const key = new DirectionalLight(0xffffff, 1.5);
  key.position.set(5, 7, 9);
  const rim = new DirectionalLight(new Color('#ff2a4d'), 3.2);
  rim.position.set(-7, -3, -6);
  const kick = new DirectionalLight(new Color('#ff6b81'), 0.9);
  kick.position.set(8, -6, 3);
  scene.add(key, rim, kick);

  const camera = new PerspectiveCamera(FOV, 1, 0.1, 100);

  const geometry = new CapsuleGeometry(RADIUS, SHAFT, 8, 20);
  const materials = [
    new MeshPhysicalMaterial({ color: '#D91C3F', roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1 }),
    new MeshPhysicalMaterial({ color: '#161619', roughness: 0.2, metalness: 0.55, clearcoat: 1, clearcoatRoughness: 0.06 }),
    new MeshPhysicalMaterial({ color: '#D9DBE0', roughness: 0.16, metalness: 1, clearcoat: 0.4, clearcoatRoughness: 0.1 }),
  ] as const;

  let bodies: Body[] = [];
  let meshes: InstancedMesh[] = [];
  let composition: Composition = narrow ? NARROW : WIDE;
  let narrowLayout = narrow;
  let halfW = 1;
  let halfH = 1;
  let width = 1;
  let height = 1;

  // Simulation state
  let clock = 0; // seconds of idle motion (frozen while paused)
  let introStart = -1;
  let paused = still;
  let visible = true;
  let scroll = 0;
  let frame = 0;
  let last = 0;
  let accumulator = 0;
  let disposed = false;
  let readySent = false;
  let quiet = 0; // consecutive frames in which nothing moved
  let pose = new Float64Array(0); // last frame's positions and axes, for moved()

  const pointerWorld = new Vector3();
  const pointerPrev = new Vector3();
  const pointerVel = new Vector3();
  let pointerActive = false;
  let pointerFresh = false;
  let lastInteraction = 0;

  // Scratch (no allocation in the loop)
  const tmpA = new Vector3();
  const tmpB = new Vector3();
  const tmpC = new Vector3();
  const tmpD = new Vector3();
  const tmpN = new Vector3();
  const quat = new Quaternion();
  const matrix = new Matrix4();
  const unitScale = new Vector3(1, 1, 1);

  /* ---------------- layout ---------------- */

  function buildSpine(keepBodies: boolean) {
    composition = narrowLayout ? NARROW : WIDE;
    camera.position.set(0, 0, composition.cameraZ);
    camera.lookAt(0, 0, 0);
    halfH = composition.cameraZ * Math.tan((FOV * Math.PI) / 360);
    halfW = halfH * camera.aspect;

    const curve = new CatmullRomCurve3(
      composition.points.map(([x, y, z]) => new Vector3(x * halfW, y * halfH, z)),
      false,
      'centripetal',
    );
    const length = curve.getLength();
    const count = Math.max(16, Math.min(48, Math.round(length / SPACING)));

    const previous = keepBodies ? bodies : [];
    const random = seeded(1993);
    const next: Body[] = [];
    const slots = [0, 0, 0];

    for (let i = 0; i < count; i++) {
      const u = count === 1 ? 0.5 : i / (count - 1);
      const base = curve.getPointAt(u);
      const tangent = curve.getTangentAt(u).normalize();
      const side = new Vector3().crossVectors(tangent, Z_AXIS);
      if (side.lengthSq() < 1e-6) side.set(1, 0, 0);
      side.normalize();
      const binormal = new Vector3().crossVectors(tangent, side).normalize();
      const finish = PATTERN[i % PATTERN.length];
      const old = previous[i];

      const body: Body = {
        p: old ? old.p : new Vector3(),
        v: old ? old.v : new Vector3(),
        a: old ? old.a : new Vector3(0, 1, 0),
        w: old ? old.w : new Vector3(),
        home: new Vector3(),
        homeAxis: new Vector3(),
        base,
        tangent,
        side,
        binormal,
        u,
        theta: u * composition.twist,
        finish,
        slot: slots[finish]++,
      };
      next.push(body);
    }
    bodies = next;
    updateHomes();

    for (const body of bodies) {
      if (previous.length && body.p.lengthSq() > 0) continue;
      if (still) {
        body.p.copy(body.home);
        body.a.copy(body.homeAxis);
        continue;
      }
      // Intro: scattered around the spine, tumbling, then pulled into line.
      const r = 3 + random() * 4.5;
      const phi = random() * Math.PI * 2;
      const cosT = random() * 2 - 1;
      const sinT = Math.sqrt(1 - cosT * cosT);
      body.p.set(
        body.home.x + r * sinT * Math.cos(phi),
        body.home.y + r * sinT * Math.sin(phi),
        body.home.z + r * cosT * 0.6 + 1.5,
      );
      body.a.set(random() - 0.5, random() - 0.5, random() - 0.5).normalize();
      body.v.set(0, 0, 0);
      body.w.set((random() - 0.5) * 6, (random() - 0.5) * 6, (random() - 0.5) * 6);
    }

    // One InstancedMesh per finish, rebuilt only when a count changes.
    if (meshes.length !== materials.length || meshes.some((mesh, finish) => mesh.count !== slots[finish])) {
      for (const mesh of meshes) {
        scene.remove(mesh);
        mesh.dispose();
      }
      meshes = materials.map((material, finish) => {
        const mesh = new InstancedMesh(geometry, material, Math.max(1, slots[finish]));
        mesh.count = slots[finish];
        mesh.instanceMatrix.setUsage(DynamicDrawUsage);
        mesh.frustumCulled = false;
        scene.add(mesh);
        return mesh;
      });
    }
  }

  /** Where each capsule wants to be right now: the spine, plus wave, twist and scroll. */
  function updateHomes() {
    const wavePhase = clock * WAVE_SPEED;
    const twist = clock * TWIST_SPEED;
    const loosen = 1 + scroll * 0.4;
    const lift = scroll * halfH * 0.35;
    // Spine centre, for the scroll loosening.
    const mid = bodies[Math.floor(bodies.length / 2)]?.base;

    for (const body of bodies) {
      const wave = WAVE * Math.sin(wavePhase - body.u * 6.2);
      body.home.copy(body.base);
      if (mid) {
        tmpA.subVectors(body.base, mid).multiplyScalar(loosen - 1);
        body.home.add(tmpA);
      }
      body.home.addScaledVector(body.side, wave);
      body.home.y += lift;

      const theta = body.theta + twist;
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      body.homeAxis.copy(body.side).multiplyScalar(c).addScaledVector(body.binormal, s).normalize();
    }
  }

  /* ---------------- physics ---------------- */

  /** Closest points between segments p1q1 and p2q2 (Ericson, RTCD 5.1.9). Writes into c1, c2. */
  function closestSegments(p1: Vector3, q1: Vector3, p2: Vector3, q2: Vector3, c1: Vector3, c2: Vector3) {
    const d1x = q1.x - p1.x, d1y = q1.y - p1.y, d1z = q1.z - p1.z;
    const d2x = q2.x - p2.x, d2y = q2.y - p2.y, d2z = q2.z - p2.z;
    const rx = p1.x - p2.x, ry = p1.y - p2.y, rz = p1.z - p2.z;
    const a = d1x * d1x + d1y * d1y + d1z * d1z;
    const e = d2x * d2x + d2y * d2y + d2z * d2z;
    const f = d2x * rx + d2y * ry + d2z * rz;
    let s: number;
    let t: number;
    const c = d1x * rx + d1y * ry + d1z * rz;
    const b = d1x * d2x + d1y * d2y + d1z * d2z;
    const denom = a * e - b * b;
    s = denom > 1e-9 ? Math.min(1, Math.max(0, (b * f - c * e) / denom)) : 0;
    t = (b * s + f) / e;
    if (t < 0) {
      t = 0;
      s = Math.min(1, Math.max(0, -c / a));
    } else if (t > 1) {
      t = 1;
      s = Math.min(1, Math.max(0, (b - c) / a));
    }
    c1.set(p1.x + d1x * s, p1.y + d1y * s, p1.z + d1z * s);
    c2.set(p2.x + d2x * t, p2.y + d2y * t, p2.z + d2z * t);
  }

  const endA1 = new Vector3();
  const endA2 = new Vector3();
  const endB1 = new Vector3();
  const endB2 = new Vector3();
  const cA = new Vector3();
  const cB = new Vector3();

  function step(dt: number, now: number) {
    const introT = introStart < 0 ? 1 : Math.min(1, (now - introStart) / INTRO_MS);
    const pull = still ? 1 : 0.15 + 0.85 * easeOutCubic(introT);
    const k = SPRING * pull;
    const kr = TURN_SPRING * pull;

    // Springs and integration.
    for (const body of bodies) {
      tmpA.subVectors(body.home, body.p).multiplyScalar(k).addScaledVector(body.v, -DAMP);
      body.v.addScaledVector(tmpA, dt);
      body.p.addScaledVector(body.v, dt);

      // Axis spring toward the nearer of +home / -home (the capsule is symmetric).
      const sign = body.a.dot(body.homeAxis) < 0 ? -1 : 1;
      tmpB.copy(body.homeAxis).multiplyScalar(sign);
      tmpC.crossVectors(body.a, tmpB).multiplyScalar(kr).addScaledVector(body.w, -TURN_DAMP);
      body.w.addScaledVector(tmpC, dt);
      tmpD.crossVectors(body.w, body.a);
      body.a.addScaledVector(tmpD, dt).normalize();
    }

    // Pointer: a soft cylinder through the screen plane.
    if (pointerActive) {
      for (const body of bodies) {
        const along = Math.min(HALF, Math.max(-HALF, tmpA.subVectors(pointerWorld, body.p).dot(body.a)));
        tmpB.copy(body.p).addScaledVector(body.a, along); // nearest point on the shaft
        const dx = tmpB.x - pointerWorld.x;
        const dy = tmpB.y - pointerWorld.y;
        const dist = Math.hypot(dx, dy);
        const reach = PUSH_RADIUS + RADIUS;
        if (dist < reach && dist > 1e-5) {
          const depth = (reach - dist) / reach;
          tmpN.set(dx / dist, dy / dist, 0);
          body.v.addScaledVector(tmpN, PUSH * depth * dt * 6);
          body.v.addScaledVector(pointerVel, DRAG * depth * dt * 6);
          tmpC.subVectors(tmpB, body.p).cross(tmpN);
          body.w.addScaledVector(tmpC, PUSH * depth * dt * 2.4);
        }
      }
    }

    // The copy's soft wall: a rod reaching past it is eased back out.
    if (composition.wall !== null) {
      const wallX = composition.wall * halfW;
      for (const body of bodies) {
        const reach = Math.abs(body.a.x) * HALF + RADIUS;
        const over = wallX - (body.p.x - reach);
        if (over > 0) body.v.x += over * 40 * dt;
      }
    }

    // Capsule-capsule contacts.
    const n = bodies.length;
    for (let iteration = 0; iteration < 2; iteration++) {
      for (let i = 0; i < n; i++) {
        const A = bodies[i];
        endA1.copy(A.p).addScaledVector(A.a, -HALF);
        endA2.copy(A.p).addScaledVector(A.a, HALF);
        for (let j = i + 1; j < n; j++) {
          const B = bodies[j];
          // Broad phase: centres further apart than two capsule lengths cannot touch.
          const bx = A.p.x - B.p.x, by = A.p.y - B.p.y, bz = A.p.z - B.p.z;
          if (bx * bx + by * by + bz * bz > (SHAFT + CONTACT) ** 2) continue;
          endB1.copy(B.p).addScaledVector(B.a, -HALF);
          endB2.copy(B.p).addScaledVector(B.a, HALF);
          closestSegments(endA1, endA2, endB1, endB2, cA, cB);
          tmpN.subVectors(cA, cB);
          const dist = tmpN.length();
          if (dist >= CONTACT || dist < 1e-6) continue;
          tmpN.divideScalar(dist);
          const depth = CONTACT - dist;
          A.p.addScaledVector(tmpN, depth * 0.5);
          B.p.addScaledVector(tmpN, -depth * 0.5);

          // Relative velocity at the contact (linear only; the spin term is folded into SPIN).
          const vn = (A.v.x - B.v.x) * tmpN.x + (A.v.y - B.v.y) * tmpN.y + (A.v.z - B.v.z) * tmpN.z;
          if (vn < 0) {
            const impulse = (-(1 + RESTITUTION) * vn) / 2;
            A.v.addScaledVector(tmpN, impulse);
            B.v.addScaledVector(tmpN, -impulse);
            tmpC.subVectors(cA, A.p).cross(tmpN);
            A.w.addScaledVector(tmpC, impulse * SPIN);
            tmpC.subVectors(cB, B.p).cross(tmpN);
            B.w.addScaledVector(tmpC, -impulse * SPIN);
          }
        }
      }
    }
  }

  /**
   * How far the spine moved since the last call: the largest squared change
   * of any position or axis. Rest is judged on this, on what reaches the
   * screen, not on distance from home or on speed: the copy's soft wall and
   * the contacts can hold a rod off its home for good, while the solver keeps
   * trading velocity with it and the rod itself never moves.
   */
  function moved() {
    const fresh = pose.length !== bodies.length * 6;
    if (fresh) pose = new Float64Array(bodies.length * 6);
    let max = 0;
    for (let i = 0; i < bodies.length; i++) {
      const { p, a } = bodies[i];
      const o = i * 6;
      const d =
        (p.x - pose[o]) ** 2 + (p.y - pose[o + 1]) ** 2 + (p.z - pose[o + 2]) ** 2 +
        (a.x - pose[o + 3]) ** 2 + (a.y - pose[o + 4]) ** 2 + (a.z - pose[o + 5]) ** 2;
      if (d > max) max = d;
      pose[o] = p.x;
      pose[o + 1] = p.y;
      pose[o + 2] = p.z;
      pose[o + 3] = a.x;
      pose[o + 4] = a.y;
      pose[o + 5] = a.z;
    }
    return fresh ? Infinity : max;
  }

  /**
   * Reduced motion: run the springs, the wall and the contacts to rest off
   * screen, so the one frame shows the settled pose and nothing moves after it.
   */
  function settle() {
    for (const body of bodies) {
      body.p.copy(body.home);
      body.a.copy(body.homeAxis);
      body.v.set(0, 0, 0);
      body.w.set(0, 0, 0);
    }
    const now = performance.now();
    let calm = 0;
    for (let i = 0; i < SETTLE_STEPS && calm < QUIET_FRAMES; i++) {
      step(STEP, now);
      calm = moved() < STILL ? calm + 1 : 0;
    }
  }

  function writeInstances() {
    for (const body of bodies) {
      quat.setFromUnitVectors(Y_AXIS, body.a);
      matrix.compose(body.p, quat, unitScale);
      meshes[body.finish].setMatrixAt(body.slot, matrix);
    }
    for (const mesh of meshes) mesh.instanceMatrix.needsUpdate = true;
  }

  /* ---------------- loop ---------------- */

  function render() {
    renderer.render(scene, camera);
    if (!readySent) {
      readySent = true;
      onReady?.();
    }
  }

  function tick(now: number) {
    frame = 0;
    if (disposed) return;
    const dt = Math.min(0.1, last ? (now - last) / 1000 : 1 / 60);
    last = now;

    if (!paused) clock += dt;
    updateHomes();

    if (pointerFresh) {
      // Smoothed pointer velocity in world units per second.
      tmpA.subVectors(pointerWorld, pointerPrev).divideScalar(Math.max(dt, 1 / 240));
      pointerVel.lerp(tmpA, 0.35);
      pointerPrev.copy(pointerWorld);
      pointerFresh = false;
    } else {
      pointerVel.multiplyScalar(0.85);
    }

    accumulator += dt;
    let steps = 0;
    while (accumulator >= STEP && steps < MAX_STEPS) {
      step(STEP, now);
      accumulator -= STEP;
      steps++;
    }
    if (steps === MAX_STEPS) accumulator = 0;

    writeInstances();
    render();
    quiet = moved() < STILL ? quiet + 1 : 0;
    schedule(now);
  }

  /** Keep the loop alive only while something can move. Reduced motion never loops. */
  function schedule(now = performance.now()) {
    if (frame || disposed || !visible || still) return;
    const introRunning = introStart >= 0 && now - introStart < INTRO_MS + 400;
    const interacting = now - lastInteraction < 2200;
    if (!paused || introRunning || interacting || quiet < QUIET_FRAMES) {
      frame = requestAnimationFrame(tick);
    } else {
      last = 0;
    }
  }

  function toWorld(x: number, y: number, out: Vector3) {
    out.set((x / width) * 2 * halfW - halfW, halfH - (y / height) * 2 * halfH, 0);
    return out;
  }

  /* ---------------- start ---------------- */

  function resize(w: number, h: number) {
    width = Math.max(1, w);
    height = Math.max(1, h);
    const dpr = Math.min(window.devicePixelRatio || 1, narrowLayout ? 1.5 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    buildSpine(bodies.length > 0);
    if (still) {
      settle();
      writeInstances();
      if (started) render();
      return;
    }
    lastInteraction = performance.now();
    schedule();
  }

  let started = false;
  const rect = canvas.getBoundingClientRect();
  visible = false; // no frames until the shaders are ready
  resize(rect.width, rect.height);
  writeInstances();
  await yieldToMain();
  // KHR_parallel_shader_compile where available: the compile does not block the main thread.
  await renderer.compileAsync(scene, camera);
  if (disposed) return noop;
  started = true;
  visible = true;
  if (!still) introStart = performance.now();
  writeInstances();
  render();
  schedule();

  return {
    pointer(x, y) {
      if (still) return;
      if (x === null) {
        pointerActive = false;
        return;
      }
      toWorld(x, y, pointerWorld);
      if (!pointerActive) pointerPrev.copy(pointerWorld);
      pointerActive = true;
      pointerFresh = true;
      lastInteraction = performance.now();
      schedule();
    },
    shock(x, y) {
      if (still) return;
      toWorld(x, y, tmpD);
      for (const body of bodies) {
        tmpA.subVectors(body.p, tmpD);
        tmpA.z *= 0.4;
        const dist = tmpA.length();
        if (dist > SHOCK_RADIUS || dist < 1e-5) continue;
        const falloff = (1 - dist / SHOCK_RADIUS) ** 2;
        body.v.addScaledVector(tmpA.divideScalar(dist), SHOCK * falloff);
        body.w.x += (Math.sin(body.u * 91.7) * 8) * falloff;
        body.w.y += (Math.cos(body.u * 57.3) * 8) * falloff;
      }
      lastInteraction = performance.now();
      schedule();
    },
    setPaused(next) {
      if (still) return;
      paused = next;
      schedule();
    },
    setScroll(progress) {
      if (still) return;
      const next = Math.min(1, Math.max(0, progress));
      if (Math.abs(next - scroll) < 0.001) return;
      scroll = next;
      lastInteraction = performance.now();
      schedule();
    },
    setVisible(next) {
      visible = next;
      if (visible) schedule();
      else if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
        last = 0;
      }
    },
    setNarrow(next) {
      if (next === narrowLayout) return;
      narrowLayout = next;
      resize(width, height);
    },
    resize,
    dispose() {
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      for (const mesh of meshes) {
        scene.remove(mesh);
        mesh.dispose();
      }
      geometry.dispose();
      materials.forEach((material) => material.dispose());
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
