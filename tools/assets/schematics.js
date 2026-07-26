/**
 * RISE DTC free tools, the instrument schematics.
 *
 * Twenty-five hand-authored SVG drawings, one per tool, each drawing that
 * tool's own arithmetic. ONE source of truth for both surfaces: the hub bakes
 * these into its tiles, every tool page bakes its own into the hero, and this
 * file is what both bakes are generated from (tools/tests/bake-hub.mjs).
 *
 * Grammar, and nothing else is allowed inside a drawing:
 *   .k   ink stroke 1.5, the primary outline
 *   .k2  ink hairline 1, secondary structure and axes
 *   .d   ink dashed guide, baselines and reference lines
 *   .f   solid ink fill        .f6  ink fill at 42 percent, cost and volume
 *   .g   gold fill, ALWAYS the answer
 *   .gk  gold stroke 2, brackets and result curves
 *   .gd  gold dashed, thresholds and crossings
 *   .h   45 degree hatch, demand you already had and cost of goods
 *   .lb  ink micro label      .lbw white micro label, for type on solid ink
 *
 * viewBox is always 0 0 120 68, so one drawing drops into a 92px mobile figure
 * or a 300px hero figure with no edits. Adding .on-ink to any ancestor inverts
 * the whole set: ink goes white, gold stays gold, .lbw flips to ink.
 *
 * The <svg class="schdefs"> hatch block must be pasted once per page or every
 * .h hatch renders empty. RiseSchematics.defs() returns it.
 *
 * Runtime behaviour is a GUARD, not a renderer: hydrate() fills a
 * [data-sch] container only when that container is empty, so a baked page
 * never re-renders and a stale bake can never blank a tile.
 */
(function () {
  'use strict';

  var DEFS = '<svg class="schdefs" width="0" height="0" aria-hidden="true" focusable="false"><defs>' +
    '<pattern id="hx" width="4.6" height="4.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
    '<line x1="0" y1="0" x2="0" y2="4.6" stroke="#1F1F1F" stroke-width="1.15" opacity=".5"/></pattern>' +
    '<pattern id="hxw" width="4.6" height="4.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">' +
    '<line x1="0" y1="0" x2="0" y2="4.6" stroke="#FFFFFF" stroke-width="1.15" opacity=".5"/></pattern>' +
    '</defs></svg>';

  var S = {};

  S['true-profit-per-order'] = {
    cap: 'Waterfall, gross order down to what is left',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="Waterfall from gross order value down through each cost to the gold remainder">' +
      '<line class="d" x1="6" y1="58.8" x2="114" y2="58.8"/>' +
      '<rect class="k" x="8" y="11" width="14" height="47.8" rx="1.4"/>' +
      '<line class="d" x1="22" y1="11" x2="26" y2="11"/>' +
      '<rect class="f6" x="26" y="11" width="14" height="11.5"/><rect class="k2" x="26" y="11" width="14" height="11.5" rx="1"/>' +
      '<line class="d" x1="40" y1="22.5" x2="44" y2="22.5"/>' +
      '<rect class="f6" x="44" y="22.5" width="14" height="10"/><rect class="k2" x="44" y="22.5" width="14" height="10" rx="1"/>' +
      '<line class="d" x1="58" y1="32.5" x2="62" y2="32.5"/>' +
      '<rect class="f6" x="62" y="32.5" width="14" height="7"/><rect class="k2" x="62" y="32.5" width="14" height="7" rx="1"/>' +
      '<line class="d" x1="76" y1="39.5" x2="80" y2="39.5"/>' +
      '<rect class="f6" x="80" y="39.5" width="14" height="9.5"/><rect class="k2" x="80" y="39.5" width="14" height="9.5" rx="1"/>' +
      '<line class="d" x1="94" y1="49" x2="98" y2="49"/>' +
      '<rect class="g" x="98" y="49" width="14" height="9.8" rx="1"/></svg>'
  };

  S['contribution-margin'] = {
    cap: 'Unit column, margin band over cost',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="A unit column split into cost and margin, beside the extra units returns force you to sell">' +
      '<rect class="g" x="10" y="10" width="26" height="18" rx="1.4"/>' +
      '<rect class="h" x="10" y="28" width="26" height="30.8"/>' +
      '<rect class="k" x="10" y="10" width="26" height="48.8" rx="1.4"/>' +
      '<line class="k2" x1="10" y1="28" x2="36" y2="28"/>' +
      '<line class="d" x1="44" y1="58.8" x2="114" y2="58.8"/>' +
      '<rect class="k2" x="48" y="39" width="9" height="19.8" rx="1"/>' +
      '<rect class="k2" x="61" y="39" width="9" height="19.8" rx="1"/>' +
      '<rect class="k2" x="74" y="39" width="9" height="19.8" rx="1"/>' +
      '<rect class="g" x="87" y="39" width="9" height="19.8" rx="1"/>' +
      '<rect class="g" x="100" y="39" width="9" height="19.8" rx="1"/>' +
      '<path class="gk" d="M87 33 v-4 H109 v4"/></svg>'
  };

  S['free-shipping-threshold'] = {
    cap: 'Threshold curve crossing zero',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="A profit curve crossing zero at the cart value where free shipping starts to pay">' +
      '<line class="k2" x1="10" y1="7" x2="10" y2="58.8"/>' +
      '<line class="k2" x1="10" y1="58.8" x2="114" y2="58.8"/>' +
      '<line class="d" x1="10" y1="35" x2="114" y2="35"/>' +
      '<path class="k" d="M13 52 C31 50 45 45 62 35 C78 25 96 16 112 11"/>' +
      '<line class="gd" x1="62" y1="9" x2="62" y2="58.8"/>' +
      '<circle class="g" cx="62" cy="35" r="3.6"/>' +
      '<text class="lb" x="14" y="32">0</text>' +
      '<text class="lb" x="66" y="15">CART</text></svg>'
  };

  S['discount-roi'] = {
    cap: 'Price slice cut, orders needed to replace it',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="A price column with the discount slice cut out, and the extra orders needed to replace it">' +
      '<rect class="g" x="11" y="14" width="19" height="10.5"/>' +
      '<rect class="k" x="10" y="13" width="21" height="45.8" rx="1.4"/>' +
      '<line class="d" x1="10" y1="24.5" x2="31" y2="24.5"/>' +
      '<path class="k2" d="M36 36 H45"/><path class="f" d="M45 33.4 l5.4 2.6 -5.4 2.6z"/>' +
      '<line class="d" x1="55" y1="58.8" x2="114" y2="58.8"/>' +
      '<rect class="k2" x="56" y="48" width="10" height="10.8" rx="1"/>' +
      '<rect class="k2" x="69" y="48" width="10" height="10.8" rx="1"/>' +
      '<rect class="k2" x="82" y="48" width="10" height="10.8" rx="1"/>' +
      '<rect class="g" x="95" y="48" width="10" height="10.8" rx="1"/>' +
      '<rect class="g" x="95" y="35" width="10" height="10.8" rx="1"/>' +
      '<path class="gk" d="M93 30 v-4 H110 v4"/></svg>'
  };

  S['break-even-roas'] = {
    cap: 'Revenue over spend against a break-even tick',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="A revenue bar over a spend bar with the break-even ratio marked on a scale">' +
      '<rect class="k" x="10" y="11" width="94" height="11" rx="1.4"/>' +
      '<rect class="f6" x="10.8" y="11.8" width="92.4" height="9.4"/>' +
      '<rect class="f" x="10" y="26" width="34" height="11" rx="1.4"/>' +
      '<line class="k2" x1="10" y1="47" x2="112" y2="47"/>' +
      '<line class="k2" x1="10" y1="47" x2="10" y2="51"/><line class="k2" x1="30.4" y1="47" x2="30.4" y2="51"/>' +
      '<line class="k2" x1="50.8" y1="47" x2="50.8" y2="51"/><line class="k2" x1="71.2" y1="47" x2="71.2" y2="51"/>' +
      '<line class="k2" x1="91.6" y1="47" x2="91.6" y2="51"/><line class="k2" x1="112" y1="47" x2="112" y2="51"/>' +
      '<line class="gd" x1="71.2" y1="41" x2="71.2" y2="14"/>' +
      '<path class="g" d="M71.2 45 l5 -7 h-10z"/>' +
      '<text class="lb" x="8" y="60">1x</text><text class="lb" x="104" y="60">6x</text></svg>'
  };

  S['ltv'] = {
    cap: 'Repeat orders decaying under a cumulative curve',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="Repeat order bars decaying under a rising cumulative value curve">' +
      '<line class="d" x1="6" y1="58.8" x2="114" y2="58.8"/>' +
      '<rect class="f6" x="10" y="24.8" width="11" height="34"/>' +
      '<rect class="f6" x="27" y="35.8" width="11" height="23"/>' +
      '<rect class="f6" x="44" y="43.8" width="11" height="15"/>' +
      '<rect class="f6" x="61" y="48.8" width="11" height="10"/>' +
      '<rect class="f6" x="78" y="51.8" width="11" height="7"/>' +
      '<rect class="f6" x="95" y="53.8" width="11" height="5"/>' +
      '<path class="gk" d="M15.5 45 C30 37 40 29 49.5 25 S 80 19 100.5 17"/>' +
      '<circle class="g" cx="15.5" cy="45" r="2.4"/><circle class="g" cx="49.5" cy="25" r="2.4"/><circle class="g" cx="100.5" cy="17" r="2.4"/></svg>'
  };

  S['cac'] = {
    cap: 'Funnel from spend down to one customer',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="A funnel narrowing from total spend down to the cost of one customer">' +
      '<path class="k" d="M10 9 H110 L74 40 H46 Z"/>' +
      '<line class="d" x1="22" y1="19" x2="98" y2="19"/>' +
      '<line class="d" x1="34" y1="30" x2="86" y2="30"/>' +
      '<path class="g" d="M46 40 H74 L68 58.8 H52 Z"/>' +
      '<text class="lb" x="12" y="6.6">SPEND</text></svg>'
  };

  S['ltv-cac-payback'] = {
    cap: 'Cumulative contribution crossing the CAC line',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="Cumulative contribution stepping up until it crosses the acquisition cost line">' +
      '<line class="k2" x1="10" y1="7" x2="10" y2="58.8"/>' +
      '<line class="k2" x1="10" y1="58.8" x2="112" y2="58.8"/>' +
      '<line class="d" x1="10" y1="26" x2="112" y2="26"/>' +
      '<path class="k" d="M12 55 H28 V47 H44 V39 H60 V31 H76 V22 H92 V15 H110"/>' +
      '<line class="gd" x1="76" y1="26" x2="76" y2="58.8"/>' +
      '<circle class="g" cx="76" cy="26" r="3.6"/>' +
      '<text class="lb" x="13" y="23">CAC</text></svg>'
  };

  S['aov'] = {
    cap: 'Order value spread with the average marked',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="A distribution of order values with the average marked and a shift to the right">' +
      '<line class="d" x1="6" y1="58.8" x2="114" y2="58.8"/>' +
      '<rect class="f6" x="10" y="53.8" width="8" height="5"/>' +
      '<rect class="f6" x="20" y="47.8" width="8" height="11"/>' +
      '<rect class="f6" x="30" y="39.8" width="8" height="19"/>' +
      '<rect class="f6" x="40" y="29.8" width="8" height="29"/>' +
      '<rect class="f6" x="50" y="24.8" width="8" height="34"/>' +
      '<rect class="f6" x="60" y="32.8" width="8" height="26"/>' +
      '<rect class="f6" x="70" y="40.8" width="8" height="18"/>' +
      '<rect class="f6" x="80" y="46.8" width="8" height="12"/>' +
      '<rect class="f6" x="90" y="51.8" width="8" height="7"/>' +
      '<rect class="f6" x="100" y="54.8" width="8" height="4"/>' +
      '<line class="gd" x1="54" y1="12" x2="54" y2="58.8"/>' +
      '<path class="gk" d="M58 16 H76"/><path class="g" d="M76 12.6 l6 3.4 -6 3.4z"/></svg>'
  };

  S['repeat-purchase-rate'] = {
    cap: 'Customer matrix, exchange orders struck out',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="A customer matrix with repeat buyers filled and exchange orders struck out">' +
      '<circle class="g" cx="14" cy="15" r="5.2"/>' +
      '<circle class="k2" cx="32" cy="15" r="5.2"/>' +
      '<circle class="g" cx="50" cy="15" r="5.2"/>' +
      '<circle class="k2" cx="68" cy="15" r="5.2"/>' +
      '<circle class="k2" cx="86" cy="15" r="5.2"/>' +
      '<circle class="k2" cx="104" cy="15" r="5.2"/><line class="k2" x1="100.4" y1="18.6" x2="107.6" y2="11.4"/>' +
      '<circle class="k2" cx="14" cy="35" r="5.2"/>' +
      '<circle class="k2" cx="32" cy="35" r="5.2"/>' +
      '<circle class="g" cx="50" cy="35" r="5.2"/>' +
      '<circle class="g" cx="68" cy="35" r="5.2"/>' +
      '<circle class="k2" cx="86" cy="35" r="5.2"/><line class="k2" x1="82.4" y1="38.6" x2="89.6" y2="31.4"/>' +
      '<circle class="k2" cx="104" cy="35" r="5.2"/>' +
      '<circle class="g" cx="14" cy="55" r="5.2"/>' +
      '<circle class="k2" cx="32" cy="55" r="5.2"/>' +
      '<circle class="k2" cx="50" cy="55" r="5.2"/>' +
      '<circle class="k2" cx="68" cy="55" r="5.2"/>' +
      '<circle class="g" cx="86" cy="55" r="5.2"/>' +
      '<circle class="k2" cx="104" cy="55" r="5.2"/></svg>'
  };

  S['pricing-margin'] = {
    cap: 'Price stack read against a target ruler',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="A price column of cost under margin, read against a target on a ruler">' +
      '<rect class="g" x="14" y="10" width="38" height="19" rx="1.4"/>' +
      '<rect class="h" x="14" y="29" width="38" height="29.8"/>' +
      '<rect class="k" x="14" y="10" width="38" height="48.8" rx="1.4"/>' +
      '<line class="k2" x1="14" y1="29" x2="52" y2="29"/>' +
      '<line class="k2" x1="76" y1="10" x2="76" y2="58.8"/>' +
      '<line class="k2" x1="76" y1="10" x2="82" y2="10"/><line class="k2" x1="76" y1="22" x2="82" y2="22"/>' +
      '<line class="k2" x1="76" y1="34" x2="82" y2="34"/><line class="k2" x1="76" y1="46" x2="82" y2="46"/>' +
      '<line class="k2" x1="76" y1="58.8" x2="82" y2="58.8"/>' +
      '<line class="gd" x1="54" y1="22" x2="66" y2="22"/>' +
      '<path class="g" d="M74 22 l-7 -4.6 v9.2z"/></svg>'
  };

  S['mer-calculator'] = {
    cap: 'Store revenue over all marketing spend',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="Store revenue over all marketing spend, drawn as a fraction">' +
      '<rect class="k" x="8" y="5" width="104" height="20" rx="2.4"/>' +
      '<rect class="f6" x="9.2" y="6.2" width="101.6" height="17.6"/>' +
      '<text class="lbw" x="26" y="17.4">ALL REVENUE</text>' +
      '<rect class="f" x="8" y="31" width="104" height="4.6" rx="2.3"/>' +
      '<rect class="g" x="30" y="42" width="60" height="20" rx="2.4"/>' +
      '<rect class="k2" x="30" y="42" width="60" height="20" rx="2.4"/>' +
      '<text class="lb" x="42" y="54.4">ALL SPEND</text></svg>'
  };

  S['blended-roas-calculator'] = {
    cap: 'Channel revenue stacked over one spend bar',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="Channel revenue stacked over one spend bar, with refunded revenue notched out">' +
      '<rect class="f" x="10" y="9" width="41" height="14"/>' +
      '<rect class="f6" x="51" y="9" width="27" height="14"/>' +
      '<rect class="h" x="78" y="9" width="21" height="14"/>' +
      '<rect class="gd" x="99" y="9" width="11" height="14"/>' +
      '<line class="gd" x1="99" y1="23" x2="110" y2="9"/>' +
      '<rect class="k" x="10" y="9" width="100" height="14" rx="1.4"/>' +
      '<rect class="f" x="10" y="31" width="100" height="2.6" rx="1.3"/>' +
      '<rect class="g" x="10" y="41" width="42" height="17" rx="2"/>' +
      '<text class="lb" x="14" y="52.6">SPEND</text></svg>'
  };

  S['cpm-calculator'] = {
    cap: 'Impression field priced per thousand',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="A field of impressions bracketed and priced per thousand">' +
      '<g class="f6">' +
      '<circle cx="14" cy="16" r="1.7"/><circle cx="23" cy="16" r="1.7"/><circle cx="32" cy="16" r="1.7"/><circle cx="41" cy="16" r="1.7"/><circle cx="50" cy="16" r="1.7"/><circle cx="59" cy="16" r="1.7"/><circle cx="68" cy="16" r="1.7"/><circle cx="77" cy="16" r="1.7"/><circle cx="86" cy="16" r="1.7"/>' +
      '<circle cx="14" cy="26" r="1.7"/><circle cx="23" cy="26" r="1.7"/><circle cx="32" cy="26" r="1.7"/><circle cx="41" cy="26" r="1.7"/><circle cx="50" cy="26" r="1.7"/><circle cx="59" cy="26" r="1.7"/><circle cx="68" cy="26" r="1.7"/><circle cx="77" cy="26" r="1.7"/><circle cx="86" cy="26" r="1.7"/>' +
      '<circle cx="14" cy="36" r="1.7"/><circle cx="23" cy="36" r="1.7"/><circle cx="32" cy="36" r="1.7"/><circle cx="41" cy="36" r="1.7"/><circle cx="50" cy="36" r="1.7"/><circle cx="59" cy="36" r="1.7"/><circle cx="68" cy="36" r="1.7"/><circle cx="77" cy="36" r="1.7"/><circle cx="86" cy="36" r="1.7"/>' +
      '<circle cx="14" cy="46" r="1.7"/><circle cx="23" cy="46" r="1.7"/><circle cx="32" cy="46" r="1.7"/><circle cx="41" cy="46" r="1.7"/><circle cx="50" cy="46" r="1.7"/><circle cx="59" cy="46" r="1.7"/><circle cx="68" cy="46" r="1.7"/><circle cx="77" cy="46" r="1.7"/><circle cx="86" cy="46" r="1.7"/>' +
      '<circle cx="14" cy="56" r="1.7"/><circle cx="23" cy="56" r="1.7"/><circle cx="32" cy="56" r="1.7"/><circle cx="41" cy="56" r="1.7"/><circle cx="50" cy="56" r="1.7"/><circle cx="59" cy="56" r="1.7"/><circle cx="68" cy="56" r="1.7"/><circle cx="77" cy="56" r="1.7"/><circle cx="86" cy="56" r="1.7"/>' +
      '</g>' +
      '<rect class="gd" x="9" y="10" width="82" height="52" rx="2"/>' +
      '<line class="k2" x1="91" y1="36" x2="97" y2="36"/>' +
      '<rect class="g" x="97" y="27" width="15" height="18" rx="2"/>' +
      '<text class="lb" x="101.5" y="40">$</text></svg>'
  };

  S['cpc-calculator'] = {
    cap: 'Clicks converging, cost against the ceiling',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="Spend over clicks with a division rule, and the cost of one click marked in gold">' +
      '<rect class="k" x="8" y="5" width="104" height="16" rx="2"/>' +
      '<rect class="f6" x="9" y="6" width="102" height="14"/>' +
      '<text class="lbw" x="14" y="15.4">SPEND</text>' +
      '<rect class="f" x="8" y="28" width="104" height="3.6" rx="1.8"/>' +
      '<g class="f6"><rect x="8" y="38" width="4.4" height="14" rx="1"/><rect x="18.4" y="38" width="4.4" height="14" rx="1"/><rect x="28.8" y="38" width="4.4" height="14" rx="1"/><rect x="39.2" y="38" width="4.4" height="14" rx="1"/><rect x="49.6" y="38" width="4.4" height="14" rx="1"/><rect x="60" y="38" width="4.4" height="14" rx="1"/><rect x="70.4" y="38" width="4.4" height="14" rx="1"/><rect x="80.8" y="38" width="4.4" height="14" rx="1"/></g>' +
      '<text class="lb" x="8" y="61">CLICKS</text>' +
      '<line class="k2" x1="87" y1="45" x2="93" y2="45"/>' +
      '<rect class="g" x="93" y="36" width="19" height="18" rx="2"/>' +
      '<text class="lb" x="97" y="48">$ / 1</text>' +
      '<path class="gk" d="M93 58 h19"/></svg>'
  };

  S['cpa-calculator'] = {
    cap: 'Clicks to carts to orders, last step bracketed',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="Clicks to carts to orders, with the cost of the last step bracketed">' +
      '<rect class="k2" x="10" y="11" width="94" height="12" rx="1.4"/>' +
      '<path class="d" d="M57 23 v5"/>' +
      '<rect class="k2" x="26" y="28" width="62" height="12" rx="1.4"/>' +
      '<path class="d" d="M57 40 v5"/>' +
      '<rect class="g" x="40" y="45" width="34" height="13.8" rx="1.4"/>' +
      '<text class="lb" x="44" y="55">ORDERS</text>' +
      '<path class="gk" d="M80 45 h5 v13.8 h-5"/></svg>'
  };

  S['ctr-calculator'] = {
    cap: 'Two rates, confidence whiskers still overlapping',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="Two click-through rates with confidence whiskers still overlapping">' +
      '<line class="k2" x1="12" y1="8" x2="12" y2="58.8"/>' +
      '<rect class="f6" x="12" y="16" width="48" height="10"/>' +
      '<path class="k2" d="M48 21 H74 M48 16.5 v9 M74 16.5 v9"/>' +
      '<rect class="g" x="12" y="40" width="66" height="10"/>' +
      '<path class="k2" d="M66 45 H92 M66 40.5 v9 M92 40.5 v9"/>' +
      '<rect class="gd" x="66" y="12" width="8" height="42"/>' +
      '<text class="lb" x="14" y="13">A</text><text class="lb" x="14" y="37">B</text></svg>'
  };

  S['conversion-rate-calculator'] = {
    cap: 'Blended line with each source scattered around it',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="A blended conversion line with each traffic source scattered around it">' +
      '<line class="d" x1="10" y1="58.8" x2="112" y2="58.8"/>' +
      '<line class="gd" x1="10" y1="34" x2="112" y2="34"/>' +
      '<line class="k2" x1="18" y1="34" x2="18" y2="50"/><circle class="f" cx="18" cy="50" r="3.1"/>' +
      '<line class="k2" x1="35" y1="34" x2="35" y2="19"/><circle class="f" cx="35" cy="19" r="3.1"/>' +
      '<line class="k2" x1="52" y1="34" x2="52" y2="43"/><circle class="f" cx="52" cy="43" r="3.1"/>' +
      '<line class="k2" x1="69" y1="34" x2="69" y2="13"/><circle class="f" cx="69" cy="13" r="3.1"/>' +
      '<line class="k2" x1="86" y1="34" x2="86" y2="47"/><circle class="f" cx="86" cy="47" r="3.1"/>' +
      '<line class="k2" x1="103" y1="34" x2="103" y2="27"/><circle class="f" cx="103" cy="27" r="3.1"/></svg>'
  };

  S['meta-ads-budget-calculator'] = {
    cap: 'One budget split at the prospecting line',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="One budget bar split at the prospecting line, with the new customers it buys">' +
      '<path class="k2" d="M10 15 v-5 H110 v5"/>' +
      '<rect class="h" x="10" y="21" width="71" height="16"/>' +
      '<rect class="g" x="81" y="21" width="29" height="16"/>' +
      '<rect class="k" x="10" y="21" width="100" height="16" rx="1.4"/>' +
      '<line class="k" x1="81" y1="21" x2="81" y2="37"/>' +
      '<g class="f6"><rect x="10" y="48" width="7" height="7" rx="1"/><rect x="20.5" y="48" width="7" height="7" rx="1"/><rect x="31" y="48" width="7" height="7" rx="1"/><rect x="41.5" y="48" width="7" height="7" rx="1"/><rect x="52" y="48" width="7" height="7" rx="1"/><rect x="62.5" y="48" width="7" height="7" rx="1"/><rect x="73" y="48" width="7" height="7" rx="1"/></g>' +
      '<g class="g"><rect x="83.5" y="48" width="7" height="7" rx="1"/><rect x="94" y="48" width="7" height="7" rx="1"/><rect x="104.5" y="48" width="7" height="7" rx="1"/></g></svg>'
  };

  S['google-ads-budget-calculator'] = {
    cap: 'Brand demand hatched, non-brand solid',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="Brand demand hatched beside the non-brand budget that buys new demand">' +
      '<rect class="h" x="14" y="25" width="38" height="33.8"/>' +
      '<rect class="k" x="14" y="25" width="38" height="33.8" rx="1.4"/>' +
      '<rect class="g" x="68" y="11" width="38" height="47.8" rx="1.4"/>' +
      '<line class="gd" x1="60" y1="7" x2="60" y2="60"/>' +
      '<text class="lb" x="18" y="21">BRAND</text>' +
      '<text class="lb" x="68" y="7.6">NON-BRAND</text></svg>'
  };

  S['ad-copy-generator'] = {
    cap: 'Copy lines inside the constraint frame',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="Copy lines inside a constraint frame, with the banned phrase struck out">' +
      '<path class="gk" d="M9 13 l3.4 3.4 L18 10"/>' +
      '<path class="gk" d="M9 25 l3.4 3.4 L18 22"/>' +
      '<path class="k2" d="M9 34 l7 7 M16 34 l-7 7"/>' +
      '<path class="gk" d="M9 49 l3.4 3.4 L18 46"/>' +
      '<path class="gk" d="M9 60 l3.4 3.4 L18 57"/>' +
      '<rect class="k" x="26" y="7" width="84" height="52" rx="3"/>' +
      '<g class="f6"><rect x="32" y="14" width="70" height="3.2"/><rect x="32" y="24" width="57" height="3.2"/><rect x="32" y="34" width="66" height="3.2"/><rect x="32" y="44" width="43" height="3.2"/><rect x="32" y="52" width="61" height="3.2"/></g>' +
      '<line class="gk" x1="30" y1="35.6" x2="102" y2="35.6"/></svg>'
  };

  S['email-roi-calculator'] = {
    cap: 'Sends in, revenue up, costs down, net in gold',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="Sends in, revenue up, costs down, with the net in gold">' +
      '<rect class="k" x="8" y="17" width="30" height="22" rx="2"/>' +
      '<path class="k2" d="M8 17 L23 30 L38 17"/>' +
      '<path class="k2" d="M42 28 H52"/><path class="f" d="M52 25.4 l5.4 2.6 -5.4 2.6z"/>' +
      '<path class="k2" d="M62 28 V15 H72"/>' +
      '<rect class="g" x="74" y="8" width="34" height="14" rx="1.6"/>' +
      '<path class="k2" d="M62 28 V45 H72"/>' +
      '<rect class="f6" x="74" y="38" width="18" height="5.4"/>' +
      '<rect class="f6" x="74" y="46" width="26" height="5.4"/>' +
      '<rect class="f6" x="74" y="54" width="13" height="5.4"/></svg>'
  };

  S['email-list-value-calculator'] = {
    cap: 'Subscriber rows, the dead ones struck out',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="Subscriber rows with the dead ones struck out and the live ones bracketed">' +
      '<rect class="f6" x="12" y="10" width="58" height="4.6"/>' +
      '<rect class="f6" x="12" y="18" width="58" height="4.6"/>' +
      '<rect class="f6" x="12" y="26" width="58" height="4.6"/>' +
      '<rect class="f6" x="12" y="34" width="58" height="4.6"/>' +
      '<rect class="k2" x="12" y="42" width="58" height="4.6"/><line class="k2" x1="12" y1="46.6" x2="70" y2="42"/>' +
      '<rect class="k2" x="12" y="50" width="58" height="4.6"/><line class="k2" x1="12" y1="54.6" x2="70" y2="50"/>' +
      '<path class="gk" d="M76 10 h5 v28.6 h-5"/>' +
      '<rect class="g" x="90" y="17" width="20" height="15" rx="2"/>' +
      '<text class="lb" x="97" y="28">$</text></svg>'
  };

  S['email-flow-scorecard'] = {
    cap: 'Eight flows, weighted, scored',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="Eight flows scored, each weighted by the revenue it carries">' +
      '<rect class="f" x="10" y="8" width="4" height="4.8"/><rect class="g" x="18" y="8" width="80" height="4.8"/>' +
      '<rect class="f6" x="10" y="16" width="3" height="4.8"/><rect class="f6" x="18" y="16" width="58" height="4.8"/>' +
      '<rect class="f6" x="10" y="24" width="2" height="4.8"/><rect class="f6" x="18" y="24" width="41" height="4.8"/>' +
      '<rect class="f" x="10" y="32" width="4" height="4.8"/><rect class="g" x="18" y="32" width="68" height="4.8"/>' +
      '<rect class="f6" x="10" y="40" width="2" height="4.8"/><rect class="f6" x="18" y="40" width="30" height="4.8"/>' +
      '<rect class="f6" x="10" y="48" width="2" height="4.8"/><rect class="f6" x="18" y="48" width="22" height="4.8"/>' +
      '<rect class="f" x="10" y="56" width="3" height="4.8"/><rect class="g" x="18" y="56" width="49" height="4.8"/>' +
      '<path class="gk" d="M104 8 h6 v52.8 h-6"/></svg>'
  };

  S['subject-line-grader'] = {
    cap: 'A subject line measured against the character rule',
    svg: '<svg class="sch" viewBox="0 0 120 68" role="img" aria-label="A subject line measured against the character rule, with the score on a gauge">' +
      '<line class="k2" x1="10" y1="11" x2="110" y2="11"/>' +
      '<g class="k2"><line x1="10" y1="11" x2="10" y2="14.6"/><line x1="30" y1="11" x2="30" y2="14"/><line x1="50" y1="11" x2="50" y2="14"/><line x1="90" y1="11" x2="90" y2="14"/><line x1="110" y1="11" x2="110" y2="14.6"/></g>' +
      '<path class="gk" d="M70 5 V17"/>' +
      '<rect class="k" x="10" y="21" width="100" height="15" rx="2.4"/>' +
      '<g class="f6"><rect x="15" y="26.4" width="14" height="4.2"/><rect x="32" y="26.4" width="9" height="4.2"/><rect x="44" y="26.4" width="19" height="4.2"/><rect x="66" y="26.4" width="14" height="4.2"/><rect x="83" y="26.4" width="21" height="4.2"/></g>' +
      '<path class="gk" d="M32 58 A28 28 0 0 1 88 58"/>' +
      '<path class="k" d="M60 58 L74 40"/>' +
      '<circle class="f" cx="60" cy="58" r="2.8"/></svg>'
  };

  function get(slug){ return S[slug] || null; }

  function hydrate(root){
    var host = root || document;
    var nodes = host.querySelectorAll('[data-sch]');
    Array.prototype.forEach.call(nodes, function (node) {
      /* idempotent: a baked tile already holds its drawing, so leave it alone */
      if (node.firstElementChild) return;
      var rec = S[node.getAttribute('data-sch')];
      if (!rec) return;
      node.innerHTML = rec.svg;
    });
    if (!host.querySelector || !document.querySelector('svg.schdefs')) {
      var d = document.createElement('div');
      d.innerHTML = DEFS;
      if (d.firstChild) document.body.insertBefore(d.firstChild, document.body.firstChild);
    }
  }

  window.RiseSchematics = { get: get, all: S, defs: function(){ return DEFS; }, hydrate: hydrate };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ hydrate(document); });
  } else {
    hydrate(document);
  }
})();
