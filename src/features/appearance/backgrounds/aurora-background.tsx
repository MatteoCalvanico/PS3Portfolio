import type { BackgroundProps } from "./background-types";
import ShaderBackground from "./shader-background";

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uAspect;
  uniform float uBoot;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.09;
    vec3 color = mix(vec3(0.008, 0.016, 0.055), vec3(0.025, 0.055, 0.11), uv.y);

    // Curtains have distinct folds and colors, with a quiet dark area for the menu.
    for (int i = 0; i < 3; i++) {
      float f = float(i);
      float x = uv.x * min(uAspect, 2.2);
      float fold = 0.60 + f * 0.065
        + 0.09 * sin(x * 2.8 + t + f * 1.6)
        + 0.035 * sin(x * 7.0 - t * 0.6 + f);
      fold += uBoot * 0.10;
      float distanceToFold = uv.y - fold;
      float curtain = exp(-abs(distanceToFold) * 13.0)
        * smoothstep(-0.015, 0.15, distanceToFold);
      float threads = 0.65 + 0.35 * sin(x * 63.0 + sin(x * 8.0 + t) * 3.0 + f);
      float envelope = pow(max(sin(uv.x * 3.14159265), 0.0), 0.6);
      vec3 tint = mix(vec3(0.04, 0.55, 0.38), vec3(0.37, 0.12, 0.60), f * 0.5);
      color += tint * curtain * threads * envelope * 0.75;
    }

    // Sparse stars belong to this theme alone.
    vec2 grid = uv * vec2(150.0 * uAspect, 150.0);
    vec2 cell = floor(grid);
    float seed = hash(cell);
    float star = 1.0 - smoothstep(0.02, 0.12, length(fract(grid) - 0.5));
    star *= step(0.992, seed) * smoothstep(0.48, 0.90, uv.y);
    color += vec3(0.60, 0.73, 0.85) * star * (0.65 + 0.15 * sin(t + seed * 30.0));
    color *= 1.0 - 0.22 * uBoot;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function AuroraBackground(props: BackgroundProps) {
  return <ShaderBackground {...props} fragmentShader={fragmentShader} />;
}
