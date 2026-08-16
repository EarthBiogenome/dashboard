/**
 * EBP backend client — the ONE place that knows where the backend lives.
 *
 * Every call to `ebp-backend` (prioritization, the per-list trend, and later
 * duplication) goes through this file. That is a deliberate rule from the
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
        detail || ('Backend returned ' + response.status), response.status, detail);
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
        detail || ('Backend returned ' + response.status), response.status, detail);
    }
    return response.json();
  }

  const listPath = (list) => '/api/lists/' + encodeURIComponent(list);
  const submissionPath = (id) => '/api/submissions/' + encodeURIComponent(id);

  return {
    BackendError: BackendError,
    backendBase: base,

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

    /** One species' timeline across the runs of a list — Panel B (A-T5). */
    speciesHistory(list, scientificName, token) {
      return getJSON(
        listPath(list) + '/species/' + encodeURIComponent(scientificName) + '/history',
        { token: token });
    },
  };
})();
