# EBP Dashboard — Canonical Style Specification

This file defines the authoritative visual standards for all dashboard HTML files.
Use it as the reference when auditing or creating files.

---

## 1. Color Palette

### Landing page (`index.html`) — CSS variables
```css
--bg:            #ffffff
--bg-alt:        #f4f6f4
--bg-card:       #ffffff
--bg-card-hover: #f7faf8
--accent:        #0d7a47      /* primary green */
--accent-light:  #e5f3ec
--accent-mid:    #16a34a
--text:          #111827
--text-dim:      #4b5563
--text-muted:    #9ca3af
--border:        #e5e7eb
```

### Visualization files (`pages/*.html`) — inline values
| Purpose | Value |
|---|---|
| Body text / labels | `#333` or `#333333` |
| Subdued text | `#555`, `#666`, `#888` |
| Chart note border | `#aaa` |
| Footer background | `rgba(248, 249, 250, 0.95)` |
| Progress bar empty track | `#d8e6de` |

### Chart data colors (viridis-inspired — use in order)
```js
["#440154", "#404387", "#2a788e", "#22a884", "#7ad151", "#ff4500"]
```

### Assembly level colors (defined in `services.js`)
| Level | Color |
|---|---|
| contig | `#b8860b` |
| scaffold | `#22a884` |
| chromosome | `#404387` |
| complete genome | `#7ad151` |

### Buttons (download/action pills — pattern from `distribution_map.html`)
```css
height: 40px;
padding: 0 20px;
font-size: 13px;
font-weight: 600;
color: #1E293B;
background-color: #ffffff;
border: 1px solid #CBD5E1;
border-radius: 25px;
box-shadow: 0 1px 4px rgba(0,0,0,0.08);
```
Hover: `background-color: #F1F5F9`. Differentiate button intent (e.g. CSV vs image export) via icon fill color, not a different background fill — keep all action buttons neutral white/slate pills.

---

## 2. Typography

### Landing page
- Font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif`
- Base line-height: `1.6`
- Page headline: `1.6rem`, weight `800`, letter-spacing `-0.02em`

### Visualization files
- Font stack: `Arial, sans-serif` (for UI controls and labels)
- Page title: `font-size: 2.0vw`, `font-weight: bold`, `color: #333`
- Chart section title: `font-size: 1.25rem`, `font-weight: 700`, `color: #2c3e50`
- Dropdown labels: `font-size: 14px`, `font-weight: bold`
- Select box: `font-size: 16px`, height `32px`

---

## 3. Footer

**Every visualization file must have a fixed footer** with this exact structure and CSS:

```html
<div id="footer">
    <div id="copyright">Data source: <a href="https://goat.genomehubs.org" target="_blank" rel="noopener noreferrer">Genomes on a Tree (GoaT)</a>. Used with permission.</div>
</div>
```

```css
#footer {
    position: fixed;
    bottom: 0;
    width: 100%;
    left: 0;
    background-color: rgba(248, 249, 250, 0.95);
    color: #333;
    text-align: center;
    padding: 5px;
    z-index: 9999;
    box-shadow: 0 -2px 5px rgba(0,0,0,0.1);
    font-size: 14px;
}
```

- `left: 0` must be present (prevents misalignment in some browsers)
- The GoaT hyperlink must be present and open in a new tab
- Do not use a `<footer>` semantic element — use `<div id="footer">`

---

## 4. Chart Explanatory Notes (`.chartNote`)

Placed **immediately below** the chart container it describes, with minimal gap:

```html
<div class="chartNote">
    <p><strong>What is shown:</strong> …description…</p>
</div>
```

```css
.chartNote {
    width: 95%;
    max-width: 1200px;
    margin: 0 auto 16px auto;
    padding: 10px 16px;
    background: #f8f9fa;
    border-left: 3px solid #aaa;
    border-radius: 4px;
    font-size: 12px;
    color: #555;
    line-height: 1.6;
}
.chartNote p { margin: 0 0 5px 0; }
.chartNote p:last-child { margin-bottom: 0; }
```

- No extra `margin-top` between chart and note (the chart container's own bottom margin handles spacing)
- Note text should start with **"What is shown:"** in bold

---

## 5. Layout & Spacing

### Landing page — a catalog card with no backend behind it

The two tool pages are not static: they read the `ebp-backend` API, and until Phase B
sets `BACKEND_BASE_PRODUCTION` in `pages/services_backend.js` there is no hostname for
them on the public deployment. Such a card renders as `.link.unavailable` — a `<div>`
rather than an `<a>`, dashed border on `--bg-alt`, `--border` icon tile, and a
`.link-badge` reading "Coming soon" on its own row under the title. No hover lift and no
arrow: those signal a destination, and there isn't one. The badge is all it says — the
card does not explain *why* the tool is unavailable, because this page is public and the
reason is internal deployment state.

Mark it in `config.js` with `requiresBackend: true`. **Do not hardcode the condition** —
`index.html` asks `EBPBackend.backendBase()`, so setting that one constant is the only
edit that turns these cards live.

### Visualization page container
```css
.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2vh;
    padding-bottom: 1vh;
    margin-top: 5vh;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
}
```

### Chart container
```css
.chart-container {
    width: 100%;
    aspect-ratio: 16/9;
    min-height: 300px;
    max-height: 70vh;
    margin: 0 auto 2vh auto;
    position: relative;
}
```

### Page title
```css
.page-title {
    text-align: center;
    font-weight: bold;
    margin: 5vh 0 0 0;
    color: #333;
    letter-spacing: 1px;
    font-size: 2.0vw;
}
```

---

## 6. Required `<head>` Tags (visualization files)

Every `pages/*.html` must include:

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="author" content="Fang Chen" />
<script src="../config.js"></script>
<script src="./echarts.min.js"></script>   <!-- if using ECharts -->
<script src="./utils.js"></script>
<script src="./services.js"></script>
```

---

## 7. Checklist for New or Modified Files

- [ ] Footer present with correct CSS (fixed, bottom 0, GoaT link)
- [ ] Chart note `.chartNote` immediately follows its chart, no extra top margin
- [ ] Colors use palette above — no blue themes (`#0000ff`, Bootstrap default blue, etc.)
- [ ] Page title uses `2.0vw` / `font-weight: bold` / `color: #333`
- [ ] `<head>` includes `config.js`, `utils.js`, `services.js`
- [ ] `<meta name="author" content="Fang Chen" />` present
