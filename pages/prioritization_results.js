/**
 * The Results view of prioritization.html — one submission, every species. [Task 6]
 *
 *   const view = PrioritizationResults.render(host, {payload, exportUrl, onSpecies, onNew});
 *   view.redraw();   // after a theme flip, or when the tab becomes visible
 *
 * The two-filter workflow the workbook was built around (CLAUDE.md, "Priority
 * Labels — Two Orthogonal Columns"), on screen: filter `Taxonomic_Priority` for
 * where the phylogenetic gaps are, filter `Project_Priority` for who is already
 * there, and read the combination. They are deliberately two controls and never
 * one ranking — a first-in-genus species that another project is already
 * sequencing is a coordination opportunity, not a low priority, and a single
 * score would bury it.
 *
 * EVERY NUMBER HERE COMES FROM THE PAYLOAD. Row values are the frame's own
 * columns and the tiles are `summary`, which the service computed with
 * `value_counts` over the same frame. Nothing is recounted client-side, so the
 * page and the Excel export cannot disagree about how many `High_New` there are.
 *
 * TWO THINGS THE TABLE MUST NOT SAY, both from CLAUDE.md:
 *
 *   1. **A PATH 1 species has no first-in-taxa answer, and `No` is not one.**
 *      Where an assembly exists the computation is skipped and the five
 *      `First_in_*` columns keep their default `No`. Drawn literally that is
 *      five red marks claiming five negative findings that were never made, so
 *      `Has_Assembly = Yes` renders the cell as not-applicable instead. That
 *      check — not the cell value — is the documented way to tell a computed
 *      `No` from a skipped one.
 *   2. **`Not_Assigned` is not "no opportunity", and `Unknown_G` is not "novel".**
 *      Both mean the species was not found in GoaT, so its status could not be
 *      established at all. They are glossed as a prompt to check the name, in
 *      the same words Panel B uses — `PrioritizationSpecies.gloss()` is the one
 *      copy of that wording on the page.
 *
 * PANEL B OPENS FROM A ROW, but only where a row can be keyed to a stored
 * timeline. The history endpoint is keyed by *tracked list* + species name, and
 * a submission has no list identity (§12.6), so the caller passes `onSpecies`
 * only when the page was opened against a tracked list. With no list open the
 * names are plain text rather than dead links.
 */

const PrioritizationResults = (function () {
  'use strict';

  /* The workbook's own sort order (generate_prioritization_tool.py,
     TAXONOMIC_PRIORITY_RANK / PROJECT_PRIORITY_RANK). Restated so the default
     row order on screen is the row order in the exported .xlsx — the same list
     read two ways should not be two orders. Note `Unknown` (a GoaT lineage gap)
     ranks above `Unknown_G` (nothing resolvable at all), which is the Python
     order and not alphabetical. */
  const TAX_RANK = {
    Highest_P: 1, Highest_C: 2, Highest_O: 3, Highest_F: 4, Highest_G: 5,
    High_S: 6, Already_Covered: 7, Unknown_S: 8, Unknown: 9, Unknown_G: 10,
  };
  const PROJ_RANK = {
    High_New: 1, Low_Active: 2, Low_Sample: 3, Medium_Improve: 4, Low_Done: 5, Not_Assigned: 6,
  };
  /* Most-threatened first, so a sort on this column answers "what is at risk".
     Anything outside the vocabulary — including a blank, which means the cached
     IUCN release has no assessment for this name — sorts last. */
  const IUCN_RANK = { EX: 1, EW: 2, CR: 3, EN: 4, VU: 5, NT: 6, LC: 7, DD: 8 };
  const IUCN_THREATENED = { VU: 1, EN: 1, CR: 1, EW: 1, EX: 1 };

  const LEVELS = [
    ['G', 'Genus'], ['F', 'Family'], ['O', 'Order'], ['C', 'Class'], ['P', 'Phylum'],
  ];

  /* Rows are added to the DOM in pages of this size. A 3,000-species list is a
     real input (Liste_Roscoff is 3,122) and one innerHTML of 3,000 rows costs a
     visible freeze on every filter keystroke. The count line always states the
     full filtered total, so a page is a rendering limit and never a silent
     truncation. */
  const PAGE = 200;

  const esc = (value) => String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const num = (value) => (value || 0).toLocaleString();

  /* The chip class + gloss come from Panel B, which owns that wording (see its
     `gloss`). Degrades to a bare chip if this view is ever dropped into a page
     without it, rather than shipping a second copy of the text. */
  function gloss(kind, label) {
    if (typeof PrioritizationSpecies !== 'undefined' && PrioritizationSpecies.gloss) {
      return PrioritizationSpecies.gloss(kind, label);
    }
    return { cls: 'c-unknown', text: '' };
  }

  // ── styles ────────────────────────────────────────────────────────────────
  const STYLE_ID = 'ebp-results-styles';
  const STYLES = `
  .ebp-res-note{background:var(--ink-3,#14231b); border:1px solid var(--line,#22362b);
    color:var(--paper-dim,#a6bcaf); font-size:12.5px; border-radius:9px; padding:10px 14px;
    margin-bottom:14px; display:flex; gap:9px; align-items:flex-start; line-height:1.6;}
  .ebp-res-note b{color:var(--paper,#e9f2ec);}
  .ebp-res-warn{border-color:rgba(224,167,96,.3); background:rgba(224,167,96,.09); color:var(--warn,#e0a760);}
  .ebp-res-warn b{color:var(--warn,#e0a760);}
  .ebp-res-warn ul{margin:0; padding-left:18px;} .ebp-res-warn li{margin:2px 0;}

  .ebp-stats{display:grid; grid-template-columns:repeat(auto-fit,minmax(148px,1fr)); gap:12px; margin-bottom:18px;}
  .ebp-stat{background:var(--ink-2,#0f1a14); border:1px solid var(--line,#22362b); border-radius:10px;
    padding:13px 15px; position:relative; overflow:hidden;}
  .ebp-stat .n{font-size:26px; font-weight:750; letter-spacing:-.02em; font-variant-numeric:tabular-nums;}
  .ebp-stat .l{font-size:12px; color:var(--paper-dim,#a6bcaf); margin-top:1px; line-height:1.4;}
  .ebp-stat .stripe{position:absolute; left:0; top:0; bottom:0; width:4px;}
  .ebp-stat.s-total .n{color:var(--paper,#e9f2ec);}
  .ebp-stat.s-novel .stripe{background:var(--novel,#7aa2ff);} .ebp-stat.s-novel .n{color:var(--novel,#7aa2ff);}
  .ebp-stat.s-new .stripe{background:var(--green-glow,#5fd39a);} .ebp-stat.s-new .n{color:var(--green-glow,#5fd39a);}
  .ebp-stat.s-improve .stripe{background:var(--improve,#e0a760);} .ebp-stat.s-improve .n{color:var(--improve,#e0a760);}
  .ebp-stat.s-low .stripe{background:var(--low,#8595a0);} .ebp-stat.s-low .n{color:var(--low,#8595a0);}
  .ebp-stat.s-na .stripe{background:var(--paper-mute,#6f8a7b);} .ebp-stat.s-na .n{color:var(--paper-mute,#6f8a7b);}

  .ebp-res-charts{display:grid; grid-template-columns:1fr 1fr; gap:18px;}
  @media (max-width:760px){ .ebp-res-charts{grid-template-columns:1fr;} }
  .ebp-res-chart{height:190px;}
  .ebp-res-cap{font-size:11.5px; color:var(--paper-mute,#6f8a7b); margin:8px 0 0; line-height:1.5;}

  .ebp-filters{display:flex; gap:10px 14px; flex-wrap:wrap; align-items:center; margin-bottom:12px;}
  .ebp-filters label{font-size:12px; color:var(--paper-dim,#a6bcaf); font-weight:600;}
  .ebp-filters select,.ebp-filters input[type=search]{font:inherit; font-size:13px; padding:7px 9px;
    background:var(--ink,#0b1310); border:1px solid var(--line,#22362b); border-radius:7px; color:var(--paper,#e9f2ec);}
  .ebp-filters input[type=search]{min-width:190px;}
  .ebp-count-note{margin-left:auto; font-size:12.5px; color:var(--paper-mute,#6f8a7b); font-variant-numeric:tabular-nums;}
  .ebp-clear{background:none; border:none; font:inherit; font-size:12.5px; color:var(--green-glow,#5fd39a);
    cursor:pointer; text-decoration:underline; padding:0;}
  .ebp-clear[hidden]{display:none;}

  .ebp-tablewrap{background:var(--ink-2,#0f1a14); border:1px solid var(--line,#22362b); border-radius:12px; overflow:hidden;}
  .ebp-scroll{overflow-x:auto; max-height:70vh; overflow-y:auto;}
  table.ebp-data{width:100%; border-collapse:collapse; font-size:13px;}
  table.ebp-data thead th{position:sticky; top:0; z-index:2; background:var(--ink-2,#0f1a14); text-align:left;
    font-weight:650; color:var(--paper-dim,#a6bcaf); font-size:11.5px; text-transform:uppercase;
    letter-spacing:.03em; padding:11px 12px; border-bottom:1px solid var(--line,#22362b); white-space:nowrap;}
  table.ebp-data thead th.srt{cursor:pointer; user-select:none;}
  table.ebp-data thead th.srt:hover{color:var(--paper,#e9f2ec);}
  table.ebp-data thead th .ar{font-size:9px; margin-left:4px; color:var(--green-glow,#5fd39a);}
  table.ebp-data tbody td{padding:9px 12px; border-bottom:1px solid var(--line-soft,#1a2a20); white-space:nowrap;
    vertical-align:top;}
  table.ebp-data tbody tr:hover{background:var(--ink-3,#14231b);}
  .ebp-sci{font-style:italic;}
  .ebp-res-name{background:none; border:none; padding:0; font:inherit; font-style:italic; color:var(--paper,#e9f2ec);
    cursor:pointer; text-align:left; border-bottom:1px dotted var(--paper-mute,#6f8a7b);}
  .ebp-res-name:hover{color:var(--green-glow,#5fd39a); border-bottom-color:var(--green-glow,#5fd39a);}
  .ebp-res-name.sel{color:var(--green-glow,#5fd39a); border-bottom-style:solid;}
  .ebp-res-as{display:block; font-size:11px; color:var(--paper-mute,#6f8a7b); font-style:normal; margin-top:2px;}
  .ebp-res-chip{display:inline-block; padding:2.5px 8px; border-radius:999px; font-size:11.5px; font-weight:600;}
  .ebp-res-chip.c-novel{background:rgba(122,162,255,.14); color:var(--novel,#7aa2ff);}
  .ebp-res-chip.c-covered{background:var(--ink-4,#1b2f24); color:var(--paper-mute,#6f8a7b);}
  .ebp-res-chip.c-new{background:rgba(63,191,127,.13); color:var(--green-glow,#5fd39a);}
  .ebp-res-chip.c-improve{background:rgba(224,167,96,.13); color:var(--improve,#e0a760);}
  .ebp-res-chip.c-low{background:var(--ink-4,#1b2f24); color:var(--low,#8595a0);}
  .ebp-res-chip.c-unknown{background:var(--ink-4,#1b2f24); color:var(--paper-mute,#6f8a7b);}
  .ebp-firsts{display:inline-flex; gap:4px; font-variant-numeric:tabular-nums;}
  .ebp-firsts b{width:19px; height:19px; border-radius:5px; font-size:11px; font-weight:700;
    display:inline-flex; align-items:center; justify-content:center; cursor:default;}
  .ebp-firsts b.y{background:rgba(122,162,255,.18); color:var(--novel,#7aa2ff);}
  .ebp-firsts b.n{background:var(--ink-4,#1b2f24); color:var(--paper-mute,#6f8a7b);}
  .ebp-firsts b.u{background:transparent; border:1px dashed var(--line,#22362b); color:var(--paper-mute,#6f8a7b);}
  .ebp-na{color:var(--paper-mute,#6f8a7b); cursor:default;}
  .ebp-projects{max-width:230px; overflow:hidden; text-overflow:ellipsis;}
  .ebp-iucn{font-weight:700; font-size:12px;}
  .ebp-iucn.threat{color:var(--red,#e0736a);} .ebp-iucn.lc{color:var(--green-glow,#5fd39a);}
  .ebp-iucn.other{color:var(--paper-dim,#a6bcaf);}
  .ebp-iucn.none{color:var(--paper-mute,#6f8a7b); font-weight:400;}
  .ebp-more{display:flex; justify-content:center; padding:12px; border-top:1px solid var(--line-soft,#1a2a20);}
  .ebp-more[hidden]{display:none;}
  .ebp-empty{padding:30px 16px; text-align:center; color:var(--paper-mute,#6f8a7b); font-size:13px;}
  `;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement('style');
    tag.id = STYLE_ID;
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }

  // ── state ─────────────────────────────────────────────────────────────────
  let els = null;
  let rows = [];          // the payload's results, untouched
  let view = [];          // filtered + sorted
  let shown = 0;          // rows currently in the DOM
  let sort = { key: 'rank', dir: 1 };
  let charts = [];
  let hooks = {};

  // ── cell renderers ────────────────────────────────────────────────────────

  function chip(kind, label) {
    if (!label) {
      return '<span class="ebp-res-chip c-unknown" title="This run produced no label for this species.">—</span>';
    }
    const g = gloss(kind, label);
    return '<span class="ebp-res-chip ' + g.cls + '" title="' + esc(label + (g.text ? ' — ' + g.text : ''))
      + '">' + esc(label) + '</span>';
  }

  function firsts(row) {
    /* PATH 1: an assembly exists, so first-in-taxa was never computed and the
       columns are at their default. Reported as not applicable — see the header
       note; this is the documented Has_Assembly check. */
    if (row.Has_Assembly === 'Yes') {
      return '<span class="ebp-na" title="An assembly already exists for this species, so first-in-taxa '
        + 'is not computed — an existing assembly rules out “first” at every level.">not applicable</span>';
    }
    return '<span class="ebp-firsts">' + LEVELS.map(function (level) {
      const value = row['First_in_' + level[1]];
      const cls = value === 'Yes' ? 'y' : (value === 'Unknown' || !value ? 'u' : 'n');
      const said = value || 'not reported';
      return '<b class="' + cls + '" title="' + esc('First in ' + level[1] + ': ' + said) + '">'
        + level[0] + '</b>';
    }).join('') + '</span>';
  }

  function iucn(row) {
    const category = (row.IUCN_Category || '').trim();
    if (!category) {
      /* Distinct from NT / DD below: this is "we have no assessment", which is a
         fact about our cached release, not a fact about the species. */
      return '<span class="ebp-iucn none" title="No assessment for this name in our cached IUCN release.">—</span>';
    }
    const cls = IUCN_THREATENED[category] ? 'threat' : (category === 'LC' ? 'lc' : 'other');
    const trend = (row.IUCN_Population_Trend || '').trim();
    return '<span class="ebp-iucn ' + cls + '" title="' + esc(category + (trend ? ' · population ' + trend : ''))
      + '">' + esc(category) + '</span>';
  }

  function species(row, clickable) {
    const name = row['Scientific Name'] || '';
    /* The GoaT-resolved name, when it is not the name that was submitted. A
       standardised trinomial or a synonym redirect is exactly the kind of thing
       a PI should see rather than have to infer from a surprising result. It is
       the only thing given a second line: `Species_Note` restates what the two
       chips already say, so it rides along as the cell's tooltip instead of
       adding a line to every row of a 3,000-species list. */
    const resolved = (row.Species || '').trim();
    const differs = resolved && resolved !== String(name).trim();
    const note = row.Species_Note ? ' title="' + esc(row.Species_Note) + '"' : '';
    const cell = clickable
      ? '<button type="button" class="ebp-res-name" data-name="' + esc(name) + '"' + note + '>'
        + esc(name) + '</button>'
      : '<span class="ebp-sci"' + note + '>' + esc(name) + '</span>';
    return cell + (differs ? '<span class="ebp-res-as">GoaT: ' + esc(resolved) + '</span>' : '');
  }

  function projects(row) {
    const value = (row.Projects_Working_On_Species || '').trim();
    if (!value) return '<span class="ebp-na">—</span>';
    return '<div class="ebp-projects" title="' + esc(value) + '">' + esc(value) + '</div>';
  }

  function goat(row) {
    const link = (row.goat_query_link || '').trim();
    if (link) {
      return '<a href="' + esc(link) + '" target="_blank" rel="noopener noreferrer">open ↗</a>';
    }
    const status = (row.goat_lookup_status || '').trim();
    return '<span class="ebp-na" title="' + esc(status === 'not_found'
      ? 'This name is not in GoaT, so there is no record to open. Its novelty was assessed from the genus.'
      : 'No GoaT record was resolved for this name' + (status ? ' (' + status + ')' : '') + '.')
      + '">—</span>';
  }

  function rowHtml(row, clickable) {
    return '<tr>'
      + '<td>' + species(row, clickable) + '</td>'
      + '<td>' + chip('tax', row.Taxonomic_Priority) + '</td>'
      + '<td>' + chip('proj', row.Project_Priority) + '</td>'
      + '<td>' + firsts(row) + '</td>'
      + '<td>' + projects(row) + '</td>'
      + '<td>' + iucn(row) + '</td>'
      + '<td>' + goat(row) + '</td>'
      + '</tr>';
  }

  // ── filter / sort ─────────────────────────────────────────────────────────

  const SORTERS = {
    rank: (row) => (TAX_RANK[row.Taxonomic_Priority] || 99) * 100 + (PROJ_RANK[row.Project_Priority] || 99),
    name: (row) => String(row['Scientific Name'] || '').toLowerCase(),
    tax: (row) => TAX_RANK[row.Taxonomic_Priority] || 99,
    proj: (row) => PROJ_RANK[row.Project_Priority] || 99,
    firsts: (row) => (row.Has_Assembly === 'Yes' ? 99
      : -LEVELS.filter((level) => row['First_in_' + level[1]] === 'Yes').length),
    iucn: (row) => IUCN_RANK[(row.IUCN_Category || '').trim()] || 99,
  };

  function apply() {
    const tax = els.tax.value;
    const proj = els.proj.value;
    const query = els.search.value.trim().toLowerCase();

    view = rows.filter(function (row) {
      if (tax && row.Taxonomic_Priority !== tax) return false;
      if (proj && row.Project_Priority !== proj) return false;
      if (!query) return true;
      return ['Scientific Name', 'Species', 'Genus', 'Family', 'Order', 'Class', 'Phylum']
        .some((field) => String(row[field] || '').toLowerCase().indexOf(query) >= 0);
    });

    const key = SORTERS[sort.key] || SORTERS.rank;
    view = view.slice().sort(function (a, b) {
      const left = key(a);
      const right = key(b);
      if (left < right) return -sort.dir;
      if (left > right) return sort.dir;
      return 0;
    });

    els.clear.hidden = !(tax || proj || query);
    shown = 0;
    els.body.innerHTML = '';
    more();
  }

  /** Add the next page of rows. */
  function more() {
    const clickable = !!hooks.onSpecies;
    const next = view.slice(shown, shown + PAGE);
    if (next.length) {
      els.body.insertAdjacentHTML('beforeend', next.map((row) => rowHtml(row, clickable)).join(''));
      shown += next.length;
    }
    els.empty.hidden = view.length > 0;
    els.more.hidden = shown >= view.length;
    els.moreBtn.textContent = 'Show ' + num(Math.min(PAGE, view.length - shown)) + ' more';

    const total = rows.length;
    els.note.textContent = view.length === total
      ? 'Showing ' + num(shown) + ' of ' + num(total)
      : 'Showing ' + num(shown) + ' of ' + num(view.length) + ' matched · ' + num(total) + ' screened';
    if (hooks.onSpecies && typeof PrioritizationSpecies !== 'undefined') {
      const open = PrioritizationSpecies.openSpecies();
      if (open) markSelected(open);
    }
  }

  function markSelected(name) {
    els.body.querySelectorAll('.ebp-res-name').forEach(function (button) {
      button.classList.toggle('sel', button.dataset.name === name);
    });
  }

  // ── charts ────────────────────────────────────────────────────────────────

  /** A CSS variable's current value, with the dark default as a fallback. */
  function cssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (value || '').trim() || fallback;
  }

  /* Chip classes carry the meaning of a colour on this page, so the bars read
     from the same mapping rather than picking a palette of their own. */
  const CHIP_VAR = {
    'c-novel': ['--novel', '#7aa2ff'],
    'c-new': ['--green-glow', '#5fd39a'],
    'c-improve': ['--improve', '#e0a760'],
    'c-low': ['--low', '#8595a0'],
    'c-covered': ['--paper-mute', '#6f8a7b'],
    'c-unknown': ['--paper-mute', '#6f8a7b'],
  };

  /* The five Highest_* labels are one family and share one colour, which makes a
     chart of them a flat blue block. Fading the ramp by breadth keeps "first in
     phylum" visually ahead of "first in genus" — the same ordering the workbook
     gives them with its green gradient. The floor is 70%, not lower: at 60% a
     lone `Highest_G` bar read as disabled rather than as the palest step of a
     ramp whose other steps were not on screen to compare it against. Alpha is
     appended as hex, which only works on a #rrggbb value; anything else keeps
     the flat colour. */
  const RAMP = { Highest_P: 'ff', Highest_C: 'ec', Highest_O: 'd9', Highest_F: 'c6', Highest_G: 'b3' };

  function colorFor(kind, label) {
    const entry = CHIP_VAR[gloss(kind, label).cls] || CHIP_VAR['c-unknown'];
    const base = cssVar(entry[0], entry[1]);
    const alpha = RAMP[label];
    return (alpha && /^#[0-9a-f]{6}$/i.test(base)) ? base + alpha : base;
  }

  function option(kind, counts, rank) {
    const labels = Object.keys(counts)
      .filter((label) => counts[label])
      .sort((a, b) => (rank[a] || 99) - (rank[b] || 99));
    const dim = cssVar('--paper-dim', '#a6bcaf');
    const mute = cssVar('--paper-mute', '#6f8a7b');
    return {
      animation: false,
      /* `left` is padding OUTSIDE the space containLabel reserves for the axis
         labels. It is 8 rather than 0 because containLabel's measurement runs a
         couple of pixels short on the longest label, which clipped the first
         letter of `Medium_Improve` against the canvas edge. */
      grid: { left: 8, right: 42, top: 4, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'item',
        formatter(point) {
          const g = gloss(kind, point.name);
          return '<b>' + esc(point.name) + '</b> · ' + num(point.value)
            + (g.text ? '<br><span style="opacity:.75">' + esc(g.text) + '</span>' : '');
        },
        extraCssText: 'max-width:280px; white-space:normal; line-height:1.5;',
      },
      xAxis: { type: 'value', show: false, max: 'dataMax' },
      yAxis: {
        type: 'category', data: labels, inverse: true,
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: dim, fontSize: 11.5 },
      },
      series: [{
        type: 'bar', barMaxWidth: 15,
        data: labels.map((label) => ({
          name: label, value: counts[label], itemStyle: { color: colorFor(kind, label), borderRadius: 3 },
        })),
        label: { show: true, position: 'right', color: mute, fontSize: 11, formatter: (p) => num(p.value) },
      }],
    };
  }

  function buildCharts(summary) {
    if (typeof echarts === 'undefined' || !els.charts) return;
    charts = [
      [els.charts.querySelector('#ebp-chart-tax'), 'tax', summary.taxonomic_priority || {}, TAX_RANK],
      [els.charts.querySelector('#ebp-chart-proj'), 'proj', summary.project_priority || {}, PROJ_RANK],
    ].map(function (spec) {
      const instance = echarts.init(spec[0]);
      instance.setOption(option(spec[1], spec[2], spec[3]));
      return { instance: instance, kind: spec[1], counts: spec[2], rank: spec[3] };
    });
  }

  // ── markup ────────────────────────────────────────────────────────────────

  function options(counts, rank, all) {
    return '<option value="">' + all + '</option>' + Object.keys(counts)
      .filter((label) => counts[label])
      .sort((a, b) => (rank[a] || 99) - (rank[b] || 99))
      .map((label) => '<option value="' + esc(label) + '">' + esc(label) + ' (' + num(counts[label]) + ')</option>')
      .join('');
  }

  function shell(payload, opts) {
    const summary = payload.summary || {};
    const tax = summary.taxonomic_priority || {};
    const proj = summary.project_priority || {};
    const total = payload.species_count || (payload.results || []).length;
    const novel = Object.keys(tax).filter((label) => label.indexOf('Highest_') === 0)
      .reduce((sum, label) => sum + tax[label], 0);
    const elsewhere = (proj.Low_Active || 0) + (proj.Low_Sample || 0) + (proj.Low_Done || 0);
    const reference = payload.reference_species_count;

    const warnings = (payload.warnings || []).length
      ? '<div class="ebp-res-note ebp-res-warn"><span aria-hidden="true">▲</span><div><b>Worth reading '
        + 'before you act on this:</b><ul>'
        + payload.warnings.map((line) => '<li>' + esc(line) + '</li>').join('') + '</ul></div></div>'
      : '';

    const chartsCard = typeof echarts === 'undefined' ? '' : `
      <div class="card">
        <h2>Where this list sits on each dimension</h2>
        <div class="ebp-res-charts">
          <div id="ebp-chart-tax" class="ebp-res-chart"></div>
          <div id="ebp-chart-proj" class="ebp-res-chart"></div>
        </div>
        <p class="ebp-res-cap">Left: taxonomic novelty, darkest at the broadest gap. Right: what the
          network is already doing. The two are counted over the same species and do not add up to each
          other — read them as two questions, not one ranking.</p>
      </div>`;

    return `
    <div class="view-head row">
      <div>
        <div class="vt">Results</div>
        <div class="vs">${num(total)} species${opts.source ? ' · ' + esc(opts.source) : ''}${
          reference ? ' · screened against ' + num(reference) + ' species with assemblies in GoaT' : ''}</div>
        <!-- Same chip as the empty state's, so the glossary stays reachable
             once a run has replaced that state. No wiring needed: the
             document-level .ebp-help-open-link handler mount() installs picks
             it up wherever it is drawn. -->
        <button class="ebp-help-btn ebp-help-open-link" type="button">How to read results <span aria-hidden="true">→</span></button>
      </div>
      <div style="display:flex; gap:10px; flex-wrap:wrap;">
        <button class="btn" id="ebp-res-new" type="button">↩ New submission</button>
        ${opts.exportUrl
          ? '<a class="btn primary" id="ebp-res-export" href="' + esc(opts.exportUrl) + '">⤓ Export to Excel</a>'
          : ''}
      </div>
    </div>

    ${warnings}
    <div class="ebp-res-note"><span aria-hidden="true">▸</span><span><b>Two independent dimensions.</b>
      <em>Taxonomic novelty</em> — would sequencing this fill a phylogenetic gap? — and
      <em>project status</em> — is the network already on it? A species can be a first-in-genus
      <em>and</em> already being sequenced elsewhere: that is a coordination opportunity, not a low
      priority, which is why these are two filters and not one score.</span></div>

    <div class="ebp-stats">
      <div class="ebp-stat s-total"><div class="n">${num(total)}</div><div class="l">Species screened</div></div>
      <div class="ebp-stat s-novel"><span class="stripe"></span><div class="n">${num(novel)}</div>
        <div class="l">Would be a phylogenetic first</div></div>
      <div class="ebp-stat s-new"><span class="stripe"></span><div class="n">${num(proj.High_New)}</div>
        <div class="l">Open — no active project</div></div>
      <div class="ebp-stat s-improve"><span class="stripe"></span><div class="n">${num(proj.Medium_Improve)}</div>
        <div class="l">Improvable assembly</div></div>
      <div class="ebp-stat s-low"><span class="stripe"></span><div class="n">${num(elsewhere)}</div>
        <div class="l">Active or done elsewhere</div></div>
      <div class="ebp-stat s-na"><span class="stripe"></span><div class="n">${num(proj.Not_Assigned)}</div>
        <div class="l">Not found in GoaT — check the name</div></div>
    </div>

    ${chartsCard}

    <!-- The filter matrix, where the filtering happens. The full glossary is a
         click away in the help panel; this is the three lines that answer
         "I have filtered — now what?" without leaving the table. -->
    ${typeof PrioritizationHelp === 'undefined' ? '' : PrioritizationHelp.matrixHtml()}

    <div class="ebp-filters">
      <div><label for="ebp-f-tax">Novelty </label>
        <select id="ebp-f-tax">${options(tax, TAX_RANK, 'All novelty')}</select></div>
      <div><label for="ebp-f-proj">Status </label>
        <select id="ebp-f-proj">${options(proj, PROJ_RANK, 'All status')}</select></div>
      <input type="search" id="ebp-f-search" placeholder="Search name or lineage…" aria-label="Search species">
      <button type="button" class="ebp-clear" id="ebp-f-clear" hidden>clear filters</button>
      <span class="ebp-count-note" id="ebp-res-count"></span>
    </div>

    <!-- Panel B (A-T5) is moved in here, directly above the table it was opened from. -->
    <div id="tl-host-results"></div>

    <div class="ebp-tablewrap">
      <div class="ebp-scroll">
        <table class="ebp-data">
          <thead><tr>
            <th class="srt" data-sort="name">Species <span class="ar"></span></th>
            <th class="srt" data-sort="tax">Taxonomic novelty <span class="ar"></span></th>
            <th class="srt" data-sort="proj">Project status <span class="ar"></span></th>
            <th class="srt" data-sort="firsts">First in… (G·F·O·C·P) <span class="ar"></span></th>
            <th>Projects on this species</th>
            <th class="srt" data-sort="iucn">IUCN <span class="ar"></span></th>
            <th>GoaT</th>
          </tr></thead>
          <tbody id="ebp-res-body"></tbody>
        </table>
        <div class="ebp-empty" id="ebp-res-empty" hidden>No species match these filters.</div>
      </div>
      <div class="ebp-more" id="ebp-res-more" hidden>
        <button class="btn" id="ebp-res-morebtn" type="button">Show more</button>
      </div>
    </div>`;
  }

  // ── render ────────────────────────────────────────────────────────────────

  /**
   * Render one submission's results into `host`.
   *
   * @param {Element} host
   * @param {{payload: object, exportUrl?: string, source?: string,
   *          onNew?: function, onSpecies?: function}} opts
   *        onSpecies(name) — pass only where a tracked list is open; without it
   *        the species names are text rather than links to nothing.
   * @returns {{redraw: function, select: function, payload: object}}
   */
  function render(host, opts) {
    injectStyles();
    hooks = opts || {};
    charts.forEach((chart) => chart.instance.dispose());
    charts = [];

    const payload = hooks.payload || {};
    rows = payload.results || [];
    sort = { key: 'rank', dir: 1 };
    host.innerHTML = shell(payload, hooks);

    els = {
      tax: host.querySelector('#ebp-f-tax'),
      proj: host.querySelector('#ebp-f-proj'),
      search: host.querySelector('#ebp-f-search'),
      clear: host.querySelector('#ebp-f-clear'),
      note: host.querySelector('#ebp-res-count'),
      body: host.querySelector('#ebp-res-body'),
      empty: host.querySelector('#ebp-res-empty'),
      more: host.querySelector('#ebp-res-more'),
      moreBtn: host.querySelector('#ebp-res-morebtn'),
      charts: host.querySelector('.ebp-res-charts'),
      head: host.querySelector('thead'),
    };

    els.tax.addEventListener('change', apply);
    els.proj.addEventListener('change', apply);
    els.search.addEventListener('input', apply);
    els.clear.addEventListener('click', function () {
      els.tax.value = '';
      els.proj.value = '';
      els.search.value = '';
      apply();
    });
    els.moreBtn.addEventListener('click', more);

    els.head.addEventListener('click', function (event) {
      const th = event.target.closest('th.srt');
      if (!th) return;
      const key = th.dataset.sort;
      sort = { key: key, dir: sort.key === key ? -sort.dir : 1 };
      els.head.querySelectorAll('.ar').forEach((mark) => { mark.textContent = ''; });
      th.querySelector('.ar').textContent = sort.dir > 0 ? '▼' : '▲';
      apply();
    });

    if (hooks.onSpecies) {
      els.body.addEventListener('click', function (event) {
        const button = event.target.closest('.ebp-res-name');
        if (button) hooks.onSpecies(button.dataset.name);
      });
    }
    if (hooks.onNew) host.querySelector('#ebp-res-new').addEventListener('click', hooks.onNew);

    buildCharts(payload.summary || {});
    apply();

    return {
      payload: payload,
      /* ECharts sizes itself from a container that has no width while the tab is
         display:none, and its colours are read from the CSS variables — so this
         is called both when the view is shown and after a theme flip. */
      redraw() {
        charts.forEach(function (chart) {
          chart.instance.resize();
          chart.instance.setOption(option(chart.kind, chart.counts, chart.rank));
        });
      },
      /** Keep the row highlighted that matches the open timeline. */
      select: markSelected,
    };
  }

  return { render: render };
})();
