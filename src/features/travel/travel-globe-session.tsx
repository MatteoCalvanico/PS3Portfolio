import { lazy, Suspense } from "react";
import "./travel-globe.css";

const TravelGlobeDialog = lazy(() => import("./travel-globe-dialog"));

interface TravelGlobeSessionProps {
  reducedMotion: boolean;
  onClose: () => void;
}

export default function TravelGlobeSession({
  reducedMotion,
  onClose,
}: TravelGlobeSessionProps) {
  return (
    <Suspense
      fallback={
        <div className="travel-globe-loading" role="status">
          <p>Loading Travel Globe…</p>
          <span>Preparing 3D world map and visited countries.</span>
        </div>
      }
    >
      <TravelGlobeDialog reducedMotion={reducedMotion} onClose={onClose} />
    </Suspense>
  );
}
