import type { CountryRecord, Ring } from "../model/world-data";

export interface GlobeTexturePalette {
  oceanTop: string;
  oceanMid: string;
  oceanBottom: string;
  graticule: string;
  landFill: string;
  landStroke: string;
  visitedFill: string;
  visitedStroke: string;
  selectedVisitedFill: string;
  selectedUnvisitedFill: string;
  selectedStroke: string;
  hoverFill: string;
  hoverStroke: string;
}

const XMB_PALETTE: GlobeTexturePalette = {
  oceanTop: "#051436",
  oceanMid: "#082258",
  oceanBottom: "#04112e",
  graticule: "rgba(130, 180, 255, 0.085)",
  landFill: "#1a3c78",
  landStroke: "rgba(132, 182, 255, 0.38)",
  visitedFill: "#20d6a0",
  visitedStroke: "rgba(176, 255, 232, 0.9)",
  selectedVisitedFill: "#64ffd4",
  selectedUnvisitedFill: "#5c9cff",
  selectedStroke: "rgba(240, 250, 255, 0.96)",
  hoverFill: "rgba(190, 224, 255, 0.36)",
  hoverStroke: "rgba(230, 245, 255, 0.75)",
};

function traceRing(
  ctx: CanvasRenderingContext2D,
  ring: Ring,
  width: number,
  height: number,
) {
  if (ring.length < 2) return;
  let prevLon = ring[0][0];
  ctx.moveTo(
    ((prevLon + 180) / 360) * width,
    ((90 - ring[0][1]) / 180) * height,
  );

  for (let i = 1; i < ring.length; i++) {
    const [lon, lat] = ring[i];
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    // Avoid drawing horizontal streaks across the antimeridian seam.
    if (Math.abs(lon - prevLon) > 180) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
    prevLon = lon;
  }
}

function drawCountry(
  ctx: CanvasRenderingContext2D,
  country: CountryRecord,
  width: number,
  height: number,
  fillStyle: string,
  strokeStyle: string,
  lineWidth: number,
) {
  ctx.beginPath();
  for (const polygon of country.polygons) {
    for (const ring of polygon.rings) {
      traceRing(ctx, ring, width, height);
    }
  }
  ctx.fillStyle = fillStyle;
  ctx.fill("evenodd");
  if (lineWidth > 0) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.lineJoin = "round";
    ctx.stroke();
  }
}

export interface DynamicGlobeTextures {
  colorCanvas: HTMLCanvasElement;
  specularCanvas: HTMLCanvasElement;
  updateHighlight: (
    selected: CountryRecord | null,
    hovered: CountryRecord | null,
  ) => void;
}

export function createGlobeTextures(
  countries: readonly CountryRecord[],
  width: number,
  height: number,
): DynamicGlobeTextures {
  const baseCanvas = document.createElement("canvas");
  baseCanvas.width = width;
  baseCanvas.height = height;
  const baseCtx = baseCanvas.getContext("2d");

  const colorCanvas = document.createElement("canvas");
  colorCanvas.width = width;
  colorCanvas.height = height;
  const colorCtx = colorCanvas.getContext("2d");

  const specularCanvas = document.createElement("canvas");
  specularCanvas.width = Math.round(width / 2);
  specularCanvas.height = Math.round(height / 2);
  const specCtx = specularCanvas.getContext("2d");

  if (baseCtx) {
    // Deep cobalt XMB ocean backdrop.
    const oceanGradient = baseCtx.createLinearGradient(0, 0, 0, height);
    oceanGradient.addColorStop(0, XMB_PALETTE.oceanTop);
    oceanGradient.addColorStop(0.5, XMB_PALETTE.oceanMid);
    oceanGradient.addColorStop(1, XMB_PALETTE.oceanBottom);
    baseCtx.fillStyle = oceanGradient;
    baseCtx.fillRect(0, 0, width, height);

    // Subtle scientific graticule grid (every 15 degrees).
    baseCtx.strokeStyle = XMB_PALETTE.graticule;
    baseCtx.lineWidth = Math.max(1, width / 2048);
    baseCtx.beginPath();
    for (let lon = -165; lon <= 180; lon += 15) {
      const x = ((lon + 180) / 360) * width;
      baseCtx.moveTo(x, 0);
      baseCtx.lineTo(x, height);
    }
    for (let lat = -75; lat <= 75; lat += 15) {
      const y = ((90 - lat) / 180) * height;
      baseCtx.moveTo(0, y);
      baseCtx.lineTo(width, y);
    }
    baseCtx.stroke();

    // Slightly brighter equator accent.
    baseCtx.strokeStyle = "rgba(155, 200, 255, 0.14)";
    baseCtx.beginPath();
    baseCtx.moveTo(0, height * 0.5);
    baseCtx.lineTo(width, height * 0.5);
    baseCtx.stroke();

    const baseStroke = Math.max(0.9, width / 2400);
    const visitedStroke = Math.max(1.4, width / 1700);

    // Draw unvisited countries first.
    for (const country of countries) {
      if (country.visited) continue;
      drawCountry(
        baseCtx,
        country,
        width,
        height,
        XMB_PALETTE.landFill,
        XMB_PALETTE.landStroke,
        baseStroke,
      );
    }

    // Draw visited countries with soft luminous glow.
    baseCtx.save();
    baseCtx.shadowColor = "rgba(58, 255, 198, 0.55)";
    baseCtx.shadowBlur = Math.max(6, width / 320);
    for (const country of countries) {
      if (!country.visited) continue;
      drawCountry(
        baseCtx,
        country,
        width,
        height,
        XMB_PALETTE.visitedFill,
        XMB_PALETTE.visitedStroke,
        visitedStroke,
      );
    }
    baseCtx.restore();
  }

  // Ocean specular map: oceans glossy (medium-bright), land softly matte.
  if (specCtx) {
    const sw = specularCanvas.width;
    const sh = specularCanvas.height;
    specCtx.fillStyle = "#888888";
    specCtx.fillRect(0, 0, sw, sh);
    for (const country of countries) {
      drawCountry(
        specCtx,
        country,
        sw,
        sh,
        country.visited ? "#383838" : "#1c1c1c",
        "#1c1c1c",
        0,
      );
    }
  }

  const updateHighlight = (
    selected: CountryRecord | null,
    hovered: CountryRecord | null,
  ) => {
    if (!colorCtx) return;
    colorCtx.clearRect(0, 0, width, height);
    colorCtx.drawImage(baseCanvas, 0, 0);

    if (hovered && hovered.key !== selected?.key) {
      drawCountry(
        colorCtx,
        hovered,
        width,
        height,
        XMB_PALETTE.hoverFill,
        XMB_PALETTE.hoverStroke,
        Math.max(1.5, width / 1600),
      );
    }

    if (selected) {
      colorCtx.save();
      colorCtx.shadowColor = selected.visited
        ? "rgba(130, 255, 224, 0.85)"
        : "rgba(145, 200, 255, 0.85)";
      colorCtx.shadowBlur = Math.max(10, width / 220);
      drawCountry(
        colorCtx,
        selected,
        width,
        height,
        selected.visited
          ? XMB_PALETTE.selectedVisitedFill
          : XMB_PALETTE.selectedUnvisitedFill,
        XMB_PALETTE.selectedStroke,
        Math.max(2, width / 1200),
      );
      colorCtx.restore();
    }
  };

  updateHighlight(null, null);

  return {
    colorCanvas,
    specularCanvas,
    updateHighlight,
  };
}
