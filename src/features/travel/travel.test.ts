import { describe, expect, it } from "vitest";
import {
  CONTINENT_BY_RAW_NAME,
  VISITED_ALPHA2_CODES,
} from "./data/travel-data";
import {
  findCountryAtLatLon,
  latLonToVector3,
  loadWorldDataset,
  searchCountries,
  vector3ToLatLon,
} from "./model/world-data";

describe("travel world dataset", () => {
  const dataset = loadWorldDataset();

  it("marks all 23 visited countries with unique keys", () => {
    expect(dataset.visitedCountries).toHaveLength(VISITED_ALPHA2_CODES.length);
    const visitedCodes = dataset.visitedCountries
      .map((country) => country.isoAlpha2?.toLowerCase())
      .sort();
    expect(visitedCodes).toEqual([...VISITED_ALPHA2_CODES].sort());

    const keys = new Set(dataset.countries.map((country) => country.key));
    expect(keys.size).toBe(dataset.countries.length);
  });

  it("does not leak Australia's visited status to Ashmore and Cartier Is.", () => {
    const ashmore = dataset.countries.find(
      (country) => country.rawName === "Ashmore and Cartier Is.",
    );
    const australia = dataset.countries.find(
      (country) => country.name === "Australia",
    );
    expect(australia?.visited).toBe(true);
    expect(ashmore?.visited).toBe(false);
  });

  it("maps every Natural Earth feature to an explicit continent", () => {
    const unmapped = dataset.countries.filter(
      (country) => !(country.rawName in CONTINENT_BY_RAW_NAME),
    );
    expect(unmapped).toEqual([]);
  });

  it("computes accurate travel statistics across continents", () => {
    expect(dataset.stats.visitedCount).toBe(23);
    expect(dataset.stats.visitedContinents).toBe(5);
    expect(dataset.stats.totalInhabitedContinents).toBe(6);

    const byName = Object.fromEntries(
      dataset.stats.byContinent.map((entry) => [
        entry.continent,
        entry.visited,
      ]),
    );
    expect(byName).toEqual({
      Europe: 18,
      Asia: 1,
      Africa: 2,
      "North America": 1,
      "South America": 0,
      Oceania: 1,
    });
  });

  it("flags San Marino and Vatican City as visited microstates", () => {
    const sanMarino = dataset.countries.find(
      (country) => country.name === "San Marino",
    );
    const vatican = dataset.countries.find(
      (country) => country.name === "Vatican City",
    );
    expect(sanMarino?.visited).toBe(true);
    expect(sanMarino?.microstate).toBe(true);
    expect(vatican?.visited).toBe(true);
    expect(vatican?.microstate).toBe(true);
  });
});

describe("travel country search", () => {
  const { countries } = loadWorldDataset();

  it("finds countries by display name, alias, ISO code, and continent", () => {
    expect(searchCountries(countries, "USA")[0]?.name).toBe("United States");
    expect(searchCountries(countries, "UK")[0]?.name).toBe("United Kingdom");
    expect(searchCountries(countries, "Czech Republic")[0]?.name).toBe(
      "Czechia",
    );
    expect(searchCountries(countries, "Vatican")[0]?.name).toBe("Vatican City");
    expect(searchCountries(countries, "Giappone")[0]?.name).toBe("Japan");
    expect(searchCountries(countries, "brasile")[0]?.name).toBe("Brazil");
  });

  it("supports filtering by visited status and continent", () => {
    const visitedAfrica = searchCountries(countries, "", "visited", "Africa");
    expect(visitedAfrica.map((country) => country.name)).toEqual([
      "Morocco",
      "South Africa",
    ]);

    const visitedOnly = searchCountries(countries, "bra", "visited");
    expect(visitedOnly).toEqual([]);

    const allCountries = searchCountries(countries, "bra", "all");
    expect(allCountries.some((country) => country.name === "Brazil")).toBe(
      true,
    );
  });
});

describe("globe coordinate math & country picking", () => {
  const { countries } = loadWorldDataset();

  it.each([
    { lat: 0, lon: 0 },
    { lat: 41.9, lon: 12.45 },
    { lat: 35.68, lon: 139.69 },
    { lat: 40.71, lon: -74.01 },
    { lat: -33.87, lon: 151.21 },
    { lat: -33.92, lon: 18.42 },
  ])(
    "round-trips lat/lon through Three.js sphere coordinates: %o",
    ({ lat, lon }) => {
      const vec = latLonToVector3(lat, lon, 2.5);
      const back = vector3ToLatLon(vec.x, vec.y, vec.z);
      expect(back.lat).toBeCloseTo(lat, 5);
      expect(back.lon).toBeCloseTo(lon, 5);
    },
  );

  it("aligns prime meridian and hemispheres with Three.js SphereGeometry", () => {
    const prime = latLonToVector3(0, 0, 1);
    expect(prime.x).toBeCloseTo(1, 5);
    expect(prime.y).toBeCloseTo(0, 5);
    expect(prime.z).toBeCloseTo(0, 5);

    const east = latLonToVector3(0, 90, 1);
    expect(east.x).toBeCloseTo(0, 5);
    expect(east.z).toBeCloseTo(-1, 5);

    const west = latLonToVector3(0, -90, 1);
    expect(west.x).toBeCloseTo(0, 5);
    expect(west.z).toBeCloseTo(1, 5);
  });

  it("picks countries and microstates accurately from globe coordinates", () => {
    expect(findCountryAtLatLon(countries, 43.9424, 12.4578)?.name).toBe(
      "San Marino",
    );
    expect(findCountryAtLatLon(countries, 41.9029, 12.4534)?.name).toBe(
      "Vatican City",
    );
    expect(findCountryAtLatLon(countries, 45.4642, 9.19)?.name).toBe("Italy");
    expect(findCountryAtLatLon(countries, 35.6762, 139.6503)?.name).toBe(
      "Japan",
    );
    expect(findCountryAtLatLon(countries, -25.2744, 133.7751)?.name).toBe(
      "Australia",
    );
    expect(findCountryAtLatLon(countries, -30.5595, 22.9375)?.name).toBe(
      "South Africa",
    );
    expect(findCountryAtLatLon(countries, 39.8283, -98.5795)?.name).toBe(
      "United States",
    );
    expect(findCountryAtLatLon(countries, 0, -140)).toBeNull();
  });
});
