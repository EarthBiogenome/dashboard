/**
 * The Submit view of prioritization.html — intake, POST, and the wait. [Task 6]
 *
 *   PrioritizationSubmit.mount(host, {onAccepted, onResult});
 *
 * A drop zone or a textarea, one `POST /api/submissions`, and whatever waiting
 * that turns out to need. Everything below is either a field of that request or
 * a field of its response; this file computes no prioritization of its own.
 *
 * SYNC VS BACKGROUND IS THE SERVER'S CALL, NOT OURS (plan §5b). One POST can
 * come back two ways, and the client has to handle both from the same call:
 *
 *   * <= EBP_SUBMISSION_SYNC_MAX (500 by default) — 200 with the whole result
 *     body. It took a few seconds and there is no progress to report, because
 *     the run had no checkpoints to report from.
 *   * above it — 202 with {id, status: 'processing', batches_total}. The run
 *     continues server-side and we poll `GET /api/submissions/{id}`, where
 *     `batches_done` / `batches_total` are real enrichment batches.
 *
 * The threshold is a server setting, so the page must never assume 500: it
 * branches on `status` in the response, never on the length of the input.
 *
 * THERE IS NO DISAMBIGUATION STEP, and the mockup's is the one thing from it
 * deliberately not built. `_design-concepts/prioritization-mockup.html` shows an
 * interstitial where 12 of 308 names are confirmed against candidate taxa before
 * scoring. No endpoint behind it exists, and inventing a client-side one would
 * be inventing taxonomy. What the backend actually does with a name it cannot
 * resolve is assess it from its genus and report it as `Unknown_S` / `Unknown_G`
 * + `Not_Assigned` — visible in the results table, never silently dropped. The
 * "What happens" card says that rather than promising a review step.
 *
 * NO LIST NAME FIELD, for the same reason. The mockup has one; a submission has
 * no list identity in v1 (§12.6 — the trend is keyed by *tracked list*, and an
 * anonymous submission never becomes one), so a name typed here would be a label
 * this page invented and nothing downstream would ever see it. The uploaded
 * file's name is used where a heading needs one, and it is called what it is.
 */

const PrioritizationSubmit = (function () {
  'use strict';

  /* Poll spacing for the background path. Enrichment batches are ~50 species
     and take a second or two each, so 2 s is roughly one poll per batch. */
  const POLL_MS = 2000;

  const esc = (value) => String(value === null || value === undefined ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  /* Exactly the server's `_split_pasted`: newlines and commas, blanks dropped.
     Restated rather than approximated — a counter that disagrees with the count
     that comes back is worse than no counter. */
  function splitPasted(text) {
    return String(text || '').replace(/,/g, '\n').split('\n')
      .map((line) => line.trim()).filter(Boolean);
  }

  const ACCEPT = '.csv,.tsv,.txt,.xlsx,.xls';

  /* ── styles ───────────────────────────────────────────────────────────────
     Injected by the component, as Panels A and B do, so the view stays a
     drop-in: the page can be rebuilt around it without it losing its layout.
     Colours come from the page's botanical-ink variables, with the dark values
     as fallbacks. */
  const STYLE_ID = 'ebp-submit-styles';
  const STYLES = `
  .ebp-sub .card.pad{padding:22px;}
  .ebp-drop{border:2px dashed var(--line,#22362b); border-radius:12px; background:var(--ink-3,#14231b);
    padding:34px 20px; text-align:center; cursor:pointer; transition:.15s;}
  .ebp-drop.over{border-color:var(--green-bright,#3fbf7f); background:var(--ink-4,#1b2f24);}
  .ebp-drop .icon{font-size:32px;}
  .ebp-drop .big{font-size:16px; font-weight:600; margin:10px 0 3px;}
  .ebp-drop .small{font-size:13px; color:var(--paper-mute,#6f8a7b);}
  .ebp-drop .browse{color:var(--green-glow,#5fd39a); font-weight:600; text-decoration:underline;}

  .ebp-file{display:flex; align-items:center; gap:10px; margin-top:12px; font-size:13px;
    background:var(--ink-3,#14231b); border:1px solid var(--line,#22362b); border-radius:9px; padding:9px 12px;}
  .ebp-file[hidden]{display:none;}
  .ebp-file .fn{font-weight:600; color:var(--paper,#e9f2ec); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;}
  .ebp-file .fsz{color:var(--paper-mute,#6f8a7b); font-variant-numeric:tabular-nums; flex:none;}
  .ebp-file .drop-it{margin-left:auto; flex:none; background:none; border:none; font:inherit; font-size:12px;
    color:var(--paper-mute,#6f8a7b); cursor:pointer; text-decoration:underline;}
  .ebp-file .drop-it:hover{color:var(--red,#e0736a);}

  .ebp-or{display:flex; align-items:center; gap:14px; margin:20px 0; color:var(--paper-mute,#6f8a7b);
    font-size:12px; letter-spacing:.06em; text-transform:uppercase;}
  .ebp-or::before,.ebp-or::after{content:""; flex:1; height:1px; background:var(--line,#22362b);}
  .ebp-sub label.ebp-field{display:block; font-size:12px; font-weight:700; color:var(--paper-dim,#a6bcaf);
    text-transform:uppercase; letter-spacing:.04em; margin-bottom:7px;}
  .ebp-sub textarea{width:100%; min-height:130px; resize:vertical; font:inherit; font-size:13.5px;
    line-height:1.6; padding:12px 14px; background:var(--ink,#0b1310); border:1px solid var(--line,#22362b);
    border-radius:9px; color:var(--paper,#e9f2ec);}
  .ebp-sub textarea:focus{outline:none; border-color:var(--green-bright,#3fbf7f);}
  .ebp-sub textarea[disabled]{opacity:.5; cursor:not-allowed;}
  .ebp-meta-row{display:flex; gap:14px; margin-top:16px; flex-wrap:wrap;}
  .ebp-meta-row .grp{flex:1; min-width:220px;}
  .ebp-sub input[type=text]{width:100%; font:inherit; font-size:13.5px; padding:9px 12px;
    background:var(--ink,#0b1310); border:1px solid var(--line,#22362b); border-radius:9px; color:var(--paper,#e9f2ec);}
  .ebp-sub input[type=text]:focus{outline:none; border-color:var(--green-bright,#3fbf7f);}
  .ebp-hint{font-size:11.5px; color:var(--paper-mute,#6f8a7b); margin-top:5px; line-height:1.5;}
  .ebp-hint code{font-size:.92em;}
  .ebp-actions{display:flex; align-items:center; gap:14px; margin-top:20px; flex-wrap:wrap;}
  .ebp-counter{font-size:13px; color:var(--paper-dim,#a6bcaf);}
  .ebp-counter b{color:var(--green-glow,#5fd39a); font-variant-numeric:tabular-nums;}

  .ebp-sub-err{margin-top:14px; font-size:12.5px; line-height:1.75; border-radius:9px; padding:11px 14px;
    color:var(--red,#e0736a); background:rgba(224,115,106,.1); border:1px solid rgba(224,115,106,.3);}
  .ebp-sub-err[hidden]{display:none;}
  .ebp-sub-err b{color:var(--red,#e0736a);}
  /* The recovery command is the point of the message, so it is legible rather
     than inheriting the page's green-on-ink code style inside a red box. */
  .ebp-sub-err code{background:rgba(224,115,106,.12); border-color:rgba(224,115,106,.28);
    color:inherit; font-size:.92em;}

  .ebp-steps{list-style:none; padding:0; margin:0; display:grid; gap:11px;}
  .ebp-steps li{display:flex; gap:11px; align-items:flex-start; font-size:13px; color:var(--paper-dim,#a6bcaf);
    line-height:1.6;}
  .ebp-steps .k{width:22px; height:22px; border-radius:50%; background:var(--ink-4,#1b2f24);
    color:var(--green-glow,#5fd39a); font-weight:700; font-size:12px; display:flex; align-items:center;
    justify-content:center; flex:none; margin-top:1px;}
  .ebp-steps b{color:var(--paper,#e9f2ec);}
  .ebp-keep{font-size:12px; color:var(--paper-mute,#6f8a7b); line-height:1.6; margin:14px 0 0;
    border-top:1px solid var(--line-soft,#1a2a20); padding-top:12px;}
  .ebp-keep b{color:var(--paper-dim,#a6bcaf);}

  .ebp-proc[hidden]{display:none;}
  .ebp-proc-head{display:flex; align-items:center; gap:12px; margin-bottom:14px;}
  .ebp-spin{width:22px; height:22px; border:3px solid var(--ink-4,#1b2f24);
    border-top-color:var(--green-glow,#5fd39a); border-radius:50%; animation:ebp-spin .8s linear infinite; flex:none;}
  @keyframes ebp-spin{to{transform:rotate(360deg);}}
  .ebp-proc-head .t{font-size:16px; font-weight:650;}
  .ebp-proc-head .s{font-size:12.5px; color:var(--paper-mute,#6f8a7b); font-variant-numeric:tabular-nums;}
  .ebp-bar{height:8px; border-radius:99px; background:var(--ink-4,#1b2f24); overflow:hidden; margin:6px 0 16px;}
  .ebp-bar>i{display:block; height:100%; width:0;
    background:linear-gradient(90deg,var(--green-deep,#0d7a47),var(--green-glow,#5fd39a));
    border-radius:99px; transition:width .4s ease;}
  /* No batch count to plot on the synchronous path, so the bar reports that it
     is running rather than inventing a position. Under prefers-reduced-motion
     the page kills the animation and it reads as a full dim track — which is
     why the elapsed counter beside it, not the bar, is the real signal. */
  .ebp-bar.indet>i{width:100%; transform-origin:left;
    animation:ebp-indet 1.5s ease-in-out infinite; opacity:.55;}
  @keyframes ebp-indet{0%{transform:scaleX(.15);}50%{transform:scaleX(.8);}100%{transform:scaleX(.15);}}
  .ebp-proc-note{font-size:12.5px; color:var(--paper-dim,#a6bcaf); line-height:1.6; margin:0;}
  .ebp-proc-note b{color:var(--paper,#e9f2ec);}
  .ebp-proc-note code{font-size:.9em;}
  `;

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement('style');
    tag.id = STYLE_ID;
    tag.textContent = STYLES;
    document.head.appendChild(tag);
  }

  function markup() {
    return `
    <div class="ebp-sub">
      <div class="ebp-sub-input">
        <div class="card pad">
          <div class="ebp-drop" id="ebp-drop" role="button" tabindex="0"
               aria-label="Choose a CSV or Excel file, or drop one here">
            <div class="icon" aria-hidden="true">⤒</div>
            <div class="big">Drop a CSV or Excel file here</div>
            <div class="small">or <span class="browse">browse your computer</span>
              · .xlsx, .xls, .csv, .tsv, .txt · the first column that looks like a name is used</div>
          </div>
          <input type="file" id="ebp-file" accept="${ACCEPT}" hidden>
          <div class="ebp-file" id="ebp-file-chip" hidden>
            <span aria-hidden="true">▤</span>
            <span class="fn"></span><span class="fsz"></span>
            <button type="button" class="drop-it">remove</button>
          </div>

          <div class="ebp-or">or paste names</div>
          <label class="ebp-field" for="ebp-names">Species names — one per line</label>
          <textarea id="ebp-names" spellcheck="false"
            placeholder="Panthera leo&#10;Aquilegia desertorum&#10;Terrapene ornata"></textarea>

          <div class="ebp-meta-row">
            <div class="grp">
              <label class="ebp-field" for="ebp-list">List name
                <span style="text-transform:none;font-weight:400;color:var(--paper-mute,#6f8a7b)">(optional)</span></label>
              <input type="text" id="ebp-list" placeholder="e.g. ARIDE Biocollections list"
                     maxlength="200" autocomplete="off">
              <div class="ebp-hint">What to call this run. It names the results header and the
                downloaded workbook (<code>&lt;list name&gt;_prioritization.xlsx</code>). <b>A label
                only</b> — it does not attach this run to a tracked list, and the “Changes over time”
                history is not affected by what you type here.</div>
            </div>
            <div class="grp">
              <label class="ebp-field" for="ebp-self">Your EBP project
                <span style="text-transform:none;font-weight:400;color:var(--paper-mute,#6f8a7b)">(optional)</span></label>
              <input type="text" id="ebp-self" placeholder="e.g. africabp" autocomplete="off">
              <div class="ebp-hint">The GoaT project code, as it appears in
                <code>sequencing_status_&lt;code&gt;</code>. Set it and your own project's status stops
                counting as “someone else is already working on it”. A code GoaT does not carry simply
                has no effect — nothing is dropped and nothing is flagged.</div>
            </div>
          </div>

          <div class="ebp-actions">
            <button class="btn primary" id="ebp-go" type="button">Start screening →</button>
            <span class="ebp-counter" id="ebp-count">Nothing to screen yet</span>
          </div>
          <div class="ebp-sub-err" id="ebp-err" role="alert" hidden></div>
        </div>

        <div class="card pad">
          <h2>What happens when you submit</h2>
          <ul class="ebp-steps">
            <li><span class="k">1</span><div><b>Name cleaning.</b> Parenthetical annotations are dropped
              and subspecies trinomials reduced to the binomial GoaT tracks assemblies at.
              <code>sp.</code> identifiers are kept as written, and <code>cf.</code> / <code>aff.</code> /
              <code>nr.</code> are reduced to the genus — they make no species-level claim. Your
              original spelling is kept and returned beside the result.</div></li>
            <li><span class="k">2</span><div><b>GoaT lookup.</b> Every name is matched on its exact
              scientific name, with a synonym pass so a superseded name resolves to the accepted
              record: assembly level, EBP-standard status, the full lineage, and every EBP project's
              sequencing status.</div></li>
            <!-- The whole clause is the swap target, not just the version, so it
                 reads as a sentence either way — see nameTheIucnRelease(). -->
            <li><span class="k">3</span><div><b>IUCN Red List.</b> A conservation category for each
              species, from <span id="ebp-iucn-release">the latest IUCN Red List release we
              hold</span>.</div></li>
            <li><span class="k">4</span><div><b>Prioritization analysis.</b> Each species is assigned
              two priority labels — taxonomic novelty and project status.</div></li>
          </ul>
          <p class="ebp-keep"><b>Where your list goes.</b> The submitted names, the results and the raw
            upload are stored on the EBP backend so the Excel export can replay exactly the results you
            saw.</p>
        </div>
      </div>

      <div class="card pad ebp-proc" id="ebp-proc" hidden aria-live="polite">
        <div class="ebp-proc-head">
          <div class="ebp-spin" aria-hidden="true"></div>
          <div>
            <div class="t" id="ebp-proc-t">Screening</div>
            <div class="s" id="ebp-proc-s"></div>
          </div>
        </div>
        <div class="ebp-bar indet" id="ebp-bar"><i></i></div>
        <p class="ebp-proc-note" id="ebp-proc-note"></p>
        <div class="ebp-actions">
          <button class="btn" id="ebp-back" type="button" hidden>← Back to the form</button>
        </div>
      </div>
    </div>`;
  }

  /* ── mounted state ────────────────────────────────────────────────────────
     One view per page, so this is module state rather than a per-mount object.
     `timer` and `tick` are held so a re-mount or a failure can stop them —
     a poll left running against a finished submission would keep overwriting
     whatever the page showed next. */
  let els = null;
  let chosenFile = null;
  let timer = null;
  let tick = null;
  let startedAt = 0;
  let hooks = {};
  /* Whether the run being watched was started from this form. A resumed deep
     link was not, so this page has no idea whether it was a paste or an upload
     and must not name one — the file chip on screen belongs to nothing. */
  let localRun = false;

  function stopWaiting() {
    if (timer) { clearTimeout(timer); timer = null; }
    if (tick) { clearInterval(tick); tick = null; }
  }

  function setError(message) {
    els.err.hidden = !message;
    els.err.innerHTML = message || '';
  }

  function humanSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  /** What the counter says, and whether there is anything to send. */
  function refreshCount() {
    if (chosenFile) {
      /* A pasted count would be a lie about a file: a spreadsheet's species
         count is whatever the server's column detection makes of it, and for
         .xlsx we cannot even read the rows. Say which file, not how many. */
      els.count.innerHTML = 'Screening <b>' + esc(chosenFile.name) + '</b> — the species count comes '
        + 'back with the results';
      return true;
    }
    const n = splitPasted(els.names.value).length;
    els.count.innerHTML = n
      ? '<b>' + n.toLocaleString() + '</b> name' + (n === 1 ? '' : 's') + ' ready'
      : 'Nothing to screen yet';
    return n > 0;
  }

  function chooseFile(file) {
    chosenFile = file || null;
    els.fileChip.hidden = !chosenFile;
    if (chosenFile) {
      els.fileChip.querySelector('.fn').textContent = chosenFile.name;
      els.fileChip.querySelector('.fsz').textContent = humanSize(chosenFile.size);
    }
    /* The server takes the file when both are sent, so the textarea is disabled
       rather than left to look like it still counts. */
    els.names.disabled = !!chosenFile;
    setError('');
    refreshCount();
  }

  // ── the wait ─────────────────────────────────────────────────────────────

  function elapsed() {
    return Math.round((Date.now() - startedAt) / 1000);
  }

  /* What the sub-line says apart from the clock. Held here rather than parsed
     back out of the DOM, so the ticker can rewrite the seconds without having
     to know what the rest of the line currently is. */
  let stateLine = '';

  function retick() {
    els.procS.textContent = (stateLine ? stateLine + ' · ' : '') + elapsed() + 's elapsed';
  }

  function showProcessing(what) {
    els.input.hidden = true;
    els.proc.hidden = false;
    els.back.hidden = true;
    els.procT.textContent = 'Screening ' + what;
    els.bar.classList.add('indet');
    els.barFill.style.width = '';
    startedAt = Date.now();
    stateLine = '';
    retick();
    tick = setInterval(function () { if (!els.proc.hidden) retick(); }, 1000);
    els.procNote.innerHTML = 'Held here until the run finishes. A first run after a restart also '
      + 'rebuilds the ~24,000-species GoaT assembly reference, which adds a few seconds.';
  }

  function showProgress(body) {
    const total = body.batches_total || 0;
    const done = body.batches_done || 0;
    /* A determinate bar only once there is something determinate to draw. At
       `0 of N` a 0%-wide fill is an empty track, which reads as a stalled run —
       and on a list of one batch that would be the whole wait. The count still
       says 0 of N; it is the bar that keeps moving. */
    if (done > 0 && total > 0) {
      els.bar.classList.remove('indet');
      els.barFill.style.width = Math.round((done / total) * 100) + '%';
    }
    stateLine = 'batch ' + done.toLocaleString() + ' of ' + total.toLocaleString();
    retick();
  }

  function fail(err) {
    stopWaiting();
    els.proc.hidden = true;
    els.input.hidden = false;
    /* `explain()` knows which backend this page is pointed at, so it can name
       the actual cause — locally, almost always "the API process is not
       running" — instead of surfacing the browser's "Failed to fetch". */
    const cause = EBPBackend.explain(err);
    setError(err && (err.unreachable || err.unconfigured)
      ? cause
      : '<b>The run did not complete.</b> ' + esc(cause));
    if (hooks.onError) hooks.onError(err);
  }

  function finish(body) {
    stopWaiting();
    els.proc.hidden = true;
    els.input.hidden = false;
    setError('');
    if (hooks.onResult) {
      hooks.onResult(body, {
        source: localRun ? (chosenFile ? chosenFile.name : 'Pasted list') : null,
      });
    }
  }

  /** Poll `GET /{id}` until it stops saying 'processing'. */
  function watch(id) {
    timer = setTimeout(async function poll() {
      let body;
      try {
        body = await EBPBackend.getSubmission(id);
      } catch (err) {
        fail(err);
        return;
      }
      if (body.status === 'processing') {
        showProgress(body);
        watch(id);
        return;
      }
      if (body.status === 'failed') {
        fail(new Error(body.error || 'The server reported the run as failed.'));
        return;
      }
      finish(body);
    }, POLL_MS);
  }

  async function start() {
    if (!refreshCount()) {
      setError('Paste some species names, or choose a CSV/XLSX file.');
      return;
    }
    setError('');
    localRun = true;
    const label = els.list.value.trim();
    showProcessing(label ? '“' + label + '”'
      : (chosenFile ? '“' + chosenFile.name + '”'
        : splitPasted(els.names.value).length.toLocaleString() + ' names'));

    let body;
    try {
      body = await EBPBackend.createSubmission({
        names: els.names.value,
        file: chosenFile,
        selfProject: els.self.value.trim(),
        listName: els.list.value.trim(),
      });
    } catch (err) {
      fail(err);
      return;
    }

    /* Announce the id the moment it exists — on the background path the run
       outlives this tab, so the URL has to become a way back to it before the
       waiting starts, not after it succeeds. */
    if (body.id && hooks.onAccepted) hooks.onAccepted(body.id, body.status);

    if (body.status === 'processing') {
      els.procNote.innerHTML = 'This list is above the server\'s synchronous limit, so it is running '
        + 'as a background job. <b>The link in your address bar now opens this run</b> — it keeps '
        + 'going if you close the tab.';
      els.back.hidden = false;
      showProgress(body);
      watch(body.id);
      return;
    }
    finish(body);
  }

  /**
   * Fill in which IUCN release step 3 is talking about.
   *
   * Read from `/api/health` rather than written into the markup: the cache is
   * reseeded when IUCN publishes, and a version typed into this page would go
   * stale silently — a stated release that is wrong is worse than an unstated
   * one, because a reader has no way to tell. On any failure the sentence keeps
   * its neutral wording ("the latest IUCN release we hold"), which is true
   * whatever the release turns out to be.
   */
  async function nameTheIucnRelease(host) {
    const slot = host.querySelector('#ebp-iucn-release');
    if (!slot) return;
    try {
      const health = await EBPBackend.health();
      const release = ((health.caches || {}).iucn_cache || {}).release;
      if (release) slot.textContent = 'IUCN Red List release ' + release + ', the latest we hold';
    } catch (err) {
      /* No backend configured, or unreachable. The neutral wording stands. */
    }
  }

  // ── mount ────────────────────────────────────────────────────────────────

  /**
   * Render the Submit view into `host`.
   *
   * @param {Element} host
   * @param {{onAccepted?: function, onResult?: function, onError?: function}} options
   *        onAccepted(id, status) — fires as soon as the server has an id.
   *        onResult(payload, {source}) — a completed submission body.
   * @returns {{reset: function, watch: function}}
   */
  function mount(host, options) {
    injectStyles();
    stopWaiting();
    hooks = options || {};
    host.innerHTML = markup();

    els = {
      input: host.querySelector('.ebp-sub-input'),
      drop: host.querySelector('#ebp-drop'),
      file: host.querySelector('#ebp-file'),
      fileChip: host.querySelector('#ebp-file-chip'),
      names: host.querySelector('#ebp-names'),
      list: host.querySelector('#ebp-list'),
      self: host.querySelector('#ebp-self'),
      go: host.querySelector('#ebp-go'),
      count: host.querySelector('#ebp-count'),
      err: host.querySelector('#ebp-err'),
      proc: host.querySelector('#ebp-proc'),
      procT: host.querySelector('#ebp-proc-t'),
      procS: host.querySelector('#ebp-proc-s'),
      procNote: host.querySelector('#ebp-proc-note'),
      bar: host.querySelector('#ebp-bar'),
      barFill: host.querySelector('#ebp-bar > i'),
      back: host.querySelector('#ebp-back'),
    };

    els.drop.addEventListener('click', () => els.file.click());
    els.drop.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); els.file.click(); }
    });
    ['dragover', 'dragenter'].forEach(function (name) {
      els.drop.addEventListener(name, function (event) {
        event.preventDefault();
        els.drop.classList.add('over');
      });
    });
    ['dragleave', 'drop'].forEach(function (name) {
      els.drop.addEventListener(name, function (event) {
        event.preventDefault();
        els.drop.classList.remove('over');
      });
    });
    els.drop.addEventListener('drop', function (event) {
      const files = event.dataTransfer && event.dataTransfer.files;
      if (files && files.length) chooseFile(files[0]);
    });
    els.file.addEventListener('change', function () {
      chooseFile(els.file.files && els.file.files[0]);
    });
    els.fileChip.querySelector('.drop-it').addEventListener('click', function () {
      els.file.value = '';
      chooseFile(null);
    });
    els.names.addEventListener('input', refreshCount);
    els.go.addEventListener('click', start);
    els.back.addEventListener('click', function () {
      /* Stops watching, not the run — the job is server-side and the URL still
         opens it. Said that way rather than labelled "Cancel". */
      stopWaiting();
      els.proc.hidden = true;
      els.input.hidden = false;
    });

    refreshCount();
    nameTheIucnRelease(host);

    return {
      /** Back to the form, keeping what was typed — a re-run of a tweaked list. */
      reset() {
        stopWaiting();
        els.proc.hidden = true;
        els.input.hidden = false;
        setError('');
      },
      /** Attach to a run already in flight — a `?submission=` deep link. */
      resume(id, body) {
        stopWaiting();
        localRun = false;
        showProcessing('');
        els.procT.textContent = 'Rejoining a run already in progress';
        els.procNote.innerHTML = 'This link opens a submission the server is still working on. It was '
          + 'started somewhere else — possibly in another tab, possibly before this one was opened.';
        if (body) showProgress(body);
        watch(id);
      },
    };
  }

  return { mount: mount, splitPasted: splitPasted };
})();
