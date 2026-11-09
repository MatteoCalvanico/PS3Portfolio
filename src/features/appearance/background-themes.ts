import { lazy } from "react";
import type { ComponentType } from "react";
import type { BackgroundProps } from "./backgrounds/background-types";
import WaveBackground from "./backgrounds/wave-background";

export interface BackgroundVariant {
  id: string;
  label: string;
  filter: string;
  swatch: string;
}

export interface BackgroundTheme {
  id: string;
  label: string;
  description: string;
  component: ComponentType<BackgroundProps>;
  fallback: string;
  variants: readonly [BackgroundVariant, ...BackgroundVariant[]];
}

export const backgroundThemes: readonly [
  BackgroundTheme,
  ...BackgroundTheme[],
] = [
  {
    id: "wave",
    label: "Wave",
    description: "The classic flowing ribbon",
    component: WaveBackground,
    fallback:
      "radial-gradient(ellipse at 45% 60%, #164db0, transparent 80%), linear-gradient(#05102c, #123475 60%, #07102b)",
    variants: [
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
    ],
  },
  {
    id: "aurora",
    label: "Aurora",
    description: "Northern lights and a starry sky",
    component: lazy(() => import("./backgrounds/aurora-background")),
    fallback:
      "radial-gradient(ellipse at 65% 20%, #174a40, transparent 55%), radial-gradient(ellipse at 30% 15%, #362354, transparent 60%), linear-gradient(#060c22, #071424)",
    variants: [
      { id: "original", label: "Original", filter: "none", swatch: "#227d69" },
    ],
  },
];

export interface BackgroundSelection {
  themeId: string;
  variantId: string;
}

const storageKey = "ps3-portfolio:background-theme:v2";
const legacyStorageKey = "ps3-portfolio:background-theme:v1";

export function resolveBackground(selection: BackgroundSelection) {
  const theme =
    backgroundThemes.find((entry) => entry.id === selection.themeId) ??
    backgroundThemes[0];
  const variant =
    theme.variants.find((entry) => entry.id === selection.variantId) ??
    theme.variants[0];
  return { theme, variant };
}

function normalizeSelection(
  selection: BackgroundSelection,
): BackgroundSelection {
  const { theme, variant } = resolveBackground(selection);
  return { themeId: theme.id, variantId: variant.id };
}

export function readBackgroundTheme(): BackgroundSelection {
  const defaultSelection = { themeId: "wave", variantId: "blue" };
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (saved !== null) {
      const value: unknown = JSON.parse(saved);
      if (
        typeof value === "object" &&
        value !== null &&
        "themeId" in value &&
        typeof value.themeId === "string" &&
        "variantId" in value &&
        typeof value.variantId === "string"
      ) {
        return normalizeSelection({
          themeId: value.themeId,
          variantId: value.variantId,
        });
      }
      return defaultSelection;
    }
    // Preserve the color chosen before themes had independent renderers.
    const legacy = window.localStorage.getItem(legacyStorageKey);
    return normalizeSelection({ themeId: "wave", variantId: legacy ?? "blue" });
  } catch {
    return defaultSelection;
  }
}

export function saveBackgroundTheme(selection: BackgroundSelection): void {
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify(normalizeSelection(selection)),
    );
  } catch {
    // The selected theme still works for this visit if storage is unavailable.
  }
}
