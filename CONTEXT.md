# Agro Dashboard Lite Context

## Overview

This repository is the integrated static implementation of the Namma Krishi Prices UI. It serves a browser-only dashboard from `index.html`, `app.js`, and `styles.css`, while reading prebuilt JSON payloads from `data/`.

It is not a React/Vite app. The frontend is a plain JavaScript single-page experience with:

- Home page with hero search and category rails
- Results page with cards-only commodity listings
- Search overlay with typed suggestion states
- Filter modal with draft/apply behavior
- English and Kannada localization

## Stack

- Plain HTML in `index.html`
- One main browser script in `app.js`
- One main stylesheet in `styles.css`
- Localization strings in `translations.json`
- Static browser payloads in `data/*.json`
- SQLite snapshot source in `data/agro_dashboard.db`
- Data rebuild script in `scripts/build_static_site.js`

## Runtime Shape

- `index.html` mounts the app into `#app`
- `app.js` owns routing, rendering, interaction, filtering, search, localization, and card expansion
- The browser fetches:
  - `translations.json`
  - `data/search-index.json`
  - `data/categories.json`
  - `data/observations.json`
- `data/metadata.json` is generated for rebuild metadata but is not the primary UI driver

The app is effectively a two-view SPA:

- Home view: hero, search, sticky category rail, commodity tiles
- Results view: sticky red header, search/filter controls, applied filter summary, result cards, expandable history

## Data Flow

- SQLite is not queried in the browser
- `npm run build:data` reads `data/agro_dashboard.db` and rewrites:
  - `data/observations.json`
  - `data/search-index.json`
  - `data/categories.json`
  - `data/metadata.json`
- `app.js` normalizes those payloads and derives:
  - search suggestions
  - category rails
  - results context
  - filter options
  - card data and history state

## Current Interaction Model

- Search works across commodity, market, and variety
- Search from home routes into results context
- Results page uses cards only; table layout is intentionally disabled
- Filter modal uses draft state before apply
- Applied filters are shown in the sticky summary row
- Search and filter overlays lock body scroll
- Header hides on downward scroll and reappears on upward scroll
- Search suggestions scroll inside their own panel while page scroll stays locked

## Current UI Decisions

- Font family is Prajavani Text everywhere
- Main header is a sticky red bar
- Hero search behavior follows the prototype:
  - large search field in hero
  - header search appears only after scrolling past hero search
- Search suggestions include empty, loading, and unavailable states
- Result cards show market-level pricing, metadata, and expandable history
- Empty chart state uses a neutral grey icon and message

## Filter-Specific Notes

- The active filter implementation is the later `renderFilterModal()` / `renderFilterField()` path near the bottom of `app.js`
- Filter behavior separates:
  - applied filters in `state.filters`
  - draft filters in `state.filterDrafts`
- Filter section heading tones intentionally match search suggestion tones:
  - market: gold
  - variety: blue
  - default/commodity-like: green
- Filter chips are expected to follow the same field tone everywhere they appear
- Filter chip close buttons are expected to use the red close affordance everywhere they appear
- Selected options in the modal use the prototype-style green square checkbox with white check

## Important Files

- `app.js`: main rendering and interaction logic
- `styles.css`: full visual system and responsive behavior
- `translations.json`: UI, entity, and locale copy
- `scripts/build_static_site.js`: rebuilds browser data from SQLite

## Commands

```bash
npm run check
npm run build:data
```

For local viewing, the repo can be served as static files. In this workspace it was being served from:

```text
http://127.0.0.1:4173
```

## Known Constraints

- Most logic lives in one large `app.js` file
- There are legacy render/style paths in the file from earlier iterations; the later render functions near the bottom are the active ones for the current UI
- Visual regressions often come from updating one render path but missing another duplicated helper path
- There is no framework-level state management, routing library, or component system

## Recommended Caution Areas

- When changing filter UI, update both:
  - initial modal render markup
  - any helper that re-renders chips/options after interaction
- When changing chip colors, verify:
  - modal draft chips
  - applied filter summary chips
  - hover states
- When changing search UI, verify:
  - home hero search
  - floating overlay search
  - locked page scroll behavior
