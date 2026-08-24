/**
 * One project's three cross-project duplication reports. [A-D4]
 *
 *   const view = DuplicationReport.render(host, {payload});
 *   view.redraw();       // after a theme flip — every colour is read at draw time
 *
 * The question this answers is the coordination sibling of the prioritization
 * tool's novelty question: **is another EBP project already sequencing the
 * species on my target list — and at what stage?** The three reports are the
 * three answers a year of quarterly emails carried, and the numbers here are
 * the same numbers: the payload is served verbatim from the row the weekly
 * capture job stored, and `/export` builds the email's tables from that same
 * row (duplication plan §4, §5).
 *
 * BUILT TO `docs/duplication-mockup.html`, whose layout this follows closely:
 * the nine-status semantic ramp, the heatmap with vertical column heads and row
 * / column totals, the CSS stacked bars, the bottom legend, and the drill-down
 * drawer. Three things are deliberately NOT the mockup, all because the mockup
 * had illustrative data and this has real data:
 *
 *   1. **The species in the drawer are real.** The mockup synthesised plausible
 *      binomials from a seeded PRNG and its comment says production would get
 *      them "in the SAME GoaT response". That is right, and it is now what
 *      happens — `analyze_project_contributions_matrix` keeps the names it
 *      already has and the payload carries them under `report_N.species`. No
 *      second request, and no GoaT call from this page at all (decision 11).
 *   2. **Rows are only the statuses that occur.** `status_order` carries all
 *      nine for every report and most reports use three or four; DTOL's report
 *      3 is a single row. Nine rows of which five are structurally zero bury
 *      the four that carry the answer, so a row is kept the moment either its
 *      `duplication_count` or any of its cells is non-zero.
 *   3. **`duplication_count` is shown beside `overlap_sum`.** The mockup had
 *      only a row total. They are different numbers and the difference is the
 *      finding: a duplication count LARGER than the overlap sum means the
 *      project overlaps projects GoaT does not represent.
 *
 * NOTHING IS RECOMPUTED HERE THAT THE BACKEND ALREADY COMPUTED. Column order is
 * the payload's `project_columns` (sorted by overlap, ties broken by name so two
 * captures of unchanged data cannot emit two orders — A-D1 finding 2) and
 * `duplication_count` is the payload's `original_counts`. The only arithmetic
 * this file does is row and column sums.
 *
 * THE NINE-COLOUR STACK, AND ITS MEASURED LIMIT. The mockup's `--s-*` ramp is
 * semantic (dim gray → blue → teal → olive → gold → brown → green, "further
 * down the pipeline") and it is kept. But nine categorical hues cannot be made
 * mutually distinguishable, and this ramp's worst adjacent pair — `in_assembly`
 * (#8a9f56) against `in_progress` (#b4923e) — separates by **ΔE 2.9 under
 * protanopia and 6.5 under normal vision** (OKLab ×100, Machado 2009 at
 * severity 1.0), which is to say not at all. That is not a fixable palette
 * problem; it is what nine hues costs, and re-stepping it only moves the
 * collision. Two things make it safe rather than merely known:
 *   * those two statuses are GoaT's own overlapping categories — the glossary
 *     defines `in_progress` as *including* `in_assembly` — so a reader who
 *     confuses them has not been told anything false; and
 *   * **colour is never the only encoding.** Every stack segment has a 2px
 *     surface gap and a hover tooltip naming its status, the heatmap labels
 *     every row, the legend names every colour, and both views print the number.
 *
 * A STATUS THIS FILE DOES NOT KNOW IS REPORTED, NEVER FOLDED AWAY. GoaT is
 * actively revising the `sequencing_status` enum (CLAUDE.md, "Status-set
 * coverage"), so a value outside STATUSES gets its own row, its own bar segment
 * in the warning colour, and a line naming it. Quietly dropping it would
 * understate duplication, which is the one wrong answer this tool must never
 * give.
 *
 * THREE EMPTY STATES THAT MEAN DIFFERENT THINGS, and merging any two of them
 * misleads the reader in the most expensive direction:
 *   * `long_list_species === 0` — GoaT holds NO target list for this project, so
 *     all three reports are empty because there was nothing to compare (A-D3
 *     finding 2). This is not "no duplication found".
 *   * `project_columns` empty with a real long list — genuinely no overlap with
 *     any other project in GoaT for this report's criteria. This IS good news.
 *   * no report at all — handled by the page, not here: the endpoint 404s with a
 *     machine-readable reason.
 */

const DuplicationReport = (function () {
  'use strict';

  /**
   * The nine statuses: the email's own gloss, and the mockup's own colour token.
   *
   * The glosses are kept in the same order and the same words as
   * `STATUS_GLOSSARY` in `api/app/routers/duplication.py`, which lifted them
   * from the retired notification template — the workbook a PI downloads and
   * this page must say the same thing about the same number.
   * `api/tests/test_duplication_parity.py` pins them together.
   */
  const STATUSES = [
    { key: 'not_started', label: 'not started', varn: '--s-not',
      gloss: 'on project target list, but sample has not been collected' },
    { key: 'sample_collected', label: 'sample collected', varn: '--s-collected',
      gloss: 'tissue is available for whole genome sequencing' },
    { key: 'sample_acquired', label: 'sample acquired', varn: '--s-acquired',
      gloss: 'samples received by the designated sequencing centers' },
    { key: 'data_generation', label: 'data generation', varn: '--s-datagen',
      gloss: 'raw sequencing data is being generated' },
    { key: 'in_assembly', label: 'in assembly', varn: '--s-assembly',
      gloss: 'genome assembly is in progress or undergoing quality control' },
    { key: 'in_progress', label: 'in progress', varn: '--s-progress',
      gloss: 'includes data_generation, in_assembly, and submitted to INSDC' },
    { key: 'open', label: 'open', varn: '--s-open',
      gloss: 'data publicly available in a project-specific data store' },
    { key: 'insdc_open', label: 'insdc open', varn: '--s-insdc',
      gloss: 'assembly is publicly available on INSDC' },
    { key: 'published', label: 'published', varn: '--s-published',
      gloss: 'has a publication associated with genome assembly' },
  ];

  const STATUS_BY_KEY = (function () {
    const map = {};
    STATUSES.forEach(function (status) { map[status.key] = status; });
    return map;
  })();

  /**
   * The three reports' title, criteria and recommendation.
   *
   * Verbatim from `REPORT_META` in `api/app/routers/duplication.py`, which took
   * them from the quarterly email — the same wording the workbook's OVERVIEW
   * sheet carries. Pinned by `api/tests/test_duplication_parity.py`. The `tab`
   * and `lead` strings are this page's own, and are not pinned: they name and
   * frame the report rather than restating its criteria.
   */
  const REPORTS = [
    {
      n: 1, tab: 'Already done elsewhere',
      lead: 'An EBP-standard assembly already exists elsewhere.',
      title: 'Duplication of species that have an EBP-standard assembly available',
      description: 'Species from your target list that have at least one assembly meeting '
        + 'the EBP-standard metrics available in INSDC.',
      recommendation: 'Consider not sequencing the species if sequencing has not_started. If '
        + 'sequencing has begun, consider working with other project representative(s) on a '
        + 'collaborative basis.',
    },
    {
      n: 2, tab: 'Active duplication',
      lead: 'Two projects are spending effort on the same genome right now.',
      title: 'Active duplication of species that your project has started working on',
      description: 'Species your project has started sample collection or sequencing on, which '
        + 'have been or are being sequenced by other projects represented in GoaT. Any existing '
        + 'assemblies do not meet the EBP-standard metrics.',
      recommendation: 'Consider coordination with identified project representative(s) to avoid '
        + 'duplication or improve existing assemblies.',
    },
    {
      n: 3, tab: 'Potential duplication',
      lead: 'You have not started; somebody else already holds samples.',
      title: 'Potential duplication of species that your project has not started working on',
      description: 'Species from your target list your project has not started sample collection '
        + 'or sequencing on, which have been or are being sequenced by other projects represented '
        + 'in GoaT. Any existing assemblies do not meet the EBP-standard metrics.',
      recommendation: 'Consider collaboration with identified projects.',
    },
  ];

  /* How many species the drawer lists before it stops and says how many more
     there are. DTOL's biggest single cell is 495, and a drawer is a drawer. */
  const DRILL_LIMIT = 60;

  const esc = (value) => String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const num = (value) => (Number(value) || 0).toLocaleString();

  function cssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (value || '').trim() || fallback;
  }

  /** A status's colour, or the warning colour for one this file does not know. */
  function colorOf(key) {
    const status = STATUS_BY_KEY[key];
    return status ? cssVar(status.varn, '#6f8a7b') : cssVar('--warn', '#e0a760');
  }

  function labelOf(key) {
    const status = STATUS_BY_KEY[key];
    return status ? status.label : key;
  }

  // ── state ─────────────────────────────────────────────────────────────────
  let payload = null;
  let hooks = {};
  let els = {};
  let active = 1;                 // which report tab
  let mode = 'heat';              // 'heat' | 'bars'
  let openCell = null;            // {status, project} while the drawer is open

  // ── reading the payload ───────────────────────────────────────────────────

  const reportOf = (n) => (payload && payload['report_' + n]) || {};

  /**
   * The contributing projects, in the payload's order.
   *
   * `project_columns` is authoritative — sorted by descending overlap with ties
   * broken by name, which is what makes two captures comparable. Any matrix key
   * missing from it is appended rather than dropped: a column that exists in the
   * data but not in the header would silently subtract from every row sum.
   */
  function columnsOf(report) {
    const columns = (report.project_columns || []).slice();
    const seen = {};
    columns.forEach(function (name) { seen[name] = true; });
    Object.keys(report.matrix || {}).forEach(function (status) {
      Object.keys(report.matrix[status] || {}).forEach(function (name) {
        if (!seen[name]) { seen[name] = true; columns.push(name); }
      });
    });
    return columns;
  }

  /** The statuses worth a row: those with a `duplication_count` or any overlap. */
  function statusesOf(report) {
    const order = (report.status_order || []).slice();
    Object.keys(report.matrix || {}).forEach(function (status) {
      if (order.indexOf(status) < 0) order.push(status);
    });
    const counts = report.original_counts || {};
    return order.filter(function (status) {
      return (Number(counts[status]) || 0) > 0 || rowSum(report, status) > 0;
    });
  }

  const cell = (report, status, project) =>
    Number(((report.matrix || {})[status] || {})[project]) || 0;

  /** `overlap_sum` — one row's total across every contributing project. */
  function rowSum(report, status) {
    const row = (report.matrix || {})[status] || {};
    return Object.keys(row).reduce(function (total, key) {
      return total + (Number(row[key]) || 0);
    }, 0);
  }

  const colSum = (report, statuses, project) => statuses.reduce(
    function (total, status) { return total + cell(report, status, project); }, 0);

  /** Statuses present in this report that STATUSES has never heard of. */
  const unknownStatuses = (report) =>
    statusesOf(report).filter(function (status) { return !STATUS_BY_KEY[status]; });

  /**
   * The species behind one cell — the drill-down, derived rather than looked up.
   *
   * `report.species` is one row per species: `[name, taxon_id, status_index,
   * [project_indices]]`, interned against the report's own `status_order` and
   * `project_columns`. A cell is the rows whose status matches and whose project
   * list contains this column, which is the SAME predicate the backend counted
   * with — `api/tests/test_duplication_service.py` asserts the two agree for
   * every cell of every report, so a cell reading 12 can never open a drawer of
   * 9.
   *
   * Returns `null`, not `[]`, when the payload predates the species lists: an
   * empty list would render as "no species", which is a different claim from
   * "this capture does not carry them".
   */
  function speciesIn(report, status, project) {
    const rows = report.species;
    if (!Array.isArray(rows)) return null;
    const statusIndex = (report.status_order || []).indexOf(status);
    const projectIndex = (report.project_columns || []).indexOf(project);
    if (statusIndex < 0 || projectIndex < 0) return [];
    return rows.filter(function (row) {
      return row[2] === statusIndex && (row[3] || []).indexOf(projectIndex) >= 0;
    });
  }

  // ── styles ────────────────────────────────────────────────────────────────
  const STYLE_ID = 'ebp-dup-styles';
  const STYLES = `
  /* ── report tabs — the mockup's card tabs, sitting on the panel ── */
  .ebp-dup-tabs{display:flex; gap:6px; margin-bottom:-1px; flex-wrap:wrap;}
  .ebp-dup-tabs button{border:1px solid var(--line,#22362b); background:var(--ink-2,#0f1a14);
    color:var(--paper-dim,#a6bcaf); font:inherit; font-size:13px; padding:10px 15px;
    border-radius:10px 10px 0 0; cursor:pointer; display:flex; align-items:center; gap:9px;
    border-bottom:none;}
  .ebp-dup-tabs button .rn{font-size:10.5px; font-weight:800; letter-spacing:.04em;
    color:var(--paper-mute,#6f8a7b); background:var(--ink-4,#1b2f24); border-radius:5px; padding:2px 6px;}
  .ebp-dup-tabs button .tct{font-variant-numeric:tabular-nums; color:var(--paper-mute,#6f8a7b);
    font-weight:600;}
  .ebp-dup-tabs button:hover{color:var(--paper,#e9f2ec);}
  .ebp-dup-tabs button.on{background:var(--ink-3,#14231b); color:var(--paper,#e9f2ec); font-weight:650;}
  .ebp-dup-tabs button.on .rn{color:var(--green-glow,#5fd39a); background:rgba(22,163,74,.14);}

  .ebp-dup-panel{border:1px solid var(--line,#22362b); border-radius:0 14px 14px 14px;
    background:var(--ink-2,#0f1a14); padding:20px 22px 24px; margin-bottom:26px;}
  .ebp-dup-desc{display:flex; gap:11px; align-items:flex-start; font-size:13px;
    color:var(--paper-dim,#a6bcaf); margin-bottom:18px; padding-bottom:16px;
    border-bottom:1px dashed var(--line,#22362b); line-height:1.65;}
  .ebp-dup-desc .ic{flex:none; width:20px; height:20px; border-radius:6px;
    background:var(--ink-4,#1b2f24); display:flex; align-items:center; justify-content:center;
    font-size:12px; margin-top:1px;}
  .ebp-dup-desc b{color:var(--paper,#e9f2ec);}
  .ebp-dup-desc .rec{display:block; margin-top:7px; color:var(--paper-mute,#6f8a7b);}
  .ebp-dup-desc .rec b{color:var(--paper-dim,#a6bcaf);}

  /* view toggle */
  .ebp-dup-vtoggle{display:flex; border:1px solid var(--line,#22362b); border-radius:8px;
    overflow:hidden; width:max-content; margin-bottom:18px;}
  .ebp-dup-vtoggle button{font:inherit; font-size:12.5px; font-weight:600; padding:7px 14px;
    background:var(--ink-2,#0f1a14); color:var(--paper-dim,#a6bcaf); border:none; cursor:pointer;}
  .ebp-dup-vtoggle button.on{background:var(--ink-4,#1b2f24); color:var(--green-glow,#5fd39a);}
  .ebp-dup-vtoggle button+button{border-left:1px solid var(--line,#22362b);}

  /* ── HEATMAP ── */
  .ebp-hmwrap{overflow-x:auto; padding-bottom:6px;}
  table.ebp-heatmap{border-collapse:separate; border-spacing:3px; font-size:12px;}
  table.ebp-heatmap th{font-weight:600; color:var(--paper-dim,#a6bcaf); padding:6px 4px;
    text-align:center; vertical-align:bottom;}
  /* The row label and the two summary columns are the table's frame: they stay
     put while 34 project columns scroll under them. A background is required on
     a sticky cell — without it the scrolling cells show through. */
  table.ebp-heatmap th.rowh{text-align:right; padding-right:12px; white-space:nowrap;
    position:sticky; left:0; z-index:4; background:var(--ink-2,#0f1a14);}
  table.ebp-heatmap th.stick,table.ebp-heatmap td.stick{position:sticky; z-index:3;
    background:var(--ink-2,#0f1a14);}
  /* border-spacing leaves a 3px transparent gap around every cell, and a
     scrolling project column shows through the gaps beside a pinned one. The
     ring paints those gaps in the surface colour, so the frame reads as solid. */
  table.ebp-heatmap th.rowh,table.ebp-heatmap th.stick,
  table.ebp-heatmap td.stick{box-shadow:0 0 0 3px var(--ink-2,#0f1a14);}
  /* The left offset is NOT set here — stickFrame() measures it after render. A
     guessed offset detaches the pinned columns from the row header and the
     scrolling project columns then render between them, which looks like a
     shuffled table rather than a broken one. */
  table.ebp-heatmap thead th.stick{z-index:5;}
  table.ebp-heatmap thead th.rowh{z-index:6;}
  table.ebp-heatmap th.colh{font-size:11px;}
  table.ebp-heatmap th.colh span{writing-mode:vertical-rl; transform:rotate(180deg);
    letter-spacing:.02em; padding:4px 0; font-family:ui-monospace,'Cascadia Code',Menlo,monospace;}
  table.ebp-heatmap th.colh.meta span{font-family:inherit; color:var(--paper-mute,#6f8a7b);}
  table.ebp-heatmap td{width:44px; height:34px; text-align:center; border-radius:6px;
    font-variant-numeric:tabular-nums; font-weight:600; color:var(--paper,#e9f2ec);
    position:relative; cursor:default; transition:transform .1s, box-shadow .1s;}
  table.ebp-heatmap td.z{color:var(--paper-mute,#6f8a7b); font-weight:400;
    background:var(--ink-3,#14231b)!important;}
  table.ebp-heatmap td:not(.z){cursor:pointer;}
  table.ebp-heatmap td:hover:not(.z){transform:scale(1.08);
    box-shadow:0 0 0 2px var(--green-glow,#5fd39a); z-index:2;}
  table.ebp-heatmap td.sel{box-shadow:0 0 0 2px var(--green-bright,#3fbf7f)!important; z-index:3;}
  table.ebp-heatmap td .st{position:absolute; left:0; top:0; bottom:0; width:3px;
    border-radius:6px 0 0 6px; opacity:.9;}
  table.ebp-heatmap td.meta{color:var(--paper-dim,#a6bcaf); font-weight:700; cursor:default;
    background:var(--ink-2,#0f1a14);}
  table.ebp-heatmap td.meta.s2{color:var(--paper-mute,#6f8a7b); padding-right:10px;
    border-right:1px solid var(--line,#22362b);}
  table.ebp-heatmap td.meta.grand{color:var(--green-glow,#5fd39a);}
  table.ebp-heatmap tr.totals th.rowh{color:var(--paper-mute,#6f8a7b); font-weight:700;}
  table.ebp-heatmap .status-cap{display:flex; align-items:center; gap:7px; justify-content:flex-end;}
  table.ebp-heatmap .status-cap .dot{width:8px; height:8px; border-radius:2px; flex:none;}
  table.ebp-heatmap .status-cap .unk{color:var(--warn,#e0a760);}

  /* ── STACKED BARS ── */
  .ebp-barrow{display:grid; grid-template-columns:112px 1fr 56px; align-items:center; gap:12px;
    padding:5px 0;}
  .ebp-barname{font-size:12.5px; font-weight:650; text-align:right; color:var(--paper-dim,#a6bcaf);
    font-family:ui-monospace,'Cascadia Code',Menlo,monospace; overflow:hidden; text-overflow:ellipsis;}
  .ebp-bartrack{height:26px; border-radius:6px; background:var(--ink-3,#14231b); overflow:hidden;
    display:flex; min-width:6px;}
  .ebp-barseg{height:100%; min-width:0; border-right:2px solid var(--ink-2,#0f1a14);}
  .ebp-barseg:last-child{border-right:none;}
  .ebp-bartot{font-size:12.5px; font-weight:700; color:var(--paper-dim,#a6bcaf);
    font-variant-numeric:tabular-nums;}
  .ebp-baraxis{display:grid; grid-template-columns:112px 1fr 56px; gap:12px; margin-top:8px;
    font-size:11px; color:var(--paper-mute,#6f8a7b);}
  @media (max-width:720px){ .ebp-barrow,.ebp-baraxis{grid-template-columns:80px 1fr 48px;} }

  /* legend */
  .ebp-dup-legend{display:flex; flex-wrap:wrap; gap:9px 16px; margin-top:20px; padding-top:16px;
    border-top:1px solid var(--line,#22362b); font-size:11.5px; color:var(--paper-dim,#a6bcaf);
    align-items:center;}
  .ebp-dup-legend .lead{color:var(--paper-mute,#6f8a7b); font-weight:700; text-transform:uppercase;
    letter-spacing:.05em; font-size:10.5px;}
  .ebp-dup-legend span{display:inline-flex; align-items:center; gap:6px;}
  .ebp-dup-legend .dot{width:10px; height:10px; border-radius:3px; flex:none;}

  /* Full panel width, deliberately — no measure cap. These are footnotes under a
     table that is itself full width, and a 96ch column left them wrapping at
     about half the panel with a ragged void beside it. They are short and set
     small; the usual 65-90ch reading measure is for running prose, not for two
     lines of caption pinned to the thing above them. */
  .ebp-dup-cap{font-size:11.5px; color:var(--paper-mute,#6f8a7b); margin:14px 0 0; line-height:1.6;}
  .ebp-dup-cap b{color:var(--paper-dim,#a6bcaf);}

  /* ── drill-down drawer ── */
  .ebp-drill{margin-top:18px; border:1px solid var(--line,#22362b); border-radius:11px;
    background:var(--ink-3,#14231b); overflow:hidden;}
  .ebp-drill[hidden]{display:none;}
  .ebp-drill-head{display:flex; align-items:center; gap:11px; padding:13px 16px;
    border-bottom:1px solid var(--line,#22362b); background:var(--ink-2,#0f1a14);}
  .ebp-drill-head .swatch{width:11px; height:11px; border-radius:3px; flex:none;}
  .ebp-drill-head .dh-title{font-size:13.5px; font-weight:700;}
  .ebp-drill-head .dh-title b{color:var(--green-glow,#5fd39a);}
  .ebp-drill-head .dh-sub{font-size:12px; color:var(--paper-mute,#6f8a7b); margin-top:1px;}
  .ebp-drill-head .dh-close{margin-left:auto; background:transparent;
    border:1px solid var(--line,#22362b); color:var(--paper-dim,#a6bcaf); border-radius:7px;
    width:28px; height:28px; cursor:pointer; font-size:15px; line-height:1; flex:none;}
  .ebp-drill-head .dh-close:hover{color:var(--green-glow,#5fd39a); border-color:rgba(63,191,127,.4);}
  .ebp-species{max-height:300px; overflow-y:auto; padding:6px;}
  .ebp-sp{display:flex; align-items:center; gap:11px; padding:8px 11px; border-radius:7px;
    font-size:13px;}
  .ebp-sp:hover{background:var(--ink-4,#1b2f24);}
  .ebp-sp .sci{font-style:italic; font-weight:500; color:var(--paper,#e9f2ec); flex:1; min-width:0;}
  .ebp-sp .tid{font-size:11px; color:var(--paper-mute,#6f8a7b); font-variant-numeric:tabular-nums;
    white-space:nowrap;}
  /* Leaves the site, so it takes the outbound-link blue rather than the
     in-product green — same rule as the cited sources in the footer. */
  .ebp-sp .goat{font-size:11.5px; color:var(--link-out,#7aa2ff); white-space:nowrap;}
  .ebp-sp+.ebp-sp{border-top:1px solid var(--line-soft,#1a2a20);}
  .ebp-drill-more{text-align:center; padding:9px; font-size:12px; color:var(--paper-mute,#6f8a7b);
    border-top:1px solid var(--line,#22362b);}
  .ebp-drill-none{padding:16px; font-size:12.5px; color:var(--warn,#e0a760); line-height:1.65;}

  /* ── empty + warning ── */
  .ebp-dup-empty{border:1px dashed var(--line,#22362b); border-radius:11px; padding:22px 24px;
    background:var(--ink-3,#14231b); color:var(--paper-dim,#a6bcaf); font-size:13px; line-height:1.7;
    max-width:80ch;}
  .ebp-dup-empty b{color:var(--paper,#e9f2ec); display:block; font-size:14.5px; margin-bottom:5px;}
  .ebp-dup-empty b.inline{display:inline; font-size:inherit;}
  .ebp-dup-empty.good b{color:var(--green-glow,#5fd39a);}
  .ebp-dup-empty.caution{border-style:solid; border-color:rgba(224,167,96,.35);
    background:rgba(224,167,96,.08);}
  .ebp-dup-empty.caution b{color:var(--warn,#e0a760);}

  .ebp-dup-warn{border:1px solid rgba(224,167,96,.35); background:rgba(224,167,96,.09);
    color:var(--warn,#e0a760); border-radius:9px; padding:10px 14px; font-size:12.5px;
    line-height:1.65; margin-bottom:14px;}
  .ebp-dup-warn b{color:var(--warn,#e0a760);}
  `;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement('style');
    tag.id = STYLE_ID;
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }

  // ── heatmap ───────────────────────────────────────────────────────────────

  /**
   * A cell's fill: its own status colour at an intensity set by the count.
   *
   * The mockup's rule, kept — `rgba(status, 0.12 + 0.88·t)` where t is the share
   * of the report's largest cell. Intensity carries magnitude and hue carries
   * the row, so the two never compete, and the floor of 0.12 is what keeps a
   * count of 1 visible as a coloured cell rather than as almost-background.
   * Zero is not painted with it at all — `.z` gets the flat surface, because
   * "no overlap" and "one overlapping species" are different findings.
   */
  function fillFor(key, share) {
    const hex = colorOf(key);
    const match = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
    if (!match) return hex;
    const alpha = (0.12 + 0.88 * Math.max(0, Math.min(1, share))).toFixed(3);
    return 'rgba(' + parseInt(match[1], 16) + ',' + parseInt(match[2], 16) + ','
      + parseInt(match[3], 16) + ',' + alpha + ')';
  }

  function heatmapHtml(report, columns, statuses) {
    let max = 0;
    statuses.forEach(function (status) {
      columns.forEach(function (project) {
        max = Math.max(max, cell(report, status, project));
      });
    });
    max = max || 1;

    /* The two summary columns sit LEFT of the projects, not right of them as in
       the mockup. The mockup had seven columns; DTOL has 34, so a row total on
       the right is 1,500px past the row label — the reader scrolls away from
       the two numbers that summarise the row they are trying to read. Both they
       and the row header are sticky, so the frame of the table stays put while
       the projects scroll under it. */
    let html = '<thead><tr><th class="rowh"></th>'
      + '<th class="colh meta stick s1"><span>overlap sum</span></th>'
      + '<th class="colh meta stick s2"><span>duplication count</span></th>'
      + columns.map(function (name) {
        return '<th class="colh"><span>' + esc(name) + '</span></th>';
      }).join('')
      + '</tr></thead><tbody>';

    statuses.forEach(function (status) {
      const known = !!STATUS_BY_KEY[status];
      html += '<tr><th class="rowh"><span class="status-cap'
        + (known ? '' : ' unk') + '">'
        + '<span class="dot" style="background:' + esc(colorOf(status)) + '"></span>'
        + esc(labelOf(status)) + (known ? '' : ' ⚠') + '</span></th>'
        + '<td class="meta stick s1">' + num(rowSum(report, status)) + '</td>'
        + '<td class="meta stick s2">' + num((report.original_counts || {})[status]) + '</td>';
      columns.forEach(function (project) {
        const value = cell(report, status, project);
        if (!value) { html += '<td class="z">·</td>'; return; }
        html += '<td data-status="' + esc(status) + '" data-project="' + esc(project) + '"'
          + ' data-count="' + value + '"'
          + ' style="background:' + esc(fillFor(status, value / max)) + '"'
          + ' title="' + value + ' species · your status ' + esc(labelOf(status))
          + ' · also in ' + esc(project) + ' · click to list them">'
          + '<span class="st" style="background:' + esc(colorOf(status)) + '"></span>'
          + num(value) + '</td>';
      });
      html += '</tr>';
    });

    html += '<tr class="totals"><th class="rowh">column total</th>'
      + '<td class="meta grand stick s1">' + num(statuses.reduce(function (total, status) {
        return total + rowSum(report, status);
      }, 0)) + '</td>'
      + '<td class="meta grand stick s2">' + num(statuses.reduce(function (total, status) {
        return total + (Number((report.original_counts || {})[status]) || 0);
      }, 0)) + '</td>'
      + columns.map(function (project) {
        return '<td class="meta">' + num(colSum(report, statuses, project)) + '</td>';
      }).join('')
      + '</tr></tbody>';

    return '<div class="ebp-hmwrap"><table class="ebp-heatmap">' + html + '</table></div>'
      + '<p class="ebp-dup-cap"><b>Click any cell to list the species behind it.</b> '
      + 'Rows are <b>your</b> project’s status; columns are the other projects that hold the same '
      + 'species. Cell colour is the row’s status, and its intensity is the count relative to the '
      + 'largest cell in this report; <code>·</code> is no overlap, which is not the palest shade — '
      + 'none and one are different answers.</p>'
      + '<p class="ebp-dup-cap"><b>overlap sum</b> may exceed <b>duplication count</b> when a '
      + 'species overlaps more than one project; a duplication count LARGER than the overlap sum '
      + 'means your project overlaps projects GoaT does not represent. The umbrella project '
      + '<code>ebp</code> is excluded from the columns: every project rolls up into it, so it would '
      + 'dominate every row without saying anything.</p>';
  }

  // ── stacked bars ──────────────────────────────────────────────────────────

  function barsHtml(report, columns, statuses) {
    const rows = columns.map(function (project) {
      return {
        project: project,
        total: colSum(report, statuses, project),
        segments: statuses.map(function (status) {
          return { status: status, value: cell(report, status, project) };
        }).filter(function (segment) { return segment.value > 0; }),
      };
    }).filter(function (row) { return row.total > 0; });

    const max = rows.reduce(function (top, row) { return Math.max(top, row.total); }, 0) || 1;

    return rows.map(function (row) {
      return '<div class="ebp-barrow">'
        + '<div class="ebp-barname" title="' + esc(row.project) + '">' + esc(row.project) + '</div>'
        + '<div class="ebp-bartrack" style="width:' + (100 * row.total / max).toFixed(1) + '%">'
        + row.segments.map(function (segment) {
          return '<div class="ebp-barseg" style="flex:' + segment.value + ' 0 0; background:'
            + esc(colorOf(segment.status)) + '" title="' + num(segment.value) + ' species · '
            + esc(labelOf(segment.status)) + '"></div>';
        }).join('')
        + '</div><div class="ebp-bartot">' + num(row.total) + '</div></div>';
    }).join('')
      + '<div class="ebp-baraxis"><span></span><span>← species count →</span>'
      + '<span style="text-align:right">total</span></div>'
      + '<p class="ebp-dup-cap">One bar per other EBP project, ordered by how many of your species '
      + 'it overlaps; the segments are <b>your</b> project’s status on those species. Hover a '
      + 'segment for its status and count — <b>switch to the heatmap to click through to the '
      + 'species themselves.</b></p>';
  }

  // ── legend ────────────────────────────────────────────────────────────────

  function legendHtml(statuses) {
    return '<div class="ebp-dup-legend"><span class="lead">Your status →</span>'
      + statuses.map(function (status) {
        const known = STATUS_BY_KEY[status];
        return '<span title="' + esc(known ? known.gloss : 'not a status this page knows')
          + '"><i class="dot" style="background:' + esc(colorOf(status)) + '"></i>'
          + esc(labelOf(status)) + (known ? '' : ' ⚠') + '</span>';
      }).join('') + '</div>';
  }

  // ── the drill-down drawer ─────────────────────────────────────────────────

  function closeDrill() {
    openCell = null;
    const drawer = els.panel.querySelector('#ebp-drill');
    if (drawer) drawer.hidden = true;
    Array.prototype.forEach.call(els.panel.querySelectorAll('td.sel'), function (td) {
      td.classList.remove('sel');
    });
  }

  function openDrill(td) {
    const status = td.dataset.status;
    const project = td.dataset.project;
    const count = Number(td.dataset.count) || 0;

    // A second click on the open cell closes it — the heatmap is the control.
    if (openCell && openCell.status === status && openCell.project === project) {
      closeDrill();
      return;
    }
    Array.prototype.forEach.call(els.panel.querySelectorAll('td.sel'), function (other) {
      other.classList.remove('sel');
    });
    td.classList.add('sel');
    openCell = { status: status, project: project };

    const report = reportOf(active);
    const species = speciesIn(report, status, project);
    const drawer = els.panel.querySelector('#ebp-drill');

    let body;
    if (species === null) {
      /* A payload captured before the species lists existed. Saying so beats an
         empty drawer, which would read as "no species" over a cell of 12. */
      body = '<div class="ebp-drill-none"><b>This capture does not carry the species names.</b><br>'
        + 'It was stored before the reports began keeping them. The next weekly capture will '
        + 'include them; the counts above are unaffected.</div>';
    } else {
      const shown = species.slice(0, DRILL_LIMIT);
      body = '<div class="ebp-species">' + shown.map(function (row) {
        const taxon = row[1];
        return '<div class="ebp-sp"><span class="sci">' + esc(row[0]) + '</span>'
          + (taxon ? '<span class="tid">taxon ' + esc(taxon) + '</span>'
            + '<a class="goat" href="https://goat.genomehubs.org/record?recordId=' + esc(taxon)
            + '&result=taxon&taxonomy=ncbi" target="_blank" rel="noopener noreferrer">GoaT ↗</a>'
            : '') + '</div>';
      }).join('') + '</div>'
        + '<div class="ebp-drill-more">' + (species.length > shown.length
          ? '+ ' + num(species.length - shown.length) + ' more · download the workbook for the '
            + 'full list'
          : num(species.length) + ' species · complete list') + '</div>';
    }

    drawer.innerHTML = '<div class="ebp-drill-head">'
      + '<span class="swatch" style="background:' + esc(colorOf(status)) + '"></span>'
      + '<div><div class="dh-title"><b>' + num(count) + '</b> species · your status <b>'
      + esc(labelOf(status)) + '</b> · also in <b>' + esc(project) + '</b></div>'
      + '<div class="dh-sub">Species on your target list that ' + esc(project)
      + ' has also registered in GoaT.</div></div>'
      + '<button class="dh-close" type="button" id="ebp-drill-close" aria-label="Close">✕</button>'
      + '</div>' + body;
    drawer.hidden = false;
  }

  // ── panel ─────────────────────────────────────────────────────────────────

  /**
   * The two empty reports that mean opposite things.
   *
   * An empty report for a project GoaT has no target list for is not a finding
   * at all — there was nothing to compare — and reading it as "no duplication"
   * is the most expensive mistake available on this page (A-D3 finding 2). The
   * long-list size is the only thing that separates them, which is why
   * `/projects` returns it.
   */
  function emptyHtml(longList) {
    if (longList === 0) {
      return '<div class="ebp-dup-empty caution"><b>This is not a finding — there was nothing '
        + 'to compare.</b>GoaT holds <b class="inline">no target list</b> for this project, so the '
        + 'report has no species to test for duplication and comes out empty for that reason '
        + 'alone. It does <em>not</em> mean the project duplicates nothing. A project reaches '
        + 'these reports by having its target species registered against its BioProject in GoaT; '
        + 'until that happens there is nothing here to read.</div>';
    }
    if (longList === null || longList === undefined) {
      return '<div class="ebp-dup-empty"><b>No overlapping projects in this report.</b>'
        + 'No other project in GoaT is working on the species this report selects. The size of the '
        + 'target list this was checked against is not recorded in this payload, so the two '
        + 'possible readings — no overlap, or nothing to compare — cannot be told apart here; '
        + 'check the other two reports.</div>';
    }
    /* `longList` is `superset.species`, which is NOT the size of the project's
       GoaT target list — it is that list after GoaT's `fields:` filter, which
       drops species carrying none of the 68 requested fields. Saying "the N
       species GoaT lists against this project" was wrong by 4.7x on DTOL
       (15,162 against a real long list of 70,852). The filtered number is the
       right one to quote HERE, because it is exactly the set a report could
       have drawn from — but it has to be described as that. */
    const total = (payload.superset || {}).long_list_total;
    return '<div class="ebp-dup-empty good"><b>No overlapping projects found.</b>'
      + 'GoaT records an assembly level or a project sequencing status for '
      + (total ? num(longList) + ' of the ' + num(total) + ' species on this project’s target list'
        : num(longList) + ' of this project’s target species')
      + ' — those are the only ones a report can draw on, and none of them meets this report’s '
      + 'criteria alongside another project. Nothing to coordinate here; read the other two '
      + 'reports before concluding anything about the project as a whole.</div>';
  }

  function tabsHtml() {
    return REPORTS.map(function (report) {
      const stored = (payload.stored || {})['report_' + report.n + '_species'];
      return '<button type="button" data-report="' + report.n + '"'
        + (report.n === active ? ' class="on"' : '') + '>'
        + '<span class="rn">R' + report.n + '</span><span>' + esc(report.tab) + '</span>'
        + '<span class="tct">' + num(stored) + '</span></button>';
    }).join('');
  }

  function panelHtml() {
    const meta = REPORTS[active - 1];
    const report = reportOf(active);
    const columns = columnsOf(report);
    const statuses = statusesOf(report);
    const unknown = unknownStatuses(report);
    const longList = (payload.superset || {}).species;

    let body;
    if (!columns.length) {
      body = emptyHtml(longList);
    } else {
      body = '<div class="ebp-dup-vtoggle" role="group" aria-label="View">'
        + '<button type="button" data-mode="heat"' + (mode === 'heat' ? ' class="on"' : '')
        + '>▦ Heatmap</button>'
        + '<button type="button" data-mode="bars"' + (mode === 'bars' ? ' class="on"' : '')
        + '>▬ Stacked bars</button></div>'
        + '<div id="ebp-dup-body">'
        + (mode === 'heat' ? heatmapHtml(report, columns, statuses)
          : barsHtml(report, columns, statuses))
        + '</div>'
        + legendHtml(statuses)
        + '<div class="ebp-drill" id="ebp-drill" hidden></div>';
    }

    return '<div class="ebp-dup-desc"><span class="ic">▤</span><span>'
      + '<b>Report ' + meta.n + ' — ' + esc(meta.lead) + '</b> ' + esc(meta.description)
      + '<span class="rec"><b>Recommendation.</b> ' + esc(meta.recommendation) + '</span>'
      + '</span></div>'
      + (unknown.length ? '<div class="ebp-dup-warn"><b>' + unknown.length
        + ' sequencing status this page does not recognise:</b> <code>'
        + esc(unknown.join('</code>, <code>')) + '</code>. GoaT is revising the status '
        + 'vocabulary. The species are counted and drawn — they are simply not glossed, because '
        + 'guessing what a new status means would put a description on a number that does not '
        + 'fit it.</div>' : '')
      + body
      + footHtml();
  }

  /**
   * The panel's actions — export, and a link into GoaT's own view of this list.
   *
   * Rendered BY THE COMPONENT rather than appended by the page. It was appended
   * at first, into the panel element — and `drawPanel()` re-renders that element
   * with `innerHTML`, so the export button vanished on the first report-tab
   * switch or theme flip. Anything that must survive a redraw has to be part of
   * what the redraw produces.
   */
  function footHtml() {
    const project = payload.project || '';
    const species = (payload.superset || {}).species;
    const total = (payload.superset || {}).long_list_total;
    return '<div class="foot">'
      + (hooks.exportUrl ? '<a class="btn primary" href="' + esc(hooks.exportUrl)
        + '">↧ Export project (.xlsx)</a>' : '')
      + (project ? '<a class="btn" target="_blank" rel="noopener noreferrer" '
        + 'href="https://goat.genomehubs.org/search?result=taxon&taxonomy=ncbi'
        + '&query=long_list%3D' + encodeURIComponent(project)
        + '%20AND%20tax_rank%28species%29">◫ Open this target list in GoaT</a>' : '')
      /* BOTH counts, because either alone misleads. `superset.species` is the
         target list AFTER GoaT's `fields:` filter — the species a report could
         possibly draw on — and `long_list_total` is the whole list, which is
         what GoaT's own UI shows and what anyone checking will compare against.
         On DTOL they are 15,162 and 70,852: quoting the first as "the target
         list" was wrong by 4.7x, and quoting only the second would imply the
         reports had 70,852 species to work with. */
      + '<span class="src" title="Only species GoaT holds an assembly level or some project&#39;s '
      + 'sequencing status for can appear in a report. The rest of the target list is registered '
      + 'in GoaT but has no status recorded against it.">'
      + esc(payload.bioproject || '')
      + (species === undefined ? '' : ' · ' + num(species)
        + (total ? ' of ' + num(total) : '') + ' target species with a status in GoaT')
      + '</span></div>';
  }

  /**
   * Pin the row header and the two summary columns at their MEASURED offsets.
   *
   * The three are `position: sticky`, and sticky needs a `left` in pixels. Those
   * offsets cannot be written in the stylesheet: the row header's width is set
   * by the longest status label in THIS report (`sample collected` and `not
   * started` differ), and `border-spacing` adds to it. A guess is not merely
   * imprecise — a sticky column pinned somewhere other than where its neighbour
   * ends lets the scrolling project columns render between the pinned ones, and
   * the table reads as shuffled rather than as broken.
   *
   * Measured against the table's own left edge before any scrolling, so the
   * numbers are the columns' natural positions.
   */
  function stickFrame() {
    const table = els.panel.querySelector('table.ebp-heatmap');
    if (!table) return;
    const wrap = table.parentNode;
    const origin = table.getBoundingClientRect().left + wrap.scrollLeft;
    const header = table.querySelector('thead th.rowh');
    const first = table.querySelector('thead th.s1');
    const second = table.querySelector('thead th.s2');
    if (!header || !first || !second) return;

    const offsets = {
      s1: first.getBoundingClientRect().left + wrap.scrollLeft - origin,
      s2: second.getBoundingClientRect().left + wrap.scrollLeft - origin,
    };
    Object.keys(offsets).forEach(function (key) {
      Array.prototype.forEach.call(table.querySelectorAll('.' + key), function (cell) {
        cell.style.left = offsets[key] + 'px';
      });
    });
  }

  function drawPanel() {
    openCell = null;
    els.panel.innerHTML = panelHtml();
    stickFrame();
  }

  function drawBody() {
    const report = reportOf(active);
    const columns = columnsOf(report);
    const statuses = statusesOf(report);
    const body = els.panel.querySelector('#ebp-dup-body');
    if (!body) return;
    closeDrill();
    body.innerHTML = mode === 'heat'
      ? heatmapHtml(report, columns, statuses)
      : barsHtml(report, columns, statuses);
    stickFrame();
  }

  // ── render ────────────────────────────────────────────────────────────────

  /**
   * Render one project's three reports into `host`.
   *
   * @param {Element} host
   * @param {{payload: object, report?: number}} opts
   * @returns {{redraw: function, report: function}}
   */
  function render(host, opts) {
    injectStyles();
    hooks = opts || {};
    payload = hooks.payload || {};
    active = hooks.report >= 1 && hooks.report <= 3 ? hooks.report : 1;
    mode = 'heat';

    host.innerHTML = '<div class="ebp-dup-tabs" id="ebp-dup-tabs" role="tablist"></div>'
      + '<div class="ebp-dup-panel" id="ebp-dup-panel"></div>';
    els = {
      tabs: host.querySelector('#ebp-dup-tabs'),
      panel: host.querySelector('#ebp-dup-panel'),
    };
    els.tabs.innerHTML = tabsHtml();

    els.tabs.addEventListener('click', function (event) {
      const button = event.target.closest('button[data-report]');
      if (!button) return;
      active = Number(button.dataset.report);
      els.tabs.innerHTML = tabsHtml();
      drawPanel();
      if (hooks.onReport) hooks.onReport(active);
    });

    /* One listener for the whole panel — the heatmap, the toggle and the
       drawer's close button are all re-rendered from strings, so binding to
       the elements themselves would need re-binding on every draw. */
    els.panel.addEventListener('click', function (event) {
      const toggle = event.target.closest('button[data-mode]');
      if (toggle) {
        if (toggle.dataset.mode === mode) return;
        mode = toggle.dataset.mode;
        Array.prototype.forEach.call(els.panel.querySelectorAll('button[data-mode]'),
          function (other) { other.classList.toggle('on', other.dataset.mode === mode); });
        drawBody();
        return;
      }
      if (event.target.closest('#ebp-drill-close')) { closeDrill(); return; }
      const td = event.target.closest('td[data-count]');
      if (td) openDrill(td);
    });

    drawPanel();

    return {
      /* Every colour is read from a CSS variable at draw time, so a theme flip
         is a redraw — the same contract the prioritization views have. The open
         drawer is deliberately not preserved: it would have to be re-derived
         anyway, and a stale selection ring is worse than a closed drawer. */
      redraw() { drawPanel(); },
      report() { return active; },
    };
  }

  return {
    render: render,
    /* Exported for the page's help card and for the parity test, so the status
       vocabulary has one copy on this side of the API as well. */
    STATUSES: STATUSES,
    REPORTS: REPORTS,
  };
})();
