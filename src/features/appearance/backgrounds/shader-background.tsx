import { useEffect, useRef } from "react";
import type { BackgroundProps } from "./background-types";

interface ShaderBackgroundProps extends BackgroundProps {
  fragmentShader: string;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/** Shared lifecycle for shader themes; the theme host provides the CSS fallback. */
export default function ShaderBackground({
  reducedMotion,
  startingUp,
  fragmentShader,
}: ShaderBackgroundProps) {
  const startupRef = useRef(startingUp);
  useEffect(() => {
    startupRef.current = startingUp;
  }, [startingUp]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let disposeScene: (() => void) | undefined;

    void import("three")
      .then((THREE) => {
        if (disposed) return;

        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: "low-power",
          });
        } catch {
          // Browsers without WebGL keep the static CSS treatment.
          return;
        }

        const canvas = renderer.domElement;
        canvas.className = "background-canvas";
        canvas.setAttribute("aria-hidden", "true");
        container.appendChild(canvas);

        const scene = new THREE.Scene();
        const camera = new THREE.Camera();
        const geometry = new THREE.PlaneGeometry(2, 2);
        const uniforms = {
          uTime: { value: 12 },
          uAspect: { value: 1 },
          uBoot: { value: startupRef.current && !reducedMotion ? 1 : 0 },
        };
        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
          depthTest: false,
          depthWrite: false,
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
          if (disposed || contextLost || document.hidden || reducedMotion)
            return;
          const delta = previousTime
            ? Math.min((timestamp - previousTime) / 1000, 0.05)
            : 0;
          elapsed += delta;
          previousTime = timestamp;
          const target = startupRef.current ? 1 : 0;
          uniforms.uBoot.value +=
            (target - uniforms.uBoot.value) * (1 - Math.exp(-delta * 3.4));
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
          renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, pixelCap),
          );
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
          canvas.style.visibility = "hidden";
          stop();
        };

        const onContextRestored = () => {
          contextLost = false;
          canvas.style.visibility = "";
          resize();
          start();
        };

        const resizeObserver = new ResizeObserver(resize);
        resizeObserver.observe(container);
        document.addEventListener("visibilitychange", onVisibilityChange);
        canvas.addEventListener("webglcontextlost", onContextLost);
        canvas.addEventListener("webglcontextrestored", onContextRestored);
        resize();
        start();

        disposeScene = () => {
          stop();
          resizeObserver.disconnect();
          document.removeEventListener("visibilitychange", onVisibilityChange);
          canvas.removeEventListener("webglcontextlost", onContextLost);
          canvas.removeEventListener("webglcontextrestored", onContextRestored);
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.forceContextLoss();
          canvas.remove();
        };
      })
      .catch(() => {
        // Offline chunk failures do not affect navigation or portfolio content.
      });

    return () => {
      disposed = true;
      disposeScene?.();
    };
  }, [reducedMotion, fragmentShader]);

  return (
    <div ref={containerRef} className="shader-background" aria-hidden="true" />
  );
}
