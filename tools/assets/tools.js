/**
 * RISE DTC free tools — shared runtime.
 *
 * Owns everything a tool page should never re-implement:
 *   - the lm-beacon contract (authenticated fetch, sendBeacon backup)
 *   - the gate_mode engine, read only from tools-config.js
 *   - en-US number formatting, hardcoded, never locale dependent
 *   - the sticky mobile verdict bar and the body padding that compensates it
 *   - copy link and the "email me this scorecard" capture UI
 *
 * Load order on every page:
 *   tools-config.js  ->  formulas-*.js  ->  tools.js  ->  page script
 *
 * A page wires itself with one call:
 *   RiseTools.init({
 *     slug: 'true-profit-per-order',
 *     getInputs:  function(){ return {...} },   // plain object, beacon payload
 *     getOutputs: function(){ return {...} },   // plain object, beacon payload
 *     onUnlock:   function(){}                  // optional, email_to_see only
 *   });
 */
(function () {
  'use strict';

  var BEACON_URL = window.__lm_beacon_url ||
    'https://bjbvqvzbzczjbatgmccb.supabase.co/functions/v1/lm-beacon';
  var SUPABASE_ANON_KEY = window.__supabase_anon_key ||
    'sb_publishable_Q-kfisfhqxXV5xiIhCduMQ_QSIflf4h';
  var CALC_THROTTLE_MS = 10000;

  var state = {
    slug: null,
    cfg: null,
    getInputs: function () { return {}; },
    getOutputs: function () { return {}; },
    onUnlock: null,
    lastCalcBeacon: 0,
    calcPending: null,
    email: null
  };

  /* ============================================================= identity */

  function readerIdentity() {
    var id = {};
    try { id = JSON.parse(localStorage.getItem('ivan.reader') || '{}') || {}; } catch (e) {}
    if (!id.session_id) {
      id.session_id = 's_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now().toString(36);
      try { localStorage.setItem('ivan.reader', JSON.stringify(id)); } catch (e) {}
    }
    return id;
  }
  function updateReader(patch) {
    var id = readerIdentity();
    for (var k in patch) { if (Object.prototype.hasOwnProperty.call(patch, k)) id[k] = patch[k]; }
    id.last_active = Date.now();
    try { localStorage.setItem('ivan.reader', JSON.stringify(id)); } catch (e) {}
    return id;
  }

  /* =============================================================== beacon */
  /* sendBeacon cannot set the apikey header, so it silently 401s. The
     authenticated fetch is what actually lands the event; sendBeacon stays as
     a best-effort unload-safe backup. Both fire, the edge function dedupes on
     session plus event. */

  function beacon(event, extra) {
    try {
      var q = new URLSearchParams(location.search);
      var body = {
        event_type: event,
        tool_type: 'calculator',
        lm_slug: window.__lm_slug || ('rise-dtc-tools-' + (state.slug || 'hub')),
        src: q.get('src') || 'direct',
        utm: {
          source: q.get('utm_source'),
          medium: q.get('utm_medium'),
          campaign: q.get('utm_campaign'),
          term: q.get('utm_term'),
          content: q.get('utm_content')
        },
        prospect_id: q.get('pid') || null,
        referrer: document.referrer || '',
        session_id: readerIdentity().session_id
      };
      if (extra) {
        for (var k in extra) { if (Object.prototype.hasOwnProperty.call(extra, k)) body[k] = extra[k]; }
      }
      var json = JSON.stringify(body);
      /* keepalive fetch is the ONLY primary send. Firing sendBeacon alongside
         it double-counts every event when the endpoint accepts both (verified
         live 2026-07-26: two identical lm_events rows 150ms apart). sendBeacon
         runs only as the fallback when fetch itself throws. */
      fetch(BEACON_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
        },
        body: json,
        keepalive: true
      })['catch'](function () {
        if (navigator.sendBeacon) {
          try { navigator.sendBeacon(BEACON_URL, new Blob([json], { type: 'application/json' })); } catch (e) {}
        }
      });
    } catch (e) {}
  }

  /* ========================================================== formatters */
  /* en-US, hardcoded. No navigator.language, no bare toLocaleString.
     Money rounds half away from zero and symmetrically, so -0.005 becomes
     -0.01 the way +0.005 becomes 0.01. Never use bare Math.round on signed
     money: it rounds -0.5 toward zero and quietly breaks loss cases. */

  function round2(x) {
    var n = Number(x);
    if (!isFinite(n)) return 0;
    var sign = n < 0 ? -1 : 1;
    return sign * (Math.round(Math.abs(n) * 100) / 100);
  }
  function roundDp(x, dp) {
    var n = Number(x);
    if (!isFinite(n)) return 0;
    var f = Math.pow(10, dp);
    var sign = n < 0 ? -1 : 1;
    return sign * (Math.round(Math.abs(n) * f) / f);
  }
  function group(intStr) {
    return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function money(x) {
    var v = round2(x);
    var parts = Math.abs(v).toFixed(2).split('.');
    return (v < 0 ? '-$' : '$') + group(parts[0]) + '.' + parts[1];
  }
  function money0(x) {
    var v = roundDp(x, 0);
    return (v < 0 ? '-$' : '$') + group(Math.abs(v).toFixed(0));
  }
  function percent(x, dp) {
    var d = (dp === undefined || dp === null) ? 1 : dp;
    var v = roundDp(x, d);
    var parts = Math.abs(v).toFixed(d).split('.');
    return (v < 0 ? '-' : '') + group(parts[0]) + (parts[1] ? '.' + parts[1] : '') + '%';
  }
  function ratio(x) {
    var v = roundDp(x, 2);
    var parts = Math.abs(v).toFixed(2).split('.');
    return (v < 0 ? '-' : '') + group(parts[0]) + '.' + parts[1];
  }
  /* Value fields are type="text" with inputmode="decimal", never type="number":
     a number input renders its value through the BROWSER locale, which is how
     comma decimals ("7,5") get onto the page. These two helpers are the only
     sanctioned way to read and write a field value. */
  function parseNum(v) {
    var s = String(v === null || v === undefined ? '' : v).trim().replace(/[^0-9+\-.,]/g, '');
    // en-US: the dot is the decimal mark. A comma is a thousands separator when
    // a dot is present, and a mistyped decimal mark when it is not.
    if (s.indexOf('.') >= 0) s = s.replace(/,/g, '');
    else s = s.replace(/,/g, '.');
    var n = parseFloat(s);
    return isFinite(n) ? n : NaN;
  }
  function numStr(n) {
    if (n === null || n === undefined || !isFinite(Number(n))) return '';
    // Number.prototype.toString is locale independent and always uses a dot.
    return String(Math.round(Number(n) * 1e6) / 1e6);
  }
  function clamp(n, min, max) {
    if (isFinite(min) && n < min) return min;
    if (isFinite(max) && n > max) return max;
    return n;
  }

  function count(x) {
    var n = Number(x) || 0;
    var sign = n < 0 ? -1 : 1;
    var v = sign * Math.round(Math.abs(n));
    return (v < 0 ? '-' : '') + group(Math.abs(v).toFixed(0));
  }

  /* ============================================================ gate mode */

  /* email_to_run is the AI class: the page stays fully visible and the email is
     what buys the model call. It never blurs anything, so it needs no branch
     beyond being a legal value here and a body class the stylesheet can read. */
  var GATES = { ungated: 1, email_to_save: 1, email_to_see: 1, email_to_run: 1 };

  function applyGate(gate) {
    var g = GATES[gate] ? gate : 'ungated';
    var b = document.body;
    b.classList.remove('gate-ungated', 'gate-email_to_save', 'gate-email_to_see', 'gate-email_to_run');
    b.classList.add('gate-' + g);
    return g;
  }
  function unlock() {
    document.body.classList.add('gate-unlocked');
    if (typeof state.onUnlock === 'function') { try { state.onUnlock(); } catch (e) {} }
  }
  function emailValid(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());
  }

  /* ================================================== sticky verdict bar */

  function syncBarPadding() {
    var bar = document.getElementById('mbar');
    var root = document.documentElement;
    if (!bar) {
      document.body.style.paddingBottom = '';
      root.style.scrollPaddingBottom = '';
      var c0 = document.querySelector('.col-inputs');
      if (c0) c0.style.paddingBottom = '';
      return;
    }
    var visible = window.getComputedStyle(bar).display !== 'none';
    if (!visible) {
      document.body.style.paddingBottom = '';
      root.style.scrollPaddingBottom = '';
      var c0 = document.querySelector('.col-inputs');
      if (c0) c0.style.paddingBottom = '';
      return;
    }
    // The bar is fixed to the bottom. Three things keep it off the inputs:
    // body padding so the document end clears it, scroll-padding so any
    // scroll-into-view stops short of it, and the reserve below the input
    // column so the last input row scrolls past it under a thumb.
    var reserve = bar.offsetHeight + 16;
    document.body.style.paddingBottom = reserve + 'px';
    root.style.scrollPaddingBottom = reserve + 'px';
    var col = document.querySelector('.col-inputs');
    if (col) col.style.paddingBottom = reserve + 'px';
  }

  function wireBar(anchorId) {
    var bar = document.getElementById('mbar');
    if (!bar) return;
    syncBarPadding();
    window.addEventListener('resize', syncBarPadding);
    if (window.ResizeObserver) {
      try { new ResizeObserver(syncBarPadding).observe(bar); } catch (e) {}
    }
    var anchor = anchorId ? document.getElementById(anchorId) : null;
    if (anchor && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { bar.classList.toggle('tucked', e.isIntersecting); });
      }, { threshold: 0.35 });
      io.observe(anchor);
    }
  }

  /* ====================================================== capture payload */

  function payload() {
    var out = {};
    try { out.inputs = state.getInputs() || {}; } catch (e) { out.inputs = {}; }
    try { out.outputs = state.getOutputs() || {}; } catch (e) { out.outputs = {}; }
    return out;
  }

  function fireCalcChange(force) {
    var now = Date.now();
    if (!force && now - state.lastCalcBeacon < CALC_THROTTLE_MS) {
      if (!state.calcPending) {
        state.calcPending = setTimeout(function () {
          state.calcPending = null;
          fireCalcChange(true);
        }, CALC_THROTTLE_MS - (now - state.lastCalcBeacon));
      }
      return;
    }
    state.lastCalcBeacon = now;
    var p = payload();
    beacon('calc_change', { answers: { inputs: p.inputs, outputs: p.outputs } });
  }

  /* =========================================================== scorecard */

  function wireScorecard() {
    var form = document.getElementById('scoreForm');
    if (!form) return;
    var input = document.getElementById('scoreEmail');
    var btn = document.getElementById('scoreSend');
    var msg = document.getElementById('scoreMsg');

    function say(text, isErr) {
      if (!msg) return;
      msg.textContent = text;
      msg.classList.toggle('err', !!isErr);
    }

    function submit() {
      var email = input ? String(input.value || '').trim() : '';
      if (!emailValid(email)) {
        say('Enter a valid email and the scorecard goes out.', true);
        if (input) input.focus();
        return;
      }
      var p = payload();
      state.email = email;
      updateReader({ email: email });
      beacon('capture', {
        email: email,
        answers: {
          inputs: p.inputs,
          outputs: p.outputs,
          gate_mode: state.cfg.gate,
          tool: state.slug,
          leaf_template_key: window.__lm_slug || ('rise-dtc-tools-' + state.slug)
        }
      });
      say('On its way to ' + email + '. It lands within a few minutes, from itsmattan@risedtc.com.', false);
      if (input) input.value = '';
      if (state.cfg.gate === 'email_to_see') unlock();
    }

    if (btn) btn.addEventListener('click', submit);
    form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });
    }
  }

  /* ============================================================ copy link */

  function wireCopyLink() {
    var btn = document.getElementById('copyLink');
    if (!btn) return;
    var original = btn.textContent;
    btn.addEventListener('click', function () {
      var url = location.origin + location.pathname;
      var inputs = {};
      try { inputs = state.getInputs() || {}; } catch (e) {}
      var q = [];
      Object.keys(inputs).forEach(function (k) {
        var v = inputs[k];
        if (v === null || v === undefined || v === '' || typeof v === 'object') return;
        q.push(encodeURIComponent(k) + '=' + encodeURIComponent(String(v)));
      });
      if (q.length) url += '?' + q.join('&');
      var done = function () {
        btn.textContent = 'Link copied';
        setTimeout(function () { btn.textContent = original; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done)['catch'](done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = url; ta.setAttribute('readonly', '');
        ta.style.position = 'absolute'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
      beacon('copy_link', { answers: { tool: state.slug } });
    });
  }

  /* ============================================================ CTA links */

  function wireCtas() {
    var nodes = document.querySelectorAll('[data-cta]');
    Array.prototype.forEach.call(nodes, function (node) {
      node.addEventListener('click', function () {
        beacon('cta_click', { answers: { target: node.getAttribute('data-cta'), tool: state.slug } });
      });
    });
  }

  /* ============================================== querystring prefill hook */

  function prefillFromQuery(names) {
    var q = new URLSearchParams(location.search);
    var out = {};
    (names || []).forEach(function (n) {
      var v = q.get(n);
      if (v !== null && v !== '' && isFinite(Number(v))) out[n] = Number(v);
    });
    return out;
  }

  /* ================================================================= init */

  function init(opts) {
    opts = opts || {};
    state.slug = opts.slug || null;
    var all = window.RISE_TOOLS_CONFIG || {};
    state.cfg = (state.slug && all[state.slug]) ? all[state.slug] : { gate: 'ungated', title: '', promise: '' };
    state.cfg.gate = applyGate(state.cfg.gate);
    if (opts.getInputs) state.getInputs = opts.getInputs;
    if (opts.getOutputs) state.getOutputs = opts.getOutputs;
    if (opts.onUnlock) state.onUnlock = opts.onUnlock;

    wireBar(opts.barAnchor || 'verdictCol');
    wireScorecard();
    wireCopyLink();
    wireCtas();

    // Every input in the calculator reports change, throttled to one beacon
    // per 10 seconds however hard the sliders are dragged.
    var fields = document.querySelectorAll('[data-calc-input]');
    Array.prototype.forEach.call(fields, function (f) {
      f.addEventListener('change', function () { fireCalcChange(false); });
    });

    beacon('view', { answers: { tool: state.slug, gate_mode: state.cfg.gate } });
    return state.cfg;
  }

  window.RiseTools = {
    init: init,
    beacon: beacon,
    money: money,
    money0: money0,
    percent: percent,
    ratio: ratio,
    count: count,
    round2: round2,
    roundDp: roundDp,
    parseNum: parseNum,
    numStr: numStr,
    clamp: clamp,
    emailValid: emailValid,
    unlock: unlock,
    syncBarPadding: syncBarPadding,
    prefillFromQuery: prefillFromQuery,
    config: function (slug) { return (window.RISE_TOOLS_CONFIG || {})[slug] || null; }
  };
})();
