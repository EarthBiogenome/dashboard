# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The **EBP Dashboard** is a static web frontend for the Earth BioGenome Project (EBP) — an interactive visualization platform tracking genomic sequencing progress across ~1.8 million eukaryotic species worldwide.

**No build step required.** Open `index.html` directly in a browser for local development.

## UI/Styling Conventions 
- When modifying or creating new HTML files, always match the existing theme/color scheme from other project files (e.g., green theme, consistent fonts, footer inclusion). Never assume a default/blue theme.

- After making edits to dashboard HTML files, verify consistent formatting across ALL related HTML files in the project — font sizes, spacing, color themes, footers, and explanatory notes should match.

## Data Pipeline 
- When adding new columns or modifying data pipelines in Python notebooks, always verify that initialization/assignment order doesn't overwrite previously computed values. Test with a small sample before full runs.

## Architecture

### Entry Point and Configuration
- `index.html` — Main dashboard landing page with sticky header, Phase I progress tracking bars, and card-based navigation to visualizations
- `config.js` — Defines all visualization pages in two categories: "Assembly Progress" and "Network Visualization"; also holds the `copyright` object

### Visualization Files
All visualization HTML files live in [source files/](source files/). Each file is self-contained — it includes its own `<script>` and `<style>` tags and loads data via `fetch()` from external GOAT/EBP APIs or local JSON.


### Shared Utilities (loaded via `<script>` tags in visualization files)
- [source files/utils.js](source files/utils.js) — `calculateCumulativeSums()`, `formatNumber()`, `getProjectValue()`
- [source files/services.js](source files/services.js) — Data fetching (`fetchData`, `getTreeData`, `getUmbrellaData`), ECharts data formatters, assembly level color mapping
- [source files/projectsList.js](source files/projectsList.js) — Static project data
- [source files/ergaList.js](source files/ergaList.js) — ERGA affiliate list

### Geographic Map Components
`geoMap/` contains separate map visualizations with Bootstrap 4, jQuery, and `world.js` (GeoJSON). These are distinct from the D3/ECharts visualizations.

### Data Processing (non-dashboard)
- `geocoding/` — Python notebooks for geocoding and Google Sheets data integration
- `repo-analytics/` — GitHub traffic analytics scripts
- `web-analytics/` — Google Analytics 4 data collection
- `.github/workflows/` — Automated weekly GitHub Actions for analytics collection

## Key Patterns

### Adding a New Visualization
1. Create a new HTML file in `source files/`
2. Add an entry to the `pages` array in `config.js` with `name`, `file`, `description`, `icon` (Font Awesome class), and `category`
3. The landing page reads `config.js` and auto-renders the card

### Color Palette (viridis-inspired, used across charts)
```js
["#440154", "#404387", "#2a788e", "#22a884", "#7ad151", "#ff4500"]
```
Assembly level colors are defined in `services.js`: contig=`#ffff33`, scaffold=`#22a884`, chromosome=`#404387`, complete genome=`#7ad151`.

### UI Theme
- Primary green: `#0d7a47`
- Font Awesome 6.4.0 loaded from CDN
- No CSS framework on main dashboard (Bootstrap 4 only in `geoMap/`)

## Dependencies
- **D3.js v6** — bundled as `source files/d3.v6.js`
- **ECharts** — bundled as `source files/echarts.min.js`
- **Phylotree** — npm package (`source files/package.json`), used in phylogenetic tree visualization
- **Underscore.js** — bundled as `source files/underscore-min.js`
