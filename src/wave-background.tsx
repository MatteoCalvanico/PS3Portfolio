import { useEffect, useRef } from 'react';

interface WaveBackgroundProps {
  reducedMotion: boolean;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uAspect;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.16;
    // A deep, uninterrupted blue field; the menu remains the foreground.
    vec3 color = mix(vec3(0.018, 0.16, 0.36), vec3(0.006, 0.030, 0.11),
                     smoothstep(0.05, 1.0, uv.y));
    vec2 lightPosition = vec2((uv.x - 0.66) * 0.78, (uv.y - 0.34) * 1.1);
    float atmosphere = exp(-dot(lightPosition, lightPosition) * 4.0);
    color += vec3(0.015, 0.085, 0.17) * atmosphere;

    // Overlapping translucent sheets, with drifting crests and feathered edges.
    // Their different phases make the folds open and close instead of moving
    // together like a stack of parallel lines.
    for (int i = 0; i < 7; i++) {
      float f = float(i);
      float x = uv.x;
      float spread = sin(x * 3.4 + t * 0.48 + f * 0.13);
      float crest = 0.355
        + 0.081 * sin(x * 4.4 - t * 0.63 + f * 0.12)
        + 0.040 * sin(x * 7.2 + t * 0.31 + f * 0.20)
        + (f - 3.0) * 0.014 * spread;
      float width = 0.026 + 0.020 * (0.5 + 0.5 * sin(x * 3.6 + f * 0.7 + t * 0.27));
      float distanceToCrest = uv.y - crest;
      float body = exp(-pow((distanceToCrest + width * 0.6) / width, 2.0));
      float edge = exp(-abs(distanceToCrest) / (0.0013 + 0.00025 * f));
      float halo = exp(-abs(distanceToCrest) / 0.016);
      float fade = 0.36 + 0.64 * pow(sin(clamp(x, 0.0, 1.0) * 3.14159265), 0.5);
      float strength = (0.52 + 0.48 * sin(f * 1.27 + 1.0)) * fade;
      color += vec3(0.075, 0.25, 0.43) * body * strength * 0.19;
      color += vec3(0.28, 0.59, 0.79) * edge * strength * 0.20;
      color += vec3(0.04, 0.17, 0.29) * halo * strength * 0.12;
    }

    // Sparse, almost still specks of light; no noisy particle cloud.
    for (int i = 0; i < 19; i++) {
      float seed = float(i) + 1.0;
      vec2 point = vec2(hash(seed), fract(hash(seed + 24.0) + uTime * 0.0015));
      vec2 delta = (uv - point) * vec2(uAspect, 1.0);
      float radius = 0.0008 + hash(seed + 61.0) * 0.0008;
      float glint = exp(-dot(delta, delta) / (radius * radius));
      float pulse = 0.35 + 0.65 * pow(0.5 + 0.5 * sin(t * 1.1 + seed), 2.0);
      color += vec3(0.36, 0.59, 0.81) * glint * pulse * 0.40;
    }

    float vignette = 1.0 - smoothstep(0.2, 0.85, length((uv - 0.5) * vec2(0.9, 1.0)));
    color *= 0.76 + 0.24 * vignette;
    gl_FragColor = vec4(color, 1.0);
  }
`;

/** Decorative only: the CSS background remains available without WebGL. */
export default function WaveBackground({ reducedMotion }: WaveBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let disposeScene: (() => void) | undefined;

    void import('three').then((THREE) => {
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
      } catch {
        // Browsers without WebGL keep the static CSS treatment.
        return;
      }

      const canvas = renderer.domElement;
      canvas.className = 'wave-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      container.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      const geometry = new THREE.PlaneGeometry(2, 2);
      const uniforms = { uTime: { value: 12 }, uAspect: { value: 1 } };
      const material = new THREE.ShaderMaterial({
        uniforms, vertexShader, fragmentShader, depthTest: false, depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.frustumCulled = false;
      scene.add(mesh);

      let frame = 0;
      let previousTime = 0;
      let elapsed = 12;
      let contextLost = false;

      const render = () => {
        if (!disposed && !contextLost) renderer.render(scene, camera);
      };

      const tick = (timestamp: number) => {
        frame = 0;
        if (disposed || contextLost || document.hidden || reducedMotion) return;
        if (previousTime) elapsed += Math.min((timestamp - previousTime) / 1000, 0.05);
        previousTime = timestamp;
        uniforms.uTime.value = elapsed;
        render();
        frame = window.requestAnimationFrame(tick);
      };

      const stop = () => {
        window.cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
      };

      const start = () => {
        if (disposed || contextLost || document.hidden) return;
        if (reducedMotion) render();
        else if (!frame) frame = window.requestAnimationFrame(tick);
      };

      const resize = () => {
        if (disposed || contextLost) return;
        const width = Math.max(container.clientWidth, 1);
        const height = Math.max(container.clientHeight, 1);
        // A softly shaded backdrop does not benefit from expensive retina pixels.
        const pixelCap = width < 768 ? 1 : 1.5;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, pixelCap));
        renderer.setSize(width, height, false);
        uniforms.uAspect.value = width / height;
        render();
      };

      const onVisibilityChange = () => {
        if (document.hidden) stop();
        else start();
      };

      const onContextLost = (event: Event) => {
        event.preventDefault();
        contextLost = true;
        canvas.style.visibility = 'hidden';
        stop();
      };

      const onContextRestored = () => {
        contextLost = false;
        canvas.style.visibility = '';
        resize();
        start();
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      document.addEventListener('visibilitychange', onVisibilityChange);
      canvas.addEventListener('webglcontextlost', onContextLost);
      canvas.addEventListener('webglcontextrestored', onContextRestored);
      resize();
      start();

      disposeScene = () => {
        stop();
        resizeObserver.disconnect();
        document.removeEventListener('visibilitychange', onVisibilityChange);
        canvas.removeEventListener('webglcontextlost', onContextLost);
        canvas.removeEventListener('webglcontextrestored', onContextRestored);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        canvas.remove();
      };
    }).catch(() => {
      // Offline chunk failures do not affect navigation or portfolio content.
    });

    return () => {
      disposed = true;
      disposeScene?.();
    };
  }, [reducedMotion]);

  return <div ref={containerRef} className="wave-background" aria-hidden="true" />;
}
