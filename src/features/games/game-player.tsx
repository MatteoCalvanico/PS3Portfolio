import { useEffect, useRef, useState } from "react";
import "./game-player.css";

const channel = "calvs-doom";

export default function GamePlayer({ onClose }: { onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const exitTimer = useRef<number | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState("");

  function command(type: string, value?: boolean) {
    frameRef.current?.contentWindow?.postMessage(
      { channel, type, value },
      window.location.origin,
    );
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => {
      window.clearTimeout(exitTimer.current);
      dialog?.close();
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => setStatus("error"), 45000);
    function receive(event: MessageEvent) {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow ||
        event.data?.channel !== channel
      )
        return;
      if (event.data.type === "ready") {
        window.clearTimeout(timeout);
        setStatus("ready");
        frameRef.current?.contentWindow?.focus();
      } else if (event.data.type === "error") {
        window.clearTimeout(timeout);
        setStatus("error");
      } else if (event.data.type === "exit") {
        onClose();
      } else if (event.data.type === "storage-unavailable") {
        setNotice(
          "Browser storage is unavailable. Saved games will last only until you leave.",
        );
      }
    }
    window.addEventListener("message", receive);
    return () => {
      window.clearTimeout(timeout);
      window.removeEventListener("message", receive);
    };
  }, [attempt, onClose]);

  useEffect(() => {
    const change = () =>
      setFullscreen(document.fullscreenElement === dialogRef.current);
    document.addEventListener("fullscreenchange", change);
    return () => document.removeEventListener("fullscreenchange", change);
  }, []);

  function exit() {
    if (status !== "ready") return onClose();
    command("exit");
    exitTimer.current = window.setTimeout(onClose, 500);
  }

  function togglePause() {
    command("pause", !paused);
    setPaused(!paused);
    if (paused) frameRef.current?.contentWindow?.focus();
  }

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await dialogRef.current?.requestFullscreen();
    } catch {
      setNotice(
        "Fullscreen is not available in this browser. You can keep playing here.",
      );
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="game-dialog"
      aria-labelledby="game-title"
      onCancel={(event) => event.preventDefault()}
      onKeyDown={(event) => {
        if (event.key === "Escape" && event.shiftKey) {
          event.preventDefault();
          exit();
        }
      }}
    >
      <header className="game-toolbar">
        <button className="game-exit" onClick={exit}>
          <span aria-hidden="true">○</span> Back to Games
        </button>
        <h1 id="game-title">
          DOOM <span>Shareware · Episode 1</span>
        </h1>
        <div className="game-actions">
          <button disabled={status !== "ready"} onClick={togglePause}>
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            disabled={status !== "ready"}
            aria-pressed={muted}
            onClick={() => {
              command("mute", !muted);
              setMuted(!muted);
            }}
          >
            Sound {muted ? "Off" : "On"}
          </button>
          {document.fullscreenEnabled ? (
            <button onClick={toggleFullscreen}>
              {fullscreen ? "Exit fullscreen" : "Fullscreen"}
            </button>
          ) : null}
        </div>
      </header>
      <div className="game-stage">
        {status !== "error" ? (
          <iframe
            key={attempt}
            ref={frameRef}
            src={`${import.meta.env.BASE_URL}games/doom/index.html`}
            title="DOOM shareware game"
            allow="autoplay; fullscreen"
            onError={() => setStatus("error")}
          />
        ) : null}
        {status === "loading" ? (
          <div className="game-overlay" role="status">
            <p>Starting DOOM…</p>
            <span>Loading the first episode.</span>
          </div>
        ) : null}
        {status === "error" ? (
          <div className="game-overlay" role="alert">
            <p>DOOM could not start.</p>
            <span>Check your connection and try again.</span>
            <button
              onClick={() => {
                setStatus("loading");
                setPaused(false);
                setMuted(false);
                setNotice("");
                setAttempt((value) => value + 1);
              }}
            >
              Try again
            </button>
          </div>
        ) : null}
        {status === "ready" && paused ? (
          <div className="game-overlay">
            <p>Paused</p>
            <button onClick={togglePause}>Resume game</button>
          </div>
        ) : null}
      </div>
      <footer className="game-help">
        <p>
          W/S move · A/D strafe · ←/→ turn · Space fire · E use · Shift run ·
          Esc menu · F2 save · F3 load
        </p>
        <p>
          Click the game to capture the mouse. Shift + Esc returns to Games.
          Saves stay in this browser.
        </p>
        {notice ? <p role="status">{notice}</p> : null}
        <a
          href={`${import.meta.env.BASE_URL}games/doom/credits.html`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Credits &amp; source
        </a>
      </footer>
    </dialog>
  );
}
