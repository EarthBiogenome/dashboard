/**
 * EBP backend client — the ONE place that knows where the backend lives.
 *
 * Every call to `ebp-backend` (prioritization, the per-list trend, and
 * cross-project duplication) goes through this file. That is a deliberate rule from the
 * integration plan §7: the existing dashboard hard-codes the GoaT host in five
 * separate pages, and moving it has cost real time every time. One constant,
 * one place.
 *
 * Loaded as a plain <script> like services.js — no modules, no build step.
 *
 *   <script src="./services_backend.js"></script>
 *   const who = await EBPBackend.resolveList(token);
 *
 * ACCESS (plan §12.6, option C). There are no PI accounts in v1. A per-list
 * capability token — handed to the project by the secretariat — authorizes the
 * reads below, and a bad or missing token comes back as 404 with the same body
 * as an unknown list. So `err.notFound` means "this link opens nothing" and
 * MUST NOT be reported as "you are not allowed": the API deliberately refuses
 * to tell us which it was, because saying so would let anyone enumerate other
 * projects' target lists.
 */

const EBPBackend = (function () {
  'use strict';

  // ── Where the backend lives ───────────────────────────────────────────────
  // Phase B provisions a Lightsail instance behind CloudFront; until it exists
  // there is no production hostname to point at, and inventing one would fail
  // at runtime with a DNS error instead of a message anyone can act on.
  // Set this to the CloudFront hostname when Phase B lands — nowhere else.
  const BACKEND_BASE_PRODUCTION = '';

  const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]', ''];
  const BACKEND_BASE_LOCAL = 'http://localhost:8000';

  /** The backend origin for wherever this page is being served from. */
  function base() {
    const host = (window.location && window.location.hostname) || '';
    if (LOCAL_HOSTS.indexOf(host) >= 0) return BACKEND_BASE_LOCAL;
    return BACKEND_BASE_PRODUCTION;
  }

  /**
   * A backend failure the UI can branch on.
   *
   * `notFound` covers both "no such list" and "wrong token" — the API returns
   * one body for both on purpose (§12.6), and this client does not pretend to
   * know more than it was told.
   */
  class BackendError extends Error {
    constructor(message, status, detail) {
      super(message);
      this.name = 'BackendError';
      this.status = status || 0;
      this.detail = detail || null;
      this.notFound = status === 404;
      this.unreachable = !status;          // network, CORS, or nothing listening
      this.unconfigured = status === -1;   // Phase B has not set a hostname yet
    }
  }

  /**
   * The human half of a FastAPI `detail`, which is not always a string.
   *
   * Most endpoints raise `HTTPException(detail='...')` and this is that string.
   * The duplication routes raise a structured detail instead — `{reason,
   * project, message, hint}` — because four different kinds of "there is
   * nothing to serve" have to be told apart by the caller rather than by
   * reading prose (A-D2). Passing that object straight to `Error` produced
   * `[object Object]` as the message, so the object is kept on `err.detail`
   * for branching and its `message` becomes the readable one.
   */
  function detailMessage(detail, status) {
    if (typeof detail === 'string' && detail) return detail;
    if (detail && typeof detail.message === 'string' && detail.message) return detail.message;
    return 'Backend returned ' + status;
  }

  function url(path, params) {
    const origin = base();
    if (!origin) {
      throw new BackendError(
        'The backend hostname has not been configured for this deployment yet.',
        -1);
    }
    const built = new URL(origin + path);
    Object.keys(params || {}).forEach(function (key) {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        built.searchParams.set(key, value);
      }
    });
    return built.toString();
  }

  async function getJSON(path, params) {
    let response;
    try {
      response = await fetch(url(path, params), { headers: { Accept: 'application/json' } });
    } catch (err) {
      if (err instanceof BackendError) throw err;
      throw new BackendError('Could not reach the EBP backend: ' + err.message, 0);
    }
    if (!response.ok) {
      let detail = null;
      try { detail = (await response.json()).detail; } catch (ignored) { /* not JSON */ }
      throw new BackendError(
        detailMessage(detail, response.status), response.status, detail);
    }
    return response.json();
  }

  /**
   * POST a FormData body.
   *
   * Deliberately sets no headers. `multipart/form-data` is CORS-safelisted and
   * the browser has to add its own boundary, so leaving both alone keeps this a
   * simple request — no preflight, and nothing for the backend's
   * `allow_headers` list to have to know about.
   */
  async function postForm(path, formData) {
    let response;
    try {
      response = await fetch(url(path), { method: 'POST', body: formData });
    } catch (err) {
      if (err instanceof BackendError) throw err;
      throw new BackendError('Could not reach the EBP backend: ' + err.message, 0);
    }
    if (!response.ok) {
      let detail = null;
      try { detail = (await response.json()).detail; } catch (ignored) { /* not JSON */ }
      throw new BackendError(
        detailMessage(detail, response.status), response.status, detail);
    }
    return response.json();
  }

  const listPath = (list) => '/api/lists/' + encodeURIComponent(list);
  const submissionPath = (id) => '/api/submissions/' + encodeURIComponent(id);
  const duplicationPath = (project) => '/api/duplication/' + encodeURIComponent(project);

  /** Is this page pointed at a backend on the developer's own machine? */
  function isLocalBackend() {
    return base().indexOf('localhost') >= 0 || base().indexOf('127.0.0.1') >= 0;
  }

  /**
   * Was this page opened as a file rather than served? Then NOTHING will work.
   *
   * A `file://` document has the opaque origin `null`, which CORS cannot be
   * configured to allow — not a setting we have failed to set, a thing that
   * cannot be granted. Every request will fail with "Failed to fetch", the
   * backend will log nothing, and the page otherwise looks entirely functional
   * until a list has been uploaded and screening has failed.
   *
   * Callers should say so up front rather than letting someone discover it.
   */
  function fileOrigin() {
    return (window.location && window.location.protocol) === 'file:';
  }

  /**
   * Why a request failed, in words the reader can act on. Returns HTML.
   *
   * "Could not reach the EBP backend: Failed to fetch" is what the browser
   * says, and it is useless: locally the cause is almost always that the API
   * process is simply not running, and the fix is one command. The page knows
   * which backend it is pointed at, so it can say which of those it is instead
   * of handing the reader the fetch error and leaving them to guess.
   */
  function explain(err) {
    if (fileOrigin()) {
      return '<b>This page was opened as a file, so it cannot reach any backend.</b> '
        + 'A <code>file://</code> document has no origin, which the backend can never be configured '
        + 'to accept. Serve this folder over http instead — from the <code>ebp-backend</code> repo, '
        + '<code>run_dev.cmd</code> starts both halves and opens the right address.';
    }
    if (err && err.unconfigured) {
      return '<b>No backend is configured for this deployment yet.</b> This page needs the EBP '
        + 'backend, which has not been given a hostname in <code>services_backend.js</code>.';
    }
    if (err && err.unreachable && isLocalBackend()) {
      /* Two causes, and `fetch` cannot tell them apart: nothing listening, and a
         CORS origin mismatch. In the second the server HANDLES the request and
         returns 200 — it is in its access log — but omits
         Access-Control-Allow-Origin, so the browser discards the response and
         rejects with the same bare "Failed to fetch". Saying "the backend is not
         answering" was wrong in exactly that case, and wrong confidently: a
         308-species run had completed server-side while this message claimed
         nothing was there. Name both, in the order they are worth checking. */
      return '<b>The request to <code>' + base() + '</code> did not complete.</b> '
        + 'Two different things look identical from here:<br>'
        + '· <b>The backend is not running.</b> From the <code>ebp-backend</code> repo, '
        + '<code>.\\run_dev.cmd</code> starts both halves and opens the page at the right '
        + 'address; or just the API with '
        + '<code>python -m uvicorn app.main:app --app-dir api --port 8000</code><br>'
        + '· <b>It is running, and the browser blocked the reply</b> because this page was opened '
        + 'from an origin the backend does not allow. Check the address bar: serve the page over '
        + '<code>http://localhost</code> or <code>http://127.0.0.1</code> — a <code>file://</code> '
        + 'path cannot call the backend at all.<br>'
        /* Deliberately generic. This said "the list can simply be screened
           again", which is the prioritization tool's story — on the duplication
           page nothing was being screened, and a reader was being told to redo
           work they never started. `explain()` is shared by both tools, so
           anything it says has to be true on either. */
        + 'Either way nothing is lost: reload once the backend answers.';
    }
    if (err && err.unreachable) {
      return '<b>Could not reach the EBP backend.</b> It may be down, or a network or CORS rule may '
        + 'be blocking the request. ' + String(err.message || '');
    }
    return String((err && err.message) || 'Unknown error.');
  }

  return {
    BackendError: BackendError,
    backendBase: base,
    isLocalBackend: isLocalBackend,
    fileOrigin: fileOrigin,
    explain: explain,

    /**
     * Screen a species list. → the result body, or a 202 acknowledgement.
     *
     * ONE CALL, TWO SHAPES, and the caller must branch on `status` rather than
     * on how many names it sent (plan §5b): at or below the server's
     * `EBP_SUBMISSION_SYNC_MAX` this returns the whole result body with
     * `status: 'complete'`; above it, `{id, status: 'processing', batches_total}`
     * for `getSubmission()` to poll. The threshold is a server setting and this
     * client does not know it.
     *
     * A file wins over pasted names, which is the server's precedence.
     */
    createSubmission(options) {
      const opts = options || {};
      const form = new FormData();
      if (opts.file) form.append('file', opts.file, opts.file.name);
      else form.append('names', opts.names || '');
      if (opts.selfProject) form.append('self_project', opts.selfProject);
      // A label, stored with the run: it names the results header and the
      // exported workbook, and it confers no list identity (§12.6).
      if (opts.listName) form.append('list_name', opts.listName);
      return postForm('/api/submissions', form);
    },

    /**
     * One submission: its status, and once complete the full result snapshot.
     *
     * Open by id — the opaque id IS the capability, matching the open POST, so
     * there is no token here. `offset` / `limit` page the `results` array;
     * omitted, the whole snapshot comes back.
     */
    getSubmission(id, options) {
      const opts = options || {};
      return getJSON(submissionPath(id), { offset: opts.offset, limit: opts.limit });
    },

    /**
     * The .xlsx download URL for a submission — the CLI's workbook.
     *
     * A URL rather than a fetch: the browser's own download handling is what
     * should carry a 2 MB file, and a blob round-trip would only add a copy in
     * memory. Throws the same `unconfigured` BackendError as everything else
     * when Phase B has not set a hostname.
     */
    submissionExportUrl(id) {
      return url(submissionPath(id) + '/export');
    },

    /**
     * Liveness, upstream reachability, cache ages and the IUCN release.
     *
     * The submit page reads `caches.iucn_cache.release` from this so it can
     * name the Red List release it screens against instead of hardcoding one —
     * a hardcoded version goes stale at the next reseed with nothing to catch it.
     */
    health() {
      return getJSON('/api/health');
    },

    /**
     * Which list does this capability token open? → {list, species_count}
     *
     * The PI's link carries only a token (`prioritization.html?list=<token>`);
     * every later call is keyed by list NAME. This is the one hop between them.
     */
    resolveList(token) {
      return getJSON('/api/lists/lookup', { token: token });
    },

    /**
     * The dated runs of one list — what the `Since` control is built from.
     *
     * Deliberately its own endpoint rather than a read of the trend payload:
     * the control may only ever offer dates a run was actually captured on.
     */
    listRuns(list, token) {
      return getJSON(listPath(list) + '/runs', { token: token });
    },

    /**
     * The §12.3 trend payload for one list.
     *
     * `includeSpecies` is opt-in for a measured reason — the per-species
     * timelines dominate the payload (MDD's is 1.3 MB with them, and Panel A
     * does not read one of them).
     */
    listTrend(list, options) {
      const opts = options || {};
      return getJSON(listPath(list) + '/trend', {
        token: opts.token,
        since: opts.since,
        include: opts.includeSpecies ? 'species' : null,
      });
    },

    /**
     * Every project a cross-project duplication report exists or could exist for.
     *
     * The UNION of the registry's reportable projects and the stored rows
     * (A-D2), so `reportable` and `has_report` are BOTH needed to size a
     * dropdown: a project the weekly job has not reached belongs in the list as
     * unselectable, not as an option that 404s when it is clicked.
     *
     * Each entry also carries `generated_date`, `stale` and `long_list_species`,
     * which is what lets a caller mark a failed capture, and tell an empty
     * report from a project GoaT holds no target list for, without a detail
     * call per project.
     */
    duplicationProjects(options) {
      const opts = options || {};
      return getJSON('/api/duplication/projects',
        { stored_only: opts.storedOnly ? 'true' : null });
    },

    /**
     * One project's stored three-report payload. → `{project, bioproject,
     * generated_date, report_1..3, superset, stored}`
     *
     * A DB read of what the weekly job precomputed — never a live GoaT query
     * (decision 11), so it answers in milliseconds and can be a week old by
     * design. `stored.stale` is the only thing that separates that from a week
     * old because the last captures FAILED; `generated_date` cannot say it.
     *
     * A miss is a 404 whose `err.detail.reason` is one of `not_yet_computed`,
     * `umbrella_project`, `not_reportable` or `unknown_project` — four
     * different situations, and a page that shows one message for all four is
     * wrong about three of them.
     */
    duplicationReport(project) {
      return getJSON(duplicationPath(project));
    },

    /**
     * The .xlsx download URL for one project's duplication report.
     *
     * A URL rather than a fetch, like `submissionExportUrl` — the browser's own
     * download handling should carry the file, and the workbook is built from
     * the same stored row the JSON comes from, so the two cannot disagree.
     */
    duplicationExportUrl(project) {
      return url(duplicationPath(project) + '/export');
    },

    /**
     * One dated metric series from `report_snapshots`. → `{metric_key, points}`
     *
     * The weekly capture writes these; nothing computes them on read, and there
     * is no way to backfill one — GoaT keeps no history, so a week not captured
     * is gone. Used by the duplication trend panel for
     * `duplication.<report>.<project>`.
     */
    trend(metricKey) {
      return getJSON('/api/trends/' + encodeURIComponent(metricKey));
    },

    /** One species' timeline across the runs of a list — Panel B (A-T5). */
    speciesHistory(list, scientificName, token) {
      return getJSON(
        listPath(list) + '/species/' + encodeURIComponent(scientificName) + '/history',
        { token: token });
    },
  };
})();
