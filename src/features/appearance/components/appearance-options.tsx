import { backgroundThemes, resolveBackground } from "../background-themes";
import type { BackgroundSelection } from "../background-themes";
import { iconStyles } from "../icons/icon-styles";
import type { IconStyleId } from "../icons/icon-styles";
import { IconStyleProvider, XmbCategoryIcon } from "../icons/icons";

export interface AppearanceOptionsProps {
  background: BackgroundSelection;
  onBackgroundChange: (selection: BackgroundSelection) => void;
  iconStyle: IconStyleId;
  onIconStyleChange: (style: IconStyleId) => void;
}

export default function AppearanceOptions({
  background,
  onBackgroundChange,
  iconStyle,
  onIconStyleChange,
}: AppearanceOptionsProps) {
  const { theme, variant } = resolveBackground(background);

  return (
    <>
      <fieldset className="theme-picker" aria-describedby="theme-note">
        <legend>Background theme</legend>
        <div className="theme-grid">
          {backgroundThemes.map((entry) => (
            <label className="theme-option theme-card" key={entry.id}>
              <input
                type="radio"
                name="background-theme"
                value={entry.id}
                checked={theme.id === entry.id}
                onChange={() =>
                  onBackgroundChange({
                    themeId: entry.id,
                    variantId: entry.variants[0].id,
                  })
                }
              />
              <span
                className="theme-preview"
                style={{ background: entry.fallback }}
                aria-hidden="true"
              />
              <span>{entry.label}</span>
              <small>{entry.description}</small>
            </label>
          ))}
        </div>
        <p id="theme-note" className="help-note">
          Appearance choices are remembered in this browser when storage is
          available.
        </p>
      </fieldset>
      {theme.variants.length > 1 ? (
        <fieldset className="theme-picker">
          <legend>{theme.label} color</legend>
          <div className="theme-grid">
            {theme.variants.map((entry) => (
              <label className="theme-option" key={entry.id}>
                <input
                  type="radio"
                  name="background-variant"
                  value={entry.id}
                  checked={variant.id === entry.id}
                  onChange={() =>
                    onBackgroundChange({
                      themeId: theme.id,
                      variantId: entry.id,
                    })
                  }
                />
                <span
                  className="theme-swatch"
                  style={{ backgroundColor: entry.swatch }}
                  aria-hidden="true"
                />
                <span>{entry.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <fieldset className="theme-picker" aria-describedby="icon-style-note">
        <legend>Icon style</legend>
        <div className="theme-grid">
          {iconStyles.map((entry) => (
            <label className="theme-option" key={entry.id}>
              <input
                type="radio"
                name="icon-style"
                value={entry.id}
                checked={iconStyle === entry.id}
                onChange={() => onIconStyleChange(entry.id)}
              />
              <span className="icon-style-preview" aria-hidden="true">
                <IconStyleProvider style={entry.id}>
                  <XmbCategoryIcon category="projects" />
                </IconStyleProvider>
              </span>
              <span>{entry.label}</span>
            </label>
          ))}
        </div>
        <p id="icon-style-note" className="help-note">
          Choose independently of the background. Technology logos and portfolio
          images keep their artwork.
        </p>
      </fieldset>
    </>
  );
}
