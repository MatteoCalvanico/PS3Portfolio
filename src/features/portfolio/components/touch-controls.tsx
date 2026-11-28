import type { NavigationAction } from "../model/navigation";

interface TouchControlsProps {
  categoryIndex: number;
  categoryCount: number;
  selectedIndex: number;
  itemCount: number;
  inFolder: boolean;
  onNavigate: (action: NavigationAction) => void;
}

export default function TouchControls({
  categoryIndex,
  categoryCount,
  selectedIndex,
  itemCount,
  inFolder,
  onNavigate,
}: TouchControlsProps) {
  return (
    <div className="touch-controls" aria-label="Touch navigation">
      <div className="dpad">
        <button
          type="button"
          className="dpad-up"
          aria-label="Previous item"
          disabled={selectedIndex === 0}
          onClick={() => onNavigate({ type: "vertical", delta: -1 })}
        >
          <span aria-hidden="true">↑</span>
        </button>
        <button
          type="button"
          className="dpad-left"
          aria-label={inFolder ? "Back to parent folder" : "Previous category"}
          disabled={!inFolder && categoryIndex === 0}
          onClick={() => onNavigate({ type: "horizontal", delta: -1 })}
        >
          <span aria-hidden="true">←</span>
        </button>
        <span className="dpad-center" aria-hidden="true" />
        <button
          type="button"
          className="dpad-right"
          aria-label={inFolder ? "Open selected item" : "Next category"}
          disabled={!inFolder && categoryIndex === categoryCount - 1}
          onClick={() => onNavigate({ type: "horizontal", delta: 1 })}
        >
          <span aria-hidden="true">→</span>
        </button>
        <button
          type="button"
          className="dpad-down"
          aria-label="Next item"
          disabled={selectedIndex === itemCount - 1}
          onClick={() => onNavigate({ type: "vertical", delta: 1 })}
        >
          <span aria-hidden="true">↓</span>
        </button>
      </div>
      <div className="touch-action">
        <button type="button" onClick={() => onNavigate({ type: "open" })}>
          <span className="controller-symbol cross" aria-hidden="true">
            ×
          </span>{" "}
          Open
        </button>
        {inFolder ? (
          <button
            type="button"
            className="touch-back"
            onClick={() => onNavigate({ type: "close" })}
          >
            <span className="controller-symbol circle" aria-hidden="true">
              ○
            </span>{" "}
            Back
          </button>
        ) : null}
      </div>
    </div>
  );
}
