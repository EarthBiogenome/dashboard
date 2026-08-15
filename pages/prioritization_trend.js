/**
 * Panel A — source movement over time, for one tracked species list.  [A-T4]
 *
 * Drop-in: give it a host element, a list name and that list's capability
 * token, and it renders the whole panel — the kinds-of-movement card, the
 * metric select, the `Since` control, the chart and the integrity line.
 *
 *   const panel = await PrioritizationTrend.mount(host, {list, token});
 *   panel.redraw();     // after the tab becomes visible, or the theme flips
 *
 * It draws on a <canvas> rather than ECharts on purpose: the whole panel is
 * ~200px of one line, and the one thing it must do that a stock line chart does
 * not — dash the segments whose window contains a change of OURS — is three
 * lines of canvas and a fight with a charting library. Nothing is added to
 * package.json (plan §7a).
 *
 * WHERE THE NUMBERS COME FROM. Every figure is read from the §12.3 payload the
 * backend serves at `GET /api/lists/{list}/trend`, which is `list_changelog
 * trend` — the same function the ARIDE deck and the mockup are generated from.
 * This file computes no counts of its own. Where the payload does not carry
 * something, the panel says so rather than filling the hole.
 *
 * THE THREE THINGS A 14-LIST VERSION MUST HANDLE THAT ARIDE'S SIX RUNS HID
 * (the mockup is ARIDE-only and assumes all three away):
 *
 *   1. A run can be MISSING a metric entirely. Reports predating the
 *      Project_Priority split or the IUCN join carry no such column, and
 *      `list_changelog` omits the metric rather than zeroing it (8 of
 *      awcs_species' 18 runs are like this). Plotting `undefined` draws a line
 *      to the floor on a run that simply did not measure. Such runs are left
 *      unplotted and counted in the sub-line.
 *   2. `series_identity` does not hold everywhere. `first_in_genus` is the same
 *      set as the Highest_* novelty labels on ARIDE and NOT on Liste_Roscoff;
 *      `unassigned` is the `not_found` set on current reports and not on MDD's
 *      May runs. A label claiming the identity is wrong on those lists, so the
 *      label changes and — where two real series exist — a second line is
 *      offered instead of one line standing for both (§12.3).
 *   3. `movement_types` can be null. Two of the 14 lists have no attributable
 *      window at all, and the card that breaks movement into kinds cannot be
 *      drawn for them.
 */

const PrioritizationTrend = (function () {
  'use strict';

  /* One metric per line. Six by default — the set §7a names. `first_in_genus`
     also IS "would be a phylogenetic first" wherever series_identity holds:
     every Highest_* label implies First_in_Genus = Yes, so they are the same
     set by construction and must appear as ONE series, never two lines that
     cannot diverge. */
  const BASE_METRICS = [
    { key: 'open', label: 'Open opportunities',
      gloss: 'no active project and no assembly — the clearest sequencing targets' },
    { key: 'first_in_genus', label: 'Would be a phylogenetic first',
      gloss: 'would be the first assembly in its genus. Identical to the Highest_* set by construction, so it is one line, not two' },
    { key: 'active', label: 'Active elsewhere',
      gloss: 'an EBP project is sequencing this species now (Low_Active). Species only at the sample stage are counted separately' },
    { key: 'improve', label: 'Improvable assembly',
      gloss: 'an assembly exists but is not EBP standard, and no project is active' },
    { key: 'unassigned', label: 'Unidentifiable in GoaT',
      gloss: 'names GoaT returned no species record for. The same set as goat_lookup_status = not_found' },
    { key: 'threatened', label: 'Threatened (CR/EN/VU)',
      gloss: 'IUCN Red List categories CR, EN or VU — a third external source, on its own release schedule' },
  ];

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const WORDS = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six',
                  7: 'seven', 8: 'eight', 9: 'nine' };

  const esc = (value) => String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const dayNum = (iso) => {
    const p = iso.split('-');
    return Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5;
  };
  const pretty = (iso) => {
    const p = iso.split('-');
    return (+p[2]) + ' ' + MONTHS[+p[1] - 1];
  };
  const prettyYear = (iso) => pretty(iso) + ' ' + iso.slice(0, 4);
  const has = (run, key) => typeof (run.stock || {})[key] === 'number';

  /* ── styles ───────────────────────────────────────────────────────────────
     Injected once by the component rather than left to the host page, so the
     panel stays drop-in: Task 6 can rebuild prioritization.html around it
     without the chart quietly losing its layout. Colours come from the page's
     botanical-ink variables where they exist, with the dark values as
     fallbacks so the panel is legible on a page that defines none. */
  const STYLE_ID = 'ebp-trend-styles';
  const STYLES = `
  .ebp-trend, .ebp-moves{border:1px solid var(--line,#22362b); border-radius:var(--radius,14px);
    background:var(--ink-2,#0f1a14); color:var(--paper,#e9f2ec);}
  .ebp-moves{padding:18px 22px 20px; margin-bottom:18px;}
  .ebp-trend{padding:20px 22px 22px;}
  .ebp-moves h3{font-size:12px; text-transform:uppercase; letter-spacing:.05em;
    color:var(--paper-mute,#6f8a7b); margin:0 0 8px; font-weight:700;}
  .ebp-moves .lead{font-size:13px; color:var(--paper-dim,#a6bcaf); margin:0 0 15px;}
  .ebp-moves .lead b{color:var(--paper,#e9f2ec);}
  .ebp-movegrid{display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:11px; align-items:start;}
  .ebp-move{border:1px solid var(--line,#22362b); border-radius:10px; background:var(--ink-3,#14231b); padding:11px 13px;}
  .ebp-move-head{display:flex; gap:11px; align-items:flex-start; width:100%; text-align:left;
    background:none; border:none; padding:0; margin:0; font:inherit; color:inherit; cursor:pointer;}
  .ebp-move-head .caret{margin-left:auto; color:var(--paper-mute,#6f8a7b); font-size:11px;
    transition:transform .15s; flex:none; padding-top:3px;}
  .ebp-move.open .ebp-move-head .caret{transform:rotate(180deg);}
  .ebp-move-head:hover .lbl{color:var(--green-glow,#5fd39a);}
  /* flex:none, or a three-digit count is shrunk to min-width and overprints the
     label beside it — Liste_Roscoff's window has kinds of 419 and 468 species. */
  .ebp-move .n{font-size:20px; font-weight:800; font-variant-numeric:tabular-nums;
    color:var(--green-glow,#5fd39a); line-height:1.15; min-width:20px; flex:none;}
  .ebp-move .lbl{display:block; font-size:12.5px; font-weight:650; color:var(--paper,#e9f2ec); line-height:1.3;}
  .ebp-move .mean{display:block; font-size:11.5px; color:var(--paper-mute,#6f8a7b); margin-top:3px; line-height:1.4;}
  /* Collapsed by default: a kind on a 5,000-name list can hold hundreds of
     species and would bury the card. Nothing is truncated — the box scrolls. */
  .ebp-move .names{display:none; flex-wrap:wrap; gap:5px; margin-top:10px; max-height:216px;
    overflow-y:auto; padding-top:9px; border-top:1px dashed var(--line,#22362b);}
  .ebp-move.open .names{display:flex;}
  .ebp-sp-chip{font-style:italic; font-size:11.5px; color:var(--paper-dim,#a6bcaf);
    background:var(--ink-2,#0f1a14); border:1px solid var(--line,#22362b); border-radius:999px;
    padding:2px 9px; cursor:pointer; line-height:1.5; font-family:inherit;}
  .ebp-sp-chip:hover{color:var(--green-glow,#5fd39a); border-color:rgba(63,191,127,.45);}

  .ebp-trend-head{display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; margin-bottom:6px;}
  .ebp-trend-head h2{font-size:15px; font-weight:750; letter-spacing:-.01em; margin:0;
    color:var(--paper,#e9f2ec); text-transform:none;}
  .ebp-badge{font-size:10.5px; font-weight:700; letter-spacing:.04em; text-transform:uppercase;
    color:var(--green-glow,#5fd39a); background:rgba(63,191,127,.12);
    border:1px solid rgba(63,191,127,.3); border-radius:999px; padding:2px 9px;}
  .ebp-trend-ctls{margin-left:auto; display:flex; gap:14px; align-items:center; flex-wrap:wrap;}
  .ebp-trend-ctl{display:flex; align-items:center; gap:7px;}
  .ebp-trend-ctl label{font-size:11.5px; text-transform:uppercase; letter-spacing:.05em;
    color:var(--paper-mute,#6f8a7b); font-weight:700;}
  .ebp-trend-ctl select{font:inherit; font-size:13px; padding:7px 10px; background:var(--ink,#0b1310);
    color:var(--paper,#e9f2ec); border:1px solid var(--line,#22362b); border-radius:8px; cursor:pointer;}
  .ebp-trend-sub{font-size:12.5px; color:var(--paper-dim,#a6bcaf); margin:0 0 14px;}
  .ebp-trend-sub b{color:var(--paper,#e9f2ec);}
  .ebp-canvas-wrap{position:relative;}
  .ebp-trend canvas{width:100%; height:210px; display:block;}
  .ebp-trend-tip{position:absolute; pointer-events:none; opacity:0; transition:opacity .12s;
    background:var(--ink-3,#14231b); border:1px solid var(--line,#22362b); border-radius:9px;
    padding:8px 11px; font-size:11.5px; line-height:1.5; color:var(--paper,#e9f2ec);
    box-shadow:0 12px 30px rgba(0,0,0,.4); white-space:nowrap; z-index:5;}
  .ebp-trend-tip b{color:var(--green-glow,#5fd39a);}
  .ebp-trend-tip .tt-d{color:var(--paper-mute,#6f8a7b);}
  .ebp-trend-legend{display:flex; gap:16px; margin-top:12px; font-size:11.5px;
    color:var(--paper-dim,#a6bcaf); flex-wrap:wrap;}
  .ebp-trend-legend span{display:inline-flex; align-items:center; gap:6px;}
  .ebp-trend-legend .ln{width:18px; height:2px; border-radius:2px; background:var(--green-glow,#5fd39a);}
  .ebp-trend-legend .ln.dash{background:repeating-linear-gradient(90deg,var(--green-glow,#5fd39a) 0 5px,transparent 5px 9px);}
  .ebp-trend-legend .pt{width:8px; height:8px; border-radius:50%; background:var(--green-glow,#5fd39a);}
  .ebp-trend-legend .muted{color:var(--paper-mute,#6f8a7b);}
  .ebp-trend-note{display:flex; gap:9px; align-items:flex-start; font-size:12px;
    color:var(--paper-dim,#a6bcaf); margin-top:14px; padding:11px 13px; background:var(--ink-3,#14231b);
    border:1px solid var(--line,#22362b); border-radius:9px;}
  .ebp-trend-note .ic{flex:none; color:var(--warn,#e0a760);}
  .ebp-trend-note b{color:var(--paper,#e9f2ec);}
  .ebp-trend-note[hidden]{display:none;}
  .ebp-trend-msg{border:1px solid var(--line,#22362b); border-radius:var(--radius,14px);
    background:var(--ink-2,#0f1a14); color:var(--paper-dim,#a6bcaf); padding:20px 22px;
    font-size:13px; line-height:1.6;}
  .ebp-trend-msg b{color:var(--paper,#e9f2ec);}
  .ebp-trend-msg code{font-family:ui-monospace,'Cascadia Code',Menlo,monospace; font-size:.9em;
    color:var(--green-glow,#5fd39a);}
  `;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement('style');
    tag.id = STYLE_ID;
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }

  /* ── which metrics this list can honestly offer ───────────────────────────
     A metric no run recorded is dropped rather than shown as an empty chart,
     and a metric pair that has stopped being one series is relabelled — and,
     where the payload carries both sides, split into two lines. */
  function metricsFor(payload) {
    const identity = payload.series_identity || {};
    const notes = (identity.notes || []).join('; ');
    const recorded = (key) => payload.runs.some((run) => has(run, key));
    const metrics = [];

    BASE_METRICS.forEach(function (metric) {
      if (!recorded(metric.key)) return;
      const spec = { key: metric.key, label: metric.label, gloss: metric.gloss };

      if (metric.key === 'first_in_genus' && identity.first_in_genus_equals_highest === false) {
        // Liste_Roscoff: six species are Highest_F with First_in_Genus = No.
        // Calling this line "would be a phylogenetic first" would be a claim
        // this list's own data contradicts.
        spec.label = 'First in genus';
        spec.gloss = 'would be the first assembly in its genus. On this list that is NOT the same '
          + 'set as the Highest_* novelty labels, so this line stands for first-in-genus only'
          + (notes ? ' (' + notes + ')' : '');
      }
      if (metric.key === 'unassigned' && identity.unassigned_equals_not_found === false) {
        spec.label = 'Not assigned a priority';
        spec.gloss = 'species the report left as Not_Assigned. On this list that is NOT the same '
          + 'set as the names GoaT could not identify, which is the separate line below'
          + (notes ? ' (' + notes + ')' : '');
      }
      metrics.push(spec);
    });

    // Two real series need two lines. Only offered where they have diverged —
    // on a list where they are one set, a second identical line is the bug the
    // display rule forbids.
    if (identity.unassigned_equals_not_found === false && recorded('not_found')) {
      metrics.push({ key: 'not_found', label: 'Unidentifiable in GoaT',
        gloss: 'names GoaT returned no species record for (goat_lookup_status = not_found)' });
    }
    return metrics;
  }

  function movesCard(payload) {
    const moves = payload.movement_types;
    if (!moves) return '';
    const kinds = moves.kinds || [];
    const membership = moves.membership || 0;
    const total = moves.external + moves.ours + membership;

    /* Spelled "seven kinds", not "7 kinds": the integrity line a few inches
       below can say 7 SPECIES moved because of us, and two unrelated sevens
       side by side is exactly the confusion the proposal warns about. */
    const kindWord = WORDS[kinds.length] || kinds.length;

    return '<div class="ebp-moves">'
      + '<h3>What kinds of movement this window contains</h3>'
      + '<p class="lead"><b>' + total + ' species changed between ' + esc(pretty(moves.since))
      + ' and ' + esc(pretty(moves.to)) + '.</b> ' + moves.external
      + ' of them because something shifted in an external source — GoaT, an EBP project, or IUCN '
      + '— in the ' + kindWord + ' kind' + (kinds.length === 1 ? '' : 's') + ' below.'
      // Going forward the normal case is zero of ours, and "the other 0 moved
      // because a correction shipped" would be a strange thing to read.
      + (moves.ours ? ' ' + moves.ours + ' moved because a lookup correction shipped on our side.' : '')
      // The third bucket. A species added to or removed from the list is
      // neither the network moving nor us — it is the input moving.
      + (membership ? ' ' + membership + ' entered or left the list itself.' : '')
      + '</p>'
      + '<div class="ebp-movegrid">' + kinds.map(function (kind, index) {
        return '<div class="ebp-move" data-kind="' + esc(kind.key) + '">'
          + '<button class="ebp-move-head" aria-expanded="false" aria-controls="ebp-kind-' + index + '">'
          + '<span class="n">' + kind.count + '</span>'
          + '<span><span class="lbl">' + esc(kind.label) + '</span>'
          + '<span class="mean">' + esc(kind.meaning) + '</span></span>'
          + '<span class="caret">▼</span>'
          + '</button>'
          + '<div class="names" id="ebp-kind-' + index + '">'
          + (kind.species || []).map(function (name) {
            return '<button class="ebp-sp-chip" data-name="' + esc(name) + '">' + esc(name) + '</button>';
          }).join('')
          + '</div></div>';
      }).join('') + '</div></div>';
  }

  function shell(payload, metrics) {
    const runs = payload.runs;
    return movesCard(payload)
      + '<div class="ebp-trend">'
      + '<div class="ebp-trend-head">'
      + '<h2>Source movement over time</h2>'
      + '<span class="ebp-badge">' + runs.length + ' dated runs</span>'
      + '<div class="ebp-trend-ctls">'
      + '<div class="ebp-trend-ctl"><label for="ebp-since">Since</label>'
      + '<select id="ebp-since"></select></div>'
      + '<div class="ebp-trend-ctl"><label for="ebp-metric">Metric</label>'
      + '<select id="ebp-metric">' + metrics.map(function (metric) {
        return '<option value="' + esc(metric.key) + '">' + esc(metric.label) + '</option>';
      }).join('') + '</select></div>'
      + '</div></div>'
      + '<p class="ebp-trend-sub"></p>'
      + '<div class="ebp-canvas-wrap"><canvas height="210"></canvas>'
      + '<div class="ebp-trend-tip"></div></div>'
      + '<div class="ebp-trend-legend">'
      + '<span><i class="ln"></i>Source movement</span>'
      + '<span><i class="ln dash"></i>Window containing a change of ours</span>'
      + '<span><i class="pt"></i>A dated run of the same ' + payload.species_count + ' names</span>'
      + '<span class="muted">Vertical axis fitted to the range, not zero-based · hover a point for its window</span>'
      + '</div>'
      + '<div class="ebp-trend-note" hidden><span class="ic">◈</span><span class="ebp-trend-integrity"></span></div>'
      + '</div>';
  }

  function message(host, html) {
    host.innerHTML = '<div class="ebp-trend-msg">' + html + '</div>';
  }

  /**
   * Render Panel A for one list.
   *
   * Resolves to {state, …}. `state` is one of:
   *   'ok'          the panel is drawn
   *   'single-run'  the list has exactly one captured run — a notice, no chart
   *   'not-found'   the token opens no list (or the list is unknown — the API
   *                 refuses to say which, §12.6). Nothing is rendered.
   *   'error'       the backend could not be reached; the reason is shown.
   */
  async function mount(host, options) {
    const opts = options || {};
    injectStyles();
    message(host, 'Loading this list’s history…');

    let payload;
    let runsDoc;
    try {
      [runsDoc, payload] = await Promise.all([
        EBPBackend.listRuns(opts.list, opts.token),
        EBPBackend.listTrend(opts.list, { token: opts.token }),
      ]);
    } catch (err) {
      if (err.notFound) {
        host.innerHTML = '';
        return { state: 'not-found', error: err };
      }
      message(host, err.unconfigured
        ? '<b>No backend is configured for this deployment yet.</b> The per-list trend reads '
          + 'from the EBP backend, which has not been given a hostname in <code>services_backend.js</code>.'
        : '<b>Could not load this list’s history.</b> ' + esc(err.message));
      return { state: 'error', error: err };
    }

    const runs = payload.runs || [];
    if (runs.length === 0) {
      message(host, '<b>No runs captured for this list yet.</b>');
      return { state: 'single-run', payload: payload };
    }
    if (runs.length === 1) {
      // §7a: at exactly one run there is a point and no line. Say that, rather
      // than draw a chart of one dot that reads as "nothing has ever moved".
      message(host, '<b>First run captured ' + esc(prettyYear(runs[0].date)) + '.</b> '
        + 'History starts from the next one — a trend needs two runs to have a window between them.');
      return { state: 'single-run', payload: payload };
    }

    const metrics = metricsFor(payload);
    if (!metrics.length) {
      message(host, '<b>None of the trend metrics were recorded on this list’s runs.</b> '
        + 'The reports predate the columns the metrics are counted from.');
      return { state: 'single-run', payload: payload };
    }

    host.innerHTML = shell(payload, metrics);

    const metricSel = host.querySelector('#ebp-metric');
    const sinceSel = host.querySelector('#ebp-since');
    const subEl = host.querySelector('.ebp-trend-sub');
    const noteEl = host.querySelector('.ebp-trend-note');
    const integrityEl = host.querySelector('.ebp-trend-integrity');
    const canvas = host.querySelector('canvas');
    const tip = host.querySelector('.ebp-trend-tip');

    const cumulative = payload.cumulative || {};
    const multiYear = runs[0].date.slice(0, 4) !== runs[runs.length - 1].date.slice(0, 4);
    const axisLabel = multiYear ? prettyYear : pretty;

    /* Default metric: `open` — the question the tool exists to answer — but only
       where this list actually has a series to draw. `open` is recorded on ONE
       of awcs_species' 18 runs (the other 17 predate the Project_Priority
       split), and opening on a single dot would present the richest history in
       the system as a list that has never been measured. Falling back to the
       best-covered metric picks `first_in_genus`, which runs the full 18. */
    const plottedCount = (key) => runs.filter((run) => has(run, key)).length;
    let curMetric = (function () {
      if (metrics.some((m) => m.key === 'open') && plottedCount('open') > 1) return 'open';
      return metrics.slice().sort((a, b) => plottedCount(b.key) - plottedCount(a.key))[0].key;
    })();
    /* Default Since = the previous run: "what changed since last time", the
       incremental question. An older date gives the cumulative view. */
    let curSince = runs[runs.length - 2].date;

    metricSel.value = curMetric;
    /* Only dates a run was actually captured on, and never the newest — "since
       the last run" would be a window of nothing. The dates come from
       /runs (`runsDoc`), which exists precisely to answer this, and the trend
       payload's own runs are the fallback if the two ever disagree. */
    const sinceDates = (runsDoc && runsDoc.runs && runsDoc.runs.length === runs.length
      ? runsDoc.runs : runs).slice(0, -1).map((run) => run.date);
    sinceSel.innerHTML = sinceDates.map(function (date) {
      return '<option value="' + esc(date) + '">' + esc(prettyYear(date)) + '</option>';
    }).join('');
    sinceSel.value = curSince;

    const meta = () => metrics.filter((m) => m.key === curMetric)[0];

    /* ── the chart ─────────────────────────────────────────────────────────── */
    const cvar = (name, fallback) => (getComputedStyle(document.documentElement)
      .getPropertyValue(name).trim() || fallback);
    let geom = [];

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth || 1040;
      const cssH = 210;
      canvas.width = cssW * dpr;
      canvas.height = cssH * dpr;
      const g = canvas.getContext('2d');
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      g.clearRect(0, 0, cssW, cssH);

      const padL = 44, padR = 18, padT = 18, padB = 36;
      const w = cssW - padL - padR, h = cssH - padT - padB;

      // Runs that recorded this metric. A run that did not is not a zero.
      const plotted = runs.map((run, index) => ({ run: run, index: index }))
        .filter((point) => has(point.run, curMetric));
      if (!plotted.length) return;

      const vals = plotted.map((point) => point.run.stock[curMetric]);
      const lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);

      /* The axis is fitted to the data, not pinned to zero. These series move by
         a handful of species out of hundreds, and a 0-based axis draws every one
         of them as a flat line — the panel would show nothing and the text would
         carry it all. That is only legitimate because the mark is a LINE
         (position), not an area or a bar (length). Tick values are always drawn,
         and the legend says the axis is fitted. */
      const pad = Math.max(1, Math.round((hi - lo) * 0.35));
      const loPad = Math.max(0, lo - pad), hiPad = hi + pad;
      // A 1-2-5 ladder at four intervals — a count axis with thirteen gridlines
      // is noise, not precision.
      const raw = (hiPad - loPad) / 4;
      const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
      let stepY = 1;
      [1, 2, 5, 10].some(function (m) { if (m * mag >= raw) { stepY = m * mag; return true; } return false; });
      stepY = Math.max(1, Math.round(stepY));    // every metric is a species count
      const yMin = Math.max(0, Math.floor(loPad / stepY) * stepY);
      let yMax = Math.ceil(hiPad / stepY) * stepY;
      if (yMax <= yMin) yMax = yMin + stepY;

      const green = cvar('--green-glow', '#5fd39a');
      const mute = cvar('--paper-mute', '#6f8a7b');
      const line = cvar('--line', '#22362b');
      const dim = cvar('--paper-dim', '#a6bcaf');
      const surface = cvar('--ink-2', '#0f1a14');

      /* grid + y labels. Solid rules — dashing is reserved for the data line,
         where it means "this window contains a change of ours". */
      g.font = '10px -apple-system,Segoe UI,sans-serif';
      g.textBaseline = 'middle';
      g.textAlign = 'right';
      for (let tick = yMin; tick <= yMax + 0.001; tick += stepY) {
        const y = padT + h - ((tick - yMin) / (yMax - yMin)) * h;
        g.strokeStyle = line; g.lineWidth = 1;
        g.beginPath(); g.moveTo(padL, y); g.lineTo(padL + w, y); g.stroke();
        g.fillStyle = mute;
        g.fillText(String(Math.round(tick)), padL - 7, y);
      }

      /* x is proportional to elapsed time, not to run index — runs are a day to
         two months apart, and even spacing would draw a two-month gap the same
         width as an overnight re-run. The span covers ALL runs, so the axis does
         not shift when a metric with fewer points is selected. */
      const t0 = dayNum(runs[0].date);
      const t1 = dayNum(runs[runs.length - 1].date);
      const span = (t1 - t0) || 1;
      // Inset so the first and last points are not flush against the axes —
      // their value labels are centred and would overprint the y-axis ticks.
      const inset = 16, wIn = w - 2 * inset;
      const xAt = (d) => padL + inset + wIn * (dayNum(d) - t0) / span;
      const yAt = (v) => padT + h - ((v - yMin) / (yMax - yMin)) * h;

      geom = plotted.map((point) => ({
        run: point.run,
        index: point.index,
        x: xAt(point.run.date),
        y: yAt(point.run.stock[curMetric]),
      }));

      /* the line, one segment at a time so a pipeline-change window can be
         dashed. A segment spanning runs that did not record this metric is
         dashed if ANY run it passes over carries the flag — the change is
         inside that stretch either way. */
      g.strokeStyle = green; g.lineWidth = 2; g.lineJoin = 'round'; g.lineCap = 'round';
      for (let s = 1; s < geom.length; s++) {
        const ours = runs.slice(geom[s - 1].index + 1, geom[s].index + 1)
          .some((run) => run.pipeline_change);
        g.setLineDash(ours ? [6, 4] : []);
        g.beginPath();
        g.moveTo(geom[s - 1].x, geom[s - 1].y);
        g.lineTo(geom[s].x, geom[s].y);
        g.stroke();
      }
      g.setLineDash([]);

      geom.forEach(function (p) {
        g.beginPath(); g.arc(p.x, p.y, 4, 0, 7);
        g.fillStyle = green; g.fill();
        g.strokeStyle = surface; g.lineWidth = 2; g.stroke();   // ring, so touching points stay separable
      });

      /* value labels on the endpoints and the extremes only. A number on every
         point collides at one-day spacing and says nothing on the runs that held
         steady — the tooltip carries those. The FIRST run to hit each extreme is
         labelled, so a value held across four runs is not labelled four times. */
      const label = {};
      label[0] = 1;
      label[geom.length - 1] = 1;
      let iLo = -1, iHi = -1;
      geom.forEach(function (p, idx) {
        const v = p.run.stock[curMetric];
        if (iLo < 0 && v === lo) iLo = idx;
        if (iHi < 0 && v === hi) iHi = idx;
      });
      label[iLo] = 1; label[iHi] = 1;
      g.textAlign = 'center';
      g.font = '600 10px -apple-system,Segoe UI,sans-serif';
      let lastLabelRight = -1e9;
      geom.forEach(function (p, idx) {
        if (!label[idx]) return;
        const text = String(p.run.stock[curMetric]);
        const half = g.measureText(text).width / 2 + 5;
        if (idx !== geom.length - 1 && p.x - half < lastLabelRight) return;   // never overprint
        // A label sits above its point unless the point is a trough, where
        // "above" is where the line goes.
        const up = idx > 0 ? geom[idx - 1].y : 1e9;
        const dn = idx < geom.length - 1 ? geom[idx + 1].y : 1e9;
        const trough = Math.min(up, dn) < p.y;
        g.fillStyle = dim;
        g.textBaseline = trough ? 'top' : 'alphabetic';
        g.fillText(text, p.x, trough ? p.y + 11 : p.y - 11);
        lastLabelRight = p.x + half;
      });

      /* x labels, suppressed where they would collide — the tooltip carries the
         rest. Only plotted runs are labelled: an axis tick under no point would
         read as a run whose value is off-scale. */
      g.textAlign = 'center'; g.textBaseline = 'top';
      g.font = '10px -apple-system,Segoe UI,sans-serif';
      let lastRight = -1e9;
      geom.forEach(function (p, idx) {
        const text = axisLabel(p.run.date);
        const half = g.measureText(text).width / 2 + 6;
        if (idx !== geom.length - 1 && p.x - half < lastRight) return;
        g.fillStyle = p.run.pipeline_change ? dim : mute;
        g.fillText(text, p.x, padT + h + 9);
        lastRight = p.x + half;
      });
    }

    /* ── hover: crosshair-free, nearest-point tooltip ──────────────────────── */
    function onMove(event) {
      if (!geom.length) return;
      const box = canvas.getBoundingClientRect();
      const mx = event.clientX - box.left;
      let near = null, best = 1e9;
      geom.forEach(function (p) {
        const d = Math.abs(p.x - mx);
        if (d < best) { best = d; near = p; }
      });
      if (!near || best > 40) { tip.style.opacity = 0; return; }

      const flow = near.run.flow;
      const at = geom.indexOf(near);
      let delta = '';
      if (flow) {
        const moves = (flow.moves || {})[curMetric];
        const previous = at > 0 ? geom[at - 1] : null;
        // The net is only meaningful against a run that measured the same
        // metric; entered/left is only reported where the window carries it.
        const net = previous
          ? near.run.stock[curMetric] - previous.run.stock[curMetric]
          : null;
        const parts = [];
        if (net !== null) {
          parts.push((net > 0 ? '+' : '') + net + ' since ' + esc(pretty(previous.run.date)));
        }
        if (moves) parts.push(moves['in'] + ' entered, ' + moves.out + ' left');
        if (parts.length) delta += '<div class="tt-d">' + parts.join(' · ') + '</div>';
        if (flow.changed !== null && flow.changed !== undefined) {
          delta += '<div class="tt-d">' + flow.changed + ' species changed in this window'
            + (flow.attributed ? ' · ' + flow.pipeline + ' ours' : ' · cause not recoverable')
            + '</div>';
        }
      }
      tip.innerHTML = '<b>' + near.run.stock[curMetric] + '</b> · ' + esc(meta().label)
        + '<div class="tt-d">' + esc(prettyYear(near.run.date)) + '</div>' + delta;
      tip.style.opacity = 1;
      const tw = tip.offsetWidth;
      tip.style.left = Math.max(0, Math.min(near.x - tw / 2, box.width - tw)) + 'px';
      tip.style.top = Math.max(0, near.y - tip.offsetHeight - 14) + 'px';
    }

    /* ── the sub line and the integrity line ───────────────────────────────── */
    function updateText() {
      const m = meta();
      const last = runs[runs.length - 1];
      const plotted = runs.filter((run) => has(run, curMetric));
      const skipped = runs.length - plotted.length;
      const first = plotted[0];
      const newest = plotted[plotted.length - 1];

      let text = 'Tracking <b>' + esc(m.label) + '</b> — ' + esc(m.gloss) + ' — across '
        + plotted.length + ' dated run' + (plotted.length === 1 ? '' : 's') + ' of the same '
        + payload.species_count + ' names, '
        + (plotted.length === 1
          ? 'on ' + esc(prettyYear(newest.date))
          : esc(prettyYear(first.date)) + ' to ' + esc(prettyYear(newest.date))) + '.';
      if (skipped) {
        // Omitted, never zeroed (§12.5). Say which runs are missing from this
        // line, or a shorter line reads as a shorter history.
        text += ' <b>' + skipped + '</b> earlier run' + (skipped === 1 ? '' : 's')
          + ' did not record this metric and ' + (skipped === 1 ? 'is' : 'are') + ' not plotted.';
      }

      const fromRun = runs.filter((run) => run.date === curSince)[0];
      const cum = cumulative[curSince];
      if (fromRun && has(fromRun, curMetric) && has(newest, curMetric)) {
        const was = fromRun.stock[curMetric];
        const now = newest.stock[curMetric];
        const net = now - was;
        const moves = cum && cum.moves ? cum.moves[curMetric] : null;
        text += '<br>Since <b>' + esc(pretty(curSince)) + '</b>: <b>' + was + ' → ' + now + '</b> '
          + (net === 0 ? '(no net change)' : '(' + (net > 0 ? '+' : '') + net + ')');
        if (moves) {
          text += ' — <b>' + moves['in'] + '</b> species entered, <b>' + moves.out + '</b> left. '
            // The net is the number that misleads; the two counts either side of
            // it are what actually happened (§10a, 237 → 244).
            + (net !== 0
              ? 'The net is the number that misleads; the two counts either side of it are what actually happened.'
              : (moves['in'] || moves.out
                ? 'A flat total is not a still list — the same number of species moved each way.'
                : ''));
        } else {
          text += '.';
        }
      } else if (fromRun) {
        text += '<br>This metric was not recorded at <b>' + esc(pretty(curSince))
          + '</b>, so there is nothing to compare the current ' + newest.stock[curMetric]
          + ' against.';
      }
      subEl.innerHTML = text;

      /* The integrity line — generated from the changelog, never authored.
         When the selected window IS the one attributable window, the split is
         already the headline of the kinds-of-movement card above, so this line
         stays out of the way rather than restating it. It appears when the
         window reaches further back — the case the card cannot speak for, and
         the one where a reader would otherwise assume the whole span is source
         movement. */
      if (!cum) {
        noteEl.hidden = true;
        integrityEl.innerHTML = '';
        return;
      }
      const attributed = cum.attributed_window;
      noteEl.hidden = !!(attributed && cum.windows === 1 && payload.movement_types);
      if (noteEl.hidden) { integrityEl.innerHTML = ''; return; }

      if (attributed) {
        integrityEl.innerHTML = '<b>' + cum.changed + ' species changed since '
          + esc(pretty(curSince)) + '</b>, across ' + cum.windows + ' window'
          + (cum.windows === 1 ? '' : 's') + '. Only ' + (cum.windows === 1 ? 'this window' : 'the last ('
          + esc(pretty(attributed.since)) + ' → ' + esc(pretty(last.date)) + ')')
          + ' can be cause-attributed: ' + attributed.pipeline + ' of its ' + attributed.changed
          + ' changes came from a pipeline change.'
          + (cum.windows > 1
            ? ' <b>Cause is not recoverable for the earlier windows</b> — the enriched data that '
              + 'would separate a source move from one of ours was overwritten in place.'
            : '');
      } else {
        integrityEl.innerHTML = '<b>' + cum.changed + ' species changed since '
          + esc(pretty(curSince)) + '.</b> <b>Cause is not recoverable for '
          + (cum.windows === 1 ? 'this window' : 'any of these ' + cum.windows + ' windows')
          + '</b> — the enriched data that would separate a source move from one of ours was '
          + 'overwritten in place.';
      }
    }

    /* ── wiring ────────────────────────────────────────────────────────────── */
    function refresh() { updateText(); draw(); }

    metricSel.addEventListener('change', function () { curMetric = this.value; refresh(); });
    sinceSel.addEventListener('change', function () {
      curSince = this.value;
      refresh();
      host.dispatchEvent(new CustomEvent('ebp-trend:since', {
        bubbles: true, detail: { list: opts.list, since: curSince },
      }));
    });
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', function () { tip.style.opacity = 0; });
    window.addEventListener('resize', draw);

    const movesEl = host.querySelector('.ebp-moves');
    if (movesEl) {
      movesEl.addEventListener('click', function (event) {
        /* A species name is the entry point to its own timeline — Panel B
           (A-T5). Until that lands, the click is announced and nothing else:
           whoever owns the page decides where a timeline opens. */
        const chip = event.target.closest('.ebp-sp-chip');
        if (chip) {
          host.dispatchEvent(new CustomEvent('ebp-trend:species', {
            bubbles: true, detail: { list: opts.list, name: chip.dataset.name },
          }));
          return;
        }
        const head = event.target.closest('.ebp-move-head');
        if (!head) return;
        const card = head.closest('.ebp-move');
        const open = !card.classList.contains('open');
        card.classList.toggle('open', open);
        head.setAttribute('aria-expanded', open ? 'true' : 'false');   // the caret shows the state
      });
    }

    refresh();

    return {
      state: 'ok',
      list: opts.list,
      payload: payload,
      /* The canvas has no width while its tab is display:none, so it can only be
         sized once the panel is actually on screen. Call this when the tab is
         shown, and after a theme flip — the colours are read from CSS vars. */
      redraw: draw,
      /* Move the window from outside — Panel B (A-T5) carries its own `Since`
         control, and two controls showing different dates on one page is the
         forked state the mockup's single-panel rule exists to prevent. Silently
         ignores a date this control does not offer, and does NOT re-dispatch
         `ebp-trend:since`: the caller is the one who just announced it. */
      setSince(date) {
        if (sinceDates.indexOf(date) < 0 || date === curSince) return;
        curSince = date;
        sinceSel.value = date;
        refresh();
      },
      destroy() { window.removeEventListener('resize', draw); host.innerHTML = ''; },
    };
  }

  return { mount: mount, metricsFor: metricsFor };
})();
