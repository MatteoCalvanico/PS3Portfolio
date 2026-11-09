import { useEffect, useRef } from "react";

interface StartupSequenceProps {
  reducedMotion: boolean;
  onComplete: () => void;
}

// The menu shares the same renderer, so the ribbons continue through the reveal.
export default function StartupSequence({
  reducedMotion,
  onComplete,
}: StartupSequenceProps) {
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (reducedMotion) {
      onComplete();
      return;
    }
    skipRef.current?.focus({ preventScroll: true });
    // A timer also completes startup if CSS animations are unavailable.
    const timeout = window.setTimeout(onComplete, 6800);
    return () => window.clearTimeout(timeout);
  }, [onComplete, reducedMotion]);

  return (
    <section
      className="startup-screen"
      role="dialog"
      aria-modal="true"
      aria-labelledby="startup-title"
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (["Escape", "Enter", " "].includes(event.key)) {
          event.preventDefault();
          event.stopPropagation();
          onComplete();
        } else if (event.key === "Tab") {
          // Skip is the only control while the underlying XMB is inert.
          event.preventDefault();
          skipRef.current?.focus();
        }
      }}
    >
      <div className="startup-curtain" aria-hidden="true" />
      <h1 id="startup-title" className="startup-title">Calv's portfolio</h1>
      <button ref={skipRef} className="startup-skip" onClick={onComplete}>
        <span className="controller-symbol cross" aria-hidden="true">×</span>
        Skip intro <kbd>Enter / Esc</kbd>
      </button>
    </section>
  );
}
