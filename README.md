# Commodity Dashboard Lite

Static commodity dashboard for GitHub Pages.

## Runtime

The browser loads the dashboard from `index.html` and reads the generated JSON files in `data/`. The SQLite snapshot is retained in `data/agro_dashboard.db` as the source artifact for rebuilding those files; the browser does not query SQLite directly.

The hosted dashboard includes:

- Commodity, market, and variety search
- Category and commodity rails
- Cascading filters
- Cards and table result layouts
- Price deltas and inline price history
- English/Kannada localization

The map and scraper workflows are intentionally excluded.

## Rebuild Static Data

Install the only build dependency and regenerate the browser payloads:

```bash
npm install
npm run build:data
```

The command reads `data/agro_dashboard.db` and rewrites:

- `data/observations.json`
- `data/search-index.json`
- `data/categories.json`
- `data/metadata.json`

## GitHub Pages

Configure Pages to deploy the `main` branch from the repository root. No Node server is required for the hosted site.
