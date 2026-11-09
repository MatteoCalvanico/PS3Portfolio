export const backgroundThemes = [
  { id: "blue", label: "Classic blue", filter: "none", swatch: "#245bc0" },
  {
    id: "purple",
    label: "Purple",
    filter: "hue-rotate(55deg)",
    swatch: "#7745c6",
  },
  {
    id: "green",
    label: "Emerald",
    filter: "hue-rotate(-95deg)",
    swatch: "#18804f",
  },
  {
    id: "amber",
    label: "Amber",
    filter: "hue-rotate(175deg)",
    swatch: "#ac681e",
  },
  {
    id: "rose",
    label: "Rose",
    filter: "hue-rotate(100deg)",
    swatch: "#bd407b",
  },
  {
    id: "graphite",
    label: "Graphite",
    filter: "grayscale(1) brightness(0.7)",
    swatch: "#505050",
  },
] as const;

export type BackgroundTheme = (typeof backgroundThemes)[number];

const storageKey = "ps3-portfolio:background-theme:v1";

export function readBackgroundTheme(): BackgroundTheme {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return (
      backgroundThemes.find((theme) => theme.id === saved) ??
      backgroundThemes[0]
    );
  } catch {
    return backgroundThemes[0];
  }
}

export function saveBackgroundTheme(theme: BackgroundTheme): void {
  try {
    window.localStorage.setItem(storageKey, theme.id);
  } catch {
    // The selected theme still works for this visit if storage is unavailable.
  }
}
