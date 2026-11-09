# Matteo Calvanico — XMB Portfolio

A React + TypeScript portfolio reproducing the layout and navigation of the PlayStation 3 XMB, with my projects, experience and toolkit. Classic blue background and a skippable PS3-style startup. No audio.

## Run locally

Requires Node.js 24, npm and curl.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. `npm test` checks navigation, swipe decisions, appearance preferences and icon rendering. `npm run build` checks TypeScript and produces the static site in `dist/`.

## Controls

- Left/right: change category. Up/down: change item.
- Enter: open the selected item. Esc: return.
- Click categories or items; scroll to move through items.
- On mobile, swipe or use the directional controls.
- Options lets visitors choose a background (Wave or Aurora) and an independent icon style (Classic XMB or Outline). Wave has six color variants: Classic blue, Purple, Emerald, Amber, Rose and Graphite. Changes apply immediately and are saved in this browser's `localStorage` for future visits. Existing color preferences are preserved. Wave in Classic blue and Classic XMB icons are the defaults. If storage is unavailable, choices still work for the current visit.

Each category remembers its selected item. Earlier items appear above the horizontal category row, while the selected item stays anchored below it. Selecting a related project from a skill opens that project's details.

## Content and assets

- `src/features/portfolio/data/portfolio.ts` contains all portfolio content.
- `public/assets/` contains the existing portfolio imagery.
- `public/xmb/` contains original PNG artwork from Sony's PS3 Custom Theme v2.00 sample. Exact source and archive checksum are documented in `public/xmb/SOURCES.txt`.
- `src/features/appearance/icons/icons.tsx` routes category and item symbols through the selected icon pack. Classic XMB uses Sony images; `src/features/appearance/icons/outline-icon.tsx` supplies local SVG symbols.
- `src/styles/global.css` controls layout, focus, transitions, mobile controls and information screens.
- `src/features/appearance/backgrounds/wave-background.tsx` draws a custom approximation of the classic blue ribbon in WebGL. This is a recreation, not Sony's original shader. `src/features/appearance/backgrounds/aurora-background.tsx` draws a separate northern-lights scene with stars and loads only when selected. `src/features/appearance/backgrounds/shader-background.tsx` shares canvas lifecycle, hidden-tab pausing, reduced motion and WebGL resource cleanup between shader themes. The interface uses installed system fonts, not a bundled PS3 font.

## Adding backgrounds and icon styles

To add a background, create a React component accepting `BackgroundProps` from `src/features/appearance/backgrounds/background-types.ts` (`reducedMotion` and `startingUp`). Register it in `src/features/appearance/background-themes.ts` with a stable ID, label, description, CSS fallback and at least one variant. Use `lazy(() => import("./backgrounds/your-background"))` to load it on demand. It appears in Options automatically; no changes to the portfolio content or navigation are needed. A theme may render its own canvas, shader or decorative elements. `ShaderBackground` is optional and supplies `uTime`, `uAspect` and `uBoot` uniforms for shader themes. Other implementations must pause when hidden, respect reduced motion and clean up resources on unmount.

To add an icon style, add its stable ID and label to `src/features/appearance/icons/icon-styles.ts`, implement a component accepting `IconProps` from `src/features/appearance/icons/icon-types.ts` (`name` and `className`), and register it in `iconPacks` in `src/features/appearance/icons/icons.tsx`. It appears in Options automatically. The shared provider applies the selected style to categories, folders, menu symbols and detail headers, independently of the background. Keep icons decorative: accessible labels live on the surrounding controls.

Only IDs are persisted: background selection uses `ps3-portfolio:background-theme:v2` and icon style uses `ps3-portfolio:icon-style:v1`. The original background `v1` color preference is read when no `v2` selection exists. Missing IDs or malformed/unavailable storage fall back to defaults.

Startup timing and composition reference: [PS3 original startup](https://www.youtube.com/watch?v=Ts3w6ksiZRI). The animation is rendered locally with CSS and the existing WebGL backdrop; no embedded video or extra runtime dependencies.

Visual references: Sony's [XMB user guide](https://manuals.playstation.net/document/en/ps3/current/basicoperations/xmb.html) and [official XMB image](https://gmedia.playstation.com/is/image/SIEPDC/ps3-xrossmediabar-image-block-02-en-17oct24?fmt=png-alpha&wid=1280).

## GitHub Pages

The included workflow tests, builds and deploys on a push to `main` or manual dispatch. You can navigate the portfolio [here](https://matteocalvanico.github.io/PS3Portfolio/)

### Last watched

Profile → Cinema shows the latest dated diary entry from [my Letterboxd RSS](https://letterboxd.com/matteocalvanico/rss/), with poster, rating and a link to the entry. The workflow refreshes and deploys it every six hours (at 00:17, 06:17, 12:17 and 18:17 UTC), as well as on normal deployments.

### Playable games

In a secret directory you can play different games directly in the browser, for instance:

- DOOM: the original 1.9 shareware first episode in a self-hosted WebAssembly player. Credits, engine source, GPL and original shareware distribution are in `public/games/doom/credits.html`.
