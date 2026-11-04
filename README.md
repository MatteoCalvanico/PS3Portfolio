# Matteo Calvanico — XMB Portfolio

A React + TypeScript portfolio reproducing the layout and navigation of the PlayStation 3 XMB, with my projects, experience and toolkit. Classic blue background, no audio or boot sequence, **for now ;-)**

## Run locally

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173. `npm test` checks navigation and swipe decisions. `npm run build` checks TypeScript and produces the static site in `dist/`.

## Controls

- Left/right: change category. Up/down: change item.
- Enter: open the selected item. Esc: return.
- Click categories or items; scroll to move through items.
- On mobile, swipe or use the directional controls.
- Options contains control guidance and the background-animation toggle. Device reduced-motion preferences are respected.

Each category remembers its selected item. Earlier items appear above the horizontal category row, while the selected item stays anchored below it. Selecting a related project from a skill opens that project's details.

## Content and assets

- `src/data.ts` contains all portfolio content, migrated from the original Angular portfolio: 8 projects, 43 skills, 6 experience/education entries, profile and contacts.
- `public/assets/` contains the existing portfolio imagery. `profile.png` is the public GitHub identicon; replace it with the intended portrait when available.
- `public/xmb/` contains original PNG artwork from Sony's PS3 Custom Theme v2.00 sample. Exact source and archive checksum are documented in `public/xmb/SOURCES.txt`.
- `src/icons.tsx` maps portfolio categories and items to the Sony images.
- `src/styles.css` controls layout, focus, transitions, mobile controls and information screens.
- `src/wave-background.tsx` draws a custom approximation of the classic blue ribbon in WebGL. This is a recreation, not Sony's original shader. It has no particles, pauses in hidden tabs and supports reduced motion. The interface uses installed system fonts, not a bundled PS3 font.

Visual references: Sony's [XMB user guide](https://manuals.playstation.net/document/en/ps3/current/basicoperations/xmb.html) and [official XMB image](https://gmedia.playstation.com/is/image/SIEPDC/ps3-xrossmediabar-image-block-02-en-17oct24?fmt=png-alpha&wid=1280).

## GitHub Pages

The included workflow tests, builds and deploys on a push to `main` or manual dispatch. You can navigate the portfolio [here](https://matteocalvanico.github.io/PS3Portfolio/)
