import { useEffect, useRef } from "react";
import type { MouseEvent, PointerEvent, RefObject } from "react";
import { swipeAction } from "../model/navigation";
import type { NavigationAction } from "../model/navigation";

interface BrowserControlsOptions {
  disabled: boolean;
  startingUp: boolean;
  inFolder: boolean;
  surfaceRef: RefObject<HTMLElement | null>;
  onNavigate: (action: NavigationAction) => void;
  onOpenOptions: () => void;
}

export function useBrowserControls({
  disabled,
  startingUp,
  inFolder,
  surfaceRef,
  onNavigate,
  onOpenOptions,
}: BrowserControlsOptions) {
  const pointerStart = useRef<{ x: number; y: number; id: number } | null>(
    null,
  );
  const suppressClick = useRef(false);
  const wheelTime = useRef(0);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        disabled ||
        (event.repeat && event.key === "Enter") ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey
      )
        return;

      const actions = {
        ArrowLeft: { type: "horizontal", delta: -1 },
        ArrowRight: { type: "horizontal", delta: 1 },
        ArrowUp: { type: "vertical", delta: -1 },
        ArrowDown: { type: "vertical", delta: 1 },
      } as const;

      if (event.key in actions) {
        event.preventDefault();
        onNavigate(actions[event.key as keyof typeof actions]);
        surfaceRef.current?.focus({ preventScroll: true });
      } else if (
        event.key === "Enter" &&
        !(event.target instanceof Element && event.target.closest("button, a"))
      ) {
        event.preventDefault();
        onNavigate({ type: "open" });
      } else if (event.key === "Escape" && inFolder) {
        event.preventDefault();
        onNavigate({ type: "close" });
        surfaceRef.current?.focus({ preventScroll: true });
      } else if (event.key === "?") {
        onOpenOptions();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [disabled, inFolder, onNavigate, onOpenOptions, surfaceRef]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;
    const wheel = (event: WheelEvent) => {
      if (disabled || event.ctrlKey) return;
      event.preventDefault();
      const amount = Math.max(Math.abs(event.deltaX), Math.abs(event.deltaY));
      if (amount < 15 || performance.now() - wheelTime.current < 160) return;
      wheelTime.current = performance.now();
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY))
        onNavigate({ type: "horizontal", delta: Math.sign(event.deltaX) });
      else onNavigate({ type: "vertical", delta: Math.sign(event.deltaY) });
    };
    surface.addEventListener("wheel", wheel, { passive: false });
    return () => surface.removeEventListener("wheel", wheel);
  }, [disabled, onNavigate, surfaceRef]);

  useEffect(() => {
    if (!startingUp) surfaceRef.current?.focus({ preventScroll: true });
  }, [startingUp, surfaceRef]);

  function onPointerDown(event: PointerEvent) {
    if (disabled || event.pointerType === "mouse") return;
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
    if (disabled || !start || start.id !== event.pointerId) return;
    const action = swipeAction(
      event.clientX - start.x,
      event.clientY - start.y,
    );
    if (!action) return;
    suppressClick.current = true;
    onNavigate(action);
  }

  function onPointerCancel() {
    pointerStart.current = null;
  }

  function onClickCapture(event: MouseEvent) {
    if (!suppressClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
  }

  return { onPointerDown, onPointerUp, onPointerCancel, onClickCapture };
}
