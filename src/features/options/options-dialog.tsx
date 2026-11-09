import Dialog from "../../components/dialog";
import AppearanceOptions from "../appearance/components/appearance-options";
import type { AppearanceOptionsProps } from "../appearance/components/appearance-options";
import ControlsHelp from "./controls-help";

interface OptionsDialogProps {
  appearance: AppearanceOptionsProps;
  reducedMotion: boolean;
  systemReduced: boolean;
  onClose: () => void;
  onToggleMotion: () => void;
  onReplayStartup: () => void;
}

export default function OptionsDialog({
  appearance,
  reducedMotion,
  systemReduced,
  onClose,
  onToggleMotion,
  onReplayStartup,
}: OptionsDialogProps) {
  return (
    <Dialog label="help-title" onClose={onClose} className="help-dialog">
      <div className="help-content">
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close help"
        >
          Close ×
        </button>
        <h1 id="help-title">Options</h1>
        <AppearanceOptions {...appearance} />
        <ControlsHelp />
        <button
          className="motion-button"
          aria-pressed={reducedMotion}
          disabled={systemReduced}
          title={
            systemReduced
              ? "Reduced motion follows your device settings"
              : "Pause or resume animation"
          }
          onClick={onToggleMotion}
        >
          Background animation <span>{reducedMotion ? "Off" : "On"}</span>
        </button>
        <button
          className="motion-button"
          disabled={reducedMotion}
          title={
            reducedMotion ? "Enable animation to replay startup" : undefined
          }
          onClick={onReplayStartup}
        >
          Replay startup <span aria-hidden="true">↻</span>
        </button>
        <p className="help-note">
          Tab moves between controls. Reduced motion follows your device
          settings.
        </p>
      </div>
    </Dialog>
  );
}
