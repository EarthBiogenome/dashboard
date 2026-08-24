/**
 * "How to read this" — the workbook's INSTRUCTIONS sheet, on the page. [Task 6]
 *
 *   PrioritizationHelp.mount();          // wires the button + #help deep link
 *   PrioritizationHelp.open(section);    // 'novelty' | 'status' | 'matrix' | ...
 *   PrioritizationHelp.matrixHtml();     // the compact inline version
 *
 * WHY THIS EXISTS. Every label the page shows is glossed on hover, and hover is
 * not an answer: it is invisible on a tablet, invisible while scanning, and
 * unprintable. A PI reading results in a meeting had no way to learn what
 * `High_S` meant without downloading the .xlsx and opening a second application.
 *
 * WHY A DRAWER AND NOT A FIFTH TAB. The same labels appear in Results, in
 * Coverage and in both trend panels, so binding the explanation to one view
 * would be wrong wherever you happened to be standing. A tab would also make
 * reference material a peer of the workflow steps in a strip that already
 * carries two conditional tabs. This opens over whichever view is on screen and
 * closes back to it.
 *
 * ONE SOURCE FOR THE LABEL PROSE. The two tables are BUILT from
 * `PrioritizationSpecies.glossary()` — the same table the chips' tooltips read.
 * Restating them here would be the third copy of this wording (the Python
 * INSTRUCTIONS sheet is the first), and this project has already been bitten by
 * exactly that drift: `CLAUDE.md` documented the not-found status label as
 * `Unknown` while the code had always emitted `Not_Assigned` (closed 2026-08-15).
 * `api/tests/test_label_parity.py` pins the label SETS across the Python sheet
 * and this page, so a label added on one side is caught rather than discovered.
 *
 * WHAT IS DELIBERATELY NOT HERE. The workbook's supporting-column definitions
 * for columns this page does not display (`X_Assembly_Count`, `X_Examples`,
 * `sequencing_status_<PROJECT>`, the other sheets). Explaining a column a reader
 * cannot see teaches them the spreadsheet, not the page.
 */

const PrioritizationHelp = (function () {
  'use strict';

  /* The workbook's sort order (generate_prioritization_tool.py), so the tables
     read top-to-bottom in the same order the results table does. Held here
     rather than in the glossary because it is a display decision. */
  const TAX_ORDER = [
    'Highest_P', 'Highest_C', 'Highest_O', 'Highest_F', 'Highest_G',
    'High_S', 'Already_Covered', 'Unknown_S', 'Unknown', 'Unknown_G',
  ];
  const PROJ_ORDER = [
    'High_New', 'Low_Active', 'Low_Sample', 'Medium_Improve', 'Low_Done', 'Not_Assigned', 'Unknown',
  ];

  /* The FILTER MATRIX — the actionable half of the two-column split, and the one
     part of the INSTRUCTIONS sheet with no equivalent anywhere on the page until
     now. Wording follows the sheet's `create_instructions_content()`.

     `compact` is what the Results view shows inline, beside the two filters,
     because that is where the decision is actually made. */
  const MATRIX = [
    { tax: 'Highest_G/F/O/C/P', proj: 'High_New', act: 'Ideal sequencing target', compact: true },
    { tax: 'Highest_G/F/O/C/P', proj: 'Low_Active', act: 'Coordinate with the indicated project(s)', compact: true },
    { tax: 'Highest_G/F/O/C/P', proj: 'Low_Sample', act: 'Coordinate with the indicated project(s)' },
    { tax: 'High_S', proj: 'High_New', act: 'Secondary target — the genus is already covered by another sequenced species, but this is still a valid candidate', compact: true },
    { tax: 'Already_Covered', proj: 'any', act: 'Reference only — not a gap-filling target' },
    { tax: 'Unknown_S', proj: 'any', act: 'The genus is covered, but the species name did not resolve — verify the name before acting' },
    { tax: 'Unknown_G', proj: 'any', act: 'The species name did not resolve — verify it before acting' },
    { tax: 'Unknown', proj: 'any', act: 'Taxonomic information is missing' },
  ];

  /* The suffixes that appear inside `Projects_Working_On_Species`. The page
     prints that column verbatim, so the vocabulary has to be readable somewhere;
     the distinction between the last two is the one that matters (CLAUDE.md). */
  const PROJECT_SUFFIXES = [
    ['(no suffix)', 'The project reports an active status for this species — it holds samples, or sequencing is under way.'],
    ['(in INSDC)', 'The assembly is public in INSDC and retrievable now.'],
    ['(submitted to INSDC)', 'The assembly has been produced and submitted, but is <b>not yet retrievable</b>. Deliberately distinct from “(in INSDC)”.'],
    ['(published)', 'The project reports the assembly as published.'],
  ];

  const esc = (value) => String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  function gloss(kind, label) {
    if (typeof PrioritizationSpecies !== 'undefined' && PrioritizationSpecies.gloss) {
      return PrioritizationSpecies.gloss(kind, label);
    }
    return { cls: 'c-unknown', text: '' };
  }

  function glossary(kind, order) {
    if (typeof PrioritizationSpecies === 'undefined' || !PrioritizationSpecies.glossary) return [];
    const entries = PrioritizationSpecies.glossary(kind);
    const rank = {};
    order.forEach((label, index) => { rank[label] = index; });
    return entries.slice().sort((a, b) => (rank[a.label] ?? 99) - (rank[b.label] ?? 99));
  }

  // ── styles ────────────────────────────────────────────────────────────────
  const STYLE_ID = 'ebp-help-styles';
  const STYLES = `
  /* A 999px pill is also what the LABEL badges use (.ebp-res-chip, .ebp-chip,
     .ebp-help-chip), and by the time a reader reaches Results those have taught
     them "pill = read it, don't click it". Two things separate this one from a
     badge: the trailing arrow, carried at rest, and an underline on hover.
     Underline rather than a fill or a new hue because green already means links,
     the active tab, "Export to Excel" and the High_New label -- a green help chip
     would compete with the view's one primary action. See also .ebp-help-link
     below: the drawer's other opener, styled as a link for the same reason.
     The outline takes --line-strong, not --line: --line is a hairline meant to
     separate panels, and at 1.23:1 on the light ground the pill all but vanished,
     leaving the arrow to carry the affordance alone. */
  .ebp-help-btn{background:transparent; border:1px solid var(--line-strong,#4a6b57); color:var(--paper-dim,#a6bcaf);
    border-radius:999px; padding:7px 13px; font:inherit; font-size:12px; font-weight:600; cursor:pointer;
    white-space:nowrap;}
  /* Solid --green-glow, not the rgba(63,191,127,.4) the page's other quiet
     controls hover to: at 40% over the light ground that composites to 1.36:1,
     which is FAINTER than this control's 3.19:1 rest outline -- the ring would
     deflate on hover. The other controls keep the soft value because their rest
     border is soft too; only this one had its rest state darkened. */
  .ebp-help-btn:hover,
  .ebp-help-btn:focus-visible{color:var(--green-glow,#5fd39a); border-color:var(--green-glow,#5fd39a);
    text-decoration:underline;}

  .ebp-help-scrim{position:fixed; inset:0; z-index:60; background:rgba(0,0,0,.5);
    backdrop-filter:blur(2px); display:flex; justify-content:flex-end;}
  .ebp-help-scrim[hidden]{display:none;}
  .ebp-help{background:var(--ink-2,#0f1a14); color:var(--paper,#e9f2ec); width:min(720px,100%);
    height:100%; overflow-y:auto; border-left:1px solid var(--line,#22362b);
    box-shadow:-24px 0 60px rgba(0,0,0,.45);}
  .ebp-help-top{position:sticky; top:0; z-index:2; display:flex; align-items:baseline; gap:12px;
    padding:18px 24px 14px; background:var(--ink-2,#0f1a14); border-bottom:1px solid var(--line,#22362b);}
  .ebp-help-top h2{margin:0; font-size:17px; font-weight:700; letter-spacing:-.01em;}
  .ebp-help-top .sub{font-size:12px; color:var(--paper-mute,#6f8a7b);}
  .ebp-help-close{margin-left:auto; background:transparent; border:1px solid var(--line,#22362b);
    color:var(--paper-dim,#a6bcaf); border-radius:7px; width:30px; height:30px; cursor:pointer;
    font-size:15px; line-height:1; flex:none;}
  .ebp-help-close:hover{color:var(--green-glow,#5fd39a); border-color:rgba(63,191,127,.4);}
  .ebp-help-body{padding:6px 24px 40px;}
  .ebp-help h3{font-size:12px; text-transform:uppercase; letter-spacing:.05em;
    color:var(--paper-mute,#6f8a7b); font-weight:700; margin:26px 0 4px;}
  .ebp-help h3:first-child{margin-top:16px;}
  .ebp-help p{font-size:13px; color:var(--paper-dim,#a6bcaf); line-height:1.65; margin:0 0 10px;}
  .ebp-help p b{color:var(--paper,#e9f2ec);}
  .ebp-help code{font-family:ui-monospace,'Cascadia Code',Menlo,monospace; font-size:.86em;
    color:var(--green-glow,#5fd39a); background:var(--ink-3,#14231b);
    border:1px solid var(--line,#22362b); border-radius:5px; padding:1px 5px;}

  .ebp-help-tbl{width:100%; border-collapse:collapse; font-size:12.5px; margin:8px 0 4px;}
  .ebp-help-tbl th{text-align:left; font-size:10.5px; text-transform:uppercase; letter-spacing:.04em;
    color:var(--paper-mute,#6f8a7b); font-weight:700; padding:6px 10px 6px 0;
    border-bottom:1px solid var(--line,#22362b);}
  .ebp-help-tbl td{padding:8px 10px 8px 0; border-bottom:1px solid var(--line-soft,#1a2a20);
    color:var(--paper-dim,#a6bcaf); line-height:1.55; vertical-align:top;}
  .ebp-help-tbl td:first-child{white-space:nowrap; width:1%;}
  .ebp-help-chip{display:inline-block; padding:2.5px 8px; border-radius:999px; font-size:11.5px;
    font-weight:600;}
  .ebp-help-chip.c-novel{background:rgba(122,162,255,.14); color:var(--novel,#7aa2ff);}
  .ebp-help-chip.c-covered{background:var(--ink-4,#1b2f24); color:var(--paper-mute,#6f8a7b);}
  .ebp-help-chip.c-new{background:rgba(63,191,127,.13); color:var(--green-glow,#5fd39a);}
  .ebp-help-chip.c-improve{background:rgba(224,167,96,.13); color:var(--improve,#e0a760);}
  .ebp-help-chip.c-low{background:var(--ink-4,#1b2f24); color:var(--low,#8595a0);}
  .ebp-help-chip.c-unknown{background:var(--ink-4,#1b2f24); color:var(--paper-mute,#6f8a7b);}
  .ebp-help-arrow{color:var(--paper-mute,#6f8a7b); padding:0 4px;}
  .ebp-help-src{font-size:11.5px; color:var(--paper-mute,#6f8a7b); line-height:1.6;}
  .ebp-help-src div{margin:3px 0;}

  /* The compact matrix, inline in the Results view beside the two filters. */
  .ebp-matrix{border:1px solid var(--line,#22362b); border-radius:10px; background:var(--ink-2,#0f1a14);
    padding:10px 14px; margin-bottom:12px; font-size:12.5px;}
  .ebp-matrix > summary{cursor:pointer; color:var(--paper-dim,#a6bcaf); font-weight:600;
    list-style:none; display:flex; align-items:center; gap:8px;}
  .ebp-matrix > summary::-webkit-details-marker{display:none;}
  .ebp-matrix > summary::before{content:"▸"; font-size:10px; color:var(--paper-mute,#6f8a7b);}
  .ebp-matrix[open] > summary::before{content:"▾";}
  .ebp-matrix > summary:hover{color:var(--paper,#e9f2ec);}
  .ebp-matrix .rows{display:grid; gap:6px; margin-top:10px;}
  .ebp-matrix .row{display:flex; align-items:center; gap:7px; flex-wrap:wrap;
    color:var(--paper-dim,#a6bcaf);}
  .ebp-matrix .act{color:var(--paper,#e9f2ec); font-weight:600;}
  .ebp-matrix .all{margin-top:9px; font-size:11.5px;}
  .ebp-help-link{background:none; border:none; padding:0; font:inherit; font-size:11.5px;
    color:var(--green-glow,#5fd39a); cursor:pointer; text-decoration:underline;}
  .ebp-help-link:hover{text-decoration:none;}

  @media (max-width:640px){ .ebp-help-body{padding:6px 16px 40px;} .ebp-help-top{padding:16px;} }
  `;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement('style');
    tag.id = STYLE_ID;
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }

  // ── content ───────────────────────────────────────────────────────────────

  function labelTable(kind, order, caption) {
    const rows = glossary(kind, order).map(function (entry) {
      return '<tr><td><span class="ebp-help-chip ' + entry.cls + '">' + esc(entry.label)
        + '</span></td><td>' + esc(entry.text) + '</td></tr>';
    }).join('');
    return '<table class="ebp-help-tbl"><thead><tr><th>' + esc(caption)
      + '</th><th>Meaning</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  function matrixRows(only) {
    return MATRIX.filter((row) => !only || row.compact).map(function (row) {
      const tax = gloss('tax', row.tax.indexOf('/') > 0 ? 'Highest_G' : row.tax);
      const proj = row.proj === 'any' ? { cls: 'c-unknown' } : gloss('proj', row.proj);
      return '<tr><td><span class="ebp-help-chip ' + tax.cls + '">' + esc(row.tax) + '</span>'
        + '<span class="ebp-help-arrow">+</span>'
        + '<span class="ebp-help-chip ' + proj.cls + '">' + esc(row.proj) + '</span></td>'
        + '<td>' + esc(row.act) + '</td></tr>';
    }).join('');
  }

  /** The compact matrix for the Results view. Collapsed by default. */
  function matrixHtml() {
    const rows = MATRIX.filter((row) => row.compact).map(function (row) {
      const tax = gloss('tax', 'Highest_G');
      const proj = gloss('proj', row.proj);
      return '<div class="row"><span class="ebp-help-chip ' + (row.tax === 'High_S' ? 'c-covered' : tax.cls)
        + '">' + esc(row.tax) + '</span><span class="ebp-help-arrow">+</span>'
        + '<span class="ebp-help-chip ' + proj.cls + '">' + esc(row.proj) + '</span>'
        + '<span class="ebp-help-arrow">→</span><span class="act">' + esc(row.act) + '</span></div>';
    }).join('');
    return '<details class="ebp-matrix"><summary>How to read the two columns together</summary>'
      + '<div class="rows">' + rows + '</div>'
      + '<div class="all"><button type="button" class="ebp-help-open-link ebp-help-link" '
      + 'data-section="matrix">all combinations, and what every label means →</button></div>'
      + '</details>';
  }

  function body(context) {
    const ctx = context || {};
    return `
      <h3 id="ebp-help-two">The two columns</h3>
      <p>Every species gets <b>two independent labels</b>. <em>Taxonomic novelty</em> asks whether
        sequencing it would fill a phylogenetic gap; <em>project status</em> asks whether the EBP
        network is already working on it. They are separate questions, and a species can score high on
        both — a first-in-genus that another project is already sequencing is a
        <b>coordination opportunity</b>, not a low priority. That is why this page gives you two
        filters and never a single ranking.</p>

      <h3 id="ebp-help-matrix">How to act on a combination</h3>
      <table class="ebp-help-tbl"><thead><tr><th>Novelty + status</th><th>What it means for you</th></tr></thead>
        <tbody>${matrixRows(false)}</tbody></table>

      <h3 id="ebp-help-novelty">Taxonomic novelty</h3>
      <p>Would sequencing this species fill a phylogenetic gap? Independent of who is working on it.
        Where a species would be a first at several levels, the <b>broadest</b> one is shown — use the
        <code>First in…</code> column for the full picture.</p>
      ${labelTable('tax', TAX_ORDER, 'Label')}

      <h3 id="ebp-help-status">Project status</h3>
      <p>What is the EBP network already doing with this species? Independent of novelty.</p>
      ${labelTable('proj', PROJ_ORDER, 'Label')}

      <h3 id="ebp-help-firsts">The <code>First in…</code> column</h3>
      <p>Genus · Family · Order · Class · Phylum, each checked <b>independently</b>. A highlighted
        letter means no assembly exists anywhere at that level — a true first. A dim letter means one
        already does. A dashed letter means the lineage is missing at that level and we cannot say.</p>
      <p>Where the species already has an assembly the cell reads <b>not applicable</b> rather than
        five negatives: the computation is skipped in that case, because an existing assembly rules
        out “first” at every level anyway. A row of negatives there would be five findings nobody
        made.</p>

      <h3 id="ebp-help-projects">Projects on this species</h3>
      <p>Every EBP project reporting any status for the species. The suffix carries the distinction
        that matters:</p>
      <table class="ebp-help-tbl"><thead><tr><th>Suffix</th><th>Meaning</th></tr></thead><tbody>
        ${PROJECT_SUFFIXES.map((row) => '<tr><td><code>' + esc(row[0]) + '</code></td><td>'
          + row[1] + '</td></tr>').join('')}
      </tbody></table>

      <h3 id="ebp-help-iucn">IUCN</h3>
      <p>The Red List category, <b>informational only</b> — it does not affect either priority label.
        A dash means our cached release carries no assessment for that name.</p>

      <h3 id="ebp-help-excel">What the Excel export adds</h3>
      <p>The download carries everything on this page plus the columns it does not show: assembly and
        example counts at each taxonomic level, one column per EBP project's raw sequencing status,
        genus and family coverage summaries, your input preserved verbatim, and a sheet of suspected
        spelling errors.</p>

      <h3 id="ebp-help-sources">Sources</h3>
      <div class="ebp-help-src">
        <div><b>Genomes on a Tree (GoaT)</b>${ctx.referenceCount
          ? ' — ' + ctx.referenceCount.toLocaleString() + ' species with assemblies' : ''}
          · <a href="https://goat.genomehubs.org" target="_blank" rel="noopener noreferrer">goat.genomehubs.org</a></div>
        <div><b>EBP projects</b> — 60+ sequencing initiatives tracked for collaboration opportunities</div>
        <div><b>IUCN Red List</b>${ctx.iucnRelease ? ' — release ' + esc(ctx.iucnRelease) : ''}
          · <a href="https://www.iucnredlist.org" target="_blank" rel="noopener noreferrer">iucnredlist.org</a></div>
      </div>`;
  }

  // ── the panel ─────────────────────────────────────────────────────────────
  let scrim = null;
  let lastFocus = null;
  const context = { referenceCount: null, iucnRelease: null };

  function element() {
    if (scrim) return scrim;
    scrim = document.createElement('div');
    scrim.className = 'ebp-help-scrim';
    scrim.hidden = true;
    scrim.innerHTML = '<div class="ebp-help" role="dialog" aria-modal="true" '
      + 'aria-label="How to read this page" tabindex="-1">'
      + '<div class="ebp-help-top"><h2>How to read this</h2>'
      + '<span class="sub">the two labels, and what to do with them</span>'
      + '<button type="button" class="ebp-help-close" aria-label="Close">✕</button></div>'
      + '<div class="ebp-help-body"></div></div>';
    scrim.addEventListener('click', function (event) {
      // The scrim closes; the panel itself does not.
      if (event.target === scrim || event.target.closest('.ebp-help-close')) close();
    });
    document.body.appendChild(scrim);
    return scrim;
  }

  function onKey(event) {
    if (event.key === 'Escape') close();
  }

  /** Open the panel, optionally scrolled to a section id (without the prefix). */
  function open(section) {
    injectStyles();
    const box = element();
    box.querySelector('.ebp-help-body').innerHTML = body(context);
    box.hidden = false;
    lastFocus = document.activeElement;
    box.querySelector('.ebp-help').focus();
    document.addEventListener('keydown', onKey);
    if (section) {
      const target = box.querySelector('#ebp-help-' + section);
      if (target) target.scrollIntoView({ block: 'start' });
    } else {
      box.querySelector('.ebp-help').scrollTop = 0;
    }
  }

  function close() {
    if (!scrim || scrim.hidden) return;
    scrim.hidden = true;
    document.removeEventListener('keydown', onKey);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    if (window.location.hash === '#help') {
      window.history.replaceState({}, '', window.location.pathname + window.location.search);
    }
  }

  /**
   * Wire the trigger button, the `#help` deep link, and any in-page opener.
   *
   * `#help` exists so the secretariat can send a PI straight to the glossary
   * rather than to the tool with an instruction to go looking for it.
   */
  function mount(button) {
    injectStyles();
    if (button) button.addEventListener('click', function () { open(); });
    document.addEventListener('click', function (event) {
      const link = event.target.closest('.ebp-help-open-link');
      if (link) open(link.dataset.section || undefined);
    });
    if (window.location.hash === '#help') open();
  }

  /** Facts for the Sources block, once a submission has produced them. */
  function setContext(values) {
    Object.assign(context, values || {});
  }

  return {
    mount: mount,
    open: open,
    close: close,
    matrixHtml: matrixHtml,
    setContext: setContext,
  };
})();
