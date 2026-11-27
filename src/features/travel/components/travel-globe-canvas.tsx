import { useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Ref } from "react";
import type { CountryRecord, WorldDataset } from "../model/world-data";
import {
  createGlobeScene,
  type GlobeSceneController,
  type HoverPayload,
} from "../rendering/globe-scene";

export interface TravelGlobeCanvasHandle {
  flyToCountry: (country: CountryRecord) => void;
  resetView: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

interface TravelGlobeCanvasProps {
  ref?: Ref<TravelGlobeCanvasHandle>;
  dataset: WorldDataset;
  selectedCountry: CountryRecord | null;
  reducedMotion: boolean;
  autoRotate: boolean;
  onSelectCountry: (country: CountryRecord | null) => void;
  onUserInteract: () => void;
  onWebGLError: () => void;
}

export default function TravelGlobeCanvas({
  ref,
  dataset,
  selectedCountry,
  reducedMotion,
  autoRotate,
  onSelectCountry,
  onUserInteract,
  onWebGLError,
}: TravelGlobeCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<GlobeSceneController | null>(null);
  const callbacksRef = useRef({
    onSelectCountry,
    onUserInteract,
    onWebGLError,
  });
  const [hover, setHover] = useState<HoverPayload | null>(null);

  useEffect(() => {
    callbacksRef.current = {
      onSelectCountry,
      onUserInteract,
      onWebGLError,
    };
  }, [onSelectCountry, onUserInteract, onWebGLError]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const controller = createGlobeScene(
      container,
      dataset,
      reducedMotion,
      autoRotate,
      {
        onSelectCountry: (country) =>
          callbacksRef.current.onSelectCountry(country),
        onHoverCountry: setHover,
        onInteractionStart: () => callbacksRef.current.onUserInteract(),
        onWebGLError: () => callbacksRef.current.onWebGLError(),
      },
    );
    controllerRef.current = controller;

    return () => {
      controller?.dispose();
      controllerRef.current = null;
    };
    // Initialize the WebGL scene once per dataset lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset]);

  useEffect(() => {
    controllerRef.current?.setSelectedCountry(selectedCountry, true);
  }, [selectedCountry]);

  useEffect(() => {
    controllerRef.current?.setAutoRotate(autoRotate);
  }, [autoRotate]);

  useEffect(() => {
    controllerRef.current?.setReducedMotion(reducedMotion);
  }, [reducedMotion]);

  useImperativeHandle(
    ref,
    () => ({
      flyToCountry(country) {
        controllerRef.current?.flyToCountry(country);
      },
      resetView() {
        controllerRef.current?.resetView();
      },
      zoomIn() {
        controllerRef.current?.zoomBy(0.76);
      },
      zoomOut() {
        controllerRef.current?.zoomBy(1.32);
      },
    }),
    [],
  );

  return (
    <div ref={containerRef} className="travel-globe-stage-inner">
      {hover ? (
        <div
          className="travel-globe-tooltip"
          style={{
            transform: `translate(${Math.round(hover.x + 16)}px, ${Math.round(hover.y - 16)}px)`,
          }}
          aria-hidden="true"
        >
          <span
            className={`travel-status-dot ${hover.country.visited ? "visited" : ""}`}
          />
          <span className="travel-tooltip-name">{hover.country.name}</span>
          <span className="travel-tooltip-meta">
            {hover.country.visited ? "Visited" : hover.country.continent}
          </span>
        </div>
      ) : null}
    </div>
  );
}
