# Namma Krishi Prices Context

## Overview

This project is a small React + Vite frontend prototype for a Kannada-language agricultural price website. It currently behaves like a single-page app with two main views:

- Home view: hero search, category tabs, and commodity tiles
- Results view: price cards, search overlay, and filter dialog

The app is driven entirely by local mock data. There is no backend, API integration, routing library, or persistent storage.

## Stack

- React 18
- Vite 5
- Plain CSS in `src/styles.css`
- Static assets in `public/assets`

## Entrypoints

- `index.html` loads Google Fonts (`Noto Serif Kannada`) and mounts the app
- `src/main.jsx` renders `App`
- `src/App.jsx` contains the full UI and interaction logic
- `src/data.js` contains all mock content, categories, search suggestions, filters, and price cards
- `vite.config.js` sets the base path to `/Namma-Krishi-App/` when building in GitHub Actions, otherwise `/`

## Current Product Shape

### Home view

- Sticky red header with logo
- Hero image with search field
- Sticky category tab bar
- Commodity grid based on the selected category
- Search opens as an overlay panel with suggestions

### Results view

- Back navigation to home
- Selected commodity summary
- Filter button and filter summary chips
- Price cards with:
  - market header
  - three stat blocks
  - metadata grid
  - expandable history graph
- Search overlay and filter modal
- Empty state when filters/query remove all matches

## State Model

`App` keeps all app state in a single component. Important state groups:

- Navigation: `view`
- Search: `query`, `draftQuery`, `searchOpen`
- Filters:
  - applied: `selectedMarkets`, `selectedVarieties`
  - draft: `draftSelectedMarkets`, `draftSelectedVarieties`
- Selection: `selectedCategory`, `selectedCommodity`
- Card expansion: `expandedCardId`
- Dialog accessibility refs:
  - `searchDialogRef`, `filterDialogRef`
  - `searchReturnFocusRef`, `filterReturnFocusRef`

The filter flow intentionally separates draft and applied state so users can change filter selections in the dialog before applying them.

## Search and Filtering Behavior

- Result cards are filtered by free-text query against:
  - commodity
  - market
  - variety
- Market and variety filters are applied on top of the text query
- Search suggestions come from `searchResults` in `src/data.js`
- Submitting search from home switches to results view
- Submitting search from results updates the existing results list

## Accessibility and Interaction Details

- `useDialogAccessibility` traps focus within open dialogs
- `Escape` closes search and filter dialogs
- Focus returns to the triggering button when a dialog closes
- Body scroll is locked while overlays are open
- The home header search button becomes visible when the hero scrolls out of view
- The filter summary hides on downward scroll and reappears on upward scroll

## Data and Content Notes

- All user-facing content is currently hard-coded in `src/data.js`
- The app is localized with Kannada copy
- Price history graph and thumbnails are static image assets
- `www.example.com` is still used as a placeholder data source in price cards

## Styling Notes

- Global tokens are defined in `:root` in `src/styles.css`
- The visual language uses:
  - brand red for headers
  - green for actions and active controls
  - cream / white panels for the content surfaces
- Layout is responsive with breakpoints at `768px` and `1024px`
- Sticky UI is used heavily in both home and results views

## Constraints and Caveats

- No real API or live price integration yet
- No URL routing, deep linking, or browser-history-aware navigation
- Most logic lives in one large `App.jsx` file
- Images and chart states are presentational, not data-driven
- The project appears to be a prototype or UI proof-of-concept rather than a production-ready application

## Useful Commands

```bash
npm run dev
npm run build
npm run preview
```

## Suggested Next Refactors

1. Split `App.jsx` into view and shared component modules
2. Move mock data behind a typed data adapter or API layer
3. Add routing for home/results state
4. Add tests for search, filter application, and dialog behavior
5. Replace placeholder data source text with real attribution
