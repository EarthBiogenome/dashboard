/**
 * The Coverage view — where THIS LIST fills gaps in the assembly tree. [Task 6]
 *
 *   const view = PrioritizationCoverage.render(host, {payload, onSpecies});
 *
 * The mockup's fourth tab, built from the submission payload and nothing else.
 * Every row already carries `Phylum` … `Genus`, the five `First_in_*` flags and
 * `Has_Assembly`, so this view issues no request, needs no endpoint, and cannot
 * disagree with the Results table — it is the same rows, grouped by lineage
 * instead of listed.
 *
 * NOT the deferred network page. C.0 (`prioritization_network.html` +
 * `/api/catalog/first-in-taxa-summary`) answers "where are the gaps across all
 * ~24,000 assemblies", which needs the reference catalog and is a different
 * question with a different denominator. This one answers "of the species I
 * submitted, where would they be firsts" — denominator: your list. The two got
 * conflated under the word "network" in the plan; they are not substitutes.
 *
 * THE THREE-WAY SPLIT IS THE WHOLE POINT, and folding it to two would be a lie.
 * Within a phylum a species is one of:
 *
 *   * NOVEL      — would be a first at some level (`Taxonomic_Priority` is one
 *                  of the `Highest_*`), broken down by how broad that first is.
 *   * COVERED    — an assembly exists, or the taxon is already represented
 *                  (`Already_Covered` / `High_S`). A real finding.
 *   * UNASSESSED — `Unknown_G` / `Unknown_S` / `Unknown`: not found in GoaT, or
 *                  found with no lineage. **This is not "no gap here."** A
 *                  phylum that is 40% unassessed is a phylum we cannot speak
 *                  about, and drawing it as covered would turn missing evidence
 *                  into a negative finding — the one error this whole tool
 *                  exists to avoid making.
 *
 * Species whose `Phylum` is blank are grouped under a named "lineage not
 * resolved" row rather than dropped, for the same reason: a total that silently
 * excludes rows is a total nobody can check.
 */

const PrioritizationCoverage = (function () {
  'use strict';

  /* Broadest first — the ordering the workbook sorts by and the one the colour
     ramp encodes. A species is counted at exactly one of these: its
     `Taxonomic_Priority`, which is already the broadest level it is first at. */
  const NOVEL_LEVELS = [
    ['Highest_P', 'Phylum'], ['Highest_C', 'Class'], ['Highest_O', 'Order'],
    ['Highest_F', 'Family'], ['Highest_G', 'Genus'],
  ];
  const NOVEL = NOVEL_LEVELS.map((level) => level[0]);
  const UNASSESSED = ['Unknown_G', 'Unknown_S', 'Unknown'];

  /* Darkest = broadest gap, as the results chart and the workbook both do. The
     floor is 60% rather than the chart's 70%: here five steps appear side by side
     in a legend and inside one bar, so they have to be told apart from each
     other, not just read as "blue". */
  const RAMP = { Highest_P: 'ff', Highest_C: 'e6', Highest_O: 'cc', Highest_F: 'b3', Highest_G: '99' };

  const RANKS = ['Phylum', 'Class', 'Order', 'Family', 'Genus'];

  const esc = (value) => String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const num = (value) => (value || 0).toLocaleString();
  const pct = (part, whole) => (whole ? Math.round((part / whole) * 100) : 0);

  /* Bucket key for a row whose rank is blank. Underscored because a taxon name
     never contains one, so it cannot collide with a real group. */
  const UNRESOLVED = '__unresolved__';

  // ── styles ────────────────────────────────────────────────────────────────
  const STYLE_ID = 'ebp-coverage-styles';
  const STYLES = `
  .ebp-cov-note{background:var(--ink-3,#14231b); border:1px solid var(--line,#22362b);
    color:var(--paper-dim,#a6bcaf); font-size:12.5px; border-radius:9px; padding:10px 14px;
    margin-bottom:16px; display:flex; gap:9px; align-items:flex-start; line-height:1.6;}
  .ebp-cov-note b{color:var(--paper,#e9f2ec);}

  .ebp-cov-lede{font-size:14px; color:var(--paper-dim,#a6bcaf); line-height:1.6; margin:0 0 16px;}
  .ebp-cov-lede b{color:var(--paper,#e9f2ec); font-variant-numeric:tabular-nums;}

  .ebp-cov-key{display:flex; gap:14px 18px; flex-wrap:wrap; align-items:center; margin-bottom:14px;
    font-size:12px; color:var(--paper-dim,#a6bcaf);}
  .ebp-cov-key span{display:inline-flex; align-items:center; gap:6px;}
  .ebp-cov-key i{width:11px; height:11px; border-radius:3px; display:inline-block;}
  .ebp-cov-key .rk{margin-left:auto; display:flex; align-items:center; gap:8px;}
  .ebp-cov-key select{font:inherit; font-size:12.5px; padding:5px 9px; background:var(--ink,#0b1310);
    color:var(--paper,#e9f2ec); border:1px solid var(--line,#22362b); border-radius:7px; cursor:pointer;}

  .ebp-cov-tbl{background:var(--ink-2,#0f1a14); border:1px solid var(--line,#22362b);
    border-radius:var(--radius,14px); overflow:hidden;}
  .ebp-cov-row{display:grid; grid-template-columns:minmax(140px,1.1fr) minmax(160px,2.4fr) 128px;
    gap:14px; align-items:center; padding:11px 18px; border-top:1px solid var(--line-soft,#1a2a20);}
  .ebp-cov-row:first-child{border-top:none;}
  .ebp-cov-row.head{background:var(--ink-3,#14231b); font-size:11.5px; text-transform:uppercase;
    letter-spacing:.03em; color:var(--paper-mute,#6f8a7b); font-weight:700; padding:9px 18px;}
  .ebp-cov-row.sub{padding-left:38px; background:color-mix(in srgb, var(--ink-3,#14231b) 55%, transparent);}
  .ebp-cov-row.sub .taxon{font-size:12.5px;}
  .ebp-cov-taxon{min-width:0;}
  .ebp-cov-taxon .taxon{font-size:13.5px; font-weight:600; color:var(--paper,#e9f2ec);
    overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
  .ebp-cov-taxon .n{font-size:11.5px; color:var(--paper-mute,#6f8a7b); font-variant-numeric:tabular-nums;}
  .ebp-cov-open{background:none; border:none; padding:0; font:inherit; color:inherit; cursor:pointer;
    display:flex; align-items:center; gap:6px; text-align:left; width:100%;}
  .ebp-cov-open .caret{font-size:9px; color:var(--paper-mute,#6f8a7b); flex:none; width:9px;}
  .ebp-cov-open:hover .taxon{color:var(--green-glow,#5fd39a);}

  .ebp-cov-bar{display:flex; height:15px; border-radius:4px; overflow:hidden;
    background:var(--ink,#0b1310); border:1px solid var(--line,#22362b);}
  .ebp-cov-bar i{display:block; height:100%;}
  /* --low, NOT --ink-4. That variable is a surface tint: in the light theme it is
     #e2ede5, which on a white card is very nearly the empty track, so a rendered
     bar read as "two thirds novel, one third nothing" when the last third was a
     real finding. --low is a true mid grey with the same value in both themes, so
     the three-way split survives the theme flip.
     (No backticks in this block — it lives inside a template literal.) */
  .ebp-cov-bar i.cov{background:var(--low,#8595a0); opacity:.55;}
  /* Hatched, not a flat block: "we could not assess this" must not be able to be
     mistaken for a measured category at a glance. */
  .ebp-cov-bar i.un{background:repeating-linear-gradient(45deg,
    var(--low,#8595a0) 0 3px, transparent 3px 7px);}

  .ebp-cov-score{text-align:right; font-variant-numeric:tabular-nums;}
  .ebp-cov-score .big{font-size:15px; font-weight:700; color:var(--novel,#7aa2ff);}
  .ebp-cov-score .small{font-size:11px; color:var(--paper-mute,#6f8a7b);}
  .ebp-cov-score .none{color:var(--paper-mute,#6f8a7b); font-weight:600; font-size:13px;}

  .ebp-cov-species{grid-column:1 / -1; display:flex; flex-wrap:wrap; gap:6px; padding:2px 0 4px;}
  .ebp-cov-chip{font-size:11.5px; font-style:italic; border:1px solid var(--line,#22362b);
    background:var(--ink,#0b1310); color:var(--paper-dim,#a6bcaf); border-radius:999px;
    padding:2px 9px; cursor:default;}
  button.ebp-cov-chip{cursor:pointer; font-family:inherit;}
  button.ebp-cov-chip:hover{color:var(--green-glow,#5fd39a); border-color:rgba(63,191,127,.4);}
  .ebp-cov-more{font-size:11.5px; color:var(--paper-mute,#6f8a7b); align-self:center;}
  .ebp-cov-empty{padding:26px 18px; text-align:center; color:var(--paper-mute,#6f8a7b); font-size:13px;}
  @media (max-width:720px){
    .ebp-cov-row{grid-template-columns:minmax(110px,1fr) minmax(90px,1.6fr) 92px; gap:9px; padding:10px 12px;}
    .ebp-cov-row.sub{padding-left:24px;}
  }
  `;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement('style');
    tag.id = STYLE_ID;
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }

  function cssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (value || '').trim() || fallback;
  }

  function novelColor(label) {
    const base = cssVar('--novel', '#7aa2ff');
    const alpha = RAMP[label];
    return (alpha && /^#[0-9a-f]{6}$/i.test(base)) ? base + alpha : base;
  }

  // ── aggregation ───────────────────────────────────────────────────────────

  /**
   * Group rows by one rank into the three-way split.
   *
   * `rows` is whatever subset the caller wants counted — the whole list for the
   * top level, one phylum's rows for a drill-down — so the same function serves
   * both and the sub-rows cannot drift from their parent.
   */
  function group(rows, rank) {
    const buckets = new Map();
    rows.forEach(function (row) {
      const key = String(row[rank] || '').trim() || UNRESOLVED;
      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { key: key, total: 0, novel: 0, covered: 0, unassessed: 0, levels: {}, names: [] };
        buckets.set(key, bucket);
      }
      bucket.total += 1;
      const label = row.Taxonomic_Priority;
      if (NOVEL.indexOf(label) >= 0) {
        bucket.novel += 1;
        bucket.levels[label] = (bucket.levels[label] || 0) + 1;
        bucket.names.push(row['Scientific Name']);
      } else if (UNASSESSED.indexOf(label) >= 0) {
        bucket.unassessed += 1;
      } else {
        bucket.covered += 1;
      }
    });

    /* Most novel species first — the view's whole question is "where does this
       list add most". Ties break on the size of the group, then the name, so the
       order is stable across renders. Unresolved lineage always sorts last: it
       is a data-quality row, not a finding. */
    return Array.from(buckets.values()).sort(function (a, b) {
      if (a.key === UNRESOLVED) return 1;
      if (b.key === UNRESOLVED) return -1;
      return (b.novel - a.novel) || (b.total - a.total) || (a.key < b.key ? -1 : 1);
    });
  }

  // ── rendering ─────────────────────────────────────────────────────────────

  function bar(bucket) {
    const segments = NOVEL_LEVELS
      .filter((level) => bucket.levels[level[0]])
      .map(function (level) {
        const count = bucket.levels[level[0]];
        return '<i style="width:' + pct(count, bucket.total) + '%; background:'
          + novelColor(level[0]) + '" title="' + esc(count + ' would be the first assembly in its '
          + level[1].toLowerCase()) + '"></i>';
      }).join('');
    const covered = bucket.covered
      ? '<i class="cov" style="width:' + pct(bucket.covered, bucket.total) + '%" title="'
        + esc(bucket.covered + ' already covered — an assembly exists, or the taxon is already '
          + 'represented by a sequenced species') + '"></i>'
      : '';
    const unassessed = bucket.unassessed
      ? '<i class="un" style="width:' + pct(bucket.unassessed, bucket.total) + '%" title="'
        + esc(bucket.unassessed + ' could not be assessed — not found in GoaT, or found without '
          + 'lineage. Not the same as “no gap here”; verify these names.') + '"></i>'
      : '';
    return '<div class="ebp-cov-bar">' + segments + covered + unassessed + '</div>';
  }

  function taxonCell(bucket, expandable, open, id) {
    const name = bucket.key === UNRESOLVED ? 'Lineage not resolved' : bucket.key;
    const inner = '<div style="min-width:0"><div class="taxon">' + esc(name) + '</div>'
      + '<div class="n">' + num(bucket.total) + ' species</div></div>';
    if (!expandable) return '<div class="ebp-cov-taxon">' + inner + '</div>';
    return '<div class="ebp-cov-taxon"><button type="button" class="ebp-cov-open" data-key="'
      + esc(bucket.key) + '" aria-expanded="' + (open ? 'true' : 'false') + '" aria-controls="' + id
      + '"><span class="caret">' + (open ? '▾' : '▸') + '</span>' + inner + '</button></div>';
  }

  function scoreCell(bucket) {
    if (!bucket.novel) {
      return '<div class="ebp-cov-score"><div class="none">—</div>'
        + '<div class="small">no firsts</div></div>';
    }
    const broadest = NOVEL_LEVELS.filter((level) => bucket.levels[level[0]])[0];
    return '<div class="ebp-cov-score"><div class="big">' + num(bucket.novel) + '</div>'
      + '<div class="small">broadest: ' + esc(broadest[1].toLowerCase()) + '</div></div>';
  }

  /* Up to this many species names per expanded group. Beyond it the Results tab
     filtered by novelty is the right tool, and the row says how many it left. */
  const CHIP_CAP = 24;

  function speciesCell(bucket, clickable) {
    if (!bucket.names.length) return '';
    const shown = bucket.names.slice(0, CHIP_CAP);
    const chips = shown.map(function (name) {
      return clickable
        ? '<button type="button" class="ebp-cov-chip" data-name="' + esc(name) + '">'
          + esc(name) + '</button>'
        : '<span class="ebp-cov-chip">' + esc(name) + '</span>';
    }).join('');
    const rest = bucket.names.length - shown.length;
    return '<div class="ebp-cov-species">' + chips
      + (rest ? '<span class="ebp-cov-more">+ ' + num(rest) + ' more — filter the Results tab by '
        + 'novelty to see them all</span>' : '') + '</div>';
  }

  // ── state ─────────────────────────────────────────────────────────────────
  let els = null;
  let rows = [];
  let subRank = 'Family';
  const expanded = new Set();
  let hooks = {};

  function draw() {
    const top = group(rows, 'Phylum');
    if (!top.length) {
      els.table.innerHTML = '<div class="ebp-cov-empty">No species to place in the tree.</div>';
      return;
    }

    const html = ['<div class="ebp-cov-row head"><div>Phylum</div>'
      + '<div>Novel · covered · unassessed</div><div style="text-align:right">Firsts</div></div>'];

    top.forEach(function (bucket, index) {
      const id = 'ebp-cov-sub-' + index;
      const open = expanded.has(bucket.key);
      html.push('<div class="ebp-cov-row">' + taxonCell(bucket, true, open, id) + bar(bucket)
        + scoreCell(bucket) + '</div>');
      if (!open) return;

      /* One level down, within this phylum only. Grouped from the phylum's own
         rows, so a sub-row can never total more than its parent. */
      const subs = group(rows.filter(
        (row) => (String(row.Phylum || '').trim() || UNRESOLVED) === bucket.key), subRank);
      subs.forEach(function (sub) {
        html.push('<div class="ebp-cov-row sub" id="' + id + '">'
          + taxonCell(sub, false) + bar(sub) + scoreCell(sub)
          + speciesCell(sub, !!hooks.onSpecies) + '</div>');
      });
    });

    els.table.innerHTML = html.join('');
  }

  function shell(payload) {
    const total = payload.species_count || (payload.results || []).length;
    const counts = (payload.summary || {}).taxonomic_priority || {};
    const novel = NOVEL.reduce((sum, label) => sum + (counts[label] || 0), 0);
    const unassessed = UNASSESSED.reduce((sum, label) => sum + (counts[label] || 0), 0);
    const phyla = group(payload.results || [], 'Phylum');
    const withFirsts = phyla.filter((bucket) => bucket.novel).length;

    return `
    <div class="view-head">
      <div class="vt">Coverage</div>
      <div class="vs">Where this list fills gaps in the assembly tree</div>
    </div>

    <p class="ebp-cov-lede"><b>${num(novel)}</b> of <b>${num(total)}</b> species in this list would be
      the first assembly at some taxonomic level, spread across <b>${num(withFirsts)}</b> of
      <b>${num(phyla.length)}</b> phyla.${unassessed
        ? ' <b>' + num(unassessed) + '</b> could not be assessed at all — those are a prompt to check '
          + 'the names, not a finding about the tree.'
        : ''}</p>

    <div class="ebp-cov-note"><span aria-hidden="true">▸</span><span><b>This is your list's view of
      the tree, not the network's.</b> The denominator on every row is the species you submitted, so a
      phylum reading “12 species, 9 firsts” means nine of <em>your</em> twelve would be a first —
      it says nothing about how many species that phylum has in total.</span></div>

    <div class="ebp-cov-key">
      ${NOVEL_LEVELS.map((level) => '<span><i style="background:' + novelColor(level[0]) + '"></i>first in '
        + level[1].toLowerCase() + '</span>').join('')}
      <span><i style="background:var(--low,#8595a0); opacity:.55"></i>already covered</span>
      <span><i style="background:repeating-linear-gradient(45deg,var(--low,#8595a0) 0 3px,transparent 3px 7px); border:1px solid var(--line,#22362b)"></i>not assessable</span>
      <span class="rk"><label for="ebp-cov-rank">Expand to</label>
        <select id="ebp-cov-rank">
          ${RANKS.slice(1).map((rank) => '<option value="' + rank + '"'
            + (rank === subRank ? ' selected' : '') + '>' + rank + '</option>').join('')}
        </select></span>
    </div>

    <!-- Panel B is MOVED in here when a species chip below is clicked. Its own
         host, not the Results one: the panel is a singleton, so borrowing that
         host would move the open timeline into a view nobody is looking at. -->
    <div id="tl-host-coverage"></div>

    <div class="ebp-cov-tbl" id="ebp-cov-table"></div>`;
  }

  /**
   * Render the Coverage view.
   *
   * @param {Element} host
   * @param {{payload: object, onSpecies?: function}} opts
   * @returns {{redraw: function}}
   */
  function render(host, opts) {
    injectStyles();
    hooks = opts || {};
    const payload = hooks.payload || {};
    rows = payload.results || [];
    expanded.clear();
    host.innerHTML = shell(payload);
    els = { table: host.querySelector('#ebp-cov-table'), rank: host.querySelector('#ebp-cov-rank') };

    els.table.addEventListener('click', function (event) {
      const toggle = event.target.closest('.ebp-cov-open');
      if (toggle) {
        const key = toggle.dataset.key;
        if (expanded.has(key)) expanded.delete(key); else expanded.add(key);
        draw();
        return;
      }
      const chip = event.target.closest('button.ebp-cov-chip');
      if (chip && hooks.onSpecies) hooks.onSpecies(chip.dataset.name);
    });
    els.rank.addEventListener('change', function () {
      subRank = els.rank.value;
      draw();
    });

    draw();
    /* Colours are read from the CSS variables at draw time, so a theme flip is
       a redraw — the same contract Panels A and the results charts have. */
    return { redraw: draw };
  }

  return { render: render };
})();
