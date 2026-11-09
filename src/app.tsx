import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import type { CSSProperties, PointerEvent, ReactNode, Ref } from "react";
import { categories as allCategories, profile } from "./data";
import type { PortfolioItem } from "./data";
import { XmbCategoryIcon, XmbItemIcon } from "./icons";
import { navigationReducer, swipeAction } from "./navigation";
import WaveBackground from "./wave-background";
import StartupSequence from "./startup-sequence";

import "./game-player.css";
const GamePlayer = lazy(() => import("./game-player"));

function visibleItems(items: PortfolioItem[]): PortfolioItem[] {
  return items
    .filter((item) => item.hide !== true)
    .map((item) =>
      item.children ? { ...item, children: visibleItems(item.children) } : item,
    );
}

const categories = allCategories.map((category) => ({
  ...category,
  items: visibleItems(category.items),
}));

const reducer = navigationReducer(categories.map((category) => category.items));
const projectsIndex = categories.findIndex(
  (category) => category.id === "projects",
);

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <time dateTime={now.toISOString()}>
      {now.toLocaleDateString("en-GB", { day: "numeric", month: "numeric" })}
      <span className="clock-time">
        {now.toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </span>
    </time>
  );
}

function Dialog({
  children,
  label,
  onClose,
  className = "",
}: {
  children: ReactNode;
  label: string;
  onClose: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={label}
      className={className}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      {children}
    </dialog>
  );
}

function ItemArtwork({
  item,
  large = false,
}: {
  item: PortfolioItem;
  large?: boolean;
}) {
  return (
    <span
      className={`item-artwork ${large ? "artwork-large" : ""} ${item.image ? "has-image" : ""}`}
    >
      {item.image ? (
        <img src={item.image} alt="" loading={large ? "eager" : "lazy"} />
      ) : (
        <XmbItemIcon name={item.icon ?? "code"} />
      )}
    </span>
  );
}

function ItemMenu({
  items,
  label,
  selectedIndex,
  selectedRef,
  onOpen,
  className,
  inactive = false,
}: {
  items: PortfolioItem[];
  label: string;
  selectedIndex: number;
  selectedRef?: Ref<HTMLButtonElement>;
  onOpen: (index: number) => void;
  className: string;
  inactive?: boolean;
}) {
  return (
    <section
      className={`item-window ${className}`}
      aria-hidden={inactive || undefined}
      inert={inactive}
      aria-label={`${label} items`}
    >
      <div
        className="item-list"
        style={{ "--item-index": selectedIndex } as CSSProperties}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            ref={index === selectedIndex ? selectedRef : undefined}
            tabIndex={!inactive && index === selectedIndex ? 0 : -1}
            className={`menu-item ${index === selectedIndex ? "selected" : ""}`}
            style={
              {
                "--item-position":
                  index < selectedIndex
                    ? `calc(var(--previous-y) + ${index - selectedIndex + 1} * var(--item-step))`
                    : index === selectedIndex
                      ? "var(--selected-y)"
                      : `calc(var(--next-y) + ${index - selectedIndex - 1} * var(--item-step))`,
              } as CSSProperties
            }
            onClick={() => onOpen(index)}
            aria-label={`Open ${item.title}`}
            aria-current={index === selectedIndex ? "true" : undefined}
          >
            <ItemArtwork item={item} />
            <span className="item-copy">
              <span className="item-title">{item.title}</span>
              <span className="item-subtitle">
                {item.children
                  ? `Folder · ${item.children.length} ${item.children.length === 1 ? "item" : "items"}`
                  : item.subtitle}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, {
    category: projectsIndex,
    selected: categories.map(() => 0),
    detail: false,
    folders: [],
  });
  const [playingGame, setPlayingGame] = useState(false);
  const closeGame = useCallback(() => {
    setPlayingGame(false);
    dispatch({ type: "close" });
    requestAnimationFrame(() => selectedRef.current?.focus());
  }, []);
  const [help, setHelp] = useState(false);
  const [systemReduced, setSystemReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [startingUp, setStartingUp] = useState(() => !systemReduced);
  const finishStartup = useCallback(() => setStartingUp(false), []);
  const [motionPaused, setMotionPaused] = useState(false);
  const reducedMotion = systemReduced || motionPaused;
  const surfaceRef = useRef<HTMLElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const pointerStart = useRef<{ x: number; y: number; id: number } | null>(
    null,
  );
  const suppressClick = useRef(false);
  const wheelTime = useRef(0);
  const category = categories[state.category];
  let items = category.items;
  let folder: PortfolioItem | undefined;
  for (const selection of state.folders) {
    folder = items[selection.index];
    items = folder.children ?? [];
  }
  const selectedIndex =
    state.folders.at(-1)?.selected ?? state.selected[state.category];
  const selectedItem = items[selectedIndex];
  const listingLabel = folder?.title ?? category.label;
  const inFolder = state.folders.length > 0;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setSystemReduced(media.matches);
    media.addEventListener("change", change);
    return () => media.removeEventListener("change", change);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        startingUp ||
        state.detail ||
        help ||
        (event.repeat && event.key === "Enter") ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;
      const action = {
        ArrowLeft: { type: "horizontal", delta: -1 },
        ArrowRight: { type: "horizontal", delta: 1 },
        ArrowUp: { type: "vertical", delta: -1 },
        ArrowDown: { type: "vertical", delta: 1 },
      } as const;
      if (event.key in action) {
        event.preventDefault();
        dispatch(action[event.key as keyof typeof action]);
        surfaceRef.current?.focus({ preventScroll: true });
      } else if (
        event.key === "Enter" &&
        !(event.target instanceof Element && event.target.closest("button, a"))
      ) {
        event.preventDefault();
        dispatch({ type: "open" });
      } else if (event.key === "Escape" && inFolder) {
        event.preventDefault();
        dispatch({ type: "close" });
        surfaceRef.current?.focus({ preventScroll: true });
      } else if (event.key === "?") {
        setHelp(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.detail, help, startingUp, inFolder]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const wheel = (event: WheelEvent) => {
      if (startingUp || state.detail || help || event.ctrlKey) return;
      event.preventDefault();
      const amount = Math.max(Math.abs(event.deltaX), Math.abs(event.deltaY));
      if (amount < 15 || performance.now() - wheelTime.current < 160) return;
      wheelTime.current = performance.now();
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY))
        dispatch({ type: "horizontal", delta: Math.sign(event.deltaX) });
      else dispatch({ type: "vertical", delta: Math.sign(event.deltaY) });
    };
    surface.addEventListener("wheel", wheel, { passive: false });
    return () => surface.removeEventListener("wheel", wheel);
  }, [state.detail, help, startingUp, inFolder]);

  useEffect(() => {
    if (!startingUp) surfaceRef.current?.focus({ preventScroll: true });
  }, [startingUp]);

  function closeDetail() {
    dispatch({ type: "close" });
    requestAnimationFrame(() =>
      selectedRef.current?.focus({ preventScroll: true }),
    );
  }

  function onPointerDown(event: PointerEvent) {
    if (event.pointerType === "mouse") return;
    suppressClick.current = false;
    pointerStart.current = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
    };
  }

  function onPointerUp(event: PointerEvent) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start || start.id !== event.pointerId) return;
    const action = swipeAction(
      event.clientX - start.x,
      event.clientY - start.y,
    );
    if (!action) return;
    suppressClick.current = true;
    dispatch(action);
  }

  function jumpToProject(id: string) {
    const index = categories[projectsIndex].items.findIndex(
      (item) => item.id === id,
    );
    if (index >= 0)
      dispatch({ type: "jump", category: projectsIndex, item: index });
  }

  return (
    <div
      className={`console ${reducedMotion ? "reduced-motion" : ""} ${state.detail ? "details-open" : ""}`}
    >
      <WaveBackground
        reducedMotion={reducedMotion || playingGame}
        startingUp={startingUp}
      />
      {startingUp ? (
        <StartupSequence
          reducedMotion={reducedMotion}
          onComplete={finishStartup}
        />
      ) : null}
      <div
        className={`xmb-interface ${startingUp ? "awaiting-startup" : ""}`}
        inert={startingUp || playingGame}
      >
        <header className="system-header">
          <div className="user-panel">
            <img
              className="avatar"
              src={profile.image}
              alt="Matteo’s GitHub avatar"
            />
            <div className="user-info">
              <span>{profile.name}</span>
              <Clock />
            </div>
            <span className="system-orb" aria-hidden="true" />
          </div>
        </header>

        <main
          className={`xmb ${inFolder ? "folder-open" : ""}`}
          ref={surfaceRef}
          tabIndex={-1}
          aria-label="Portfolio browser"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            pointerStart.current = null;
          }}
          onClickCapture={(event) => {
            if (suppressClick.current) {
              event.preventDefault();
              event.stopPropagation();
              suppressClick.current = false;
            }
          }}
        >
          <nav
            className="category-window"
            aria-label="Portfolio categories"
            inert={inFolder}
            aria-hidden={inFolder || undefined}
          >
            <div
              className="category-track"
              style={{ "--category-index": state.category } as CSSProperties}
            >
              {categories.map((item, index) => (
                <button
                  key={item.id}
                  tabIndex={index === state.category ? 0 : -1}
                  aria-label={item.label}
                  title={item.label}
                  className={`category ${index === state.category ? "active" : ""}`}
                  onClick={() => dispatch({ type: "category", index })}
                  aria-current={index === state.category ? "true" : undefined}
                >
                  <span className="category-icon">
                    <XmbCategoryIcon category={item.id} />
                  </span>
                  <span className="category-label">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          <ItemMenu
            key={category.id}
            className="root-items"
            items={category.items}
            label={category.label}
            selectedIndex={state.selected[state.category]}
            selectedRef={inFolder ? undefined : selectedRef}
            inactive={inFolder}
            onOpen={(index) => dispatch({ type: "open", index })}
          />
          {folder ? (
            <>
              <button
                className="folder-back-target"
                aria-label={`Back from ${folder.title}`}
                title={`Back from ${folder.title}`}
                onClick={closeDetail}
              >
                <span className="folder-back-chevron" aria-hidden="true">
                  ‹
                </span>
              </button>
              <ItemMenu
                key={state.folders.map((entry) => entry.index).join("/")}
                className="folder-items"
                items={items}
                label={listingLabel}
                selectedIndex={selectedIndex}
                selectedRef={selectedRef}
                onOpen={(index) => dispatch({ type: "open", index })}
              />
            </>
          ) : null}

          <div className="screen-reader" role="status" aria-live="polite">
            {listingLabel}, {selectedItem.title}, {selectedIndex + 1} of{" "}
            {items.length}
          </div>
        </main>

        <div className="touch-controls" aria-label="Touch navigation">
          <div className="dpad">
            <button
              className="dpad-up"
              aria-label="Previous item"
              disabled={selectedIndex === 0}
              onClick={() => dispatch({ type: "vertical", delta: -1 })}
            >
              ↑
            </button>
            <button
              className="dpad-left"
              aria-label={
                inFolder ? "Back to parent folder" : "Previous category"
              }
              disabled={!inFolder && state.category === 0}
              onClick={() => dispatch({ type: "horizontal", delta: -1 })}
            >
              ←
            </button>
            <span className="dpad-center" />
            <button
              className="dpad-right"
              aria-label={inFolder ? "Open selected item" : "Next category"}
              disabled={!inFolder && state.category === categories.length - 1}
              onClick={() => dispatch({ type: "horizontal", delta: 1 })}
            >
              →
            </button>
            <button
              className="dpad-down"
              aria-label="Next item"
              disabled={selectedIndex === items.length - 1}
              onClick={() => dispatch({ type: "vertical", delta: 1 })}
            >
              ↓
            </button>
          </div>
          <div className="touch-action">
            <button onClick={() => dispatch({ type: "open" })}>
              <span className="controller-symbol cross">×</span> Open
            </button>
          </div>
        </div>

        <footer className="system-footer">
          <div className="navigation-hints">
            <button onClick={() => dispatch({ type: "open" })}>
              <span className="controller-symbol cross">×</span> Enter
            </button>
            {inFolder ? (
              <button className="folder-back" onClick={closeDetail}>
                <span className="controller-symbol circle">○</span> Back
              </button>
            ) : (
              <span className="back-hint">
                <span className="controller-symbol circle">○</span> Back
              </span>
            )}
          </div>
          <div className="system-options">
            <button
              className="help-button"
              onClick={() => setHelp(true)}
              aria-label="Navigation help and settings"
            >
              <span className="controller-symbol triangle">△</span> Options
            </button>
          </div>
        </footer>

        {state.detail && !playingGame ? (
          <Dialog
            key={selectedItem.id}
            label="detail-title"
            onClose={closeDetail}
            className="detail-dialog"
          >
            <div className="detail-shell">
              <header className="detail-header">
                <span>
                  <XmbCategoryIcon category={category.id} />
                  {folder
                    ? `${category.label} / ${folder.title}`
                    : category.label}
                </span>
                <button
                  onClick={closeDetail}
                  className="close-button"
                  aria-label="Close details"
                >
                  <span className="controller-symbol circle">○</span> Back{" "}
                  <kbd>Esc</kbd>
                </button>
              </header>
              <div
                className={`detail-content ${selectedItem.image ? "with-image" : ""}`}
                key={selectedItem.id}
              >
                {selectedItem.image ? (
                  <div
                    className={`detail-image ${category.id === "projects" ? "project-image" : ""}`}
                  >
                    <img
                      src={selectedItem.image}
                      alt={`${selectedItem.title} ${category.id === "projects" ? "preview" : "image"}`}
                    />
                  </div>
                ) : (
                  <div className="detail-symbol">
                    <XmbItemIcon name={selectedItem.icon ?? category.icon} />
                  </div>
                )}
                <article className="detail-copy">
                  <p className="detail-eyebrow">{selectedItem.subtitle}</p>
                  <h1 id="detail-title">{selectedItem.title}</h1>
                  <p className="detail-description">
                    {selectedItem.description}
                  </p>
                  {selectedItem.contentImage ? (
                    <img
                      className="detail-content-image"
                      src={selectedItem.contentImage.src}
                      alt={selectedItem.contentImage.alt}
                      width={1200}
                      height={630}
                    />
                  ) : null}
                  {selectedItem.game ? (
                    <button
                      className="play-game"
                      onClick={() => setPlayingGame(true)}
                    >
                      ▷ Play DOOM
                    </button>
                  ) : null}
                  {selectedItem.tags?.length ? (
                    <ul className="tags" aria-label="Technologies">
                      {selectedItem.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  ) : null}
                  {selectedItem.relatedProjects?.length ? (
                    <div className="related-projects">
                      <h2>Selected projects</h2>
                      {selectedItem.relatedProjects
                        .filter((id) =>
                          categories[projectsIndex].items.some(
                            (item) => item.id === id,
                          ),
                        )
                        .map((id) => (
                          <button key={id} onClick={() => jumpToProject(id)}>
                            {
                              categories[projectsIndex].items.find(
                                (item) => item.id === id,
                              )?.title
                            }
                            <span aria-hidden="true">›</span>
                          </button>
                        ))}
                    </div>
                  ) : null}
                  {selectedItem.links?.length ? (
                    <div className="detail-links">
                      {selectedItem.links.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target={
                            link.url.startsWith("mailto:")
                              ? undefined
                              : "_blank"
                          }
                          rel="noopener noreferrer"
                        >
                          {link.label}
                          <span aria-hidden="true">›</span>
                        </a>
                      ))}
                    </div>
                  ) : null}
                </article>
              </div>
              <div className="detail-footnote">
                {profile.name}
                <span>{profile.role}</span>
              </div>
            </div>
          </Dialog>
        ) : null}

        {help ? (
          <Dialog
            label="help-title"
            onClose={() => setHelp(false)}
            className="help-dialog"
          >
            <div className="help-content">
              <button
                className="close-button"
                onClick={() => setHelp(false)}
                aria-label="Close help"
              >
                Close ×
              </button>
              <h1 id="help-title">Options</h1>
              <h2 className="controls-title">Controls</h2>
              <dl>
                <div>
                  <dt>← →</dt>
                  <dd>Change category. In a folder: back / open.</dd>
                </div>
                <div>
                  <dt>↑ ↓</dt>
                  <dd>Choose an item</dd>
                </div>
                <div>
                  <dt>Enter</dt>
                  <dd>Open the selected item</dd>
                </div>
                <div>
                  <dt>Esc</dt>
                  <dd>Go back one level</dd>
                </div>
                <div>
                  <dt>Mouse</dt>
                  <dd>Click to select or open. Scroll to browse.</dd>
                </div>
                <div>
                  <dt>Touch</dt>
                  <dd>Swipe in either direction or use the arrow buttons.</dd>
                </div>
              </dl>
              <button
                className="motion-button"
                aria-pressed={reducedMotion}
                disabled={systemReduced}
                title={
                  systemReduced
                    ? "Reduced motion follows your device settings"
                    : "Pause or resume animation"
                }
                onClick={() => setMotionPaused((value) => !value)}
              >
                Background animation <span>{reducedMotion ? "Off" : "On"}</span>
              </button>
              <button
                className="motion-button"
                disabled={reducedMotion}
                title={
                  reducedMotion
                    ? "Enable animation to replay startup"
                    : undefined
                }
                onClick={() => {
                  setHelp(false);
                  setStartingUp(true);
                }}
              >
                Replay startup <span aria-hidden="true">↻</span>
              </button>
              <p className="help-note">
                Tab moves between controls. Reduced motion follows your device
                settings.
              </p>
            </div>
          </Dialog>
        ) : null}
      </div>
      {playingGame ? (
        <Suspense
          fallback={
            <div className="game-overlay" role="status">
              Starting DOOM…
            </div>
          }
        >
          <GamePlayer onClose={closeGame} />
        </Suspense>
      ) : null}
    </div>
  );
}
