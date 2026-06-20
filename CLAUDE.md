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
All visualization HTML files live in [pages/](pages/). Each file is self-contained — it includes its own `<script>` and `<style>` tags and loads data via `fetch()` from external GOAT/EBP APIs or local JSON.


### Shared Utilities (loaded via `<script>` tags in visualization files)
- [pages/utils.js](pages/utils.js) — `calculateCumulativeSums()`, `formatNumber()`, `getProjectValue()`
- [pages/services.js](pages/services.js) — Data fetching (`fetchData`, `getTreeData`, `getUmbrellaData`), ECharts data formatters, assembly level color mapping
- [pages/projectsList.js](pages/projectsList.js) — Static project data
- [pages/ergaList.js](pages/ergaList.js) — ERGA affiliate list

### Geographic Map Components
`geoMap/` contains separate map visualizations with Bootstrap 4, jQuery, and `world.js` (GeoJSON). These are distinct from the D3/ECharts visualizations.

### Data Processing (non-dashboard)
- `geocoding/` — Python notebooks for geocoding and Google Sheets data integration
- `repo-analytics/` — GitHub traffic analytics scripts
- `web-analytics/` — Google Analytics 4 data collection
- `.github/workflows/` — Automated weekly GitHub Actions for analytics collection

## Key Patterns

### Adding a New Visualization
1. Create a new HTML file in `pages/`
2. Add an entry to the `pages` array in `config.js` with `name`, `file`, `description`, `icon` (Font Awesome class), and `category`
3. The landing page reads `config.js` and auto-renders the card

### UI Theme & Colors
See `STYLE_SPEC.md` for the full color palette, typography, spacing, footer rules, and per-file checklist. No CSS framework on main dashboard (Bootstrap 4 only in `geoMap/`).

### Path Conventions
- Use **forward slashes** for all repo-relative paths (`pages/foo.html`, not `pages\foo.html`).
- Git stores paths POSIX-style; Windows backslash paths in tooling cause duplicate-looking entries.
- One canonical file per dashboard visualization (via `config.js`); standalone variants such as `pages/distribution_map_white.html` are kept for special embed/export use and are not duplicates.
- Agent skills live under `.claude/skills/` only.

## Dependencies
- **D3.js v6** — bundled as `pages/d3.v6.js`
- **ECharts** — bundled as `pages/echarts.min.js`
- **Phylotree** — npm package (`pages/package.json`), used in phylogenetic tree visualization
- **Underscore.js** — bundled as `pages/underscore-min.js`
