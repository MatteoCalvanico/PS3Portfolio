import { feature, mesh } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import countriesTopology from "world-atlas/countries-50m.json";
import {
  CONTINENT_BY_RAW_NAME,
  DISPLAY_NAME_OVERRIDES,
  FOCUS_OVERRIDES,
  INHABITED_CONTINENTS,
  MICROSTATE_NUMERIC_IDS,
  SEARCH_ALIASES,
  VISITED_EXCLUDED_RAW_NAMES,
  VISITED_NUMERIC_TO_ALPHA2,
  type Continent,
} from "../data/travel-data";

export type LngLat = readonly [lon: number, lat: number];
export type Ring = readonly LngLat[];
export type PolygonCoords = readonly Ring[];

export interface BoundingBox {
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
}

export interface CountryPolygon {
  rings: PolygonCoords;
  bbox: BoundingBox;
}

export interface CountryRecord {
  key: string;
  isoNumeric: string | null;
  isoAlpha2: string | null;
  name: string;
  rawName: string;
  continent: Continent;
  visited: boolean;
  microstate: boolean;
  lat: number;
  lon: number;
  zoomDistance: number;
  aliases: readonly string[];
  searchTokens: string;
  polygons: readonly CountryPolygon[];
}

export interface ContinentStat {
  continent: Continent;
  visited: number;
  total: number;
}

export interface TravelStats {
  visitedCount: number;
  totalCount: number;
  worldPercentage: number;
  visitedContinents: number;
  totalInhabitedContinents: number;
  byContinent: readonly ContinentStat[];
}

export interface WorldDataset {
  countries: readonly CountryRecord[];
  visitedCountries: readonly CountryRecord[];
  borders: readonly (readonly LngLat[])[];
  stats: TravelStats;
}

interface CountryProps {
  name?: string;
}

type WorldTopology = Topology<{
  countries: GeometryCollection<CountryProps>;
}>;

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

export function latLonToVector3(
  lat: number,
  lon: number,
  radius = 1,
): { x: number; y: number; z: number } {
  const phi = (90 - lat) * DEG2RAD;
  const theta = (lon + 180) * DEG2RAD;
  const sinPhi = Math.sin(phi);
  return {
    x: -radius * Math.cos(theta) * sinPhi,
    y: radius * Math.cos(phi),
    z: radius * Math.sin(theta) * sinPhi,
  };
}

export function vector3ToLatLon(
  x: number,
  y: number,
  z: number,
): { lat: number; lon: number } {
  const radius = Math.hypot(x, y, z);
  if (radius === 0) return { lat: 0, lon: 0 };
  const clampedY = Math.max(-1, Math.min(1, y / radius));
  const lat = Math.asin(clampedY) * RAD2DEG;
  const lon = Math.atan2(-z, x) * RAD2DEG;
  return { lat, lon };
}

export function formatCoordinates(lat: number, lon: number): string {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lon >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(2)}° ${ns}, ${Math.abs(lon).toFixed(2)}° ${ew}`;
}

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function slugify(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function ringBoundsAndArea(ring: Ring): {
  bbox: BoundingBox;
  area: number;
  centroidLat: number;
  centroidLon: number;
} {
  let minLon = Infinity;
  let minLat = Infinity;
  let maxLon = -Infinity;
  let maxLat = -Infinity;
  let signedArea = 0;
  let cx = 0;
  let cy = 0;

  for (let i = 0; i < ring.length; i++) {
    const [lon, lat] = ring[i];
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;

    const [nextLon, nextLat] = ring[(i + 1) % ring.length];
    const cross = lon * nextLat - nextLon * lat;
    signedArea += cross;
    cx += (lon + nextLon) * cross;
    cy += (lat + nextLat) * cross;
  }

  const area = Math.abs(signedArea) * 0.5;
  if (Math.abs(signedArea) > 1e-8) {
    return {
      bbox: { minLon, minLat, maxLon, maxLat },
      area,
      centroidLon: cx / (3 * signedArea),
      centroidLat: cy / (3 * signedArea),
    };
  }

  return {
    bbox: { minLon, minLat, maxLon, maxLat },
    area,
    centroidLon: (minLon + maxLon) * 0.5,
    centroidLat: (minLat + maxLat) * 0.5,
  };
}

function computeZoomDistance(maxSpanDeg: number, microstate: boolean): number {
  if (microstate) return 1.58;
  if (maxSpanDeg < 3) return 1.72;
  if (maxSpanDeg < 8) return 1.92;
  if (maxSpanDeg < 18) return 2.15;
  if (maxSpanDeg < 35) return 2.4;
  return 2.75;
}

function pointInRing(lon: number, lat: number, ring: Ring): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    // Skip antimeridian wrap edges so they don't create phantom crossings.
    if (Math.abs(xi - xj) > 180) continue;

    const intersects =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInPolygon(
  lon: number,
  lat: number,
  polygon: CountryPolygon,
): boolean {
  const { bbox, rings } = polygon;
  if (
    lat < bbox.minLat ||
    lat > bbox.maxLat ||
    lon < bbox.minLon ||
    lon > bbox.maxLon
  ) {
    return false;
  }
  if (!rings.length || !pointInRing(lon, lat, rings[0])) return false;
  for (let i = 1; i < rings.length; i++) {
    if (pointInRing(lon, lat, rings[i])) return false;
  }
  return true;
}

export function angularDistanceDeg(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const p1 = lat1 * DEG2RAD;
  const p2 = lat2 * DEG2RAD;
  const dp = (lat2 - lat1) * DEG2RAD;
  const dl = (lon2 - lon1) * DEG2RAD;
  const a =
    Math.sin(dp * 0.5) ** 2 +
    Math.cos(p1) * Math.cos(p2) * Math.sin(dl * 0.5) ** 2;
  return 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a))) * RAD2DEG;
}

export function findCountryAtLatLon(
  countries: readonly CountryRecord[],
  lat: number,
  lon: number,
  microstateToleranceDeg = 0.75,
): CountryRecord | null {
  // Prioritize microstates (e.g. San Marino and Vatican City inside Italy)
  // so clicking their luminous markers selects them instead of the enclosing country.
  let closestMicrostate: CountryRecord | null = null;
  let closestDistance = microstateToleranceDeg;

  for (const country of countries) {
    if (!country.microstate) continue;
    const distance = angularDistanceDeg(lat, lon, country.lat, country.lon);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestMicrostate = country;
    }
  }
  if (closestMicrostate) return closestMicrostate;

  for (const country of countries) {
    for (const polygon of country.polygons) {
      if (pointInPolygon(lon, lat, polygon)) {
        return country;
      }
    }
  }

  return null;
}

export function computeTravelStats(
  countries: readonly CountryRecord[],
): TravelStats {
  const totalCount = countries.length;
  const visitedCount = countries.reduce(
    (sum, country) => sum + (country.visited ? 1 : 0),
    0,
  );
  const byContinent: ContinentStat[] = INHABITED_CONTINENTS.map((continent) => {
    let visited = 0;
    let total = 0;
    for (const country of countries) {
      if (country.continent !== continent) continue;
      total++;
      if (country.visited) visited++;
    }
    return { continent, visited, total };
  });

  const visitedContinents = byContinent.filter(
    (entry) => entry.visited > 0,
  ).length;

  return {
    visitedCount,
    totalCount,
    worldPercentage:
      totalCount > 0 ? Math.round((visitedCount / totalCount) * 100) : 0,
    visitedContinents,
    totalInhabitedContinents: INHABITED_CONTINENTS.length,
    byContinent,
  };
}

export type CountryFilter = "all" | "visited" | "unvisited";

export function searchCountries(
  countries: readonly CountryRecord[],
  query: string,
  filter: CountryFilter = "all",
  continent: Continent | "all" = "all",
): CountryRecord[] {
  const normalized = normalizeText(query);

  const filtered = countries.filter((country) => {
    if (filter === "visited" && !country.visited) return false;
    if (filter === "unvisited" && country.visited) return false;
    if (continent !== "all" && country.continent !== continent) return false;
    if (!normalized) return true;
    return country.searchTokens.includes(normalized);
  });

  if (!normalized) {
    return filtered.sort((a, b) => {
      if (a.visited !== b.visited) return a.visited ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  return filtered.sort((a, b) => {
    const score = (country: CountryRecord): number => {
      const name = normalizeText(country.name);
      if (name === normalized) return 0;
      if (country.isoAlpha2 && normalizeText(country.isoAlpha2) === normalized)
        return 1;
      if (country.aliases.some((alias) => normalizeText(alias) === normalized))
        return 2;
      if (name.startsWith(normalized)) return country.visited ? 3 : 4;
      if (
        country.aliases.some((alias) =>
          normalizeText(alias).startsWith(normalized),
        )
      ) {
        return country.visited ? 5 : 6;
      }
      return country.visited ? 7 : 8;
    };

    const diff = score(a) - score(b);
    return diff !== 0 ? diff : a.name.localeCompare(b.name);
  });
}

let cachedDataset: WorldDataset | null = null;

export function buildWorldDataset(
  topology: WorldTopology = countriesTopology as unknown as WorldTopology,
): WorldDataset {
  const collection = feature(topology, topology.objects.countries);
  const borderMesh = mesh(topology, topology.objects.countries);
  const seenKeys = new Set<string>();
  const countries: CountryRecord[] = [];

  for (const item of collection.features) {
    const rawName = item.properties?.name?.trim() || "Unknown";
    const isoNumeric =
      item.id !== undefined && item.id !== null
        ? String(item.id).padStart(3, "0")
        : null;
    const isExcludedDuplicate = VISITED_EXCLUDED_RAW_NAMES.has(rawName);
    const isoAlpha2 =
      isoNumeric && !isExcludedDuplicate
        ? (VISITED_NUMERIC_TO_ALPHA2[isoNumeric] ?? null)
        : null;
    const visited = Boolean(isoAlpha2);
    const microstate = Boolean(
      isoNumeric &&
      !isExcludedDuplicate &&
      MICROSTATE_NUMERIC_IDS.has(isoNumeric),
    );
    const name = DISPLAY_NAME_OVERRIDES[rawName] ?? rawName;
    const continent = CONTINENT_BY_RAW_NAME[rawName] ?? "Europe";

    const rawPolygons: PolygonCoords[] =
      item.geometry?.type === "Polygon"
        ? [item.geometry.coordinates as unknown as PolygonCoords]
        : item.geometry?.type === "MultiPolygon"
          ? (item.geometry.coordinates as unknown as PolygonCoords[])
          : [];

    const polygons: CountryPolygon[] = [];
    let bestArea = -1;
    let bestLat = 0;
    let bestLon = 0;
    let bestSpan = 10;

    for (const rings of rawPolygons) {
      if (!rings.length) continue;
      const stats = ringBoundsAndArea(rings[0]);
      polygons.push({ rings, bbox: stats.bbox });
      if (stats.area > bestArea) {
        bestArea = stats.area;
        bestLat = stats.centroidLat;
        bestLon = stats.centroidLon;
        bestSpan = Math.max(
          stats.bbox.maxLon - stats.bbox.minLon,
          stats.bbox.maxLat - stats.bbox.minLat,
        );
      }
    }

    const focusOverride =
      isoNumeric && !isExcludedDuplicate
        ? FOCUS_OVERRIDES[isoNumeric]
        : undefined;
    const lat = focusOverride ? focusOverride.lat : bestLat;
    const lon = focusOverride ? focusOverride.lon : bestLon;
    const zoomDistance =
      focusOverride?.distance ?? computeZoomDistance(bestSpan, microstate);

    let key =
      isoNumeric && !isExcludedDuplicate
        ? `iso-${isoNumeric}`
        : `region-${slugify(rawName)}`;
    if (seenKeys.has(key)) {
      key = `${key}-${slugify(rawName)}`;
    }
    seenKeys.add(key);

    const aliases =
      isoNumeric && !isExcludedDuplicate
        ? (SEARCH_ALIASES[isoNumeric] ?? [])
        : [];
    const searchTokens = normalizeText(
      [name, rawName, isoAlpha2 ?? "", continent, ...aliases].join(" "),
    );

    countries.push({
      key,
      isoNumeric: isExcludedDuplicate ? null : isoNumeric,
      isoAlpha2,
      name,
      rawName,
      continent,
      visited,
      microstate,
      lat,
      lon,
      zoomDistance,
      aliases,
      searchTokens,
      polygons,
    });
  }

  countries.sort((a, b) => a.name.localeCompare(b.name));
  const visitedCountries = countries.filter((country) => country.visited);
  const stats = computeTravelStats(countries);
  const borders = (borderMesh.coordinates ?? []) as unknown as LngLat[][];

  return {
    countries,
    visitedCountries,
    borders,
    stats,
  };
}

export function loadWorldDataset(): WorldDataset {
  if (!cachedDataset) {
    cachedDataset = buildWorldDataset();
  }
  return cachedDataset;
}
