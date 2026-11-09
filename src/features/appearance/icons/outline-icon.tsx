import type { ReactNode } from "react";
import type { IconProps } from "./icon-types";

// Local SVG artwork keeps the icon pack independent of fonts and network calls.
const symbols: Record<string, ReactNode> = {
  user: <><circle cx="12" cy="7" r="3.5" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V4h8v3M3 12a22 22 0 0 0 18 0M12 12v3" /></>,
  graduation: <><path d="m2 8 10-5 10 5-10 5Zm4 2v7q6 5 12 0v-7M22 8v9" /></>,
  gamepad: <><path d="M7 7h10c3 0 4 3 5 10 .3 3-2 4-4 2l-3-3H9l-3 3c-2 2-4.3 1-4-2 1-7 2-10 5-10Z" /><path d="M7 9v5M4.5 11.5h5M16 10h.01M19 13h.01" /></>,
  code: <><path d="m8 5-6 7 6 7m8-14 6 7-6 7M14 3l-4 18" /></>,
  layers: <><path d="m2 7 10-5 10 5-10 5Zm0 5 10 5 10-5M2 17l10 5 10-5" /></>,
  tools: <><path d="m14 5 1-3h4l-1 5 4 2-2 4-3-1-9 9-5-5 9-9-1-3Z" /><circle cx="6" cy="18" r=".7" /></>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m3 5 9 8 9-8" /></>,
  folder: <path d="M2 7V4h7l3 3h10v13H2Zm0 3h20" />,
  globe: <><circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="4" ry="10" /><path d="M2 12h20" /></>,
  document: <><path d="M5 2h9l5 5v15H5Zm9 0v6h5M8 12h8M8 16h8" /></>,
  film: <><rect x="3" y="2" width="18" height="20" rx="1" /><path d="M7 2v20M17 2v20M3 7h4M3 12h4M3 17h4M17 7h4M17 12h4M17 17h4" /></>,
  plane: <path d="m22 2-7 20-4-9-9-4Zm0 0L11 13" />,
  terminal: <><rect x="2" y="3" width="20" height="18" rx="2" /><path d="m6 8 4 4-4 4m7 0h5" /></>,
  database: <><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0" /></>,
  cloud: <path d="M6 19a5 5 0 0 1-1-10 7 7 0 0 1 13-2 6 6 0 0 1 0 12Z" />,
  github: <><path d="M8 21v-4c-4 1-5-2-5-2m13 6v-4c0-1-.4-2-1-2 4-.5 6-2 6-6 0-1-.5-2-1-3 0-1 0-2-.5-3-2 0-3 1-4 2a16 16 0 0 0-7 0C7 4 6 3 4 3c-.5 1-.5 2-.5 3C3 7 2.5 8 2.5 9c0 4 2 5.5 6 6-.6 0-.5 1-.5 2" /></>,
  linkedin: <><rect x="2" y="2" width="20" height="20" rx="2" /><path d="M7 10v7M7 7h.01M11 17v-7m0 3c0-4 6-4 6 0v4" /></>,
};

export default function OutlineIcon({ name, className }: IconProps) {
  return (
    <svg
      className={`${className} outline-icon`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {symbols[name] ?? symbols.code}
    </svg>
  );
}
