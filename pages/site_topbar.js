/**
 * The site header, as the home page draws it, on the two tool pages.
 *
 * WHY THIS EXISTS. The tool pages carried a header of their own — a logo, a
 * two-item Prioritization/Duplication switcher and a theme button — so the
 * only way back to a report was the browser's Back button, and a reader who
 * arrived on a tool page directly had no route to the rest of the site at all.
 * This replaces that strip with the home page's: the same logo, the same
 * search, the same Report / Network / Tools menus.
 *
 * BUILT FROM config.js, LIKE THE HOME PAGE'S. There is no hand-written list of
 * pages here. `index.html` builds its nav from the same `pages` array, so a
 * report added there appears in both without a second edit — which is the
 * property that matters, since the two are separate implementations. They are
 * separate because unifying them means rewriting the home page's working
 * header, and the brief was the smallest change that puts the header on the
 * tools. If a third page ever needs this, unify then.
 *
 * LINKS STAY IN THIS TAB. The home page opens tools and reports in a new tab,
 * deliberately: it is the index, and you go back to it. A header that did the
 * same on every page would multiply tabs as you moved around — three clicks,
 * four tabs — so here the header switches the page you are on. One tab per
 * thing you opened from home, and no accumulation after that.
 *
 * LIGHT ONLY. The home page has no theme toggle and is not theme-aware: its
 * comment says the light values ARE the palette, and a dark-OS visitor gets it
 * as-is. The tool pages are dark-first with a toggle, so the two never matched.
 * The pages now pin `data-theme="light"`, which their own `:root[data-theme=
 * "light"]` block already supports, and this header uses those variables rather
 * than a palette of its own.
 */
(function () {
  'use strict';

  var FA = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';

  /* The home page loads Font Awesome; the tool pages never did. Injected rather
     than added to both pages' <head> so the dependency travels with the thing
     that needs it. Absent, the <i> elements render as nothing and the header is
     still usable — icons here are decoration, and every one of them sits beside
     its own text label. */
  function ensureFontAwesome() {
    if (document.querySelector('link[href*="font-awesome"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FA;
    document.head.appendChild(link);
  }

  /* Lifted from index.html so the two headers read identically. Colours come
     from the page's own variables — the tool pages define the same names — with
     the home page's literals as fallbacks for the three it does not have. */
  var STYLES = `
  .ebp-topbar{position:sticky; top:0; z-index:30; border-bottom:1px solid var(--line,#d6e3d9);
    background:rgba(255,255,255,.92); backdrop-filter:blur(8px);}
  .ebp-topbar .inner{display:flex; align-items:center; gap:12px; padding:13px 24px; flex-wrap:wrap;
    max-width:1180px; margin:0 auto;}
  .ebp-topbar .logo{display:flex; align-items:center; gap:9px; font-weight:800; font-size:14px;
    white-space:nowrap; color:var(--paper,#12211a); text-decoration:none;}
  .ebp-topbar .logo img{width:25px; height:25px; border-radius:7px; object-fit:cover; display:block;}
  .ebp-topbar .logo:hover{text-decoration:none;}
  .ebp-search-wrap{margin-left:14px; flex:1; max-width:420px; position:relative;}
  .ebp-search{display:flex; align-items:center; gap:8px; background:var(--ink,#f4f7f4);
    border:1px solid var(--line,#d6e3d9); border-radius:9px; padding:0 13px;
    color:var(--paper-mute,#5a6e62); font-size:13px;}
  .ebp-search:focus-within{border-color:var(--green-glow,#0d7846);}
  .ebp-search input{flex:1; background:transparent; border:none; outline:none;
    color:var(--paper,#12211a); font:inherit; font-size:13px; padding:9px 0;}
  .ebp-search input::placeholder{color:var(--paper-mute,#5a6e62);}
  .ebp-search .kbd{font-size:13px; color:var(--paper-mute,#5a6e62);
    border:1px solid var(--line,#d6e3d9); border-radius:5px; padding:1px 6px;
    background:var(--ink-2,#ffffff);}
  .ebp-results{position:absolute; left:0; right:0; top:calc(100% + 8px);
    background:var(--ink-2,#fff); border:1px solid var(--line,#d6e3d9); border-radius:12px;
    box-shadow:0 22px 54px rgba(18,33,26,.16); padding:8px; z-index:45;
    max-height:min(70vh,520px); overflow-y:auto; display:none;}
  .ebp-results.on{display:block;}
  .ebp-results .grp{font-size:13px; font-weight:800; letter-spacing:.04em; text-transform:uppercase;
    color:var(--paper-mute,#5a6e62); padding:8px 10px 4px;}
  .ebp-results .row{display:flex; align-items:center; gap:10px; padding:9px 11px; border-radius:8px;
    color:var(--paper-dim,#3e5548); font-size:13px; text-decoration:none; cursor:pointer;}
  .ebp-results .row:hover,.ebp-results .row.on{background:var(--ink-3,#eef5f0); color:var(--paper,#12211a);}
  .ebp-results .row .ri{width:20px; text-align:center; flex:none; color:var(--green-glow,#0d7846);}
  .ebp-results .none{padding:14px 12px; color:var(--paper-mute,#5a6e62); font-size:13px;}
  .ebp-topnav{margin-left:auto; display:flex; gap:3px; align-items:center;}
  .ebp-topnav .n{font-size:13px; padding:8px 13px; border-radius:8px; color:var(--paper-dim,#3e5548);
    cursor:pointer; white-space:nowrap; background:none; border:none; font-family:inherit;}
  .ebp-topnav .n:hover{color:var(--paper,#12211a);}
  .ebp-nav-menu{position:relative;}
  .ebp-nav-menu .n{display:inline-flex; align-items:center; gap:6px;}
  .ebp-nav-menu .caret{font-size:13px; opacity:.7;}
  .ebp-dropdown{position:absolute; right:0; top:calc(100% + 8px); background:var(--ink-2,#fff);
    border:1px solid var(--line,#d6e3d9); border-radius:12px; box-shadow:0 18px 44px rgba(18,33,26,.15);
    padding:7px; opacity:0; visibility:hidden; transform:translateY(-6px);
    transition:opacity .15s, transform .15s, visibility .15s; z-index:40;}
  .ebp-dropdown.wide{width:300px;}
  .ebp-dropdown.list{width:265px;}
  .ebp-nav-menu:hover .ebp-dropdown,.ebp-nav-menu:focus-within .ebp-dropdown{
    opacity:1; visibility:visible; transform:translateY(0);}
  .ebp-dd-item{display:flex; gap:11px; align-items:flex-start; padding:11px 12px; border-radius:9px;
    text-decoration:none;}
  a.ebp-dd-item:hover{background:var(--ink-3,#eef5f0); text-decoration:none;}
  .ebp-dd-item.off{opacity:.6; cursor:default;}
  /* The page you are on: marked, not dimmed. Sharing the .off styling here
     made the current tool read as unavailable.
     NOTE: no backticks anywhere in this block. It is a template literal, so a
     backtick ENDS it -- quoting a class name that way silently truncated the
     stylesheet and turned the rest into a tagged-template call. */
  .ebp-dd-item.here{background:var(--ink-3,#eef5f0); cursor:default;}
  /* The middot is the literal character, not a CSS escape: this block is a JS
     TEMPLATE LITERAL, where a backslash-zero is the NULL escape. Writing the
     unicode form put a NUL byte in the file and took the component down.
     Twice, in fact: re.sub's REPLACEMENT reads it as an octal group ref too. */
  .ebp-dd-item.here .dt::after{content:' · you are here'; font-weight:600;
    color:var(--paper-mute,#5a6e62);}
  .ebp-dd-item .di{width:32px; height:32px; border-radius:8px; display:flex; align-items:center;
    justify-content:center; font-size:14px; flex:none;}
  .ebp-dd-item.prio .di{background:rgba(122,209,81,.18); border:1px solid rgba(122,209,81,.45);
    color:var(--genus-ink,#2f6b1f);}
  .ebp-dd-item.dup .di{background:rgba(74,111,165,.13); border:1px solid rgba(74,111,165,.32);
    color:var(--gap,#4a6fa5);}
  .ebp-dd-item .dt{font-size:13px; font-weight:700; color:var(--paper,#12211a);}
  .ebp-dd-item .dd{font-size:13px; color:var(--paper-mute,#5a6e62); line-height:1.35;}
  .ebp-dd-item .soon{font-size:13px; font-weight:800; letter-spacing:.05em; text-transform:uppercase;
    color:var(--paper-mute,#5a6e62); border:1px dashed var(--line,#d6e3d9); border-radius:999px;
    padding:1px 7px; margin-left:6px; white-space:nowrap;}
  .ebp-dd-link{display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px;
    color:var(--paper-dim,#3e5548); font-size:13px; text-decoration:none;}
  .ebp-dd-link:hover{background:var(--ink-3,#eef5f0); color:var(--paper,#12211a); text-decoration:none;}
  .ebp-dd-link.on{background:var(--ink-3,#eef5f0); color:var(--paper,#12211a); font-weight:700;}
  .ebp-dd-link .dli{font-size:13px; width:20px; text-align:center; flex:none;
    color:var(--green-deep,#0d7846);}
  @media (max-width:900px){ .ebp-search-wrap{display:none;} }
  @media (max-width:640px){
    .ebp-topbar .inner{padding:11px 16px 9px; gap:8px;}
    .ebp-topnav{margin-left:0; width:100%; justify-content:space-between; gap:2px;}
    .ebp-topnav .n{padding:7px 10px; font-size:13px;}
    .ebp-nav-menu{position:static;}
    .ebp-dropdown{left:8px; right:8px; width:auto;}
  }
  `;

  /* index.html's own renaming, repeated because the source of truth for it is
     the home page's nav and not config.js. A category this does not know keeps
     its own name, so a new one still appears rather than silently vanishing. */
  var SHORT_LABEL = {
    'Assembly progress': 'Report',
    'Network visualization': 'Network',
    'Sequencing coordination toolset': 'Tools'
  };
  var TOOL_CATEGORY = 'Sequencing coordination toolset';

  function esc(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function catalogue() {
    return (typeof pages !== 'undefined' && Array.isArray(pages)) ? pages : [];
  }

  /* Same question index.html asks, and of the same authority: the one file that
     knows where the backend lives. A tool page whose backend is unset renders
     as "Soon" in this menu exactly as it does on the home page, rather than as
     a link into a dead end. */
  function backendConfigured() {
    try {
      /* A BARE identifier, exactly as index.html tests it, and NOT
         `window.EBPBackend`. services_backend.js declares its export as a
         top-level `const`, and a top-level const/let/class creates a binding in
         the global SCRIPT scope without ever becoming a property of `window` —
         only `var` and implicit globals do that. `window.EBPBackend` is
         therefore always undefined, which read here as "no backend configured"
         and rendered both tools in the Tools menu as an unclickable SOON, on a
         deployment whose backend was live. Found 2026-09-14. */
      return typeof EBPBackend !== 'undefined' && !!EBPBackend.backendBase();
    } catch (err) {
      return false;
    }
  }

  /* config.js paths are written from the site ROOT (`./pages/x.html`) because
     index.html sits there. This header runs from inside `pages/`, so the prefix
     has to come off — otherwise every link 404s at `pages/pages/x.html`. */
  function href(file) {
    return String(file || '').replace(/^\.\/pages\//, './').replace(/^pages\//, './');
  }

  function basename(path) {
    return String(path || '').split('/').pop().split('?')[0];
  }

  function isCurrent(file) {
    return basename(file) && basename(file) === basename(window.location.pathname);
  }

  function buildNav() {
    var configured = backendConfigured();
    var html = '';
    catalogue().forEach(function (cat) {
      var label = SHORT_LABEL[cat.category] || cat.category;
      var rich = cat.category === TOOL_CATEGORY;
      html += '<div class="ebp-nav-menu">'
        + '<span class="n" tabindex="0" role="button" aria-haspopup="true">' + esc(label)
        + ' <span class="caret" aria-hidden="true">▾</span></span>'
        + '<div class="ebp-dropdown ' + (rich ? 'wide' : 'list') + '">';
      (cat.pages || []).forEach(function (p) {
        var off = !!(p.requiresBackend && !configured);
        var here = isCurrent(p.file);
        if (rich) {
          var cls = p.file.indexOf('prioritization') > -1 ? 'prio' : 'dup';
          var inner = '<span class="di" aria-hidden="true"><i class="fas '
            + esc(p.icon || 'fa-circle') + '"></i></span>'
            + '<div><div class="dt">' + esc(p.name)
            + (off ? '<span class="soon">Soon</span>' : '') + '</div>'
            + '<div class="dd">' + esc(p.description || '') + '</div></div>';
          if (off) {
            html += '<div class="ebp-dd-item off ' + cls + '">' + inner + '</div>';
          } else if (here) {
            html += '<div class="ebp-dd-item here ' + cls + '" aria-current="page">'
              + inner + '</div>';
          } else {
            html += '<a class="ebp-dd-item ' + cls + '" href="' + esc(href(p.file)) + '">'
              + inner + '</a>';
          }
        } else {
          html += '<a class="ebp-dd-link' + (here ? ' on' : '') + '" href="' + esc(href(p.file)) + '"'
            + (here ? ' aria-current="page"' : '') + '>'
            + '<span class="dli" aria-hidden="true"><i class="fas '
            + esc(p.icon || 'fa-circle') + '"></i></span>'
            + esc(p.name) + '</a>';
        }
      });
      html += '</div></div>';
    });
    return html;
  }

  function flatPages() {
    var out = [];
    catalogue().forEach(function (cat) {
      (cat.pages || []).forEach(function (p) {
        out.push({ page: p, category: cat.category });
      });
    });
    return out;
  }

  function wireSearch(root) {
    var input = root.querySelector('#ebpSearchInput');
    var box = root.querySelector('#ebpResults');
    if (!input || !box) return;
    var rows = [];
    var active = -1;

    function close() {
      box.classList.remove('on');
      rows = [];
      active = -1;
    }

    function render(query) {
      var q = query.trim().toLowerCase();
      if (!q) return close();
      var configured = backendConfigured();
      var hits = flatPages().filter(function (entry) {
        return (entry.page.name + ' ' + (entry.page.description || '') + ' ' + entry.category)
          .toLowerCase().indexOf(q) > -1;
      });
      if (!hits.length) {
        box.innerHTML = '<div class="none">Nothing matches “' + esc(query.trim()) + '”.</div>';
        box.classList.add('on');
        rows = [];
        active = -1;
        return;
      }
      var html = '';
      var seen = '';
      hits.forEach(function (entry) {
        if (entry.category !== seen) {
          seen = entry.category;
          html += '<div class="grp">' + esc(SHORT_LABEL[seen] || seen) + '</div>';
        }
        var off = !!(entry.page.requiresBackend && !configured);
        html += '<a class="row" href="' + esc(href(entry.page.file)) + '" role="option">'
          + '<span class="ri" aria-hidden="true"><i class="fas '
          + esc(entry.page.icon || 'fa-circle') + '"></i></span>'
          + esc(entry.page.name)
          + (off ? ' <span class="soon">Soon</span>' : '') + '</a>';
      });
      box.innerHTML = html;
      box.classList.add('on');
      rows = Array.prototype.slice.call(box.querySelectorAll('.row'));
      active = -1;
    }

    function move(step) {
      if (!rows.length) return;
      if (active > -1) rows[active].classList.remove('on');
      active = (active + step + rows.length) % rows.length;
      rows[active].classList.add('on');
      rows[active].scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') { event.preventDefault(); move(1); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); move(-1); }
      else if (event.key === 'Enter' && active > -1) { event.preventDefault(); rows[active].click(); }
      else if (event.key === 'Escape') { close(); input.blur(); }
    });
    document.addEventListener('click', function (event) {
      if (!root.contains(event.target)) close();
    });
    /* "/" focuses the box, as it does on the home page — but never while the
       reader is typing somewhere else, which on THESE pages is a real risk: the
       prioritization form has a textarea people paste species names into. */
    document.addEventListener('keydown', function (event) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      var el = document.activeElement;
      var tag = el && el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (el && el.isContentEditable)) return;
      event.preventDefault();
      input.focus();
      input.select();
    });
  }

  function mount() {
    if (document.querySelector('.ebp-topbar')) return;
    ensureFontAwesome();

    var style = document.createElement('style');
    style.id = 'ebp-topbar-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);

    var bar = document.createElement('div');
    bar.className = 'ebp-topbar';
    bar.innerHTML = ''
      + '<div class="inner">'
      +   '<a class="logo" href="../index.html">'
      +     '<img src="../favicon.jpg" alt="">'
      +     '<span>Earth BioGenome</span>'
      +   '</a>'
      +   '<div class="ebp-search-wrap">'
      +     '<div class="ebp-search">'
      +       '<span aria-hidden="true"><i class="fas fa-magnifying-glass"></i></span>'
      +       '<input id="ebpSearchInput" type="search" placeholder="Search reports and tools…"'
      +         ' aria-label="Search reports and tools" autocomplete="off" role="combobox"'
      +         ' aria-expanded="false" aria-autocomplete="list" aria-controls="ebpResults">'
      +       '<span class="kbd">/</span>'
      +     '</div>'
      +     '<div class="ebp-results" id="ebpResults" role="listbox" aria-label="Search results"></div>'
      +   '</div>'
      +   '<nav class="ebp-topnav" aria-label="Main">' + buildNav() + '</nav>'
      + '</div>';

    document.body.insertBefore(bar, document.body.firstChild);
    wireSearch(bar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
