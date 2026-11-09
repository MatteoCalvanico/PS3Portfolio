interface SystemFooterProps {
  inFolder: boolean;
  onOpen: () => void;
  onBack: () => void;
  onOpenOptions: () => void;
}

export default function SystemFooter({
  inFolder,
  onOpen,
  onBack,
  onOpenOptions,
}: SystemFooterProps) {
  return (
    <footer className="system-footer">
      <div className="navigation-hints">
        <button onClick={onOpen}>
          <span className="controller-symbol cross">×</span> Enter
        </button>
        {inFolder ? (
          <button className="folder-back" onClick={onBack}>
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
          onClick={onOpenOptions}
          aria-label="Navigation help and settings"
        >
          <span className="controller-symbol triangle">△</span> Options
        </button>
      </div>
    </footer>
  );
}
