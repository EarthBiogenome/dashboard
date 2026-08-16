/**
 * Panel B — one species' history across the dated runs of a tracked list. [A-T5]
 *
 * The weekly question a PI actually asks is not "how is the list trending" but
 * *"did anything change on the species I care about?"* (proposal §3). This is
 * that answer: the run-by-run timeline of one species, what moved coming into
 * each run, and — where the window can be attributed — why.
 *
 *   PrioritizationSpecies.open({host, list, token, name, runs, since});
 *   PrioritizationSpecies.close();
 *
 * ONE PANEL, MOVED — never two. The timeline can be opened from two places: a
 * species chip in the kinds-of-movement card (Panel A raises `ebp-trend:species`
 * today) and, once Task 6 lands, a row of the results table. The panel element
 * is a singleton that is *moved* into whichever host asked for it, so there is
 * only ever one open history and the `Since` control inside it cannot fork into
 * two copies that disagree. That rule is the mockup's and it is kept here.
 *
 * WHERE THE NUMBERS COME FROM. `GET /api/lists/{list}/species/{name}/history`,
 * keyed on `Scientific Name` — the INPUT name, never `Species` (the GoaT-resolved
 * name has blanks and duplicates). Every field rendered below is a field of that
 * payload; this file computes no decisions of its own, and where the payload does
 * not carry something it says so rather than filling the hole.
 *
 * WHAT A 14-LIST VERSION MUST HANDLE THAT ARIDE'S SIX RUNS HID (the mockup is
 * ARIDE-only and assumes all four away):
 *
 *   1. `tax` and `proj` CAN BE EMPTY, and that is not "no priority". A report
 *      predating the Priority_Note split carried one column, not two — 17 of
 *      awcs_species' 18 runs are like this — so the labels cannot be read from
 *      it. An empty pill would read as a species with no status; the row says
 *      the report has no such column instead. Absent is not empty.
 *   2. A timeline can be 18 runs long and quiet in most of them. Consecutive
 *      no-change runs fold into one line that NAMES how many and which dates,
 *      and opens on click. Nothing is dropped — a shorter panel must not read
 *      as a shorter history.
 *   3. `cause` is null far more often than it is set. Only the newest window of
 *      12 of the 14 lists is attributable at all, so most moves get "cause not
 *      recoverable" — which is a statement about our evidence, not about the
 *      species, and is worded that way.
 *   4. A species may be absent from a run entirely (it entered or left the
 *      list). Where the caller passes the list's run dates, those runs are drawn
 *      as gaps rather than silently closed up.
 *
 * NEVER `assembly_level` BESIDE `assembly_span` (proposal §3, 2026-08-10). A GoaT
 * taxon record aggregates each field's maximum across the subtree, so on
 * *Zapus hudsonius* the August row pairs a 2026 chromosome assembly's level with
 * a 2019 scaffold's span — each field right, together an assembly that does not
 * exist. The payload carries level and the EBP flag only, and this panel adds
 * nothing to them.
 */

const PrioritizationSpecies = (function () {
  'use strict';

  /* Column -> what to call it in a sentence. The keys are `list_changelog`'s
     TIMELINE_FIELDS; anything outside that set is shown under its raw column
     name rather than guessed at. */
  const FIELD = {
    Taxonomic_Priority: 'novelty',
    Project_Priority: 'project status',
    Has_Assembly: 'has assembly',
    Being_Sequenced: 'being sequenced',
    Projects_Working_On_Species: 'projects',
    IUCN_Category: 'IUCN',
    First_in_Genus: 'first in genus',
    First_in_Family: 'first in family',
    First_in_Order: 'first in order',
    First_in_Class: 'first in class',
    First_in_Phylum: 'first in phylum',
  };

  /* The cause vocabulary, one entry per `list_changelog` cause. `kind` drives the
     colour: OURS is the one a reader must be able to discount — it means the
     species did not move, our answer about it did.

     `_silent` variants are mapped even though the timeline should not carry one
     (a silent row is by definition a run where no decision moved, and a cause is
     only attached to a run whose decisions moved). Mapped anyway: an unmapped
     cause would render as a bare identifier at exactly the moment someone is
     trying to understand a surprise. */
  const CAUSE = {
    wrong_species: { kind: 'ours',
      text: 'Ours — the earlier runs had matched the wrong GoaT record, and the correction changed the recommendation.' },
    wrong_species_silent: { kind: 'ours',
      text: 'Ours — the earlier runs had matched the wrong GoaT record. The recommendation happened to land the same way.' },
    rank_granularity: { kind: 'ours',
      text: 'Ours — the name now resolves to the species-level taxon rather than a subspecies record.' },
    rank_granularity_silent: { kind: 'ours',
      text: 'Ours — the name now resolves to the species-level taxon rather than a subspecies record. No decision moved with it.' },
    taxon_changed: { kind: 'ours',
      text: 'Ours — the name resolves to a different GoaT taxon than before, and the kind of move could not be determined.' },
    taxon_changed_silent: { kind: 'ours',
      text: 'Ours — the name resolves to a different GoaT taxon than before. No decision moved with it.' },
    our_logic_changed: { kind: 'ours',
      text: 'Ours — the GoaT record is identical to the previous run, so this came from a change in our own logic.' },
    now_found: { kind: 'source',
      text: 'Source — GoaT gained a species record for this name. It could not be assessed for project status before.' },
    now_missing: { kind: 'source',
      text: 'Source — GoaT no longer returns a species record for this name. Unusual, and always worth a look.' },
    goat_record_changed: { kind: 'source',
      text: 'Source — this species’ own GoaT record moved: an assembly, a project status, or a retired project field.' },
    reference_data_changed: { kind: 'source',
      text: 'Source — this species’ record is unchanged; what moved is GoaT’s wider assembly reference data, so a First_in_* flag followed.' },
    iucn_assessment_changed: { kind: 'source',
      text: 'Source — IUCN published a new assessment. Nothing in GoaT moved.' },
    record_changed_only: { kind: 'source',
      text: 'Source — a project status moved in GoaT, but no decision on this species changed with it.' },
    same_taxon_changed: { kind: 'unknown',
      text: 'Same taxon, and the cause is not attributable — there is no enriched data from the earlier run to compare against.' },
    added_to_list: { kind: 'membership',
      text: 'The list — this species was added to the input list in this run.' },
    removed_from_list: { kind: 'membership',
      text: 'The list — this species was removed from the input list in this run.' },
  };

  /* Novelty and status labels: a colour and a plain-English gloss (CLAUDE.md's
     two tables, which are the workbook's INSTRUCTIONS sheet in prose).

     `Unknown` belongs to NOVELTY and `Not_Assigned` to PROJECT STATUS — they are
     different questions, not two spellings of one (Fang, 2026-08-15). The one
     exception is history: `Project_Priority = Unknown` appears on MDD's 6/7/9
     May 2026 runs, an older spelling the 11 May run renamed, so it is glossed
     under PROJ as what it meant then rather than left to render bare. */
  const TAX = {
    Highest_P: ['c-novel', 'would be the first assembly in its phylum — the broadest gap there is'],
    Highest_C: ['c-novel', 'would be the first assembly in its class'],
    Highest_O: ['c-novel', 'would be the first assembly in its order'],
    Highest_F: ['c-novel', 'would be the first assembly in its family'],
    Highest_G: ['c-novel', 'would be the first assembly in its genus'],
    High_S: ['c-covered', 'no assembly, but not a first at any level — the taxon is already covered'],
    Already_Covered: ['c-covered', 'an assembly already exists for this species, so novelty does not apply'],
    Unknown_S: ['c-unknown', 'not found in GoaT; its genus was found and is not first at any level. Verify the name'],
    Unknown_G: ['c-unknown', 'not found in GoaT, and neither was its genus — novelty cannot be assessed. Verify the name'],
    Unknown: ['c-unknown', 'found in GoaT, but its lineage above genus is missing there — a GoaT data gap'],
  };
  const PROJ = {
    High_New: ['c-new', 'no active project and no assembly — an open sequencing opportunity'],
    Medium_Improve: ['c-improve', 'an assembly exists but is not EBP standard, and no project is active'],
    Low_Active: ['c-low', 'an EBP project is sequencing this species now, or has submitted an assembly to INSDC'],
    Low_Sample: ['c-low', 'an EBP project holds samples; sequencing has not started'],
    Low_Done: ['c-low', 'an EBP-standard assembly is confirmed in GoaT'],
    Not_Assigned: ['c-unknown', 'not found in GoaT, so neither assembly nor project status could be confirmed at species level, or taxonomic information is missing. Verify the name before treating it as a sequencing opportunity'],
    Unknown: ['c-unknown', 'the older spelling of Not_Assigned, on runs before 11 May 2026: status unverifiable because the species was not found in GoaT. Verify the name'],
  };

  const LOOKUP = {
    not_found: 'not found in GoaT — assessed from the genus',
    skipped: 'GoaT was not queried for this name in this run',
  };

  /* Fold consecutive quiet runs at this many or more. Below it the fold would
     hide as much as it saves. */
  const FOLD_AT = 3;

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* Date and escaping helpers are deliberately re-stated rather than imported
     from prioritization_trend.js: the two panels are independent drop-ins (Panel
     B opens from the results table, where Panel A need not be on the page), and
     ten lines of formatting is a smaller cost than a load-order dependency. */
  const esc = (value) => String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const pretty = (iso) => {
    const p = String(iso).split('-');
    return (+p[2]) + ' ' + MONTHS[+p[1] - 1];
  };
  const prettyYear = (iso) => pretty(iso) + ' ' + String(iso).slice(0, 4);

  /* ── styles ───────────────────────────────────────────────────────────────
     Injected by the component, as Panel A's are, so the panel stays drop-in:
     Task 6 can rebuild prioritization.html around it without the timeline
     quietly losing its layout. Colours come from the page's botanical-ink
     variables where they exist, with the dark values as fallbacks. */
  const STYLE_ID = 'ebp-species-styles';
  const STYLES = `
  .ebp-tl{border:1px solid var(--line,#22362b); border-radius:var(--radius,14px);
    background:var(--ink-2,#0f1a14); color:var(--paper,#e9f2ec); padding:18px 22px 20px; margin-bottom:18px;}
  .ebp-tl[hidden]{display:none;}
  .ebp-tl-head{display:flex; align-items:baseline; gap:11px; flex-wrap:wrap; margin-bottom:2px;}
  .ebp-tl-head .who{font-size:15px; font-weight:700; font-style:italic; color:var(--paper,#e9f2ec);}
  .ebp-tl-head .meta{font-size:12px; color:var(--paper-mute,#6f8a7b);}
  .ebp-tl-ctls{margin-left:auto; display:flex; gap:10px; align-items:center;}
  .ebp-tl-ctls label{font-size:11.5px; text-transform:uppercase; letter-spacing:.05em;
    color:var(--paper-mute,#6f8a7b); font-weight:700;}
  .ebp-tl-ctls select{font:inherit; font-size:12.5px; padding:5px 9px; background:var(--ink,#0b1310);
    color:var(--paper,#e9f2ec); border:1px solid var(--line,#22362b); border-radius:8px; cursor:pointer;}
  .ebp-tl-close{background:transparent; border:1px solid var(--line,#22362b); color:var(--paper-dim,#a6bcaf);
    border-radius:7px; width:28px; height:28px; cursor:pointer; font-size:14px; line-height:1; flex:none;}
  .ebp-tl-close:hover{color:var(--green-glow,#5fd39a); border-color:rgba(63,191,127,.4);}
  .ebp-tl-note{font-size:11.5px; color:var(--paper-mute,#6f8a7b); margin:0 0 8px;}
  .ebp-tl-note b{color:var(--paper-dim,#a6bcaf);}

  .ebp-tl-row{display:grid; grid-template-columns:92px 16px 1fr; gap:12px; padding:10px 0;
    border-top:1px solid var(--line-soft,#1a2a20); align-items:start;}
  /* Runs before the selected Since date are dimmed, not hidden — the window is a
     reading of the history, not a truncation of it. .62 rather than the mockup's
     .6: on a default window the dimmed rows are most of an 18-run timeline, and
     they have to stay readable on the dark ground, not just present. */
  .ebp-tl-row.before{opacity:.62;}
  .ebp-tl-row .when{font-size:12px; color:var(--paper-dim,#a6bcaf); font-variant-numeric:tabular-nums; padding-top:1px;}
  .ebp-tl-row .rail{position:relative; height:100%; min-height:18px;}
  .ebp-tl-row .rail::before{content:""; position:absolute; left:50%; top:0; bottom:-11px; width:1px;
    background:var(--line,#22362b); transform:translateX(-50%);}
  .ebp-tl-row:last-child .rail::before{bottom:auto; height:7px;}
  .ebp-tl-row .rail i{position:absolute; left:50%; top:3px; width:9px; height:9px; border-radius:50%;
    transform:translateX(-50%); background:var(--ink-2,#0f1a14); border:2px solid var(--paper-mute,#6f8a7b); z-index:1;}
  .ebp-tl-row.moved .rail i{background:var(--green-glow,#5fd39a); border-color:var(--green-glow,#5fd39a);}
  .ebp-tl-row.gap .rail i{width:6px; height:6px; top:5px; border-style:dashed; background:transparent;}
  .ebp-tl-labels{display:flex; gap:7px; align-items:center; flex-wrap:wrap;}
  .ebp-chip{display:inline-block; padding:2.5px 8px; border-radius:999px; font-size:11.5px; font-weight:600;}
  .ebp-chip.c-novel{background:rgba(122,162,255,.14); color:var(--novel,#7aa2ff);}
  .ebp-chip.c-covered{background:var(--ink-4,#1b2f24); color:var(--paper-mute,#6f8a7b);}
  .ebp-chip.c-new{background:rgba(63,191,127,.13); color:var(--green-glow,#5fd39a);}
  .ebp-chip.c-improve{background:rgba(224,167,96,.13); color:var(--improve,#e0a760);}
  .ebp-chip.c-low{background:var(--ink-4,#1b2f24); color:var(--low,#8595a0);}
  .ebp-chip.c-unknown{background:var(--ink-4,#1b2f24); color:var(--paper-mute,#6f8a7b);}
  .ebp-chip.c-absent{background:transparent; border:1px dashed var(--line,#22362b);
    color:var(--paper-mute,#6f8a7b); font-weight:500; font-style:italic;}
  .ebp-tl-resolved{font-size:11.5px; color:var(--paper-mute,#6f8a7b); margin-top:4px;}
  .ebp-tl-resolved em{font-style:italic; color:var(--paper-dim,#a6bcaf);}
  .ebp-tl-deltas{margin-top:6px; display:grid; gap:3px;}
  .ebp-tl-delta{font-size:11.5px; color:var(--paper-dim,#a6bcaf);}
  .ebp-tl-delta .f{color:var(--paper-mute,#6f8a7b);}
  .ebp-tl-delta .was{color:var(--paper-mute,#6f8a7b); text-decoration:line-through;}
  .ebp-tl-delta .now{color:var(--green-glow,#5fd39a); font-weight:600;}
  .ebp-tl-cause{margin-top:6px; font-size:11.5px; display:inline-flex; gap:7px; align-items:center;
    border-radius:8px; padding:4px 9px; line-height:1.45;}
  .ebp-tl-cause.ours{color:var(--warn,#e0a760); background:rgba(224,167,96,.12); border:1px solid rgba(224,167,96,.28);}
  .ebp-tl-cause.source{color:var(--green-glow,#5fd39a); background:rgba(63,191,127,.1); border:1px solid rgba(63,191,127,.26);}
  .ebp-tl-cause.membership{color:var(--novel,#7aa2ff); background:rgba(122,162,255,.1); border:1px solid rgba(122,162,255,.26);}
  .ebp-tl-cause.unknown{color:var(--paper-mute,#6f8a7b); background:var(--ink-3,#14231b); border:1px solid var(--line,#22362b);}
  .ebp-tl-quiet{font-size:11.5px; color:var(--paper-mute,#6f8a7b); margin-top:2px;}
  .ebp-tl-pipe{font-size:11px; color:var(--warn,#e0a760); margin-top:5px;}

  .ebp-tl-foldbtn{background:none; border:none; padding:0; font:inherit; font-size:11.5px;
    color:var(--paper-mute,#6f8a7b); cursor:pointer; text-align:left;}
  .ebp-tl-foldbtn:hover{color:var(--green-glow,#5fd39a);}
  .ebp-tl-foldbtn .caret{display:inline-block; margin-left:5px; font-size:10px;}
  .ebp-tl-fold[hidden]{display:none;}
  .ebp-tl-msg{font-size:12.5px; color:var(--paper-dim,#a6bcaf); line-height:1.6; margin:10px 0 0;}
  .ebp-tl-msg b{color:var(--paper,#e9f2ec);}
  .ebp-tl-msg code{font-family:ui-monospace,'Cascadia Code',Menlo,monospace; font-size:.9em;
    color:var(--green-glow,#5fd39a);}
  /* The chips Panel A renders are this panel's entry point, so the selected one
     is marked from here — the two ship together and there is no third owner. */
  .ebp-sp-chip.sel{color:var(--green-glow,#5fd39a); border-color:var(--green-glow,#5fd39a);
    background:rgba(63,191,127,.1); font-weight:600;}
  @media (max-width:640px){ .ebp-tl-row{grid-template-columns:76px 14px 1fr; gap:9px;} }
  `;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement('style');
    tag.id = STYLE_ID;
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }

  /* ── the singleton panel ──────────────────────────────────────────────────
     Created once and moved between hosts. `state` is everything a redraw needs,
     so changing the `Since` date does not re-fetch a timeline already in hand. */
  let panel = null;
  const state = { list: null, token: null, name: null, timeline: null, runs: [], since: null };

  function element() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.className = 'ebp-tl';
    panel.hidden = true;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', 'Species history');
    panel.addEventListener('click', function (event) {
      if (event.target.closest('.ebp-tl-close')) { close(); return; }
      const fold = event.target.closest('.ebp-tl-foldbtn');
      if (fold) {
        const wrap = document.getElementById(fold.getAttribute('aria-controls'));
        const open = wrap.hidden;
        wrap.hidden = !open;
        fold.setAttribute('aria-expanded', open ? 'true' : 'false');
        fold.querySelector('.caret').textContent = open ? '▴' : '▾';
      }
    });
    panel.addEventListener('change', function (event) {
      if (event.target.id !== 'ebp-tl-since') return;
      state.since = event.target.value;
      render();
      /* Panel A listens for this and moves its own window to match: one Since
         value on the page, whichever control set it. */
      panel.dispatchEvent(new CustomEvent('ebp-trend:since', {
        bubbles: true, detail: { list: state.list, since: state.since, source: 'species' },
      }));
    });
    return panel;
  }

  function clearSelection() {
    document.querySelectorAll('.ebp-sp-chip.sel').forEach((chip) => chip.classList.remove('sel'));
  }

  function markSelection(name) {
    clearSelection();
    document.querySelectorAll('.ebp-sp-chip').forEach(function (chip) {
      if (chip.dataset.name === name) chip.classList.add('sel');
    });
  }

  function close() {
    if (!panel) return;
    panel.hidden = true;
    panel.innerHTML = '';
    state.name = null;
    state.timeline = null;
    clearSelection();
    panel.dispatchEvent(new CustomEvent('ebp-species:close', { bubbles: true }));
  }

  /* ── one row ──────────────────────────────────────────────────────────────
     `previous` is the preceding point of the SAME timeline, used only to report
     a resolved-name move: `resolved_as` is evidence, not a decision, so it is
     not in the payload's `changed` list and has to be read across two points.
     Reported only when BOTH sides are non-empty — a blank side means the column
     was absent from that run's report, and "→ Aquilegia desertorum" would claim
     a rename where a field simply began to exist. */
  function row(entry, index, previous, pipelineChange) {
    const moved = (entry.changed || []).length > 0;
    const before = state.since && entry.date < state.since;

    const deltas = (entry.changed || []).map(function (change) {
      return '<div class="ebp-tl-delta"><span class="f">'
        + esc(FIELD[change.field] || change.field) + '</span> <span class="was">'
        + esc(change.was || '—') + '</span> → <span class="now">' + esc(change.now || '—')
        + '</span></div>';
    }).join('');

    let cause = '';
    if (moved) {
      const known = entry.cause ? CAUSE[entry.cause] : null;
      cause = known
        ? '<div class="ebp-tl-cause ' + known.kind + '">' + esc(known.text) + '</div>'
        : (entry.cause
          ? '<div class="ebp-tl-cause unknown">' + esc(entry.cause) + '</div>'
          : '<div class="ebp-tl-cause unknown">Cause not recoverable for this window — the '
            + 'enriched data that would separate a source move from one of ours was overwritten '
            + 'in place.</div>');
    }

    /* assembly_level and the EBP flag only — never a span beside a level. */
    const facts = [];
    if (entry.assembly_level) {
      facts.push('assembly: ' + esc(entry.assembly_level)
        + (entry.ebp ? ' · EBP standard ' + esc(entry.ebp) : ''));
    }
    if (entry.projects) facts.push('projects: ' + esc(entry.projects));
    if (entry.iucn) facts.push('IUCN ' + esc(entry.iucn));

    const resolved = LOOKUP[entry.lookup]
      || (entry.resolved_as
        ? 'resolved as <em>' + esc(entry.resolved_as) + '</em>'
          + (entry.taxon_id ? ' · taxon ' + esc(entry.taxon_id) : '')
        : 'no resolved name in this run’s report');

    return '<div class="ebp-tl-row' + (moved ? ' moved' : '') + (before ? ' before' : '') + '">'
      + '<div class="when">' + esc(prettyYear(entry.date)) + '</div>'
      + '<div class="rail"><i></i></div>'
      + '<div class="ebp-tl-body">'
      + labels(entry)
      + '<div class="ebp-tl-resolved">' + resolved + (facts.length ? ' · ' + facts.join(' · ') : '')
      + renamed(entry, previous) + '</div>'
      + (deltas
        ? '<div class="ebp-tl-deltas">' + deltas + '</div>'
        : (index === 0
          ? '<div class="ebp-tl-quiet">first captured run — nothing before it to compare against</div>'
          : '<div class="ebp-tl-quiet">no change</div>'))
      + cause
      + (pipelineChange
        ? '<div class="ebp-tl-pipe">⌁ our pipeline changed on this run — a move here may be ours '
          + 'rather than the network’s</div>'
        : '')
      + '</div></div>';
  }

  function renamed(entry, previous) {
    if (!previous || !previous.resolved_as || !entry.resolved_as) return '';
    if (previous.resolved_as === entry.resolved_as) return '';
    return ' · <b>was <em>' + esc(previous.resolved_as) + '</em></b>';
  }

  /* The two priority labels. Both empty is the common case on old reports and it
     is NOT "no priority": that report carried a single Priority_Note column, so
     the two labels cannot be read from it at all. */
  function labels(entry) {
    const tax = entry.tax || '';
    const proj = entry.proj || '';
    if (!tax && !proj) {
      return '<div class="ebp-tl-labels"><span class="ebp-chip c-absent" title="This run’s '
        + 'report predates the two-column split — it carried a single Priority_Note, so neither '
        + 'label can be read from it. Absent, not blank.">no priority columns in this run’s report</span></div>';
    }
    return '<div class="ebp-tl-labels">' + chip(tax, TAX) + chip(proj, PROJ) + '</div>';
  }

  function chip(value, glossary) {
    if (!value) {
      return '<span class="ebp-chip c-absent" title="This column is not in this run’s report.">'
        + 'not recorded</span>';
    }
    const spec = glossary[value] || ['c-unknown', ''];
    return '<span class="ebp-chip ' + spec[0] + '"'
      + (spec[1] ? ' title="' + esc(spec[1]) + '"' : '') + '>' + esc(value) + '</span>';
  }

  /* A run of the list that this species is not in — it entered or left. Drawn
     only when the caller passed the list's run dates; without them the panel
     cannot know a run is missing rather than never captured. */
  function gapRow(date) {
    return '<div class="ebp-tl-row gap' + (state.since && date < state.since ? ' before' : '') + '">'
      + '<div class="when">' + esc(prettyYear(date)) + '</div>'
      + '<div class="rail"><i></i></div>'
      + '<div class="ebp-tl-body"><div class="ebp-tl-quiet">not in the list on this run</div></div>'
      + '</div>';
  }

  /* ── the whole panel ─────────────────────────────────────────────────────── */
  function render() {
    const timeline = state.timeline || [];
    const dates = timeline.map((entry) => entry.date);
    const pipeline = {};
    state.runs.forEach(function (run) { pipeline[run.date] = !!run.pipeline_change; });

    /* Every run of the LIST, not only the runs that carry this species, so a
       species that entered or left the list shows the runs it was absent from
       rather than having them closed up behind it. Falls back to the species'
       own dates when the caller passed no run list — without them the panel
       cannot tell "absent from this run" from "this run was never captured". */
    const allDates = state.runs.length ? state.runs.map((run) => run.date) : dates;
    const byDate = {};
    timeline.forEach(function (entry, index) { byDate[entry.date] = index; });

    const moved = timeline.filter((entry) => (entry.changed || []).length).length;
    const missing = allDates.length - timeline.length;

    /* Build the rows, folding consecutive quiet runs. The first run is never
       folded — "first captured run" is the start of the history, not a quiet
       stretch of it. */
    const html = [];
    let quiet = [];          // markup of the quiet runs seen since the last flush
    let quietDates = [];
    let folds = 0;

    function flushQuiet() {
      if (!quiet.length) return;
      if (quiet.length >= FOLD_AT) {
        const id = 'ebp-tl-fold-' + (folds++);
        html.push('<div class="ebp-tl-row"><div class="when">' + quiet.length + ' runs</div>'
          + '<div class="rail"><i></i></div><div class="ebp-tl-body">'
          + '<button class="ebp-tl-foldbtn" aria-expanded="false" aria-controls="' + id + '">'
          + 'no change · ' + esc(pretty(quietDates[0])) + ' – '
          + esc(pretty(quietDates[quietDates.length - 1]))
          + '<span class="caret">▾</span></button></div></div>'
          + '<div class="ebp-tl-fold" id="' + id + '" hidden>' + quiet.join('') + '</div>');
      } else {
        html.push(quiet.join(''));
      }
      quiet = [];
      quietDates = [];
    }

    allDates.forEach(function (date) {
      const index = byDate[date];
      if (index === undefined) { flushQuiet(); html.push(gapRow(date)); return; }
      const entry = timeline[index];
      const markup = row(entry, index, index > 0 ? timeline[index - 1] : null, pipeline[date]);
      // A run our pipeline changed on is never folded away, even when this
      // species held still through it — that is the run a reader checks first.
      const isQuiet = index > 0 && !(entry.changed || []).length && !pipeline[date];
      if (isQuiet) {
        quiet.push(markup);
        quietDates.push(date);
        return;
      }
      flushQuiet();
      html.push(markup);
    });
    flushQuiet();

    const sinceDates = allDates.slice(0, -1);
    const control = sinceDates.length
      ? '<div class="ebp-tl-ctls"><label for="ebp-tl-since">Since</label>'
        + '<select id="ebp-tl-since">' + sinceDates.map(function (date) {
          return '<option value="' + esc(date) + '"'
            + (date === state.since ? ' selected' : '') + '>' + esc(prettyYear(date)) + '</option>';
        }).join('') + '</select></div>'
      : '';

    const dimmed = state.since && allDates.filter((date) => date < state.since).length;

    panel.innerHTML = '<div class="ebp-tl-head">'
      + '<span class="who">' + esc(state.name) + '</span>'
      + '<span class="meta">' + timeline.length + ' run' + (timeline.length === 1 ? '' : 's')
      + ' in ' + esc(state.list) + ' · '
      + (moved ? moved + ' with a change' : 'nothing changed in any of them')
      + (missing > 0 ? ' · not in the list on ' + missing + ' of its runs' : '')
      + '</span>' + control
      + '<button class="ebp-tl-close" type="button" aria-label="Close this species’ history">✕</button>'
      + '</div>'
      + (dimmed
        ? '<p class="ebp-tl-note">Runs before <b>' + esc(prettyYear(state.since))
          + '</b> are dimmed — they fall outside the selected window, and are kept rather than '
          + 'cut so the history stays whole.</p>'
        : '')
      + html.join('');
  }

  function messageOnly(html) {
    // The empty controls div is the spacer that keeps ✕ on the right, exactly
    // where it sits when there IS a Since control to push it there.
    panel.innerHTML = '<div class="ebp-tl-head">'
      + '<span class="who">' + esc(state.name || '') + '</span>'
      + '<div class="ebp-tl-ctls"></div>'
      + '<button class="ebp-tl-close" type="button" aria-label="Close">✕</button></div>'
      + '<p class="ebp-tl-msg">' + html + '</p>';
  }

  /**
   * Open one species' history inside `host`.
   *
   * options:
   *   host    element the panel is moved into (required)
   *   list    list NAME (not the token) — every read below is keyed by it
   *   token   the list's capability token, or omitted for an admin session
   *   name    the species' `Scientific Name`, exactly as the list carries it
   *   runs    optional: the list's runs ([{date, pipeline_change}] or [date]),
   *           which is what lets the panel draw an absence and flag our own
   *           pipeline changes. Panel A already holds them (`payload.runs`).
   *   since   optional: the currently selected window start, for dimming
   *   inList  optional: assert that this species IS on this list. Set it only
   *           when the name came FROM the list (Panel A's chips); it decides
   *           which of two readings an empty timeline is given — see below.
   *
   * Resolves to {state}: 'ok' · 'no-history' (the species never moved, so the
   * payload carries no timeline for it) · 'not-found' (the link opens nothing) ·
   * 'error'.
   */
  async function open(options) {
    const opts = options || {};
    injectStyles();
    const box = element();
    const host = opts.host || document.body;
    if (box.parentNode !== host) host.appendChild(box);

    // A window belongs to one list's run dates. Opening a species on a different
    // list carries none of it over, or the dimming would be read off dates that
    // list never had.
    if (opts.list !== state.list) state.since = null;
    state.list = opts.list;
    state.token = opts.token || null;
    state.name = opts.name;
    state.timeline = null;
    state.runs = (opts.runs || []).map((run) => (typeof run === 'string' ? { date: run } : run));
    if (opts.since !== undefined && opts.since !== null) state.since = opts.since;

    box.hidden = false;
    markSelection(opts.name);
    messageOnly('Loading this species’ history…');
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    let history;
    try {
      history = await EBPBackend.speciesHistory(opts.list, opts.name, opts.token);
    } catch (err) {
      /* Two different 404s, and here they CAN be told apart without leaking
         anything: the list-level body is the fixed 'List not found' that a bad
         token also gets, while the species-level one names the species — and to
         see it at all you already hold a token that opens this list. */
      if (err.notFound && err.detail !== 'List not found') {
        /* WHAT THIS 404 CAN AND CANNOT BE READ AS. A timeline is stored only for
           species that MOVED, so its absence has two possible causes — the
           species held the same values across every run, or it is not on this
           list at all — and nothing in the response separates them. Neither can
           the backend: `list_species_history` holds movers, not membership, so
           the list's full roster is not on either side of this call.

           `inList` is therefore the caller's assertion, not a fetched fact, and
           only a caller that got the name FROM this list may make it: Panel A's
           species chips qualify, a Task 6 results row does not — a submission is
           not the tracked list (§12.6) and can carry any species at all. Without
           it, both readings are stated. (A-T5 shipped the strong sentence
           unconditionally, which was true while the chip was the only entry
           point and false the moment the results table became the second one.) */
        messageOnly(opts.inList
          ? '<b>No stored history for this species.</b> A timeline is kept only for species that '
            + 'moved in at least one window, so this one has held the same novelty, status and '
            + 'projects across every captured run of <code>' + esc(opts.list) + '</code>.'
          : '<b>No stored history for this species in <code>' + esc(opts.list) + '</code>.</b> '
            + 'A timeline is kept only for species that moved in at least one window, so either '
            + 'this species has held the same novelty, status and projects across every captured '
            + 'run of that list — or it is not on that list. The two look the same from here.');
        return { state: 'no-history' };
      }
      if (err.notFound) {
        messageOnly('<b>This link no longer opens this list.</b> Trend links are issued per list '
          + 'by the EBP secretariat and are replaced when a list’s link is rotated.');
        return { state: 'not-found', error: err };
      }
      messageOnly(err.unconfigured
        ? '<b>No backend is configured for this deployment yet.</b> The species history reads from '
          + 'the EBP backend, which has not been given a hostname in <code>services_backend.js</code>.'
        : '<b>Could not load this species’ history.</b> ' + esc(err.message));
      return { state: 'error', error: err };
    }

    state.timeline = history.timeline || [];
    if (!state.timeline.length) {
      // The endpoint 404s on an empty timeline, so this is belt-and-braces.
      messageOnly('<b>No runs carry this species.</b>');
      return { state: 'no-history' };
    }
    /* Default window: the previous run, matching Panel A — "what changed since
       last time" is the incremental question both panels open on. */
    if (!state.since) {
      const dates = state.runs.length ? state.runs.map((run) => run.date) : state.timeline.map((e) => e.date);
      state.since = dates.length > 1 ? dates[dates.length - 2] : null;
    }
    render();
    box.dispatchEvent(new CustomEvent('ebp-species:open', {
      bubbles: true, detail: { list: state.list, name: state.name, runs: state.timeline.length },
    }));
    return { state: 'ok', timeline: state.timeline };
  }

  /** Move the dimming window without re-fetching. No-op when nothing is open. */
  function setSince(date) {
    if (!panel || panel.hidden || !state.timeline) return;
    state.since = date;
    render();
  }

  return {
    open: open,
    close: close,
    setSince: setSince,
    /** The species currently open, or null — so a host can keep its own row highlighted. */
    openSpecies() { return state.name; },
    element: element,

    /**
     * The label glossary — a chip class and a plain-English reading. [Task 6]
     *
     * Exported because the results table shows the same two labels this timeline
     * does, and this wording is the workbook's INSTRUCTIONS sheet in prose. Two
     * copies of it would drift, and the copy a PI happened to read would decide
     * what they thought `High_S` meant. `kind` is 'tax' or 'proj'; an unmapped
     * label is reported as unmapped rather than glossed as something else.
     */
    gloss(kind, label) {
      const entry = (kind === 'tax' ? TAX : PROJ)[label];
      return entry ? { cls: entry[0], text: entry[1] } : { cls: 'c-unknown', text: '' };
    },

    /**
     * Every label of one vocabulary, as [{label, cls, text}]. [Task 6]
     *
     * The help panel's tables are BUILT from this rather than written out again,
     * so the glossary a reader opens and the tooltip on a chip cannot say
     * different things about the same label. Order is this file's declaration
     * order; a caller that wants the workbook's rank order sorts it, because
     * that is a display concern and this is the vocabulary.
     */
    glossary(kind) {
      const table = kind === 'tax' ? TAX : PROJ;
      return Object.keys(table).map((label) => ({
        label: label, cls: table[label][0], text: table[label][1],
      }));
    },
  };
})();
