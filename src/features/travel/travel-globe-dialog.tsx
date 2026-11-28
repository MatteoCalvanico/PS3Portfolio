import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Continent } from "./data/travel-data";
import {
  formatCoordinates,
  loadWorldDataset,
  searchCountries,
  type CountryFilter,
  type CountryRecord,
} from "./model/world-data";
import TravelGlobeCanvas, {
  type TravelGlobeCanvasHandle,
} from "./components/travel-globe-canvas";
import "./travel-globe.css";

interface TravelGlobeDialogProps {
  reducedMotion: boolean;
  onClose: () => void;
}

export default function TravelGlobeDialog({
  reducedMotion,
  onClose,
}: TravelGlobeDialogProps) {
  const dataset = useMemo(() => loadWorldDataset(), []);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const canvasHandleRef = useRef<TravelGlobeCanvasHandle>(null);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CountryFilter>("visited");
  const [continentFilter, setContinentFilter] = useState<Continent | "all">(
    "all",
  );
  const [selectedCountry, setSelectedCountry] = useState<CountryRecord | null>(
    null,
  );
  const [autoRotate, setAutoRotate] = useState(() => !reducedMotion);
  const [webglFailed, setWebglFailed] = useState(false);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  // When typing a query while on the default "Visited" tab, search across all countries
  // so users can immediately locate any country on Earth.
  const effectiveFilter: CountryFilter =
    query.trim().length > 0 && filter === "visited" ? "all" : filter;

  const visibleCountries = useMemo(
    () =>
      searchCountries(
        dataset.countries,
        query,
        effectiveFilter,
        continentFilter,
      ),
    [dataset.countries, query, effectiveFilter, continentFilter],
  );

  const handleSelectCountry = useCallback((country: CountryRecord | null) => {
    setSelectedCountry((previous) => {
      if (country && previous?.key === country.key) {
        canvasHandleRef.current?.flyToCountry(country);
      }
      return country;
    });
    if (country) {
      setAutoRotate(false);
      setMobilePanelOpen(false);
    }
  }, []);

  const handleUserInteract = useCallback(() => {
    setAutoRotate(false);
  }, []);

  const handleResetView = useCallback(() => {
    setSelectedCountry(null);
    canvasHandleRef.current?.resetView();
  }, []);

  const { stats } = dataset;

  return (
    <dialog
      ref={dialogRef}
      className="travel-globe-dialog"
      aria-labelledby="travel-globe-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="travel-globe-toolbar">
        <button
          type="button"
          className="travel-globe-exit"
          onClick={onClose}
          aria-label="Back to Travel"
        >
          <span className="controller-symbol circle" aria-hidden="true">
            ○
          </span>
          Back to Travel <kbd>Esc</kbd>
        </button>

        <div className="travel-globe-heading">
          <h1 id="travel-globe-title">Travel Globe</h1>
          <p>
            {stats.visitedCount} countries visited · {stats.visitedContinents}{" "}
            continents · {stats.worldPercentage}% of the world
          </p>
        </div>

        <div className="travel-globe-actions">
          <button
            type="button"
            className="travel-panel-toggle"
            aria-expanded={mobilePanelOpen}
            onClick={() => setMobilePanelOpen((open) => !open)}
          >
            {mobilePanelOpen ? "Hide list" : "Explore"}
          </button>
          <button
            type="button"
            className="travel-action-autorotate"
            disabled={reducedMotion || webglFailed}
            aria-pressed={autoRotate && !reducedMotion}
            onClick={() => setAutoRotate((value) => !value)}
          >
            Auto-rotate
          </button>
          <button
            type="button"
            disabled={webglFailed}
            onClick={handleResetView}
          >
            Reset view
          </button>
        </div>
      </header>

      <div className="travel-globe-body">
        {mobilePanelOpen ? (
          <button
            type="button"
            className="travel-sidebar-backdrop"
            aria-label="Close country panel"
            onClick={() => setMobilePanelOpen(false)}
          />
        ) : null}
        <aside
          className={`travel-sidebar ${mobilePanelOpen ? "open" : ""}`}
          aria-label="Travel statistics and country search"
        >
          <section className="travel-stats" aria-label="Travel statistics">
            <div className="travel-stats-grid">
              <div className="travel-stat-tile">
                <span className="travel-stat-value accent">
                  {stats.visitedCount}
                </span>
                <span className="travel-stat-label">Visited</span>
              </div>
              <div className="travel-stat-tile">
                <span className="travel-stat-value">
                  {stats.visitedContinents}/{stats.totalInhabitedContinents}
                </span>
                <span className="travel-stat-label">Continents</span>
              </div>
              <div className="travel-stat-tile">
                <span className="travel-stat-value">
                  {stats.worldPercentage}%
                </span>
                <span className="travel-stat-label">World map</span>
              </div>
            </div>

            <div
              className="travel-continents"
              role="group"
              aria-label="Filter by continent"
            >
              {stats.byContinent.map((entry) => {
                const ratio =
                  entry.total > 0
                    ? Math.round((entry.visited / entry.total) * 100)
                    : 0;
                const active = continentFilter === entry.continent;
                return (
                  <button
                    key={entry.continent}
                    type="button"
                    className="travel-continent-chip"
                    aria-pressed={active}
                    onClick={() =>
                      setContinentFilter((current) =>
                        current === entry.continent ? "all" : entry.continent,
                      )
                    }
                  >
                    <span className="travel-continent-row">
                      <span className="travel-continent-name">
                        {entry.continent}
                      </span>
                      <span
                        className={`travel-continent-count ${entry.visited > 0 ? "has-visited" : ""}`}
                      >
                        {entry.visited}/{entry.total}
                      </span>
                    </span>
                    <span className="travel-continent-bar" aria-hidden="true">
                      <span
                        className="travel-continent-fill"
                        style={{ width: `${ratio}%` }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="travel-search-block">
            <div className="travel-search-field">
              <input
                type="search"
                className="travel-search-input"
                value={query}
                placeholder="Search any country (e.g. Japan, USA, Vatican)…"
                aria-label="Search countries"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={(event) => {
                  // Capture Escape while search has text so it clears the search
                  // instead of closing the entire fullscreen modal dialog.
                  if (event.key === "Escape" && query.length > 0) {
                    event.preventDefault();
                    event.stopPropagation();
                    setQuery("");
                    setHighlightedIndex(0);
                    return;
                  }
                  if (
                    event.key === "ArrowDown" &&
                    visibleCountries.length > 0
                  ) {
                    event.preventDefault();
                    setHighlightedIndex((index) =>
                      Math.min(index + 1, visibleCountries.length - 1),
                    );
                  } else if (
                    event.key === "ArrowUp" &&
                    visibleCountries.length > 0
                  ) {
                    event.preventDefault();
                    setHighlightedIndex((index) => Math.max(index - 1, 0));
                  } else if (
                    event.key === "Enter" &&
                    visibleCountries[highlightedIndex]
                  ) {
                    event.preventDefault();
                    handleSelectCountry(visibleCountries[highlightedIndex]);
                  }
                }}
              />
            </div>

            <div
              className="travel-filter-row"
              role="group"
              aria-label="Country list filter"
            >
              <button
                type="button"
                className="travel-filter-tab"
                aria-pressed={effectiveFilter === "visited"}
                onClick={() => {
                  setFilter("visited");
                  setQuery("");
                  setHighlightedIndex(0);
                }}
              >
                Visited ({stats.visitedCount})
              </button>
              <button
                type="button"
                className="travel-filter-tab"
                aria-pressed={effectiveFilter === "all"}
                onClick={() => {
                  setFilter("all");
                  setHighlightedIndex(0);
                }}
              >
                All ({stats.totalCount})
              </button>
            </div>

            {continentFilter !== "all" ? (
              <div className="travel-active-continent">
                <span>Continent: {continentFilter}</span>
                <button type="button" onClick={() => setContinentFilter("all")}>
                  Show all
                </button>
              </div>
            ) : null}
          </div>

          {visibleCountries.length > 0 ? (
            <ul className="travel-country-list" aria-label="Matching countries">
              {visibleCountries.map((country, index) => {
                const isSelected = selectedCountry?.key === country.key;
                const isKeyboardActive =
                  query.trim().length > 0 && index === highlightedIndex;
                return (
                  <li key={country.key} className="travel-country-item">
                    <button
                      type="button"
                      className={`travel-country-button ${isSelected || isKeyboardActive ? "selected" : ""}`}
                      aria-current={isSelected ? "true" : undefined}
                      onClick={() => handleSelectCountry(country)}
                    >
                      <span className="travel-country-main">
                        <span
                          className={`travel-status-dot ${country.visited ? "visited" : ""}`}
                          aria-hidden="true"
                        />
                        <span className="travel-country-text">
                          <span className="travel-country-name">
                            {country.name}
                          </span>
                          <span className="travel-country-sub">
                            {country.continent}
                            {country.microstate ? " · Microstate" : ""}
                          </span>
                        </span>
                      </span>
                      {country.visited ? (
                        <span className="travel-country-badge">Visited</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="travel-empty-state" role="status">
              <p>No countries match “{query || continentFilter}”.</p>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setContinentFilter("all");
                  setFilter("all");
                }}
              >
                Reset filters
              </button>
            </div>
          )}

          <footer className="travel-sidebar-footer">
            <span>
              {visibleCountries.length} of {stats.totalCount} shown
            </span>
          </footer>
        </aside>

        <section
          className="travel-globe-stage"
          aria-label="Interactive 3D world globe"
        >
          {webglFailed ? (
            <div className="travel-webgl-fallback" role="status">
              <p className="travel-webgl-fallback-title">
                3D globe unavailable in this browser
              </p>
              <p>
                Interactive 3D globe rendering requires WebGL, which is
                unavailable right now. You can still browse all{" "}
                {stats.visitedCount} visited countries and statistics in the
                panel.
              </p>
            </div>
          ) : (
            <TravelGlobeCanvas
              ref={canvasHandleRef}
              dataset={dataset}
              selectedCountry={selectedCountry}
              reducedMotion={reducedMotion}
              autoRotate={autoRotate}
              onSelectCountry={handleSelectCountry}
              onUserInteract={handleUserInteract}
              onWebGLError={() => setWebglFailed(true)}
            />
          )}

          {selectedCountry ? (
            <article
              className="travel-country-card"
              aria-live="polite"
              aria-label={`Selected country: ${selectedCountry.name}`}
            >
              <div className="travel-card-top">
                <span
                  className={`travel-card-pill ${selectedCountry.visited ? "visited" : ""}`}
                >
                  <span
                    className={`travel-status-dot ${selectedCountry.visited ? "visited" : ""}`}
                    aria-hidden="true"
                  />
                  {selectedCountry.visited ? "Visited" : "Not yet visited"}
                </span>
                <button
                  type="button"
                  className="travel-card-close"
                  aria-label="Clear selected country"
                  onClick={() => setSelectedCountry(null)}
                >
                  ×
                </button>
              </div>
              <h2>
                {selectedCountry.name}
                {selectedCountry.isoAlpha2
                  ? ` (${selectedCountry.isoAlpha2})`
                  : ""}
              </h2>
              <p className="travel-card-meta">
                {selectedCountry.continent}
                {selectedCountry.microstate ? " · Microstate beacon" : ""}
                <br />
                {formatCoordinates(selectedCountry.lat, selectedCountry.lon)}
              </p>
              {!webglFailed ? (
                <div className="travel-card-actions">
                  <button
                    type="button"
                    onClick={() =>
                      canvasHandleRef.current?.flyToCountry(selectedCountry)
                    }
                  >
                    Center on globe
                  </button>
                </div>
              ) : null}
            </article>
          ) : null}

          {!webglFailed ? (
            <div className="travel-stage-hud">
              <div
                className="travel-zoom-controls"
                role="group"
                aria-label="Globe camera controls"
              >
                <button
                  type="button"
                  aria-label="Zoom in"
                  title="Zoom in"
                  onClick={() => canvasHandleRef.current?.zoomIn()}
                >
                  +
                </button>
                <button
                  type="button"
                  aria-label="Zoom out"
                  title="Zoom out"
                  onClick={() => canvasHandleRef.current?.zoomOut()}
                >
                  −
                </button>
                <button
                  type="button"
                  aria-label="Reset globe view"
                  title="Reset view"
                  onClick={handleResetView}
                >
                  ⌖
                </button>
              </div>

              <div className="travel-legend" aria-hidden="true">
                <span>
                  <i className="travel-legend-swatch visited" /> Visited (
                  {stats.visitedCount})
                </span>
                <span>
                  <i className="travel-legend-swatch unvisited" /> Other
                </span>
                <span>
                  <i className="travel-legend-swatch beacon" /> Microstate
                </span>
              </div>

              <p className="travel-stage-hint">
                Drag to rotate · Scroll to zoom · Click any country
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </dialog>
  );
}
