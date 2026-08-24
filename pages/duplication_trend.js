/**
 * How one project's cross-project duplication is changing, capture by capture. [A-D4]
 *
 *   const panel = DuplicationTrend.mount(host, {project: 'dtol', displayName: '…'});
 *   panel.redraw();      // theme flip / resize
 *   panel.dispose();     // before the host is replaced
 *
 * WHERE THE HISTORY COMES FROM, AND WHY IT IS SHORT TODAY. The weekly capture
 * job stores four dated `duplication.*` metrics per project in
 * `report_snapshots` (A-D5b, duplication plan §6), and `GET /api/trends/<key>`
 * reads them. Three of the four are the three reports; the fourth is their sum,
 * which this panel deliberately does NOT draw — see below. So the trend is not
 * something that had to be built, it is something that **accrues**: one point
 * per project per weekly run, starting from the first capture.
 *
 * **It cannot be backfilled.** GoaT reports what is true today and keeps no
 * history, so a week not captured is a week permanently missing. That is why the
 * metrics were wired into the cron before there was any page to show them, and
 * it is why this panel states the number of captures rather than implying a long
 * series exists.
 *
 * THREE HONEST STATES, because a chart is not always the truthful rendering:
 *   * no captures at all — nothing has been recorded for this project yet;
 *   * ONE capture — the numbers are shown as numbers, and the panel says a
 *     trend needs a second point. Drawing a single dot on an axis and calling it
 *     a trend would suggest a flat line where there is no line at all;
 *   * two or more — the lines.
 *
 * THREE LINES, NOT FOUR. `duplication.total.<project>` is the sum of the other
 * three (the three report predicates are pairwise disjoint, which A-D5b's own
 * test asserts arithmetically), so a fourth line would add a channel and no
 * information. It is printed as a number in the header instead. This also keeps
 * the chart at three series, which is where an any-two-marks-may-touch form has
 * to stop — see the colour note on SERIES.
 */

const DuplicationTrend = (function () {
  'use strict';

  /**
   * The three series, their metric key, and their colour token.
   *
   * COLOUR IS NOT THE ONLY ENCODING HERE, and that is measured rather than
   * decorative. Green against amber is the classic red-green collision: the dark
   * pair separates by ΔE 7.1 under deuteranopia (OKLab ×100, Machado 2009 at
   * severity 1.0) and the light pair by 5.1 — below the threshold at which two
   * lines can be told apart by hue. Both pairs are comfortable under normal
   * vision (17.3 and 22.3), so the fix is not a different palette — no three
   * hues clear both gates on a white ground — it is a second channel. Each line
   * therefore carries its own LINE TYPE and a DIRECT END-LABEL, so the series
   * can be read with no colour vision at all.
   */
  const SERIES = [
    { key: 'ebp_standard_done', label: 'R1 done elsewhere', short: 'R1',
      varn: '--trend-r1', lineType: 'solid',
      hint: 'species another project has already finished to EBP standard' },
    { key: 'active', label: 'R2 active duplication', short: 'R2',
      varn: '--trend-r2', lineType: 'dashed',
      hint: 'species your project and another are both working on' },
    { key: 'samples_elsewhere', label: 'R3 potential duplication', short: 'R3',
      varn: '--trend-r3', lineType: 'dotted',
      hint: 'species you have not started that another project already holds' },
  ];

  const esc = (value) => String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const num = (value) => (Number(value) || 0).toLocaleString();

  function cssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (value || '').trim() || fallback;
  }

  // ── state ─────────────────────────────────────────────────────────────────
  let host = null;
  let project = '';
  let displayName = '';
  let dates = [];            // every capture date, ascending
  let series = [];           // [{...SERIES entry, points: {date: value}}]
  let total = null;          // the newest `duplication.total.<project>` value
  let chart = null;          // the live ECharts instance, once there is a line

  // ── styles ────────────────────────────────────────────────────────────────
  const STYLE_ID = 'ebp-duptrend-styles';
  const STYLES = `
  .ebp-trend{border:1px solid var(--line,#22362b); border-radius:14px;
    background:var(--ink-2,#0f1a14); padding:20px 22px 22px; margin-bottom:26px;}
  .ebp-trend-head{display:flex; align-items:baseline; gap:12px; flex-wrap:wrap; margin-bottom:6px;}
  .ebp-trend-head h2{font-size:15px; font-weight:750; letter-spacing:-.01em; margin:0;}
  .ebp-trend-head .badge{font-size:10.5px; font-weight:700; letter-spacing:.04em;
    text-transform:uppercase; color:var(--green-glow,#5fd39a); background:rgba(22,163,74,.12);
    border:1px solid rgba(22,163,74,.3); border-radius:999px; padding:2px 9px; white-space:nowrap;}
  .ebp-trend-head .badge.thin{color:var(--warn,#e0a760); background:rgba(224,167,96,.12);
    border-color:rgba(224,167,96,.3);}
  .ebp-trend-head .tot{margin-left:auto; font-size:12.5px; color:var(--paper-mute,#6f8a7b);}
  .ebp-trend-head .tot b{color:var(--paper-dim,#a6bcaf); font-variant-numeric:tabular-nums;}
  /* Full panel width, no measure cap — the same rule the heatmap's notes and the
     reading guide follow. At 88ch this sat at 593px inside a 1,028px panel and
     ran to three lines with a void beside it. */
  .ebp-trend-sub{font-size:12.5px; color:var(--paper-dim,#a6bcaf); margin:0 0 16px;
    line-height:1.6;}
  .ebp-trend-sub b{color:var(--paper,#e9f2ec);}
  .ebp-trend-chart{width:100%; height:220px;}
  .ebp-trend-legend{display:flex; gap:9px 18px; margin-top:12px; font-size:11.5px;
    color:var(--paper-dim,#a6bcaf); flex-wrap:wrap;}
  .ebp-trend-legend span{display:inline-flex; align-items:center; gap:7px;}
  .ebp-trend-legend .ln{width:22px; height:0; border-top-width:2px; border-top-style:solid; flex:none;}
  .ebp-trend-note{display:flex; gap:9px; align-items:flex-start; font-size:11.5px;
    color:var(--paper-mute,#6f8a7b); margin-top:14px; padding-top:13px;
    border-top:1px dashed var(--line,#22362b); line-height:1.65;}
  .ebp-trend-note .ic{flex:none; color:var(--warn,#e0a760);}
  .ebp-trend-note b{color:var(--paper-dim,#a6bcaf);}
  .ebp-trend-first{border:1px dashed var(--line,#22362b); border-radius:11px; padding:16px 18px;
    background:var(--ink-3,#14231b); font-size:12.5px; color:var(--paper-dim,#a6bcaf);
    line-height:1.7;}
  .ebp-trend-first b{color:var(--paper,#e9f2ec);}
  .ebp-trend-first ul{margin:9px 0 0; padding-left:19px;}
  .ebp-trend-first li{margin:3px 0;}
  .ebp-trend-first .v{font-variant-numeric:tabular-nums; font-weight:700; color:var(--paper,#e9f2ec);}
  `;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement('style');
    tag.id = STYLE_ID;
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }

  // ── the chart ─────────────────────────────────────────────────────────────

  /**
   * The ECharts option, rebuilt from scratch on every draw.
   *
   * WHY ECHARTS AND NOT A CANVAS. This panel was hand-drawn first, matching the
   * mockup — but the mockup's canvas was copied without checking whether its
   * REASON carried over, and it did not. `prioritization_trend.js` hand-rolls
   * because it dashes individual SEGMENTS of a line, which is not an ECharts
   * primitive; nothing here needs that. A multi-series time line is the library's
   * textbook case, and the ~150 lines of tick, axis, DPR and hit-test maths that
   * went with the canvas were generic work with no requirement behind them.
   * Checklist §5 allows "ECharts + vanilla JS only" — the house rule inside that
   * is library by default, hand-roll with a stated reason.
   *
   * Colours are read from CSS variables at build time, so a theme flip is a
   * rebuild — the same contract every other chart in this suite has.
   */
  function option() {
    const dim = cssVar('--paper-dim', '#a6bcaf');
    const mute = cssVar('--paper-mute', '#6f8a7b');
    const line = cssVar('--line', '#22362b');

    return {
      animation: false,
      /* `right` is generous because the end-labels live out there, and they are
         the encoding that makes the lines readable without colour — the plot
         yields the space rather than the labels being clipped. */
      grid: { left: 4, right: 104, top: 18, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'line', lineStyle: { color: mute, type: 'dashed' } },
        formatter(points) {
          if (!points || !points.length) return '';
          const rows = points.map(function (point) {
            return '<div style="display:flex; gap:14px; justify-content:space-between">'
              + '<span>' + point.marker + esc(point.seriesName) + '</span><b>'
              + (point.value === null || point.value === undefined ? '—' : num(point.value))
              + '</b></div>';
          }).join('');
          return '<b>' + esc(points[0].axisValue) + '</b><br>' + rows;
        },
        extraCssText: 'line-height:1.6;',
      },
      xAxis: {
        type: 'category', data: dates, boundaryGap: false,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: line } },
        axisLabel: { color: mute, fontSize: 10 },
      },
      yAxis: {
        type: 'value',
        /* A zero baseline, always: these are counts, and a count axis that does
           not start at zero exaggerates every move on it. */
        min: 0,
        axisLabel: { color: mute, fontSize: 10, formatter: (value) => num(value) },
        splitLine: { lineStyle: { color: line, type: 'dashed' } },
      },
      series: series.map(function (entry) {
        const color = cssVar(entry.varn, '#5fd39a');
        return {
          name: entry.label,
          type: 'line',
          symbol: 'circle',
          symbolSize: 7,
          /* A capture this metric missed is a null, and the gap is left open
             rather than bridged: connecting across it would draw a straight
             line through a week nobody measured. */
          connectNulls: false,
          data: dates.map(function (date) {
            const value = entry.points[date];
            return value === undefined ? null : value;
          }),
          itemStyle: { color: color },
          lineStyle: { color: color, width: 2, type: entry.lineType },
          /* The second channel. See the note on SERIES: the green/amber pair
             cannot be separated by hue under deuteranopia at any stepping, so
             the line type and this label carry the identity instead. */
          endLabel: {
            show: true, color: color, fontSize: 11, fontWeight: 600, distance: 8,
            /* The newest value rides in the label: it is the number a reader
               wants off a trend line, and putting it here means it is legible
               without hovering and without a fourth axis label. */
            formatter: (point) => entry.short + '  ' + num(point.value),
          },
          emphasis: { focus: 'series' },
        };
      }),
    };
  }

  function draw() {
    const box = host.querySelector('#ebp-trend-chart');
    if (!box || dates.length < 2 || typeof echarts === 'undefined') return;
    if (!chart || chart.getDom() !== box) chart = echarts.init(box);
    chart.setOption(option(), true);
  }

  function redraw() {
    if (!chart) { draw(); return; }
    chart.resize();
    chart.setOption(option(), true);
  }

  function dispose() {
    if (chart) { chart.dispose(); chart = null; }
  }

  function legendHtml() {
    return '<div class="ebp-trend-legend">' + series.map(function (entry) {
      const style = 'border-top-color:' + cssVar(entry.varn, '#5fd39a') + ';'
        + 'border-top-style:' + entry.lineType + ';';
      return '<span title="' + esc(entry.hint) + '"><i class="ln" style="' + style + '"></i>'
        + esc(entry.label) + '</span>';
    }).join('') + '</div>';
  }

  function noteHtml() {
    return '<div class="ebp-trend-note"><span class="ic">⚠</span><span>'
      + '<b>This history cannot be reconstructed.</b> GoaT reports what is true today and keeps no '
      + 'past, so each point here exists only because the weekly capture recorded it at the time. '
      + 'A week that is not captured is missing for good — which is also why the series starts when '
      + 'capture started, not when the project did.</span></div>';
  }

  function chartHtml(captures) {
    return '<div class="ebp-trend-head">'
      + '<h2>How is ' + esc(displayName || project.toUpperCase())
      + '’s overlap changing?</h2>'
      + '<span class="badge">' + captures + ' weekly captures</span>'
      + (total !== null ? '<span class="tot">newest total <b>' + num(total)
        + '</b> species</span>' : '')
      + '</div>'
      + '<p class="ebp-trend-sub">Each of the three reports, one point per recorded capture. '
      + 'Lines that <b>fall</b> are duplication being resolved — a species dropped, coordinated on, '
      + 'or finished; lines that <b>rise</b> are new overlap appearing as other projects register '
      + 'target species in GoaT.</p>'
      + '<div class="ebp-trend-chart" id="ebp-trend-chart"></div>'
      + legendHtml() + noteHtml();
  }

  function firstCaptureHtml() {
    const date = dates[0];
    return '<div class="ebp-trend-head">'
      + '<h2>How is ' + esc(displayName || project.toUpperCase())
      + '’s overlap changing?</h2>'
      + '<span class="badge thin">1 capture · not yet a trend</span></div>'
      + '<div class="ebp-trend-first">'
      + '<b>One capture has been recorded, on ' + esc(date) + '.</b> A trend needs a second, and '
      + 'the next weekly run will produce it. These are the numbers a future line will start from:'
      + '<ul>' + series.map(function (entry) {
        const value = entry.points[date];
        return '<li>' + esc(entry.label) + ' — <span class="v">'
          + (value === undefined ? '—' : num(value)) + '</span> species</li>';
      }).join('') + '</ul></div>'
      + noteHtml();
  }

  function noHistoryHtml() {
    return '<div class="ebp-trend-head">'
      + '<h2>How is ' + esc(displayName || project.toUpperCase())
      + '’s overlap changing?</h2>'
      + '<span class="badge thin">no captures recorded</span></div>'
      + '<div class="ebp-trend-first"><b>Nothing has been recorded for this project yet.</b> '
      + 'The weekly capture writes one dated point per report per project; once it has reached this '
      + 'project, its history starts accruing here.</div>' + noteHtml();
  }

  // ── mount ─────────────────────────────────────────────────────────────────

  /**
   * Load and render one project's duplication history.
   *
   * @param {Element} target
   * @param {{project: string, displayName?: string}} opts
   * @returns {Promise<{redraw: function, captures: number}>}
   */
  async function mount(target, opts) {
    injectStyles();
    host = target;
    project = (opts.project || '').toLowerCase();
    displayName = opts.displayName || '';
    /* A previous project's instance is bound to a DOM node this mount is about
       to replace; ECharts keeps a global registry keyed by element, so leaving
       it attached leaks the old chart and its resize listener. */
    dispose();
    host.className = 'ebp-trend';
    host.innerHTML = '<div class="ebp-trend-head"><h2>Loading history…</h2></div>';

    /* Four exact metric reads rather than one prefix sweep: `?prefix=duplication.`
       returns all 184 series for the whole network, which grows by 184 points a
       week and is 45× more than this panel draws. */
    let results;
    try {
      results = await Promise.all(SERIES.concat([{ key: 'total' }]).map(function (entry) {
        return EBPBackend.trend('duplication.' + entry.key + '.' + project);
      }));
    } catch (err) {
      host.innerHTML = '<div class="ebp-trend-head"><h2>History unavailable</h2></div>'
        + '<div class="ebp-trend-first">' + EBPBackend.explain(err) + '</div>';
      return { redraw() {}, dispose: dispose, captures: 0 };
    }

    const seen = {};
    series = SERIES.map(function (entry, index) {
      const points = {};
      ((results[index] || {}).points || []).forEach(function (point) {
        points[point.snapshot_date] = point.value;
        seen[point.snapshot_date] = true;
      });
      return Object.assign({}, entry, { points: points });
    });
    const totalPoints = (results[SERIES.length] || {}).points || [];
    total = totalPoints.length ? totalPoints[totalPoints.length - 1].value : null;
    totalPoints.forEach(function (point) { seen[point.snapshot_date] = true; });
    dates = Object.keys(seen).sort();

    if (!dates.length) {
      host.innerHTML = noHistoryHtml();
    } else if (dates.length === 1) {
      host.innerHTML = firstCaptureHtml();
    } else {
      host.innerHTML = chartHtml(dates.length);
      draw();
    }
    return { redraw: redraw, dispose: dispose, captures: dates.length };
  }

  return { mount: mount, SERIES: SERIES };
})();
