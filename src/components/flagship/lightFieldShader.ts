/**
 * GLSL for the light field: three soft crimson lights (and a trace of teal)
 * drifting around a focal point, folded by a slow domain-warped "silk" field
 * so they read as light through moving fabric rather than as blobs. The light
 * gathers behind the product (the focal point) and falls to near-black where
 * copy sits, so text never needs a scrim. GLSL ES 1.00, so it runs on WebGL1
 * as well as WebGL2; three fBm calls per pixel at half resolution.
 */

export const VERTEX_SHADER = /* glsl */ `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_pointer;   // 0..1, eased; (-1,-1) when there is no mouse
uniform vec2 u_focus;     // 0..1, where the light gathers
uniform float u_intensity;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotate = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p = rotate * p;
    amplitude *= 0.5;
  }
  return value;
}

// Set once per fragment in main(); glow() reads it to keep the lights round.
float aspect;

vec3 glow(vec2 uv, vec2 center, float radius, vec3 color) {
  vec2 d = (uv - center) * vec2(aspect, 1.0);
  return color * exp(-dot(d, d) / (radius * radius));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  aspect = u_resolution.x / u_resolution.y;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
  float t = u_time;

  // Silk: a slow domain-warped field that folds the light.
  vec2 w = vec2(fbm(p * 1.1 + vec2(0.0, t * 0.03)), fbm(p * 1.1 + vec2(4.1, -t * 0.025)));
  float silk = fbm(p * 1.5 + 2.2 * w + vec2(t * 0.012, 0.0));
  float folds = smoothstep(0.3, 0.72, silk);
  float edge = 1.0 - smoothstep(0.0, 0.05, abs(silk - 0.55));

  // Three warm lights and a trace of teal drift around the focal point on slow
  // Lissajous paths (periods of one to two minutes): the light breathes, it never loops visibly.
  vec2 f = u_focus;
  vec3 light = vec3(0.0);
  light += glow(uv, f + vec2(0.05 + 0.035 * sin(t * 0.11), 0.08 + 0.03 * cos(t * 0.09)), 0.30, vec3(0.94, 0.20, 0.31) * 0.62);
  light += glow(uv, f + vec2(-0.06 + 0.04 * cos(t * 0.07), -0.12 + 0.03 * sin(t * 0.08)), 0.55, vec3(0.50, 0.05, 0.12) * 1.0);
  light += glow(uv, f + vec2(0.17 + 0.03 * sin(t * 0.06), -0.22), 0.20, vec3(0.95, 0.38, 0.28) * 0.22);
  light += glow(uv, f + vec2(0.24, 0.3 + 0.03 * sin(t * 0.05)), 0.22, vec3(0.20, 0.94, 0.82) * 0.06);

  vec3 color = vec3(0.027, 0.027, 0.039);
  color += light * (0.35 + 0.85 * folds) + light * edge * 0.35;

  if (u_pointer.x >= 0.0) {
    color += glow(uv, u_pointer, 0.28, vec3(0.94, 0.2, 0.31)) * (0.10 + 0.12 * folds);
  }
  color *= u_intensity;

  // Soft vignette, then a dither so the dark gradients never band.
  // (smoothstep needs edge0 < edge1, so falloffs are 1.0 - smoothstep.)
  color *= 1.0 - smoothstep(0.45, 1.4, length((uv - 0.5) * vec2(1.0, 1.15)));
  color += (hash(gl_FragCoord.xy + fract(u_time)) - 0.5) * (2.0 / 255.0);

  gl_FragColor = vec4(color, 1.0);
}
`;
