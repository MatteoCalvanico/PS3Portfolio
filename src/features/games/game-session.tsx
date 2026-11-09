import { lazy, Suspense } from "react";
import "./game-player.css";

const GamePlayer = lazy(() => import("./game-player"));

export default function GameSession({ onClose }: { onClose: () => void }) {
  return (
    <Suspense
      fallback={
        <div className="game-overlay" role="status">
          Starting DOOM…
        </div>
      }
    >
      <GamePlayer onClose={onClose} />
    </Suspense>
  );
}
