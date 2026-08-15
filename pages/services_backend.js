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

  const listPath = (list) => '/api/lists/' + encodeURIComponent(list);

  return {
    BackendError: BackendError,
    backendBase: base,

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
