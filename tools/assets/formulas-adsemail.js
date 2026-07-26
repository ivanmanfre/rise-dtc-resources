/*
 * RISE DTC free tools — shared math library (ads + email half)
 *
 * Source of truth: phase1-spec-adsemail.json (11 tools).
 * Pure functions only. No DOM, no I/O, no globals beyond window.RISE_TOOLS.
 *
 * Contract per tool:
 *   RISE_TOOLS['<slug>'].compute(inputs) -> object
 * Returned object carries the DISPLAY-ROUNDED values under the exact names the
 * spec's test vectors assert, plus `raw` holding the same quantities at full
 * float precision, plus `display` as an alias of the rounded set.
 *
 * Rounding contract, pinned by the spec and identical in every tool:
 *   roundHalfUp(x, d) = Math.sign(x) * Math.round(Number((Math.abs(x) * 10**d).toFixed(6))) / 10**d
 * The toFixed(6) step is load-bearing: it repairs binary-float drift so that an
 * exact .xx5 boundary rounds away from zero. Without it 11475/5000 = 2.295
 * returns 2.29 instead of 2.30 (email-roi-calculator TV1).
 *
 * All internal math runs at full float precision. Rounding is applied ONCE, at
 * display. Nothing downstream is ever computed from a rounded number.
 */
(function () {
  'use strict';

  var g = typeof globalThis !== 'undefined' ? globalThis : this;
  if (typeof g.window === 'undefined') { g.window = g; }
  var root = g.window;
  if (!root.RISE_TOOLS) { root.RISE_TOOLS = {}; }
  var RISE_TOOLS = root.RISE_TOOLS;

  /* ------------------------------------------------------------------ *
   * Shared helpers
   * ------------------------------------------------------------------ */

  function roundHalfUp(x, d) {
    if (x === null || x === undefined) { return null; }
    if (typeof x !== 'number' || !isFinite(x)) { return null; }
    var p = Math.pow(10, d);
    return Math.sign(x) * Math.round(Number((Math.abs(x) * p).toFixed(6))) / p;
  }

  // Rounds only when the value is a real number; nulls stay null (never 0).
  function r2(x) { return roundHalfUp(x, 2); }
  function r0(x) { return roundHalfUp(x, 0); }
  function r3(x) { return roundHalfUp(x, 3); }
  function r4(x) { return roundHalfUp(x, 4); }

  // Rounds a [low, high] pair, preserving a null pair as null.
  function rPair(lo, hi, d) {
    if (lo === null && hi === null) { return null; }
    return [roundHalfUp(lo, d), roundHalfUp(hi, d)];
  }

  // "not entered" detection. Empty string, null and undefined are all absent.
  // 0 is a real, entered value everywhere in this library.
  function isBlank(v) {
    return v === null || v === undefined || v === '' ||
      (typeof v === 'number' && !isFinite(v));
  }

  // Numeric coercion for an optional field: blank -> fallback (default null).
  function num(v, fallback) {
    if (isBlank(v)) { return fallback === undefined ? null : fallback; }
    var n = typeof v === 'number' ? v : Number(v);
    return isFinite(n) ? n : (fallback === undefined ? null : fallback);
  }

  // Required numeric: blank -> 0.
  function n0(v) { return num(v, 0); }

  function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

  function safeDiv(a, b) {
    if (a === null || b === null || !isFinite(a) || !isFinite(b) || b === 0) { return null; }
    var q = a / b;
    return isFinite(q) ? q : null;
  }

  // Returns-adjusted contribution rate as a fraction of GROSS booked revenue.
  // Kept orders deliver full contribution; returned orders deliver none AND
  // cost rc of AOV to handle.
  function cmRateRa(cm, r, rc) {
    return (1 - r) * cm - r * rc;
  }

  // Formats a number for inline prose: drops a trailing .0, keeps real decimals.
  function fmtNum(x) {
    if (x === null || x === undefined || !isFinite(x)) { return ''; }
    return String(roundHalfUp(x, 2));
  }

  /* -- locale-tolerant money / percent parser ---------------------------- *
   * Pinned by spec-blended-roas.json. Rules, in order:
   *   1. trim; 2. strip currency symbols and every whitespace char (NBSP too);
   *   3. if BOTH '.' and ',' are present, the one that occurs LAST is the
   *      decimal separator and every instance of the other is deleted;
   *   4. a lone ',' is a DECIMAL separator only when exactly 1 or 2 digits
   *      follow it to the end of the string, otherwise it is a thousands
   *      separator and is deleted; 5. mirror rule for a lone '.';
   *   6. anything still non-numeric returns null — never NaN on screen.
   * Known and deliberate limit: '1.234' parses to 1234, not 1.234. That is the
   * standard heuristic and it is correct for a 2dp money field with min step 1.
   * Do NOT "fix" it into a locale bug.                                       */
  function parseAmount(v) {
    if (v === null || v === undefined) { return null; }
    if (typeof v === 'number') { return isFinite(v) ? v : null; }
    var s = String(v).trim()
      .replace(/[$\u20AC\u00A3\u00A5]/g, '')
      .replace(/[\s\u00A0\u202F]/g, '');
    if (s === '') { return null; }

    var lastDot = s.lastIndexOf('.');
    var lastComma = s.lastIndexOf(',');
    var dec = null;
    if (lastDot !== -1 && lastComma !== -1) {
      dec = Math.max(lastDot, lastComma);
    } else if (lastComma !== -1) {
      dec = /,\d{1,2}$/.test(s) ? lastComma : null;
    } else if (lastDot !== -1) {
      dec = /\.\d{1,2}$/.test(s) ? lastDot : null;
    }

    var head = (dec === null ? s : s.slice(0, dec)).replace(/[.,]/g, '');
    var tail = (dec === null ? '' : s.slice(dec + 1)).replace(/[.,]/g, '');
    var clean = dec === null ? head : head + '.' + tail;
    if (!/^[+-]?\d*\.?\d*$/.test(clean) || !/\d/.test(clean)) { return null; }
    var n = Number(clean);
    return isFinite(n) ? n : null;
  }

  /* -- statistics: A&S 7.1.26 erf, pinned by name and constants ---------- *
   * Abramowitz & Stegun 7.1.26, odd-extended. Max absolute error 1.5e-7.
   * Pinned here (rather than delegating to any engine builtin) so the
   * p-values in the test vectors are deterministic across JS engines.       */

  var AS_P  = 0.3275911;
  var AS_A1 = 0.254829592;
  var AS_A2 = -0.284496736;
  var AS_A3 = 1.421413741;
  var AS_A4 = -1.453152027;
  var AS_A5 = 1.061405429;

  function erf(x) {
    if (x < 0) { return -erf(-x); }
    var t = 1 / (1 + AS_P * x);
    var poly = ((((AS_A5 * t + AS_A4) * t + AS_A3) * t + AS_A2) * t + AS_A1) * t;
    return 1 - poly * Math.exp(-x * x);
  }

  function normalCdf(x) {
    return 0.5 * (1 + erf(x / Math.SQRT2));
  }

  var Z_CRITICAL = { 90: 1.645, 95: 1.96, 99: 2.576 };
  var Z_BETA_80_POWER = 0.8416;
  var Z_95 = 1.96;

  /* Wald 95% interval on a proportion. Returns [lo, hi] as fractions. */
  function waldCi(p, n) {
    if (p === null || n === null || n <= 0) { return null; }
    var half = Z_95 * Math.sqrt(p * (1 - p) / n);
    return [p - half, p + half];
  }

  /* ------------------------------------------------------------------ *
   * 1. mer-calculator
   * ------------------------------------------------------------------ */

  RISE_TOOLS['mer-calculator'] = {
    compute: function (inputs) {
      var i = inputs || {};
      var totalRevenue = n0(i.total_revenue);
      var totalAdSpend = n0(i.total_ad_spend);
      var newCustomerRevenue = num(i.new_customer_revenue, null);
      var cm = n0(i.cm_pct) / 100;
      var r = n0(i.return_rate_pct) / 100;
      var rcEntered = !isBlank(i.return_cost_pct);
      var rc = n0(i.return_cost_pct) / 100;
      var opex = n0(i.opex_period);

      var hasSpend = totalAdSpend > 0;
      var rate = cmRateRa(cm, r, rc);
      var rateUsable = rate > 0;

      var mer = hasSpend ? totalRevenue / totalAdSpend : null;
      var amer = (hasSpend && newCustomerRevenue !== null)
        ? newCustomerRevenue / totalAdSpend : null;

      var breakevenMer = rateUsable ? 1 / rate : null;

      // Range: the return rate is the hardest-guessed input, so the floor is
      // recomputed at +/- 5 percentage points. Endpoints are computed
      // independently, so one end may be a number while the other is null.
      var rLow = Math.max(0, r - 0.05);
      var rHigh = Math.min(1, r + 0.05);
      var rateLow = cmRateRa(cm, rLow, rc);
      var rateHigh = cmRateRa(cm, rHigh, rc);
      var breakevenMerLow = rateLow > 0 ? 1 / rateLow : null;
      var breakevenMerHigh = rateHigh > 0 ? 1 / rateHigh : null;

      var targetMerAllIn = (hasSpend && rateUsable)
        ? (1 + opex / totalAdSpend) / rate : null;

      var contributionAfterAds = totalRevenue * rate - totalAdSpend;

      var headroom = (mer !== null && breakevenMer !== null)
        ? mer - breakevenMer : null;
      var headroomPct = (hasSpend && rateUsable)
        ? (totalRevenue * rate / totalAdSpend - 1) * 100 : null;

      var verdictBand = null;
      if (mer !== null && breakevenMer !== null) {
        if (mer >= breakevenMer * 1.25) { verdictBand = 'comfortably above break-even'; }
        else if (mer >= breakevenMer) { verdictBand = 'above break-even, no cushion'; }
        else { verdictBand = 'below break-even'; }
      }

      var notes = [];
      if (!hasSpend) { notes.push('No ad spend in this period, so MER is undefined.'); }
      if (!rateUsable) { notes.push('No MER breaks even: after returns every order loses money.'); }
      if (!rcEntered) { notes.push('return handling cost not entered'); }

      var raw = {
        cm_rate_ra: rate,
        mer: mer,
        amer: amer,
        cm_rate_ra_pct: rate * 100,
        breakeven_mer: breakevenMer,
        breakeven_mer_low: breakevenMerLow,
        breakeven_mer_high: breakevenMerHigh,
        target_mer_all_in: targetMerAllIn,
        headroom: headroom,
        headroom_pct: headroomPct,
        contribution_after_ads: contributionAfterAds
      };

      var display = {
        mer: r2(mer),
        amer: r2(amer),
        cm_rate_ra_pct: r2(rate * 100),
        breakeven_mer: r2(breakevenMer),
        breakeven_mer_low: r2(breakevenMerLow),
        breakeven_mer_high: r2(breakevenMerHigh),
        breakeven_mer_range: rPair(breakevenMerLow, breakevenMerHigh, 2),
        target_mer_all_in: r2(targetMerAllIn),
        headroom: r2(headroom),
        headroom_pct: r2(headroomPct),
        contribution_after_ads: r2(contributionAfterAds),
        verdict_band: verdictBand
      };

      return Object.assign({}, display, { raw: raw, display: display, notes: notes });
    }
  };

  /* ------------------------------------------------------------------ *
   * 2. cpm-calculator
   * ------------------------------------------------------------------ */

  RISE_TOOLS['cpm-calculator'] = {
    compute: function (inputs) {
      var i = inputs || {};
      var mode = i.mode || 'cpm_from_spend';
      var adSpend = num(i.ad_spend, null);
      var impressions = num(i.impressions, null);
      var cpmIn = num(i.cpm, null);

      var outCpm = null;
      var outSpend = null;
      var outImpressions = null;
      var roundtripSpend = null;
      var roundtripCpm = null;
      var message = null;

      if (mode === 'cpm_from_spend') {
        outSpend = adSpend;
        outImpressions = impressions;
        if (impressions === null || impressions <= 0) {
          message = 'Enter impressions above 0.';
        } else {
          outCpm = n0(adSpend) / impressions * 1000;
        }
      } else if (mode === 'spend_from_cpm') {
        outCpm = cpmIn;
        outImpressions = impressions;
        outSpend = n0(cpmIn) * n0(impressions) / 1000;
      } else if (mode === 'impressions_from_spend') {
        outCpm = cpmIn;
        outSpend = adSpend;
        if (cpmIn === null || cpmIn <= 0) {
          message = 'Enter a CPM above 0.';
        } else {
          outImpressions = n0(adSpend) / cpmIn * 1000;
          // Round-trip check, computed from the UNROUNDED impressions figure.
          roundtripSpend = cpmIn * outImpressions / 1000;
        }
      }

      if (mode === 'cpm_from_spend' && outCpm !== null && impressions > 0) {
        roundtripSpend = outCpm * impressions / 1000;
      }
      if (mode === 'spend_from_cpm' && impressions > 0) {
        roundtripCpm = outSpend / impressions * 1000;
      }

      // affordable_cpm mode: a bid ceiling is a money decision, so it runs on
      // returns-adjusted contribution per order.
      var raco = null;
      var ordersPer1000 = null;
      var breakevenCpm = null;
      var breakevenCpmLow = null;
      var breakevenCpmHigh = null;

      if (mode === 'affordable_cpm') {
        var ctr = n0(i.ctr_pct) / 100;
        var cvr = n0(i.cvr_pct) / 100;
        var aov = n0(i.aov);
        var cm = n0(i.cm_pct) / 100;
        var r = n0(i.return_rate_pct) / 100;
        var rc = n0(i.return_cost_pct) / 100;

        raco = aov * cmRateRa(cm, r, rc);
        ordersPer1000 = 1000 * ctr * cvr;

        if (raco <= 0) {
          // No CPM is affordable: an order loses money before you pay for the
          // impression. Range suppressed rather than printed as a band of zeros.
          breakevenCpm = 0;
          message = 'No CPM is affordable: an order loses money before you pay for the impression.';
        } else if (ctr === 0 || cvr === 0) {
          breakevenCpm = 0;
          message = 'A funnel that converts nothing can afford nothing.';
        } else {
          breakevenCpm = ordersPer1000 * raco;
          // breakeven_cpm is linear in both CTR and CVR, so 0.8x0.8 and 1.2x1.2
          // are exact multipliers, not simulations.
          breakevenCpmLow = 0.64 * breakevenCpm;
          breakevenCpmHigh = 1.44 * breakevenCpm;
        }
      }

      var raw = {
        cpm: outCpm,
        ad_spend: outSpend,
        impressions: outImpressions,
        roundtrip_spend_from_cpm: roundtripSpend,
        roundtrip_cpm_from_spend: roundtripCpm,
        raco: raco,
        orders_per_1000_impressions: ordersPer1000,
        breakeven_cpm: breakevenCpm,
        breakeven_cpm_low: breakevenCpmLow,
        breakeven_cpm_high: breakevenCpmHigh
      };

      var display = {
        mode: mode,
        cpm: r2(outCpm),
        ad_spend: r2(outSpend),
        impressions: r0(outImpressions),
        roundtrip_spend_from_cpm: r2(roundtripSpend),
        roundtrip_cpm_from_spend: r2(roundtripCpm),
        raco: r2(raco),
        orders_per_1000_impressions: r4(ordersPer1000),
        breakeven_cpm: r2(breakevenCpm),
        breakeven_cpm_low: r2(breakevenCpmLow),
        breakeven_cpm_high: r2(breakevenCpmHigh),
        breakeven_cpm_range: rPair(breakevenCpmLow, breakevenCpmHigh, 2),
        message: message
      };

      return Object.assign({}, display, { raw: raw, display: display });
    }
  };

  /* ------------------------------------------------------------------ *
   * 3. cpc-calculator
   * ------------------------------------------------------------------ */

  RISE_TOOLS['cpc-calculator'] = {
    compute: function (inputs) {
      var i = inputs || {};
      var mode = i.mode || 'cpc_from_spend';
      var adSpend = num(i.ad_spend, null);
      var clicks = num(i.clicks, null);
      var cpcIn = num(i.cpc, null);

      var outCpc = null;
      var outSpend = null;
      var outClicks = null;
      var roundtripSpend = null;
      var roundtripClicks = null;
      var message = null;

      if (mode === 'cpc_from_spend') {
        outSpend = adSpend;
        outClicks = clicks;
        if (clicks === null || clicks <= 0) {
          message = 'Enter clicks above 0.';
        } else {
          outCpc = n0(adSpend) / clicks;
          roundtripSpend = outCpc * clicks;
        }
      } else if (mode === 'spend_from_cpc') {
        outCpc = cpcIn;
        outClicks = clicks;
        outSpend = n0(cpcIn) * n0(clicks);
      } else if (mode === 'clicks_from_spend') {
        outCpc = cpcIn;
        outSpend = adSpend;
        if (cpcIn === null || cpcIn <= 0) {
          message = 'Enter a CPC above 0.';
        } else {
          outClicks = n0(adSpend) / cpcIn;
          roundtripSpend = cpcIn * outClicks;
        }
      }
      if (mode === 'spend_from_cpc' && clicks > 0) {
        roundtripClicks = outSpend / cpcIn;
      }

      var raco = null;
      var maxCpc = null;
      var maxCpcLow = null;
      var maxCpcHigh = null;
      var impliedCpa = null;

      if (mode === 'max_cpc') {
        var cvr = n0(i.cvr_pct) / 100;
        var aov = n0(i.aov);
        var cm = n0(i.cm_pct) / 100;
        var r = n0(i.return_rate_pct) / 100;
        var rc = n0(i.return_cost_pct) / 100;

        raco = aov * cmRateRa(cm, r, rc);

        if (raco <= 0) {
          maxCpc = 0;
          message = 'No click price is affordable: an order loses money after returns.';
        } else if (cvr === 0) {
          maxCpc = 0;
          message = 'Traffic that never converts cannot justify any click price.';
        } else {
          maxCpc = cvr * raco;
          impliedCpa = maxCpc / cvr;
          // The two soft inputs fail together in the real world, so the band
          // moves CVR and return rate in the same direction at once.
          var rHigh = Math.min(1, r + 0.05);
          var rLow = Math.max(0, r - 0.05);
          maxCpcLow = (0.8 * cvr) * aov * cmRateRa(cm, rHigh, rc);
          maxCpcHigh = (1.2 * cvr) * aov * cmRateRa(cm, rLow, rc);
        }
      }

      var raw = {
        cpc: outCpc,
        ad_spend: outSpend,
        clicks: outClicks,
        roundtrip_spend_from_cpc: roundtripSpend,
        roundtrip_clicks_from_spend: roundtripClicks,
        raco: raco,
        max_cpc: maxCpc,
        max_cpc_low: maxCpcLow,
        max_cpc_high: maxCpcHigh,
        implied_cpa_at_max_cpc: impliedCpa
      };

      var display = {
        mode: mode,
        cpc: r2(outCpc),
        ad_spend: r2(outSpend),
        clicks: r0(outClicks),
        roundtrip_spend_from_cpc: r2(roundtripSpend),
        roundtrip_clicks_from_spend: r0(roundtripClicks),
        raco: r2(raco),
        max_cpc: r2(maxCpc),
        max_cpc_low: r2(maxCpcLow),
        max_cpc_high: r2(maxCpcHigh),
        max_cpc_range: rPair(maxCpcLow, maxCpcHigh, 2),
        implied_cpa_at_max_cpc: r2(impliedCpa),
        message: message
      };

      return Object.assign({}, display, { raw: raw, display: display });
    }
  };

  /* ------------------------------------------------------------------ *
   * 4. cpa-calculator
   * ------------------------------------------------------------------ */

  RISE_TOOLS['cpa-calculator'] = {
    compute: function (inputs) {
      var i = inputs || {};
      var adSpend = n0(i.ad_spend);
      var conversions = n0(i.conversions);
      var aov = n0(i.aov);
      var cm = n0(i.cm_pct) / 100;
      var r = n0(i.return_rate_pct) / 100;
      var rc = n0(i.return_cost_pct) / 100;
      var repeat12 = n0(i.repeat_orders_12mo);
      var window = n0(i.payback_window_months);

      var cpaActual = conversions > 0 ? adSpend / conversions : null;

      var aovUsable = aov > 0;
      var raco = aovUsable ? aov * cmRateRa(cm, r, rc) : null;
      var racoUsable = raco !== null && raco > 0;

      // Linear accrual: repeat orders are assumed to arrive evenly across the
      // year, so a 6-month window earns half of them. Stated on-page.
      var repeatInWindow = repeat12 * (window / 12);

      var maxCpaFirst = racoUsable ? raco : null;
      var maxCpaLtv = racoUsable ? raco * (1 + repeatInWindow) : null;

      var maxCpaLtvLow = null;
      var maxCpaLtvHigh = null;
      if (racoUsable) {
        var rHigh = Math.min(1, r + 0.05);
        var rLow = Math.max(0, r - 0.05);
        maxCpaLtvLow = aov * cmRateRa(cm, rHigh, rc) * (1 + 0.75 * repeatInWindow);
        maxCpaLtvHigh = aov * cmRateRa(cm, rLow, rc) * (1 + 1.25 * repeatInWindow);
      }

      var headroomFirst = (cpaActual !== null && maxCpaFirst !== null)
        ? maxCpaFirst - cpaActual : null;
      var headroomLtv = (cpaActual !== null && maxCpaLtv !== null)
        ? maxCpaLtv - cpaActual : null;

      var verdict = null;
      if (cpaActual !== null && maxCpaFirst !== null && maxCpaLtv !== null) {
        if (cpaActual <= maxCpaFirst) { verdict = 'pays back on the first order'; }
        else if (cpaActual <= maxCpaLtv) { verdict = 'pays back inside your window, and you have to fund the gap until then'; }
        else { verdict = 'does not pay back'; }
      }

      var notes = [];
      if (conversions <= 0) { notes.push('No orders yet, so CPA is undefined. The ceilings below still apply.'); }
      if (!racoUsable && aovUsable) { notes.push('Every order loses money after returns, so no acquisition cost is affordable.'); }
      if (isBlank(i.return_cost_pct)) { notes.push('return handling cost not entered'); }

      var raw = {
        cpa_actual: cpaActual,
        raco: raco,
        max_cpa_first_order: maxCpaFirst,
        repeat_in_window: repeatInWindow,
        max_cpa_ltv: maxCpaLtv,
        max_cpa_ltv_low: maxCpaLtvLow,
        max_cpa_ltv_high: maxCpaLtvHigh,
        headroom_first: headroomFirst,
        headroom_ltv: headroomLtv
      };

      var display = {
        cpa_actual: r2(cpaActual),
        raco: r2(raco),
        max_cpa_first_order: r2(maxCpaFirst),
        repeat_in_window: r3(repeatInWindow),
        max_cpa_ltv: r2(maxCpaLtv),
        max_cpa_ltv_low: r2(maxCpaLtvLow),
        max_cpa_ltv_high: r2(maxCpaLtvHigh),
        max_cpa_ltv_range: rPair(maxCpaLtvLow, maxCpaLtvHigh, 2),
        headroom_first: r2(headroomFirst),
        headroom_ltv: r2(headroomLtv),
        verdict: verdict
      };

      return Object.assign({}, display, { raw: raw, display: display, notes: notes });
    }
  };

  /* ------------------------------------------------------------------ *
   * 5. ctr-calculator
   * ------------------------------------------------------------------ */

  RISE_TOOLS['ctr-calculator'] = {
    compute: function (inputs) {
      var i = inputs || {};
      var impA = num(i.impressions_a, null);
      var clicksA = num(i.clicks_a, null);
      var impB = num(i.impressions_b, null);
      var clicksB = num(i.clicks_b, null);
      var conf = num(i.confidence_level, 95);

      var zCrit = Z_CRITICAL[conf] !== undefined ? Z_CRITICAL[conf] : Z_CRITICAL[95];
      var alpha = 1 - conf / 100;

      var warnings = [];
      var message = null;

      var nullResult = {
        ctr_a_pct: null, ctr_a_ci: null, ctr_b_pct: null, ctr_b_ci: null,
        lift_pct: null, z: null, p_value: null, significant: null,
        n_per_variant: null, z_critical: zCrit, message: null
      };

      if (impA === null || impA <= 0) {
        nullResult.message = 'Enter variant A impressions above 0.';
        return Object.assign({}, nullResult, {
          raw: { ctr_a: null, ctr_b: null, se: null, p_pool: null },
          display: nullResult, warnings: warnings
        });
      }

      var ctrA = n0(clicksA) / impA;
      var ciA = waldCi(ctrA, impA);

      // Variant B is present only when both of its fields carry real values.
      // Nothing is silently treated as 0.
      var hasB = impB !== null && impB > 0 && clicksB !== null;

      var ctrB = null, ciB = null, lift = null, pPool = null, se = null;
      var z = null, pValue = null, significant = null, nPerVariant = null;

      if (!hasB) {
        message = 'Add variant B to run the check.';
      } else {
        ctrB = clicksB / impB;
        ciB = waldCi(ctrB, impB);

        lift = ctrA > 0 ? (ctrB / ctrA - 1) * 100 : null;

        pPool = (clicksA + clicksB) / (impA + impB);
        se = Math.sqrt(pPool * (1 - pPool) * (1 / impA + 1 / impB));

        if (!(se > 0)) {
          message = 'Not enough variation to test.';
        } else {
          z = (ctrB - ctrA) / se;
          // Two-sided, normal approximation, no continuity correction.
          pValue = 2 * (1 - normalCdf(Math.abs(z)));
          significant = pValue < alpha;
        }

        if (ctrB === ctrA) {
          message = 'No observed difference to size a test against.';
        } else {
          var variance = ctrA * (1 - ctrA) + ctrB * (1 - ctrB);
          var delta = ctrB - ctrA;
          nPerVariant = Math.ceil(
            (Math.pow(zCrit + Z_BETA_80_POWER, 2) * variance) / (delta * delta)
          );
        }

        var thin = [
          ['A', clicksA, impA - clicksA],
          ['B', clicksB, impB - clicksB]
        ];
        for (var t = 0; t < thin.length; t++) {
          if (thin[t][1] < 10 || thin[t][2] < 10) {
            warnings.push('Variant ' + thin[t][0] + ' has fewer than 10 clicks or 10 non-clicks: the normal approximation is unreliable at this count.');
          }
        }
      }

      var raw = {
        ctr_a: ctrA,
        ctr_b: ctrB,
        p_pool: pPool,
        se: se,
        z: z,
        p_value: pValue,
        lift_pct: lift,
        n_per_variant: nPerVariant
      };

      var display = {
        ctr_a_pct: r2(ctrA * 100),
        ctr_a_ci: ciA === null ? null : [r2(ciA[0] * 100), r2(ciA[1] * 100)],
        ctr_b_pct: ctrB === null ? null : r2(ctrB * 100),
        ctr_b_ci: ciB === null ? null : [r2(ciB[0] * 100), r2(ciB[1] * 100)],
        lift_pct: r2(lift),
        z: r3(z),
        p_value: r4(pValue),
        significant: significant,
        n_per_variant: nPerVariant,
        z_critical: zCrit,
        message: message
      };

      return Object.assign({}, display, { raw: raw, display: display, warnings: warnings });
    }
  };

  /* ------------------------------------------------------------------ *
   * 6. conversion-rate-calculator
   * ------------------------------------------------------------------ */

  var CVR_SOURCES = ['paid_social', 'paid_search', 'email', 'direct_organic'];

  RISE_TOOLS['conversion-rate-calculator'] = {
    compute: function (inputs) {
      var i = inputs || {};

      var rows = [];
      var cvrPerSource = {};
      var cvrCiPerSource = {};
      var included = [];

      for (var s = 0; s < CVR_SOURCES.length; s++) {
        var key = CVR_SOURCES[s];
        var sessions = num(i[key + '_sessions'], null);
        var orders = num(i[key + '_orders'], 0);
        // A row is included only if its sessions field is filled and > 0.
        // An excluded row never becomes a 0%-converting row.
        var isIn = sessions !== null && sessions > 0;
        var row = {
          key: key,
          sessions: sessions,
          orders: isIn ? (orders === null ? 0 : orders) : null,
          included: isIn,
          cvr: isIn ? (orders === null ? 0 : orders) / sessions : null
        };
        rows.push(row);
        cvrPerSource[key] = isIn ? r2(row.cvr * 100) : null;
        if (isIn) {
          included.push(row);
          var ci = waldCi(row.cvr, sessions);
          cvrCiPerSource[key] = [r2(ci[0] * 100), r2(ci[1] * 100)];
        } else {
          cvrCiPerSource[key] = null;
        }
      }

      var totalSessions = 0;
      var totalOrders = 0;
      for (var k = 0; k < included.length; k++) {
        totalSessions += included[k].sessions;
        totalOrders += included[k].orders;
      }

      var message = null;
      if (included.length === 0) {
        message = 'Fill at least one traffic source.';
        var empty = {
          cvr_per_source: cvrPerSource,
          total_sessions: 0,
          total_orders: 0,
          blended_cvr_pct: null,
          blended_ci: null,
          spread_pp: null,
          best_minus_blended_pp: null,
          session_shares_pct: {},
          mix_shift_pct: null,
          low_order_rows: [],
          cvr_ci_per_source: cvrCiPerSource,
          message: message
        };
        return Object.assign({}, empty, {
          raw: { blended_cvr: null, total_sessions: 0, total_orders: 0 },
          display: empty
        });
      }

      var blendedCvr = totalOrders / totalSessions;
      var blendedCiRaw = waldCi(blendedCvr, totalSessions);

      var sessionShares = {};
      for (var m = 0; m < included.length; m++) {
        sessionShares[included[m].key] = r2(included[m].sessions / totalSessions * 100);
      }

      var spreadPp = null;
      var bestMinusBlendedPp = null;
      if (included.length >= 2) {
        var maxCvr = -Infinity, minCvr = Infinity;
        for (var q = 0; q < included.length; q++) {
          if (included[q].cvr > maxCvr) { maxCvr = included[q].cvr; }
          if (included[q].cvr < minCvr) { minCvr = included[q].cvr; }
        }
        spreadPp = (maxCvr - minCvr) * 100;
        bestMinusBlendedPp = (maxCvr - blendedCvr) * 100;
      } else {
        message = 'Add a second source to see what blending costs you.';
      }

      // Mix shift: what the blended rate becomes if paid social sessions grow
      // 20% and every per-source rate stays exactly where it is.
      var mixShift = null;
      var social = rows[0];
      if (social.included) {
        var extraSessions = 0.2 * social.sessions;
        mixShift = (totalOrders + extraSessions * social.cvr) /
          (totalSessions + extraSessions) * 100;
      }

      var lowOrderRows = [];
      for (var v = 0; v < included.length; v++) {
        if (included[v].orders < 30) { lowOrderRows.push(included[v].key); }
      }

      var raw = {
        blended_cvr: blendedCvr,
        total_sessions: totalSessions,
        total_orders: totalOrders,
        spread_pp: spreadPp,
        best_minus_blended_pp: bestMinusBlendedPp,
        mix_shift_pct: mixShift,
        cvr_per_source: (function () {
          var o = {};
          for (var a = 0; a < rows.length; a++) { o[rows[a].key] = rows[a].cvr; }
          return o;
        })()
      };

      var display = {
        cvr_per_source: cvrPerSource,
        total_sessions: totalSessions,
        total_orders: totalOrders,
        blended_cvr_pct: r2(blendedCvr * 100),
        blended_ci: blendedCiRaw === null ? null
          : [r2(blendedCiRaw[0] * 100), r2(blendedCiRaw[1] * 100)],
        spread_pp: r2(spreadPp),
        best_minus_blended_pp: r2(bestMinusBlendedPp),
        session_shares_pct: sessionShares,
        mix_shift_pct: r2(mixShift),
        low_order_rows: lowOrderRows,
        cvr_ci_per_source: cvrCiPerSource,
        message: message
      };

      return Object.assign({}, display, { raw: raw, display: display });
    }
  };

  /* ------------------------------------------------------------------ *
   * 7. meta-ads-budget-calculator
   * ------------------------------------------------------------------ */

  RISE_TOOLS['meta-ads-budget-calculator'] = {
    compute: function (inputs) {
      var i = inputs || {};
      var target = n0(i.target_new_customers);
      var shareRequested = n0(i.retargeting_share_pct);
      var shareUsed = clamp(shareRequested, 0, 40);
      var s = shareUsed / 100;

      var warnings = [];
      if (shareRequested > 40) {
        warnings.push('retargeting share clamped from ' + fmtNum(shareRequested) + '% to 40%');
      }
      if (shareUsed > 30) {
        warnings.push('retargeting above 30% of budget');
      }
      if (isBlank(i.return_cost_per_return)) {
        warnings.push('return handling cost not entered');
      }

      // orders per dollar of spend, per segment
      function kFor(cpm, ctrPct, cvrPct) {
        var c = num(cpm, null);
        if (c === null || c <= 0) { return null; }  // unusable segment, not infinite efficiency
        return 1000 * (n0(ctrPct) / 100) * (n0(cvrPct) / 100) / c;
      }

      var kP = kFor(i.prospecting_cpm, i.prospecting_ctr_pct, i.prospecting_cvr_pct);
      // At share 0 the retargeting fields are ignored entirely, even if filled.
      var kR = s > 0 ? kFor(i.retargeting_cpm, i.retargeting_ctr_pct, i.retargeting_cvr_pct) : null;

      var kBlend = (1 - s) * (kP === null ? 0 : kP) + s * (kR === null ? 0 : kR);

      var totalBudget = kBlend > 0 ? target / kBlend : null;

      var budgetProspecting = totalBudget === null ? null : totalBudget * (1 - s);
      var budgetRetargeting = totalBudget === null ? null : totalBudget * s;

      // Orders are computed from the UNROUNDED budgets. Rounding the budget
      // first would break the 186.48 + 113.52 = 300.00 reconciliation.
      var ordersProspecting = budgetProspecting === null ? null
        : budgetProspecting * (kP === null ? 0 : kP);
      var ordersRetargeting = budgetRetargeting === null ? null
        : budgetRetargeting * (kR === null ? 0 : kR);

      var cacProspecting = (kP !== null && kP > 0) ? 1 / kP : null;
      var cacRetargeting = (s > 0 && kR !== null && kR > 0) ? 1 / kR : null;
      var blendedCac = kBlend > 0 ? 1 / kBlend : null;

      var contribution = n0(i.contribution_per_order);
      var r = n0(i.return_rate_pct) / 100;
      var returnCost = n0(i.return_cost_per_return);
      var raco = contribution * (1 - r) - returnCost * r;

      var maxAffordable = target * raco;
      var netFirstOrder = totalBudget === null ? null : maxAffordable - totalBudget;

      // Budget is inversely proportional to both CVRs, so /1.2 and /0.8 are
      // exact, not simulated.
      var budgetLow = totalBudget === null ? null : totalBudget / 1.2;
      var budgetHigh = totalBudget === null ? null : totalBudget / 0.8;
      var netLow = budgetLow === null ? null : maxAffordable - budgetLow;
      var netHigh = budgetHigh === null ? null : maxAffordable - budgetHigh;

      if (kBlend <= 0) {
        warnings.push('At least one segment needs a CPM, CTR and conversion rate above 0.');
      }
      if (raco <= 0) {
        warnings.push('no budget is affordable at these unit economics');
      }

      var raw = {
        k_p: kP, k_r: kR, k_blend: kBlend,
        total_budget: totalBudget,
        budget_prospecting: budgetProspecting,
        budget_retargeting: budgetRetargeting,
        orders_prospecting: ordersProspecting,
        orders_retargeting: ordersRetargeting,
        cac_prospecting: cacProspecting,
        cac_retargeting: cacRetargeting,
        blended_cac: blendedCac,
        raco: raco,
        max_affordable_budget: maxAffordable,
        net_first_order: netFirstOrder,
        budget_low: budgetLow, budget_high: budgetHigh,
        net_low: netLow, net_high: netHigh
      };

      var display = {
        retarget_share_used_pct: r2(shareUsed),
        cac_prospecting: r2(cacProspecting),
        cac_retargeting: r2(cacRetargeting),
        blended_cac: r2(blendedCac),
        total_budget: r2(totalBudget),
        budget_prospecting: r2(budgetProspecting),
        budget_retargeting: r2(budgetRetargeting),
        orders_prospecting: r2(ordersProspecting),
        orders_retargeting: r2(ordersRetargeting),
        raco: r2(raco),
        max_affordable_budget: r2(maxAffordable),
        net_first_order: r2(netFirstOrder),
        budget_low: r2(budgetLow),
        budget_high: r2(budgetHigh),
        budget_range: rPair(budgetLow, budgetHigh, 2),
        net_low: r2(netLow),
        net_high: r2(netHigh),
        net_range: rPair(netLow, netHigh, 2),
        warnings: warnings
      };

      return Object.assign({}, display, { raw: raw, display: display });
    }
  };

  /* ------------------------------------------------------------------ *
   * 8. google-ads-budget-calculator
   * ------------------------------------------------------------------ */

  RISE_TOOLS['google-ads-budget-calculator'] = {
    compute: function (inputs) {
      var i = inputs || {};
      var target = n0(i.target_new_customers);
      var brandSearches = n0(i.brand_monthly_searches);
      var brandCtr = n0(i.brand_expected_ctr_pct) / 100;
      var brandCpc = n0(i.brand_cpc);
      var brandCvr = n0(i.brand_cvr_pct) / 100;

      var nonbrandCpcRaw = num(i.nonbrand_cpc, null);
      var nonbrandCvrRaw = num(i.nonbrand_cvr_pct, null);
      var nonbrandCvr = nonbrandCvrRaw === null ? null : nonbrandCvrRaw / 100;

      var brandClicksMax = brandSearches * brandCtr;
      var brandOrdersMax = brandClicksMax * brandCvr;
      var brandOrders = Math.min(brandOrdersMax, target);
      // Brand clicks are bought before non-brand: cheaper per order in every
      // account where this tool is worth opening.
      var brandClicksUsed = brandCvr > 0 ? brandOrders / brandCvr : 0;
      var brandBudget = brandClicksUsed * brandCpc;
      var remainingOrders = Math.max(0, target - brandOrders);

      var nonbrandClicks = null;
      var nonbrandBudget = null;
      var message = null;

      if (remainingOrders === 0) {
        // Short-circuit BEFORE any division, so empty non-brand fields can
        // never divide by zero.
        nonbrandClicks = 0;
        nonbrandBudget = 0;
      } else if (nonbrandCvr === null || nonbrandCvr <= 0) {
        message = 'Non-brand conversion rate must be above 0 to reach the remaining ' +
          fmtNum(remainingOrders) + ' customers.';
      } else {
        nonbrandClicks = remainingOrders / nonbrandCvr;
        nonbrandBudget = nonbrandClicks * n0(nonbrandCpcRaw);
      }

      var totalBudget = nonbrandBudget === null ? null : brandBudget + nonbrandBudget;

      var brandCac = brandCvr > 0 ? brandCpc / brandCvr : null;
      var nonbrandCac = (nonbrandCpcRaw !== null && nonbrandCvr !== null && nonbrandCvr > 0)
        ? nonbrandCpcRaw / nonbrandCvr : null;
      var blendedCacSplit = (totalBudget !== null && target > 0)
        ? totalBudget / target : null;

      // The blended-vs-split comparison is suppressed entirely whenever
      // total_budget is null or the non-brand fields are empty. It is never
      // printed against a null.
      var nonbrandFieldsFilled = nonbrandCpcRaw !== null && nonbrandCvrRaw !== null;
      var naiveBudget = null, naiveGap = null, naiveErrorPct = null;
      if (totalBudget !== null && nonbrandFieldsFilled) {
        var naiveCpc = (brandCpc + nonbrandCpcRaw) / 2;
        var naiveCvr = (n0(i.brand_cvr_pct) + nonbrandCvrRaw) / 2;
        if (naiveCvr > 0 && totalBudget > 0) {
          naiveBudget = target * naiveCpc / (naiveCvr / 100);
          naiveGap = totalBudget - naiveBudget;
          naiveErrorPct = (naiveBudget / totalBudget - 1) * 100;
        }
      }

      var contribution = n0(i.contribution_per_order);
      var r = n0(i.return_rate_pct) / 100;
      var returnCost = n0(i.return_cost_per_return);
      var raco = contribution * (1 - r) - returnCost * r;
      var maxAffordable = target * raco;
      var netFirstOrder = totalBudget === null ? null : maxAffordable - totalBudget;

      // Only the non-brand budget moves: brand CPC and brand CVR are the
      // best-known numbers in any account.
      var totalLow = nonbrandBudget === null ? null : brandBudget + nonbrandBudget / 1.2;
      var totalHigh = nonbrandBudget === null ? null : brandBudget + nonbrandBudget / 0.8;

      var capNotice = null;
      if (brandOrdersMax < target) {
        capNotice = 'Brand search volume caps you at ' + fmtNum(brandOrdersMax) +
          ' orders; the other ' + fmtNum(remainingOrders) + ' must come from non-brand.';
      }

      var raw = {
        brand_clicks_max: brandClicksMax,
        brand_orders_max: brandOrdersMax,
        brand_orders: brandOrders,
        brand_clicks_used: brandClicksUsed,
        brand_budget: brandBudget,
        remaining_orders: remainingOrders,
        nonbrand_clicks: nonbrandClicks,
        nonbrand_budget: nonbrandBudget,
        total_budget: totalBudget,
        brand_cac: brandCac,
        nonbrand_cac: nonbrandCac,
        blended_cac_split: blendedCacSplit,
        naive_budget: naiveBudget,
        naive_gap: naiveGap,
        naive_error_pct: naiveErrorPct,
        raco: raco,
        max_affordable_budget: maxAffordable,
        net_first_order: netFirstOrder,
        total_low: totalLow,
        total_high: totalHigh
      };

      var display = {
        brand_clicks_max: r2(brandClicksMax),
        brand_orders_max: r2(brandOrdersMax),
        brand_orders: r2(brandOrders),
        brand_clicks_used: r2(brandClicksUsed),
        brand_budget: r2(brandBudget),
        remaining_orders: r2(remainingOrders),
        nonbrand_clicks: r2(nonbrandClicks),
        nonbrand_budget: r2(nonbrandBudget),
        total_budget: r2(totalBudget),
        total_budget_range: rPair(totalLow, totalHigh, 2),
        brand_cac: r2(brandCac),
        nonbrand_cac: r2(nonbrandCac),
        blended_cac_split: r2(blendedCacSplit),
        naive_budget: r2(naiveBudget),
        naive_gap: r2(naiveGap),
        naive_error_pct: r2(naiveErrorPct),
        raco: r2(raco),
        max_affordable_budget: r2(maxAffordable),
        net_first_order: r2(netFirstOrder),
        total_low: r2(totalLow),
        total_high: r2(totalHigh),
        cap_notice: capNotice,
        message: message
      };

      return Object.assign({}, display, { raw: raw, display: display });
    }
  };

  /* ------------------------------------------------------------------ *
   * 9. email-roi-calculator
   * ------------------------------------------------------------------ */

  RISE_TOOLS['email-roi-calculator'] = {
    compute: function (inputs) {
      var i = inputs || {};
      var flow = n0(i.flow_revenue);
      var campaign = n0(i.campaign_revenue);
      var platform = n0(i.platform_cost);
      var agency = n0(i.agency_time_cost);
      var newSubs = n0(i.new_subscribers);
      var sac = n0(i.subscriber_acquisition_cost);
      var cm = n0(i.cm_pct) / 100;
      var r = n0(i.return_rate_pct) / 100;
      var rc = n0(i.return_cost_pct) / 100;

      var gross = flow + campaign;
      var rate = cmRateRa(cm, r, rc);
      var netAfterReturns = gross * (1 - r);
      var contribution = gross * rate;

      var acquisitionCost = newSubs * sac;
      var runCost = platform + agency;
      var totalCost = runCost + acquisitionCost;

      // The headline ratio the category quotes, printed so the gap is visible
      // on the same screen as the honest one.
      var roiNaive = runCost > 0 ? gross / runCost : null;
      var roiHonest = totalCost > 0 ? contribution / totalCost : null;
      var netProfit = contribution - totalCost;

      var flowShare = gross > 0 ? flow / gross * 100 : null;
      var campaignShare = gross > 0 ? campaign / gross * 100 : null;

      var hasSubs = newSubs > 0;
      var revenuePerNewSub = hasSubs ? gross / newSubs : null;
      var contributionPerNewSub = hasSubs ? contribution / newSubs : null;
      var breakevenSac = hasSubs ? (contribution - runCost) / newSubs : null;

      var rHigh = Math.min(1, r + 0.05);
      var rLow = Math.max(0, r - 0.05);
      var costLow = runCost + newSubs * sac * 1.4;
      var costHigh = runCost + newSubs * sac * 0.6;
      var roiLow = costLow > 0 ? gross * cmRateRa(cm, rHigh, rc) / costLow : null;
      var roiHigh = costHigh > 0 ? gross * cmRateRa(cm, rLow, rc) / costHigh : null;

      var notes = [];
      if (!hasSubs) {
        notes.push('Enter new subscribers to see what each one costs and earns.');
        notes.push('The ROI above looks stable only because acquisition cost is unfilled.');
      }
      if (runCost === 0) { notes.push('No platform or time cost entered.'); }
      if (totalCost === 0) { notes.push('Email cannot have a return on zero cost.'); }
      if (breakevenSac !== null && breakevenSac < 0) {
        notes.push('negative: email contribution does not even cover platform and time before you buy a single subscriber');
      }
      if (isBlank(i.return_cost_pct)) { notes.push('return handling cost not entered'); }

      var raw = {
        gross_email_revenue: gross,
        cm_rate_ra: rate,
        net_revenue_after_returns: netAfterReturns,
        returns_adjusted_contribution: contribution,
        acquisition_cost: acquisitionCost,
        total_cost: totalCost,
        roi_naive_x: roiNaive,
        roi_honest_x: roiHonest,
        net_profit: netProfit,
        flow_share_pct: flowShare,
        campaign_share_pct: campaignShare,
        revenue_per_new_subscriber: revenuePerNewSub,
        contribution_per_new_subscriber: contributionPerNewSub,
        breakeven_sac: breakevenSac,
        roi_low_x: roiLow,
        roi_high_x: roiHigh
      };

      var display = {
        gross_email_revenue: r2(gross),
        net_revenue_after_returns: r2(netAfterReturns),
        returns_adjusted_contribution: r2(contribution),
        acquisition_cost: r2(acquisitionCost),
        total_cost: r2(totalCost),
        roi_naive_x: r2(roiNaive),
        roi_honest_x: r2(roiHonest),
        roi_range: rPair(roiLow, roiHigh, 2),
        roi_low_x: r2(roiLow),
        roi_high_x: r2(roiHigh),
        net_profit: r2(netProfit),
        flow_share_pct: r2(flowShare),
        campaign_share_pct: r2(campaignShare),
        revenue_per_new_subscriber: r2(revenuePerNewSub),
        contribution_per_new_subscriber: r2(contributionPerNewSub),
        breakeven_sac: r2(breakevenSac)
      };

      return Object.assign({}, display, { raw: raw, display: display, notes: notes });
    }
  };

  /* ------------------------------------------------------------------ *
   * 10. email-list-value-calculator
   * ------------------------------------------------------------------ */

  RISE_TOOLS['email-list-value-calculator'] = {
    compute: function (inputs) {
      var i = inputs || {};
      var listSize = n0(i.list_size);
      var activeSharePct = n0(i.active_share_pct);
      var flow90 = n0(i.flow_revenue_90d);
      var campaign90 = n0(i.campaign_revenue_90d);
      var cm = n0(i.cm_pct) / 100;
      var r = n0(i.return_rate_pct) / 100;
      var rc = n0(i.return_cost_pct) / 100;
      var winbackPts = n0(i.winback_uplift_pts);

      var activeSubscribers = listSize * activeSharePct / 100;
      var inactiveSubscribers = listSize - activeSubscribers;
      var gross90 = flow90 + campaign90;
      var rate = cmRateRa(cm, r, rc);
      var contribution90 = gross90 * rate;

      var hasList = listSize > 0;
      var hasActive = activeSubscribers > 0;

      var valuePerSubscriberNaive = hasList ? gross90 / listSize : null;
      var valuePerActive = hasActive ? gross90 / activeSubscribers : null;
      var contributionPerActive = hasActive ? contribution90 / activeSubscribers : null;
      // 90 days scaled by 365/90, with no seasonality. Said on the page.
      var annualisedPerActive = contributionPerActive === null
        ? null : contributionPerActive * (365 / 90);

      var flowShare = gross90 > 0 ? flow90 / gross90 * 100 : null;
      var campaignShare = gross90 > 0 ? campaign90 / gross90 * 100 : null;

      var scenarioSharePct = Math.min(100, activeSharePct + winbackPts);
      var scenarioActive = listSize * scenarioSharePct / 100;

      var scenarioGross = null, scenarioContribution = null, upliftContribution = null;
      if (valuePerActive !== null) {
        // Reactivated subscribers assumed to monetise like today's actives.
        // That is a ceiling, not a forecast, which is why the band exists.
        scenarioGross = valuePerActive * scenarioActive;
        scenarioContribution = scenarioGross * rate;
        upliftContribution = scenarioContribution - contribution90;
      }
      var upliftLow = upliftContribution === null ? null : 0.5 * upliftContribution;
      var upliftHigh = upliftContribution === null ? null : 1.0 * upliftContribution;

      var capNotice = null;
      if (activeSharePct + winbackPts > 100) {
        capNotice = 'Active share capped at 100%: your realistic uplift is ' +
          fmtNum(100 - activeSharePct) + ' points, not ' + fmtNum(winbackPts) + '.';
      }

      var notes = [];
      if (!hasActive) {
        notes.push('No active subscribers, so value per active subscriber is undefined.');
      }
      if (isBlank(i.return_cost_pct)) { notes.push('return handling cost not entered'); }

      var raw = {
        active_subscribers: activeSubscribers,
        inactive_subscribers: inactiveSubscribers,
        gross_90d: gross90,
        cm_rate_ra: rate,
        contribution_90d: contribution90,
        value_per_subscriber_naive: valuePerSubscriberNaive,
        value_per_active_subscriber: valuePerActive,
        contribution_per_active: contributionPerActive,
        annualised_contribution_per_active: annualisedPerActive,
        flow_share_pct: flowShare,
        campaign_share_pct: campaignShare,
        scenario_active_share_pct: scenarioSharePct,
        scenario_active_subscribers: scenarioActive,
        scenario_gross: scenarioGross,
        scenario_contribution: scenarioContribution,
        uplift_contribution: upliftContribution,
        uplift_low: upliftLow,
        uplift_high: upliftHigh
      };

      var display = {
        active_subscribers: r0(activeSubscribers),
        inactive_subscribers: r0(inactiveSubscribers),
        gross_90d: r2(gross90),
        contribution_90d: r2(contribution90),
        value_per_subscriber_naive: r2(valuePerSubscriberNaive),
        value_per_active_subscriber: r2(valuePerActive),
        contribution_per_active: r2(contributionPerActive),
        annualised_contribution_per_active: r2(annualisedPerActive),
        flow_share_pct: r2(flowShare),
        campaign_share_pct: r2(campaignShare),
        scenario_active_share_pct: r2(scenarioSharePct),
        scenario_contribution: r2(scenarioContribution),
        uplift_contribution: r2(upliftContribution),
        uplift_low: r2(upliftLow),
        uplift_high: r2(upliftHigh),
        uplift_range: rPair(upliftLow, upliftHigh, 2),
        cap_notice: capNotice
      };

      return Object.assign({}, display, { raw: raw, display: display, notes: notes });
    }
  };

  /* ------------------------------------------------------------------ *
   * 11. email-flow-scorecard
   * ------------------------------------------------------------------ */

  // Canonical order is fixed and is what breaks ties in top_3_missing, so the
  // output never depends on object key order.
  var FLOW_ORDER = [
    'welcome', 'abandoned_cart', 'browse_abandon', 'post_purchase',
    'winback', 'sunset', 'back_in_stock', 'vip'
  ];

  // Weight = purchase intent at the moment the flow fires, multiplied by how
  // many people trigger it. Sums to exactly 100, asserted by TV2.
  var FLOW_WEIGHTS = {
    welcome: 20,
    abandoned_cart: 22,
    browse_abandon: 12,
    post_purchase: 14,
    winback: 10,
    sunset: 8,
    back_in_stock: 8,
    vip: 6
  };

  var FLOW_FACTOR = { absent: 0.0, partial: 0.5, live: 1.0 };

  var FLOW_IMPACT = {
    welcome: 'Every new subscriber lands with nothing waiting for them, at the one moment they are most willing to buy.',
    abandoned_cart: 'Shoppers who reached checkout and stopped hear nothing back, and that is the highest intent moment email ever gets.',
    browse_abandon: 'People who looked at a product and left are never followed up, so the largest warm audience on the site goes unserved.',
    post_purchase: 'Buyers get no fit or care guidance after the order, which costs repeat purchases and sends avoidable returns back to you.',
    winback: 'Customers who already bought once are not asked to come back, and they are the cheapest revenue on the list.',
    sunset: 'Unengaged subscribers keep receiving mail, which drags the inbox placement of every other flow down with it.',
    back_in_stock: 'Restock moments pass without an alert, so demand you already earned gets spent somewhere else.',
    vip: 'Your best customers are treated exactly like everyone else, so nothing protects the top of the retention curve.'
  };

  var GRADE_BANDS = [
    [85, 'complete'],
    [70, 'solid with gaps at the edges'],
    [50, 'core covered, revenue leaking'],
    [30, 'half the engine missing'],
    [-Infinity, 'flows are not running']
  ];

  RISE_TOOLS['email-flow-scorecard'] = {
    compute: function (inputs) {
      var i = inputs || {};

      var score = 0;
      var scoreLow = 0;
      var scoreHigh = 0;
      var factorSum = 0;
      var anyPartial = false;
      var missingPerFlow = {};
      var missingList = [];

      for (var n = 0; n < FLOW_ORDER.length; n++) {
        var flow = FLOW_ORDER[n];
        var status = i[flow + '_status'];
        if (FLOW_FACTOR[status] === undefined) { status = 'absent'; }
        var factor = FLOW_FACTOR[status];
        var weight = FLOW_WEIGHTS[flow];

        if (status === 'partial') { anyPartial = true; }

        score += weight * factor;
        scoreLow += weight * (status === 'live' ? 1 : 0);
        scoreHigh += weight * (status === 'absent' ? 0 : 1);
        factorSum += factor;

        var missing = weight * (1 - factor);
        missingPerFlow[flow] = r2(missing);
        if (missing > 0) {
          missingList.push({ flow: flow, missing: missing, order: n });
        }
      }

      // Sorted by missing points descending, ties broken by canonical order
      // ascending. Deterministic and testable.
      missingList.sort(function (a, b) {
        if (b.missing !== a.missing) { return b.missing - a.missing; }
        return a.order - b.order;
      });

      var top3 = [];
      var impactStatements = [];
      for (var t = 0; t < Math.min(3, missingList.length); t++) {
        top3.push([missingList[t].flow, r2(missingList[t].missing)]);
        impactStatements.push({
          flow: missingList[t].flow,
          statement: FLOW_IMPACT[missingList[t].flow]
        });
      }

      var coveragePct = factorSum / 8 * 100;

      var gradeBand = GRADE_BANDS[GRADE_BANDS.length - 1][1];
      for (var b = 0; b < GRADE_BANDS.length; b++) {
        if (score >= GRADE_BANDS[b][0]) { gradeBand = GRADE_BANDS[b][1]; break; }
      }

      var notes = [];
      if (missingList.length === 0) {
        notes.push('Nothing is missing. The audit moves from presence to depth, and this tool only measures presence.');
      }
      if (!anyPartial) {
        notes.push('Nothing was judged partial, so the band collapses to a single number.');
      }

      var raw = {
        score: score,
        score_low: scoreLow,
        score_high: scoreHigh,
        coverage_pct_unweighted: coveragePct,
        weights: FLOW_WEIGHTS,
        canonical_order: FLOW_ORDER
      };

      var display = {
        score: r2(score),
        score_low: r2(scoreLow),
        score_high: r2(scoreHigh),
        score_band: [r2(scoreLow), r2(scoreHigh)],
        coverage_pct_unweighted: r2(coveragePct),
        grade_band: gradeBand,
        missing_points_per_flow: missingPerFlow,
        top_3_missing: top3,
        impact_statements: impactStatements
      };

      return Object.assign({}, display, { raw: raw, display: display, notes: notes });
    }
  };

  /* ------------------------------------------------------------------ *
   * 12. blended-roas-calculator
   *
   * Source of truth: phase1-newtool-specs/spec-blended-roas.json.
   *
   * This tool answers a COMPOSITION question, not a margin one: what share of
   * the revenue behind the ratio is paid-driven, what the ratio becomes once
   * refunded revenue is removed, and how far the platforms' own ROAS sits above
   * the number the whole store produced. It takes NO contribution-margin input
   * and publishes NO break-even floor — the floor is margin-derived and it
   * belongs to mer-calculator. If anyone ever adds cm_pct here, this tool has
   * become a duplicate of mer-calculator and should be cut instead.
   * ------------------------------------------------------------------ */

  // Canonical flag order, so the emitted array is deterministic and testable.
  var BLENDED_FLAG_ORDER = [
    'parts_exceed_total', 'paid_dependency_clamped', 'derived_remainder_clamped',
    'nonpaid_clamped', 'range_collapsed', 'range_floor_clipped',
    'platform_claim_exceeds_total', 'resellable_not_entered'
  ];

  // The tool's own line, not a cited benchmark: above this share of revenue the
  // blended figure stops carrying information the ad account did not already
  // carry. Labelled as a judgment call on the page.
  var PAID_CARRIES_PCT = 70;

  RISE_TOOLS['blended-roas-calculator'] = {
    compute: function (inputs) {
      var i = inputs || {};

      // Every field goes through the locale-tolerant parser before it is a
      // number. Optional fields stay null when blank — never substituted with 0.
      var R = parseAmount(i.total_revenue);
      if (R === null) { R = 0; }
      var S = parseAmount(i.total_ad_spend);
      if (S === null) { S = 0; }
      var P = parseAmount(i.paid_revenue);
      var E = parseAmount(i.email_revenue);
      var O = parseAmount(i.organic_direct_revenue);
      var rPct = parseAmount(i.return_rate_pct);
      if (rPct === null) { rPct = 0; }
      var kPct = parseAmount(i.resellable_pct);
      var resellableEntered = kPct !== null;
      var PR = parseAmount(i.platform_reported_roas);

      var r = rPct / 100;
      var k = resellableEntered ? kPct / 100 : 0;

      // Kept factor: the share of booked revenue that is never given back and
      // never written off. Refunded revenue on goods that return to full-price
      // stock is DEFERRED, not destroyed, so it stays inside f. At k = 1 the
      // factor is exactly 1 and every returns-adjusted output collapses onto
      // its unadjusted twin — the same collapse true-profit-per-order uses.
      var f = 1 - r * (1 - k);

      var hasSpend = S > 0;
      var hasRevenue = R > 0;

      // This half stays useful with no ad spend entered, so it is never gated.
      var netKept = R * f;
      var lostToReturns = R * r * (1 - k);

      var blended = hasSpend ? R / S : null;
      var raBlended = hasSpend ? R * f / S : null;
      var dragX = hasSpend ? lostToReturns / S : null;

      // The single guessed input is the return rate, so the adjusted ratio
      // ships as a band at +/- 5 percentage POINTS (identical to
      // mer-calculator). The pessimistic end takes the HIGHER return rate.
      var rPess = Math.min(1, r + 0.05);
      var rOpt = Math.max(0, r - 0.05);
      var raLow = hasSpend ? R * (1 - rPess * (1 - k)) / S : null;
      var raHigh = hasSpend ? R * (1 - rOpt * (1 - k)) / S : null;

      var paidRoas = (hasSpend && P !== null) ? P / S : null;
      var raPaidRoas = (hasSpend && P !== null) ? P * f / S : null;

      // The ladder reads the RAW dependency; the page prints the clamped one,
      // so a 120% dependency still trips the tier it should.
      var depRaw = (P !== null && hasRevenue) ? P / R * 100 : null;
      var dep = depRaw === null ? null : clamp(depRaw, 0, 100);
      var depClamped = depRaw !== null && (depRaw > 100 || depRaw < 0);

      var emailShare = (E !== null && hasRevenue) ? E / R * 100 : null;

      // Organic is derived as the remainder ONLY when at least one of the two
      // rows above it was filled. Deriving it from nothing would print
      // "100% organic", a claim the user never made.
      var organicEntered = O !== null;
      var organicDerived = false;
      var remainderClamped = false;
      var oEff = null;
      if (organicEntered) {
        oEff = O;
      } else if (hasRevenue && (P !== null || E !== null)) {
        organicDerived = true;
        oEff = R - (P === null ? 0 : P) - (E === null ? 0 : E);
        if (oEff < 0) { oEff = 0; remainderClamped = true; }
      }
      var organicShare = (oEff !== null && hasRevenue) ? oEff / R * 100 : null;

      var nonpaid = null;
      var nonpaidClamped = false;
      if (P !== null && hasRevenue) {
        nonpaid = R - P;
        if (nonpaid < 0) { nonpaid = 0; nonpaidClamped = true; }
      }

      // Entered parts are NEVER rescaled to fit the total. A contradiction gets
      // named and measured; silently normalising a user's numbers teaches
      // nothing.
      var partsEntered = 0;
      var partsSum = 0;
      if (P !== null) { partsSum += P; partsEntered++; }
      if (E !== null) { partsSum += E; partsEntered++; }
      if (organicEntered) { partsSum += O; partsEntered++; }
      var partsExceed = partsEntered > 0 && (partsSum - R) > 1e-9;
      var partsOverflow = partsExceed ? partsSum - R : 0;

      // Platform block is hidden entirely when the platforms' ROAS is blank,
      // and null (not zero) when there is no spend to measure it against.
      var platformEntered = PR !== null;
      var claimedRevenue = null;
      var claimedShare = null;
      var vsBlended = null;
      var vsPaid = null;
      var overstatement = null;
      var claimExceeds = false;
      if (platformEntered && hasSpend) {
        claimedRevenue = PR * S;
        claimedShare = hasRevenue ? claimedRevenue / R * 100 : null;
        vsBlended = blended === null ? null : PR - blended;
        vsPaid = paidRoas === null ? null : PR - paidRoas;
        overstatement = (paidRoas !== null && paidRoas > 0) ? PR / paidRoas : null;
        claimExceeds = claimedShare !== null && claimedShare > 100;
      }

      var rangeCollapsed = raLow !== null && raHigh !== null &&
        Math.abs(raHigh - raLow) < 1e-9;
      var rangeFloorClipped = hasSpend && (r - 0.05) < 0;

      /* -- verdict ladder ------------------------------------------------ *
       * Three tier classes, used exactly as ltv / contribution-margin /
       * conversion-rate-calculator use them.                                */
      var tier, tierLabel, verdictBand;
      if (!hasSpend || blended === null) {
        tier = 't-fix';
        tierLabel = 'ENTER AD SPEND';
        verdictBand = 'No ad spend in this period, so blended ROAS is undefined.';
      } else if (raBlended < 1) {
        tier = 't-not';
        tierLabel = 'BELOW ONE TO ONE';
        verdictBand = 'After refunds, every dollar of ad spend brings back less than a dollar of kept revenue.';
      } else if (depRaw !== null && depRaw >= PAID_CARRIES_PCT) {
        tier = 't-fix';
        tierLabel = 'PAID CARRIES THE STORE';
        verdictBand = 'The blended number is close to the paid number, so it is not telling you anything the ad account was not already telling you.';
      } else {
        tier = 't-safe';
        tierLabel = 'BLEND HOLDS';
        verdictBand = 'Kept revenue clears ad spend and the non-paid channels are carrying a real share of it.';
      }

      // A tier is a money verdict; an attribution gap is a measurement problem.
      // Separate chips, and this one never moves the tier.
      var attributionNote = claimExceeds
        ? 'Your platforms claim more revenue than the store booked.'
        : null;

      var flagSet = {
        parts_exceed_total: partsExceed,
        paid_dependency_clamped: depClamped,
        derived_remainder_clamped: remainderClamped,
        nonpaid_clamped: nonpaidClamped,
        range_collapsed: rangeCollapsed,
        range_floor_clipped: rangeFloorClipped,
        platform_claim_exceeds_total: claimExceeds,
        resellable_not_entered: !resellableEntered
      };
      var flags = [];
      for (var fi = 0; fi < BLENDED_FLAG_ORDER.length; fi++) {
        if (flagSet[BLENDED_FLAG_ORDER[fi]]) { flags.push(BLENDED_FLAG_ORDER[fi]); }
      }

      var notes = [];
      if (!hasSpend) {
        notes.push('Kept revenue and the cost of returns still compute without ad spend; every ratio on this page does not.');
      }
      if (!hasRevenue) {
        notes.push('Enter revenue above 0 to see the channel split.');
      }
      if (P === null) {
        notes.push('Add the revenue you attribute to paid to see how much of this the ads are carrying.');
      }
      if (P === null && E === null && !organicEntered) {
        notes.push('Fill at least one channel row to see the split.');
      }
      if (!resellableEntered) {
        notes.push('resellable share not entered, treated as none');
      }
      if (partsExceed) {
        notes.push('Your channel rows add up to ' + fmtNum(partsOverflow) +
          ' more than total revenue. Nothing has been rescaled.');
      }
      if (rangeCollapsed) {
        notes.push(k >= 1
          ? 'At 100% resellable there is nothing for the return rate to move.'
          : 'Every scenario returns the same number, so the band collapses to a point.');
      }
      if (rangeFloorClipped) {
        notes.push('A return rate cannot go below zero, so the optimistic end is your entered number.');
      }
      if (platformEntered && hasSpend && P === 0) {
        notes.push('Your platforms report a ROAS against paid revenue you have recorded as zero.');
      }

      var raw = {
        kept_factor: f,
        net_kept_revenue: netKept,
        revenue_lost_to_returns: lostToReturns,
        blended_roas: blended,
        ra_blended_roas: raBlended,
        ra_blended_roas_low: raLow,
        ra_blended_roas_high: raHigh,
        returns_drag_x: dragX,
        paid_roas: paidRoas,
        ra_paid_roas: raPaidRoas,
        paid_dependency_pct_raw: depRaw,
        paid_dependency_pct: dep,
        nonpaid_revenue: nonpaid,
        email_revenue_share_pct: emailShare,
        organic_direct_revenue: oEff,
        organic_direct_share_pct: organicShare,
        parts_sum: partsEntered > 0 ? partsSum : null,
        parts_overflow: partsOverflow,
        platform_claimed_revenue: claimedRevenue,
        platform_claimed_share_of_total_pct: claimedShare,
        platform_vs_blended_delta: vsBlended,
        platform_vs_paid_delta: vsPaid,
        platform_overstatement_x: overstatement
      };

      var display = {
        blended_roas: r2(blended),
        ra_blended_roas: r2(raBlended),
        ra_blended_roas_low: r2(raLow),
        ra_blended_roas_high: r2(raHigh),
        ra_blended_roas_range: rPair(raLow, raHigh, 2),
        returns_drag_x: r2(dragX),
        net_kept_revenue: r2(netKept),
        revenue_lost_to_returns: r2(lostToReturns),
        paid_roas: r2(paidRoas),
        ra_paid_roas: r2(raPaidRoas),
        paid_dependency_pct: r2(dep),
        paid_dependency_pct_raw: r2(depRaw),
        nonpaid_revenue: r2(nonpaid),
        email_revenue_share_pct: r2(emailShare),
        organic_direct_revenue: r2(oEff),
        organic_direct_share_pct: r2(organicShare),
        organic_direct_derived: organicDerived,
        parts_overflow: r2(partsOverflow),
        platform_claimed_revenue: r2(claimedRevenue),
        platform_claimed_share_of_total_pct: r2(claimedShare),
        platform_vs_blended_delta: r2(vsBlended),
        platform_vs_paid_delta: r2(vsPaid),
        platform_overstatement_x: r2(overstatement),
        tier: tier,
        tier_label: tierLabel,
        verdict_band: verdictBand,
        attribution_note: attributionNote,
        flags: flags
      };

      return Object.assign({}, display, { raw: raw, display: display, notes: notes });
    }
  };

  /* ------------------------------------------------------------------ *
   * Shared helpers exposed for the tool pages and the test runner
   * ------------------------------------------------------------------ */

  RISE_TOOLS._helpers = RISE_TOOLS._helpers || {};
  RISE_TOOLS._helpers.roundHalfUp = roundHalfUp;
  RISE_TOOLS._helpers.parseAmount = parseAmount;
  RISE_TOOLS._helpers.erf = erf;
  RISE_TOOLS._helpers.normalCdf = normalCdf;
  RISE_TOOLS._helpers.cmRateRa = cmRateRa;
  RISE_TOOLS._helpers.waldCi = waldCi;
  RISE_TOOLS._helpers.FLOW_WEIGHTS = FLOW_WEIGHTS;
  RISE_TOOLS._helpers.FLOW_ORDER = FLOW_ORDER;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = window.RISE_TOOLS;
  }
}());
