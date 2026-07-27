/**
 * RISE DTC free tools, the Claude pack page runtime.
 *
 * Pack pages do not load tools.js: there is no calculator, no gate engine and
 * no sticky verdict bar to run. What they DO share is the beacon, so the
 * contract below is a deliberate copy of RiseTools.beacon(), byte for byte in
 * shape: same endpoint, same anon key, same body keys, same keepalive fetch as
 * the ONLY primary send with sendBeacon reached only from the catch.
 *
 * That last point is not a style choice. Firing both double-counts every event
 * when the endpoint accepts both (verified live 2026-07-26, two identical
 * lm_events rows 150ms apart). Never "improve" this by firing both.
 *
 * A page wires itself with one call, after setting window.__lm_slug:
 *   RisePack.init({ slug: 'margin-interrogation', type: 'prompts' });
 */
(function () {
  'use strict';

  var BEACON_URL = window.__lm_beacon_url ||
    'https://bjbvqvzbzczjbatgmccb.supabase.co/functions/v1/lm-beacon';
  var SUPABASE_ANON_KEY = window.__supabase_anon_key ||
    'sb_publishable_Q-kfisfhqxXV5xiIhCduMQ_QSIflf4h';

  var state = { slug: null, type: null, email: null };

  /* ============================================================= identity */
  /* the same localStorage key the calculator pages use, so one reader is one
     session across the hub, a tool page and a pack page */

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

  function beacon(event, extra) {
    try {
      var q = new URLSearchParams(location.search);
      var body = {
        event_type: event,
        tool_type: 'pack',
        lm_slug: window.__lm_slug || ('rise-dtc-tools-claude-' + (state.slug || 'pack')),
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
      /* keepalive fetch is the ONLY primary send. sendBeacon cannot set the
         apikey header, so it silently 401s, and firing it alongside the fetch
         double-counts. It runs only when fetch itself throws. */
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

  function toolKey() { return 'claude-' + (state.slug || 'pack'); }

  /* ========================================================== clipboard */

  function writeClipboard(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done)['catch'](function () { legacy(text, done); });
      return;
    }
    legacy(text, done);
  }
  function legacy(text, done) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'absolute'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    done();
  }

  /* every copy button names the element it copies with data-copy="<id>" */
  function wireCopy() {
    var nodes = document.querySelectorAll('[data-copy]');
    Array.prototype.forEach.call(nodes, function (btn) {
      var original = btn.textContent;
      btn.addEventListener('click', function () {
        var src = document.getElementById(btn.getAttribute('data-copy'));
        if (!src) return;
        writeClipboard(src.textContent, function () {
          btn.textContent = 'Copied';
          btn.classList.add('is-done');
          setTimeout(function () {
            btn.textContent = original;
            btn.classList.remove('is-done');
          }, 2200);
        });
        beacon('copy_prompt', {
          answers: {
            tool: toolKey(),
            pack_item: state.slug,
            block: btn.getAttribute('data-block') || btn.getAttribute('data-copy')
          }
        });
      });
    });
  }

  /* ==================================================== SKILL.md download */
  /* A blob, so the file is the exact text printed on the page and there is no
     second copy of a SKILL.md anywhere in the repo to drift out of sync. */

  function wireDownload() {
    var nodes = document.querySelectorAll('[data-download]');
    Array.prototype.forEach.call(nodes, function (btn) {
      btn.addEventListener('click', function () {
        var src = document.getElementById(btn.getAttribute('data-download'));
        if (!src) return;
        var name = btn.getAttribute('data-filename') || 'SKILL.md';
        var blob = new Blob([src.textContent], { type: 'text/markdown;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url; a.download = name;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        beacon('download', {
          answers: { tool: toolKey(), pack_item: state.slug, file: name }
        });
      });
    });
  }

  /* ========================================================= sample run */

  function wireSample() {
    var nodes = document.querySelectorAll('details.sample');
    Array.prototype.forEach.call(nodes, function (d) {
      var fired = false;
      d.addEventListener('toggle', function () {
        if (!d.open || fired) return;
        fired = true;
        beacon('open_sample', { answers: { tool: toolKey(), pack_item: state.slug } });
      });
    });
  }

  /* ============================================================= capture */
  /* email_to_save, honest: everything on this page stays open either way. The
     email is only how the take-away copy reaches the reader. */

  function emailValid(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());
  }

  function wireCapture() {
    var form = document.getElementById('packForm');
    if (!form) return;
    var input = document.getElementById('packEmail');
    var btn = document.getElementById('packSend');
    var msg = document.getElementById('packMsg');

    function say(text, isErr) {
      if (!msg) return;
      msg.textContent = text;
      msg.classList.toggle('err', !!isErr);
    }

    function submit() {
      var email = input ? String(input.value || '').trim() : '';
      if (!emailValid(email)) {
        say('Enter a valid email and the pack goes out.', true);
        if (input) input.focus();
        return;
      }
      state.email = email;
      updateReader({ email: email });
      beacon('capture', {
        email: email,
        answers: {
          tool: toolKey(),
          pack_item: state.slug,
          requested: 'pack'
        }
      });
      say('On its way. It lands within a few minutes, from itsmattan@risedtc.com.', false);
      if (input) input.value = '';
    }

    if (btn) btn.addEventListener('click', submit);
    form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); submit(); }
      });
    }
  }

  /* ============================================================ CTA links */

  function wireCtas() {
    var nodes = document.querySelectorAll('[data-cta]');
    Array.prototype.forEach.call(nodes, function (node) {
      node.addEventListener('click', function () {
        beacon('cta_click', {
          answers: { target: node.getAttribute('data-cta'), tool: toolKey(), pack_item: state.slug }
        });
      });
    });
  }

  /* ================================================================= init */

  function init(opts) {
    opts = opts || {};
    state.slug = opts.slug || null;
    state.type = opts.type || null;
    document.body.classList.add('gate-email_to_save');

    wireCopy();
    wireDownload();
    wireSample();
    wireCapture();
    wireCtas();

    beacon('view', {
      answers: { tool: toolKey(), pack_item: state.slug, pack_type: state.type, gate_mode: 'email_to_save' }
    });
  }

  window.RisePack = { init: init, beacon: beacon, emailValid: emailValid };
})();
