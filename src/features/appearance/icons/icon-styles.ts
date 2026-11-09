export const iconStyles = [
  { id: "xmb", label: "Classic XMB" },
  { id: "outline", label: "Outline" },
] as const;

export type IconStyleId = (typeof iconStyles)[number]["id"];

const storageKey = "ps3-portfolio:icon-style:v1";

export function readIconStyle(): IconStyleId {
  try {
    const saved = window.localStorage.getItem(storageKey);
    return iconStyles.find((style) => style.id === saved)?.id ?? "xmb";
  } catch {
    return "xmb";
  }
}

export function saveIconStyle(style: IconStyleId): void {
  try {
    window.localStorage.setItem(storageKey, style);
  } catch {
    // Appearance can still change when browser storage is blocked.
  }
}
