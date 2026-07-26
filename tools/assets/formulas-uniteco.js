/**
 * RISE DTC tools hub — unit-economics formula library (11 tools).
 *
 * Source of truth: phase1-spec-uniteco.json.
 * Every compute() is a PURE function: inputs object in, outputs object out.
 * No DOM. No rounding. All arithmetic stays in full float — display rounding
 * (money 2dp, percent 1dp, counts ceil/floor, threshold to nearest $5) is the
 * page layer's job.
 *
 * Usage in the browser:
 *   <script src="/tools/assets/formulas-uniteco.js"></script>
 *   var out = RISE_TOOLS['true-profit-per-order'].compute({ aov: 68, ... });
 */
(function () {
  var window = (typeof globalThis !== 'undefined')
    ? (globalThis.window || (globalThis.window = globalThis))
    : this;

  window.RISE_TOOLS = window.RISE_TOOLS || {};
  var RISE_TOOLS = window.RISE_TOOLS;

  /* ---------------------------------------------------------------- helpers */

  // Payment processing fixed component, per order (true-profit-per-order).
  var PROC_FIXED = 0.30;

  // Blended-budget constants (cac tool).
  var BUDGET_SMALL = 10000;
  var BUDGET_LARGE = 100000;

  // "Supplied" means: not null, not undefined, not empty string, not NaN.
  // An explicit 0 IS supplied (matters for aov.refunded_amount).
  function has(v) {
    if (v === null || v === undefined || v === '') return false;
    var n = Number(v);
    return !isNaN(n);
  }
  function num(v) { return has(v) ? Number(v) : null; }   // null when blank
  function or0(v) { return has(v) ? Number(v) : 0; }      // 0 when blank
  function frac(v) { return has(v) ? Number(v) / 100 : 0; } // percent -> fraction

  // Return-rate stress: pessimistic case is r * 1.2 clamped at 100%.
  function rateUp(pctVal) { return Math.min(100, or0(pctVal) * 1.2); }
  function rateDown(pctVal) { return or0(pctVal) * 0.8; }

  /* =========================================================== 1. true profit */

  function tppoContribution(aov, cogsPct, shipping, returnRate, returnProcCost, resellablePct, procPct) {
    var r = returnRate / 100, c = cogsPct / 100, s = resellablePct / 100, p = procPct / 100;
    return (1 - r) * aov
      - aov * c * (1 - r * s)
      - shipping
      - r * returnProcCost
      - (p * aov + PROC_FIXED);
  }

  RISE_TOOLS['true-profit-per-order'] = {
    compute: function (inputs) {
      var aov = or0(inputs.aov);
      var cogsPct = or0(inputs.cogs_pct);
      var shipping = or0(inputs.shipping);
      var returnRate = or0(inputs.return_rate);
      var rpc = or0(inputs.return_processing_cost);
      var resellablePct = or0(inputs.resellable_pct);
      var cac = or0(inputs.cac);
      var procPct = or0(inputs.proc_pct);
      var repeatRate = num(inputs.repeat_rate);

      var r = returnRate / 100, c = cogsPct / 100, s = resellablePct / 100, p = procPct / 100;

      var revenue_kept = (1 - r) * aov;
      var cogs_cost = aov * c * (1 - r * s);
      var return_handling_cost = r * rpc;
      var processing_cost = p * aov + PROC_FIXED;

      var contribution_before_cac =
        tppoContribution(aov, cogsPct, shipping, returnRate, rpc, resellablePct, procPct);
      var true_profit_per_order = contribution_before_cac - cac;
      var returns_drag_per_order = r * (aov * (1 - s * c) + rpc);

      var break_even_orders_per_customer = contribution_before_cac > 0
        ? Math.ceil(cac / contribution_before_cac)
        : null;

      // Optional repeat toggle: only live at 0 < repeat_rate < 100.
      var expected_orders_per_customer = (repeatRate !== null && repeatRate > 0 && repeatRate < 100)
        ? 1 / (1 - repeatRate / 100)
        : null;
      var profit_per_customer = expected_orders_per_customer !== null
        ? expected_orders_per_customer * contribution_before_cac - cac
        : null;

      var safe_threshold = 0.05 * aov;

      var verdict_tier;
      if (true_profit_per_order > safe_threshold) {
        verdict_tier = 'SAFE TO SCALE';
      } else if ((true_profit_per_order > 0 && true_profit_per_order <= safe_threshold)
        || (true_profit_per_order <= 0 && profit_per_customer !== null && profit_per_customer > 0)) {
        verdict_tier = 'FIX FIRST';
      } else {
        verdict_tier = 'NOT YET';
      }

      // Range: return rate and CAC are the two guessed inputs.
      var cacLowCase = cac * 1.2;   // pessimistic
      var cacHighCase = cac * 0.8;  // optimistic
      var true_profit_low =
        tppoContribution(aov, cogsPct, shipping, rateUp(returnRate), rpc, resellablePct, procPct) - cacLowCase;
      var true_profit_high =
        tppoContribution(aov, cogsPct, shipping, rateDown(returnRate), rpc, resellablePct, procPct) - cacHighCase;

      return {
        revenue_kept: revenue_kept,
        cogs_cost: cogs_cost,
        return_handling_cost: return_handling_cost,
        processing_cost: processing_cost,
        contribution_before_cac: contribution_before_cac,
        true_profit_per_order: true_profit_per_order,
        returns_drag_per_order: returns_drag_per_order,
        break_even_orders_per_customer: break_even_orders_per_customer,
        expected_orders_per_customer: expected_orders_per_customer,
        profit_per_customer: profit_per_customer,
        safe_threshold: safe_threshold,
        verdict_tier: verdict_tier,
        true_profit_low: true_profit_low,
        true_profit_mid: true_profit_per_order,
        true_profit_high: true_profit_high,
        range_inert: or0(inputs.return_rate) === 0
      };
    }
  };

  /* =================================================== 2. contribution margin */

  function cmAdjusted(price, cogsUnit, shipUnit, otherVar, returnRate, returnCost, resellablePct) {
    var r = returnRate / 100, s = resellablePct / 100;
    return (1 - r) * price
      - cogsUnit * (1 - r * s)
      - shipUnit
      - otherVar
      - r * returnCost;
  }

  RISE_TOOLS['contribution-margin'] = {
    compute: function (inputs) {
      var price = or0(inputs.price);
      var cogsUnit = or0(inputs.cogs_unit);
      var shipUnit = or0(inputs.shipping_unit);
      var otherVar = or0(inputs.other_variable);
      var returnRate = or0(inputs.return_rate);
      var returnCost = or0(inputs.return_cost);
      var resellablePct = or0(inputs.resellable_pct);
      var fixedCosts = num(inputs.fixed_costs);

      var r = returnRate / 100, s = resellablePct / 100;

      var gross_cm_per_unit = price - cogsUnit - shipUnit - otherVar;
      var returns_adjusted_cm_per_unit =
        cmAdjusted(price, cogsUnit, shipUnit, otherVar, returnRate, returnCost, resellablePct);
      var returns_drag_per_unit = r * (price - s * cogsUnit + returnCost);

      var netRevenue = (1 - r) * price;
      var cm_ratio_net_pct = netRevenue > 0 ? returns_adjusted_cm_per_unit / netRevenue * 100 : null;
      var cm_ratio_gross_pct = price > 0 ? returns_adjusted_cm_per_unit / price * 100 : null;
      var returns_drag_pts = price > 0 ? returns_drag_per_unit / price * 100 : null;

      var fc = (fixedCosts !== null && fixedCosts > 0) ? fixedCosts : null;
      var break_even_units = (fc !== null && returns_adjusted_cm_per_unit > 0)
        ? Math.ceil(fc / returns_adjusted_cm_per_unit) : null;
      var break_even_units_ignoring_returns = (fc !== null && gross_cm_per_unit > 0)
        ? Math.ceil(fc / gross_cm_per_unit) : null;
      var extra_units_returns_cost_you =
        (break_even_units !== null && break_even_units_ignoring_returns !== null)
          ? break_even_units - break_even_units_ignoring_returns : null;

      var cm_low = cmAdjusted(price, cogsUnit, shipUnit, otherVar, rateUp(returnRate), returnCost, resellablePct);
      var cm_high = cmAdjusted(price, cogsUnit, shipUnit, otherVar, rateDown(returnRate), returnCost, resellablePct);

      return {
        gross_cm_per_unit: gross_cm_per_unit,
        returns_adjusted_cm_per_unit: returns_adjusted_cm_per_unit,
        returns_drag_per_unit: returns_drag_per_unit,
        returns_drag_pts: returns_drag_pts,
        cm_ratio_net_pct: cm_ratio_net_pct,
        cm_ratio_gross_pct: cm_ratio_gross_pct,
        break_even_units: break_even_units,
        break_even_units_ignoring_returns: break_even_units_ignoring_returns,
        extra_units_returns_cost_you: extra_units_returns_cost_you,
        cm_low: cm_low,
        cm_mid: returns_adjusted_cm_per_unit,
        cm_high: cm_high,
        range_inert: returnRate === 0
      };
    }
  };

  /* ============================================== 3. free shipping threshold */

  function fstNetPer100(currentAov, cmPct, shippingCost, reachPct, liftPct, thresholdReturnRate, returnCost) {
    var reach = reachPct / 100, L = liftPct / 100, rt = thresholdReturnRate / 100, m = cmPct / 100;
    return 100 * reach * currentAov * L * (1 - rt) * m
      - 100 * reach * rt * returnCost
      - 100 * reach * shippingCost;
  }

  RISE_TOOLS['free-shipping-threshold'] = {
    compute: function (inputs) {
      var currentAov = or0(inputs.current_aov);
      var cmPct = or0(inputs.cm_pct);
      var shippingCost = or0(inputs.shipping_cost);
      var thresholdMultiplier = or0(inputs.threshold_multiplier);
      var reachPct = or0(inputs.reach_pct);
      var liftPct = or0(inputs.aov_lift_pct);
      var rtPct = or0(inputs.threshold_return_rate);
      var returnCost = or0(inputs.return_cost);

      var reach = reachPct / 100, L = liftPct / 100, rt = rtPct / 100, m = cmPct / 100;

      var suggested_threshold = Math.ceil(currentAov * thresholdMultiplier / 5) * 5;
      var qualifying_orders_per_100 = 100 * reach;

      var incremental_revenue_gross_per_100 = 100 * reach * currentAov * L;
      var incremental_revenue_net_per_100 = 100 * reach * currentAov * L * (1 - rt);
      var incremental_contribution_per_100 = 100 * reach * currentAov * L * (1 - rt) * m;
      var returns_cost_per_100 = 100 * reach * rt * returnCost;
      var shipping_absorbed_per_100 = 100 * reach * shippingCost;

      var net_impact_per_100 =
        incremental_contribution_per_100 - returns_cost_per_100 - shipping_absorbed_per_100;
      var net_impact_per_order = net_impact_per_100 / 100;

      var naive_net_impact_per_100 =
        100 * reach * currentAov * L * m - 100 * reach * shippingCost;
      var bracketing_leak_per_100 = naive_net_impact_per_100 - net_impact_per_100;

      var denom = (1 - rt) * m;
      var break_even_lift_dollars = denom > 0 ? (shippingCost + rt * returnCost) / denom : null;
      var break_even_lift_pct = (break_even_lift_dollars !== null && currentAov > 0)
        ? break_even_lift_dollars / currentAov * 100 : null;

      var threshold_verdict = net_impact_per_order > 0
        ? 'This threshold pays for itself'
        : 'At this lift, the threshold costs you money';

      var net_impact_per_order_low =
        fstNetPer100(currentAov, cmPct, shippingCost, reachPct, liftPct * 0.8, rtPct, returnCost) / 100;
      var net_impact_per_order_high =
        fstNetPer100(currentAov, cmPct, shippingCost, reachPct, liftPct * 1.2, rtPct, returnCost) / 100;

      return {
        suggested_threshold: suggested_threshold,
        qualifying_orders_per_100: qualifying_orders_per_100,
        incremental_revenue_gross_per_100: incremental_revenue_gross_per_100,
        incremental_revenue_net_per_100: incremental_revenue_net_per_100,
        incremental_contribution_per_100: incremental_contribution_per_100,
        returns_cost_per_100: returns_cost_per_100,
        shipping_absorbed_per_100: shipping_absorbed_per_100,
        net_impact_per_100: net_impact_per_100,
        net_impact_per_order: net_impact_per_order,
        naive_net_impact_per_100: naive_net_impact_per_100,
        bracketing_leak_per_100: bracketing_leak_per_100,
        break_even_lift_dollars: break_even_lift_dollars,
        break_even_lift_pct: break_even_lift_pct,
        threshold_verdict: threshold_verdict,
        net_impact_per_order_low: net_impact_per_order_low,
        net_impact_per_order_mid: net_impact_per_order,
        net_impact_per_order_high: net_impact_per_order_high,
        // True when break-even needs more lift than even the optimistic case delivers.
        unreachable_at_plausible_lift:
          break_even_lift_pct !== null && break_even_lift_pct > liftPct * 1.2
      };
    }
  };

  /* ============================================================ 4. discount ROI */

  RISE_TOOLS['discount-roi'] = {
    compute: function (inputs) {
      var aov = or0(inputs.aov);
      var d = or0(inputs.discount_pct) / 100;
      var m = or0(inputs.cm_pct) / 100;
      var orders = or0(inputs.orders);
      var L = or0(inputs.expected_lift_pct) / 100;
      var rb = or0(inputs.return_rate_baseline) / 100;
      var rd = or0(inputs.return_rate_discount) / 100;
      var returnCost = or0(inputs.return_cost);

      var A = (1 - rb) * aov * m - rb * returnCost;
      var B = (1 - rd) * aov * (m - d) - rd * returnCost;

      var baseline_contribution_total = orders * A;
      var promo_orders = orders * (1 + L);
      var promo_contribution_total = promo_orders * B;
      var net_profit_impact = promo_contribution_total - baseline_contribution_total;

      var verdict = net_profit_impact > 0 ? 'The promo pays' : 'The promo costs you money';

      var required_lift_pct = B > 0 ? (A / B - 1) * 100 : null;
      var naive_required_lift_pct = m > d ? (d / (m - d)) * 100 : null;

      var steps = [0.10, 0.15, 0.20, 0.25];
      var labels = ['10%', '15%', '20%', '25%'];
      var required_lift_table = [];
      for (var k = 0; k < steps.length; k++) {
        var x = steps[k];
        var Bx = (1 - rd) * aov * (m - x) - rd * returnCost;
        var req = Bx > 0 ? (A / Bx - 1) * 100 : null;
        var nai = m > x ? (x / (m - x)) * 100 : null;
        required_lift_table.push({
          discount: labels[k],
          required: req,
          // Display rule: anything above 1000% renders as "not reachable";
          // the raw value is still returned above.
          required_display: (req !== null && req > 1000) ? 'not reachable' : null,
          naive: nai
        });
      }

      var net_profit_impact_low = orders * (1 + L * 0.8) * B - baseline_contribution_total;
      var net_profit_impact_high = orders * (1 + L * 1.2) * B - baseline_contribution_total;

      return {
        baseline_contribution_per_order: A,
        promo_contribution_per_order: B,
        baseline_contribution_total: baseline_contribution_total,
        promo_orders: promo_orders,
        promo_contribution_total: promo_contribution_total,
        net_profit_impact: net_profit_impact,
        verdict: verdict,
        required_lift_pct: required_lift_pct,
        required_lift_display: (required_lift_pct !== null && required_lift_pct > 1000)
          ? 'not reachable' : null,
        naive_required_lift_pct: naive_required_lift_pct,
        required_lift_table: required_lift_table,
        net_profit_impact_low: net_profit_impact_low,
        net_profit_impact_mid: net_profit_impact,
        net_profit_impact_high: net_profit_impact_high,
        no_lift_saves_it: !(B > 0)
      };
    }
  };

  /* ========================================================= 5. break-even ROAS */

  function berCase(aov, cmPct, returnRate, returnCost) {
    var m = cmPct / 100, r = returnRate / 100;
    var contribution = (1 - r) * aov * m - r * returnCost;
    var cmNet = aov > 0 ? contribution / aov : null;
    var roas = (cmNet !== null && cmNet > 0) ? 1 / cmNet : null;
    return { contribution: contribution, cmNet: cmNet, roas: roas };
  }

  RISE_TOOLS['break-even-roas'] = {
    compute: function (inputs) {
      var aov = or0(inputs.aov);
      var cmPct = or0(inputs.cm_pct);
      var returnRate = or0(inputs.return_rate);
      var returnCost = or0(inputs.return_cost);
      var t = or0(inputs.target_net_margin_pct) / 100;
      var reportedRoas = num(inputs.platform_reported_roas);

      var m = cmPct / 100;
      var mid = berCase(aov, cmPct, returnRate, returnCost);

      var break_even_roas = mid.roas;
      var naive_break_even_roas = m > 0 ? 1 / m : null;
      var returns_penalty_x = (break_even_roas !== null && naive_break_even_roas !== null)
        ? break_even_roas - naive_break_even_roas : null;

      var target_roas = (mid.cmNet !== null && mid.cmNet > t) ? 1 / (mid.cmNet - t) : null;

      var max_cac_per_order = mid.contribution;
      var max_cac_for_target = mid.contribution - t * aov;

      var net_margin_at_4x = mid.cmNet !== null ? (mid.cmNet - 0.25) * 100 : null;

      var actual_net_margin_at_reported_roas =
        (reportedRoas !== null && reportedRoas > 0 && mid.cmNet !== null)
          ? (mid.cmNet - 1 / reportedRoas) * 100 : null;

      var best = berCase(aov, cmPct, rateDown(returnRate), returnCost);
      var worst = berCase(aov, cmPct, rateUp(returnRate), returnCost);

      return {
        contribution_per_order: mid.contribution,
        cm_net: mid.cmNet,
        break_even_roas: break_even_roas,
        naive_break_even_roas: naive_break_even_roas,
        returns_penalty_x: returns_penalty_x,
        target_roas: target_roas,
        max_cac_per_order: max_cac_per_order,
        max_cac_for_target: max_cac_for_target,
        net_margin_at_4x: net_margin_at_4x,
        actual_net_margin_at_reported_roas: actual_net_margin_at_reported_roas,
        break_even_roas_best_case: best.roas,
        break_even_roas_expected: break_even_roas,
        break_even_roas_worst_case: worst.roas,
        range_inert: returnRate === 0
      };
    }
  };

  /* ==================================================================== 6. LTV */

  // End-of-year discounting; the fractional trailing year is prorated into the
  // next period. At dr = 0 this reduces exactly to annual * lifespan.
  function discountedSum(annual, lifespanYears, dr) {
    var full = Math.floor(lifespanYears);
    var fracYear = lifespanYears - full;
    var total = 0;
    for (var k = 1; k <= full; k++) total += annual / Math.pow(1 + dr, k);
    total += fracYear * annual / Math.pow(1 + dr, full + 1);
    return total;
  }

  RISE_TOOLS['ltv'] = {
    compute: function (inputs) {
      var grossAov = or0(inputs.gross_aov);
      var r = or0(inputs.return_rate) / 100;
      var x = or0(inputs.exchange_share_pct) / 100;
      var f = or0(inputs.purchases_per_year);
      var y = or0(inputs.lifespan_years);
      var m = or0(inputs.cm_pct) / 100;
      var cac = num(inputs.cac);
      var dr = or0(inputs.discount_rate_pct) / 100;

      var net_aov = grossAov * (1 - r * (1 - x));
      var total_orders = f * y;

      var contribution_ltv = net_aov * m * f * y;
      var naive_contribution_ltv = grossAov * m * f * y;
      var returns_gap = naive_contribution_ltv - contribution_ltv;

      var net_ltv_after_cac = (cac !== null) ? contribution_ltv - cac : null;
      var ltv_cac_ratio = (cac !== null && cac > 0) ? contribution_ltv / cac : null;

      var annual_contribution = net_aov * m * f;
      var discounted_contribution_ltv = dr > 0
        ? discountedSum(annual_contribution, y, dr)
        : contribution_ltv;

      var annualLow = net_aov * m * f * 0.8;
      var annualHigh = net_aov * m * f * 1.2;

      return {
        net_aov: net_aov,
        total_orders: total_orders,
        annual_contribution: annual_contribution,
        contribution_ltv: contribution_ltv,
        naive_contribution_ltv: naive_contribution_ltv,
        returns_gap: returns_gap,
        net_ltv_after_cac: net_ltv_after_cac,
        ltv_cac_ratio: ltv_cac_ratio,
        discounted_contribution_ltv: discounted_contribution_ltv,
        contribution_ltv_low: annualLow * y,
        contribution_ltv_mid: contribution_ltv,
        contribution_ltv_high: annualHigh * y,
        discounted_contribution_ltv_low: dr > 0
          ? discountedSum(annualLow, y, dr) : annualLow * y,
        discounted_contribution_ltv_mid: discounted_contribution_ltv,
        discounted_contribution_ltv_high: dr > 0
          ? discountedSum(annualHigh, y, dr) : annualHigh * y
      };
    }
  };

  /* ==================================================================== 7. CAC */

  RISE_TOOLS['cac'] = {
    compute: function (inputs) {
      var totalAdSpend = or0(inputs.total_ad_spend);
      var otherAcq = or0(inputs.other_acq_costs);      // blank treated as 0
      var newCustomers = or0(inputs.new_customers);
      var reportedConv = num(inputs.platform_reported_conversions);
      var aSpend = or0(inputs.channel_a_spend);
      var aCustomers = or0(inputs.channel_a_customers);
      var bSpend = or0(inputs.channel_b_spend);
      var bCustomers = or0(inputs.channel_b_customers);

      var blended_cac = newCustomers > 0 ? (totalAdSpend + otherAcq) / newCustomers : null;
      var media_only_cac = newCustomers > 0 ? totalAdSpend / newCustomers : null;
      var platform_reported_cac = (reportedConv !== null && reportedConv > 0)
        ? totalAdSpend / reportedConv : null;

      var attribution_gap_pct = (reportedConv !== null && reportedConv > 0 && newCustomers > 0)
        ? (reportedConv - newCustomers) / newCustomers * 100 : null;

      var overstatement_factor = (blended_cac !== null && platform_reported_cac !== null && platform_reported_cac > 0)
        ? blended_cac / platform_reported_cac : null;

      var channel_a_cac = aCustomers > 0 ? aSpend / aCustomers : null;
      var channel_b_cac = bCustomers > 0 ? bSpend / bCustomers : null;

      var unattributed_spend = totalAdSpend - aSpend - bSpend;
      var unattributed_customers = newCustomers - aCustomers - bCustomers;
      var data_error_flag = unattributed_spend < 0 || unattributed_customers < 0;

      var customers_per_10k = (blended_cac !== null && blended_cac > 0)
        ? Math.floor(BUDGET_SMALL / blended_cac) : null;
      var customers_per_100k = (blended_cac !== null && blended_cac > 0)
        ? Math.floor(BUDGET_LARGE / blended_cac) : null;

      // Range flexes the customer count +/- 20%; spend is held fixed.
      var blended_cac_low = newCustomers > 0 ? (totalAdSpend + otherAcq) / (newCustomers * 1.2) : null;
      var blended_cac_high = newCustomers > 0 ? (totalAdSpend + otherAcq) / (newCustomers * 0.8) : null;

      return {
        blended_cac: blended_cac,
        media_only_cac: media_only_cac,
        platform_reported_cac: platform_reported_cac,
        attribution_gap_pct: attribution_gap_pct,
        overstatement_factor: overstatement_factor,
        channel_a_cac: channel_a_cac,
        channel_b_cac: channel_b_cac,
        unattributed_spend: unattributed_spend,
        unattributed_customers: unattributed_customers,
        data_error_flag: data_error_flag,
        customers_per_10k: customers_per_10k,
        customers_per_100k: customers_per_100k,
        blended_cac_low: blended_cac_low,
        blended_cac_mid: blended_cac,
        blended_cac_high: blended_cac_high
      };
    }
  };

  /* ======================================================= 8. LTV : CAC payback */

  RISE_TOOLS['ltv-cac-payback'] = {
    compute: function (inputs) {
      var grossAov = or0(inputs.gross_aov);
      var r = or0(inputs.return_rate) / 100;
      var x = or0(inputs.exchange_share_pct) / 100;
      var cmPct = or0(inputs.cm_pct);
      var f = or0(inputs.purchases_per_year);
      var y = or0(inputs.lifespan_years);
      var cac = or0(inputs.cac);

      var net_aov = grossAov * (1 - r * (1 - x));

      // fMult and mMult are flexed jointly; margin is capped at 100%.
      function scenario(fMult, mMult) {
        var m = Math.min(100, cmPct * mMult) / 100;
        var cpo = net_aov * m;
        var freq = f * fMult;
        var ltv = cpo * freq * y;
        var monthly = cpo * freq / 12;
        return {
          cpo: cpo,
          ltv: ltv,
          ratio: cac > 0 ? ltv / cac : null,
          payback: monthly > 0 ? cac / monthly : null
        };
      }

      var mid = scenario(1, 1);
      var low = scenario(0.8, 0.8);
      var high = scenario(1.2, 1.2);

      var payback_orders = mid.cpo > 0 ? Math.ceil(cac / mid.cpo) : null;
      var never_pays_back_flag = (mid.payback === null) || (mid.payback > y * 12);

      return {
        net_aov: net_aov,
        contribution_per_order: mid.cpo,
        monthly_contribution: mid.cpo * f / 12,
        ltv: mid.ltv,
        ratio_low: low.ratio,
        ratio_mid: mid.ratio,
        ratio_high: high.ratio,
        payback_months_fast: high.payback,
        payback_months_mid: mid.payback,
        payback_months_slow: low.payback,
        payback_orders: payback_orders,
        never_pays_back_flag: never_pays_back_flag
      };
    }
  };

  /* ==================================================================== 9. AOV */

  RISE_TOOLS['aov'] = {
    compute: function (inputs) {
      var grossRevenue = or0(inputs.gross_revenue);
      var orders = or0(inputs.orders);
      var refundedAmount = num(inputs.refunded_amount); // explicit 0 is honoured
      var returnRate = or0(inputs.return_rate);
      var x = or0(inputs.exchange_share_pct) / 100;
      var m = or0(inputs.cm_pct) / 100;
      var targetLift = or0(inputs.target_aov_lift);

      var r = returnRate / 100;
      var supplied = refundedAmount !== null;

      var gross_aov = orders > 0 ? grossRevenue / orders : null;
      var refund_dollars = supplied ? refundedAmount : grossRevenue * r * (1 - x);

      var rawFraction = grossRevenue > 0 ? refund_dollars / grossRevenue : 0;
      var data_error_flag = rawFraction > 1;
      var refund_fraction = Math.min(1, rawFraction);

      var net_aov = gross_aov !== null ? gross_aov * (1 - refund_fraction) : null;
      var aov_gap = (gross_aov !== null && net_aov !== null) ? gross_aov - net_aov : null;
      var aov_gap_pct = (gross_aov !== null && gross_aov > 0) ? aov_gap / gross_aov * 100 : null;

      var contribution_per_order_now = net_aov !== null ? net_aov * m : null;
      var contribution_gain_per_order = targetLift * (1 - refund_fraction) * m;
      var contribution_per_order_after = contribution_per_order_now !== null
        ? contribution_per_order_now + contribution_gain_per_order : null;

      var total_contribution_gain = contribution_gain_per_order * orders;
      var naive_total_contribution_gain = targetLift * m * orders;
      var overstatement = naive_total_contribution_gain - total_contribution_gain;

      // Range: lift always flexes; the refund side only flexes when it was guessed.
      var fracLow, fracHigh;
      if (supplied) {
        fracLow = refund_fraction;
        fracHigh = refund_fraction;
      } else {
        fracLow = Math.min(1, (rateUp(returnRate) / 100) * (1 - x));   // more returns -> less gain
        fracHigh = Math.min(1, (rateDown(returnRate) / 100) * (1 - x));
      }
      var total_contribution_gain_low = targetLift * 0.8 * (1 - fracLow) * m * orders;
      var total_contribution_gain_high = targetLift * 1.2 * (1 - fracHigh) * m * orders;

      return {
        gross_aov: gross_aov,
        refund_dollars: refund_dollars,
        refund_fraction: refund_fraction,
        refund_source: supplied ? 'measured' : 'derived',
        data_error_flag: data_error_flag,
        net_aov: net_aov,
        aov_gap: aov_gap,
        aov_gap_pct: aov_gap_pct,
        contribution_per_order_now: contribution_per_order_now,
        contribution_gain_per_order: contribution_gain_per_order,
        contribution_per_order_after: contribution_per_order_after,
        total_contribution_gain: total_contribution_gain,
        naive_total_contribution_gain: naive_total_contribution_gain,
        overstatement: overstatement,
        extra_cac_headroom_per_order: contribution_gain_per_order,
        total_contribution_gain_low: total_contribution_gain_low,
        total_contribution_gain_mid: total_contribution_gain,
        total_contribution_gain_high: total_contribution_gain_high
      };
    }
  };

  /* ================================================== 10. repeat purchase rate */

  RISE_TOOLS['repeat-purchase-rate'] = {
    compute: function (inputs) {
      var totalCustomers = or0(inputs.total_customers);
      var repeatCustomers = or0(inputs.repeat_customers);
      var e = or0(inputs.exchange_share_of_repeats) / 100;
      var windowMonths = or0(inputs.window_months);
      var netAov = or0(inputs.net_aov);
      var m = or0(inputs.cm_pct) / 100;
      var targetLiftPts = or0(inputs.target_lift_pts);

      var raw_repeat_rate_pct = totalCustomers > 0 ? repeatCustomers / totalCustomers * 100 : null;
      var true_repeat_customers = repeatCustomers * (1 - e);
      var true_repeat_rate_pct = totalCustomers > 0 ? true_repeat_customers / totalCustomers * 100 : null;
      var exchange_inflation_pts = (raw_repeat_rate_pct !== null && true_repeat_rate_pct !== null)
        ? raw_repeat_rate_pct - true_repeat_rate_pct : null;

      var extra_repeat_customers = totalCustomers * targetLiftPts / 100;
      var extra_orders = extra_repeat_customers * 1; // one extra order per newly-repeating customer
      var extra_revenue = extra_orders * netAov;
      var extra_contribution = extra_orders * netAov * m;
      var extra_contribution_annualized = windowMonths > 0
        ? extra_contribution * (12 / windowMonths) : null;

      var eLow = Math.min(1, e * 1.2);  // higher exchange share -> LOWER true rate
      var eHigh = e * 0.8;
      var true_repeat_rate_low = totalCustomers > 0
        ? repeatCustomers * (1 - eLow) / totalCustomers * 100 : null;
      var true_repeat_rate_high = totalCustomers > 0
        ? repeatCustomers * (1 - eHigh) / totalCustomers * 100 : null;

      var extra_contribution_low = totalCustomers * (targetLiftPts * 0.8) / 100 * netAov * m;
      var extra_contribution_high = totalCustomers * (targetLiftPts * 1.2) / 100 * netAov * m;

      return {
        raw_repeat_rate_pct: raw_repeat_rate_pct,
        true_repeat_customers: true_repeat_customers,
        true_repeat_rate_pct: true_repeat_rate_pct,
        exchange_inflation_pts: exchange_inflation_pts,
        extra_repeat_customers: extra_repeat_customers,
        extra_orders: extra_orders,
        extra_revenue: extra_revenue,
        extra_contribution: extra_contribution,
        extra_contribution_annualized: extra_contribution_annualized,
        data_error_flag: repeatCustomers > totalCustomers,
        true_repeat_rate_low: true_repeat_rate_low,
        true_repeat_rate_mid: true_repeat_rate_pct,
        true_repeat_rate_high: true_repeat_rate_high,
        extra_contribution_low: extra_contribution_low,
        extra_contribution_mid: extra_contribution,
        extra_contribution_high: extra_contribution_high,
        extra_contribution_annualized_low: windowMonths > 0
          ? extra_contribution_low * (12 / windowMonths) : null,
        extra_contribution_annualized_mid: extra_contribution_annualized,
        extra_contribution_annualized_high: windowMonths > 0
          ? extra_contribution_high * (12 / windowMonths) : null,
        range_inert: e === 0
      };
    }
  };

  /* ======================================================== 11. pricing margin */

  function pmRealized(price, unitCost, fulfilment, returnRate, returnCost, resellablePct) {
    var r = returnRate / 100, s = resellablePct / 100;
    return (1 - r) * price
      - unitCost * (1 - r * s)
      - fulfilment
      - r * returnCost;
  }

  function pmTargetPriceNet(unitCost, fulfilment, returnRate, returnCost, resellablePct, t) {
    var r = returnRate / 100, s = resellablePct / 100;
    if (!(r < 1) || !(t < 1)) return null;
    return (unitCost * (1 - r * s) + fulfilment + r * returnCost) / ((1 - r) * (1 - t));
  }

  RISE_TOOLS['pricing-margin'] = {
    compute: function (inputs) {
      var unitCost = or0(inputs.unit_cost);
      var price = or0(inputs.selling_price);
      var fulfilment = or0(inputs.fulfilment_cost);
      var returnRate = or0(inputs.return_rate);
      var returnCost = or0(inputs.return_cost);
      var resellablePct = or0(inputs.resellable_pct);
      var t = or0(inputs.target_margin_pct) / 100;
      var basis = inputs.target_margin_basis || 'net-of-returns';

      var r = returnRate / 100;

      // Section A — markup, cost-based, returns-blind.
      var markup_pct = unitCost > 0 ? (price - unitCost) / unitCost * 100 : null;
      var markup_multiple = unitCost > 0 ? price / unitCost : null;

      // Section B — gross margin, price-based, returns-blind.
      var gross_profit_per_unit = price - unitCost;
      var gross_margin_pct = price > 0 ? (price - unitCost) / price * 100 : null;

      // Section C — realized, returns included.
      var realized_profit_per_unit =
        pmRealized(price, unitCost, fulfilment, returnRate, returnCost, resellablePct);
      var netRevenue = (1 - r) * price;
      var realized_margin_net_pct = netRevenue > 0 ? realized_profit_per_unit / netRevenue * 100 : null;
      var realized_margin_gross_pct = price > 0 ? realized_profit_per_unit / price * 100 : null;
      var margin_gap_pts = (gross_margin_pct !== null && realized_margin_gross_pct !== null)
        ? gross_margin_pct - realized_margin_gross_pct : null;

      var target_price_gross = (t < 1 && unitCost > 0) ? unitCost / (1 - t) : null;
      var target_price_net =
        pmTargetPriceNet(unitCost, fulfilment, returnRate, returnCost, resellablePct, t);
      var target_price_headline = (basis === 'net-of-returns') ? target_price_net : target_price_gross;
      var price_gap = (target_price_net !== null && target_price_gross !== null)
        ? target_price_net - target_price_gross : null;

      var rUpPct = rateUp(returnRate), rDownPct = rateDown(returnRate);

      var realized_margin_gross_low = price > 0
        ? pmRealized(price, unitCost, fulfilment, rUpPct, returnCost, resellablePct) / price * 100 : null;
      var realized_margin_gross_high = price > 0
        ? pmRealized(price, unitCost, fulfilment, rDownPct, returnCost, resellablePct) / price * 100 : null;

      // LOW price = the cheaper price a LOWER return rate allows.
      var target_price_net_low =
        pmTargetPriceNet(unitCost, fulfilment, rDownPct, returnCost, resellablePct, t);
      var target_price_net_high =
        pmTargetPriceNet(unitCost, fulfilment, rUpPct, returnCost, resellablePct, t);

      return {
        markup_pct: markup_pct,
        markup_multiple: markup_multiple,
        gross_profit_per_unit: gross_profit_per_unit,
        gross_margin_pct: gross_margin_pct,
        realized_profit_per_unit: realized_profit_per_unit,
        realized_margin_net_pct: realized_margin_net_pct,
        realized_margin_gross_pct: realized_margin_gross_pct,
        margin_gap_pts: margin_gap_pts,
        target_price_gross: target_price_gross,
        target_price_net: target_price_net,
        target_price_headline: target_price_headline,
        price_gap: price_gap,
        realized_margin_gross_low: realized_margin_gross_low,
        realized_margin_gross_mid: realized_margin_gross_pct,
        realized_margin_gross_high: realized_margin_gross_high,
        target_price_net_low: target_price_net_low,
        target_price_net_mid: target_price_net,
        target_price_net_high: target_price_net_high,
        target_already_beaten: (target_price_net !== null && target_price_net < price),
        range_inert: returnRate === 0
      };
    }
  };
})();

/* Node compatibility: lets the test runner require() this browser script. */
if (typeof module !== 'undefined') {
  module.exports = (typeof window !== 'undefined' ? window : globalThis).RISE_TOOLS;
}
