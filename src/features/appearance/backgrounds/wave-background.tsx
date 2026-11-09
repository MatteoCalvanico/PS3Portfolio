import type { BackgroundProps } from "./background-types";
import ShaderBackground from "./shader-background";

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uAspect;
  uniform float uBoot;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.12;
    float boot = uBoot;

    // The classic theme is a quiet cobalt field, dark at both screen edges.
    float blueField = exp(-pow((uv.y - 0.43) / 0.39, 2.0));
    vec3 color = mix(vec3(0.008, 0.022, 0.10), vec3(0.025, 0.145, 0.43), blueField);
    float sideLight = exp(-pow((uv.x - 0.69) * min(uAspect, 1.7) / 1.15, 2.0));
    color += vec3(0.008, 0.025, 0.065) * sideLight * blueField;

    // The startup ribbon sits high, then settles into the familiar XMB position.
    color *= 1.0 - 0.32 * boot;
    color += vec3(0.015, 0.025, 0.065) * boot
      * exp(-pow((uv.y - 0.55) / 0.4, 2.0));

    // Four thin, translucent sheets turn slowly through the same broad fold.
    // Light fills their surface rather than tracing an electric sine-wave line.
    for (int i = 0; i < 4; i++) {
      float f = float(i);
      float x = uv.x;
      float drift = t * 0.34;
      float sweep = 0.35
        + 0.072 * sin(x * 3.7 + 0.55 + drift)
        + 0.030 * cos(x * 5.2 - t * 0.20 + f * 0.27);
      float startupSweep = 0.66
        + 0.060 * sin(x * 5.0 + t * 0.80)
        + 0.025 * cos(x * 7.0 - t * 0.50 + f * 0.3);
      sweep = mix(sweep, startupSweep, boot);
      float turn = 0.5 + 0.5 * sin(x * 4.1 + t * 0.28 + f * 0.52);
      float spread = (f - 1.5) * 0.018 * sin(x * 3.3 + t * 0.23 + 0.65);
      float width = 0.018 + 0.052 * turn * turn;
      width *= 1.0 + 0.60 * boot;
      spread *= 1.0 + 0.9 * boot;
      float upper = sweep + spread + width * (0.48 + 0.18 * sin(x * 2.8 + f));
      float lower = sweep + spread - width;
      float across = clamp((uv.y - lower) / (upper - lower), 0.0, 1.0);
      float sheet = smoothstep(lower - 0.008, lower + 0.010, uv.y)
        * (1.0 - smoothstep(upper - 0.008, upper + 0.007, uv.y));

      // Soft pearlescent roll-off and a broad silver-blue rim, like backlit silk.
      float satin = 0.20 + 0.52 * pow(across, 1.7)
        + 0.24 * exp(-pow((across - 0.68) / 0.24, 2.0));
      float rim = exp(-pow((uv.y - upper) / (0.0040 + f * 0.0007), 2.0));
      float underGlow = exp(-pow((uv.y - lower) / 0.013, 2.0));
      float light = (0.50 + 0.20 * sin(x * 2.5 + f * 0.72 + t * 0.15))
        * (0.72 + 0.28 * sin(x * 3.14159265));
      light *= 1.0 + 1.2 * boot;
      vec3 pearl = mix(vec3(0.24, 0.36, 0.57), vec3(0.47, 0.59, 0.73), across);
      color = mix(color, pearl, sheet * satin * light * 0.21);
      color += vec3(0.27, 0.36, 0.48) * rim * light * 0.13;
      color += vec3(0.075, 0.13, 0.22) * underGlow * light * 0.10;
    }

    float vignette = 1.0 - smoothstep(0.20, 0.82, length((uv - 0.5) * vec2(0.87, 1.0)));
    color *= 0.80 + 0.20 * vignette;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export default function WaveBackground(props: BackgroundProps) {
  return <ShaderBackground {...props} fragmentShader={fragmentShader} />;
}
