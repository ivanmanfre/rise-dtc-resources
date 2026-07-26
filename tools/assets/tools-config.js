/**
 * RISE DTC tools hub, per-tool configuration.
 *
 * ONE place to flip a gate. Nothing else in the template reads a gate value.
 *   gate: "ungated"       -> everything visible; the scorecard email block is an optional offer.
 *   gate: "email_to_save" -> everything visible; email is required only to send the scorecard.
 *   gate: "email_to_see"  -> results blurred until a valid email is captured. Implemented, used nowhere.
 *   gate: "email_to_run"  -> everything on the page is visible; the email is what buys the model
 *                            call on the two tools that run on a request. Used by 21 and 25.
 *
 * order  = hub position 01 to 25 (Unit economics 01-11, Paid ads 12-21, Email 22-25)
 * title  = the label used on the hub and in every cross-link on every page
 * promise = the one-line hub description and cross-link subtitle
 *
 * The renumber that took this file from 22 tools to 25 inserted
 * blended-roas-calculator at 13 and ad-copy-generator at 21, and appended
 * subject-line-grader at 25. Slugs never changed, so no URL moved. The
 * existing 22 tools' gate values are byte-identical to the pre-renumber file.
 */
(function () {
  var W = (typeof globalThis !== 'undefined')
    ? (globalThis.window || (globalThis.window = globalThis))
    : this;

  W.RISE_TOOLS_CONFIG = {

    /* ---------------------------------------------- Unit economics, 01 to 11 */

    'true-profit-per-order': {
      order: '01', family: 'uniteco', gate: 'ungated',
      title: 'True Profit Per Order',
      promise: 'What one order leaves you after returns, shipping, card fees and acquisition.'
    },
    'contribution-margin': {
      order: '02', family: 'uniteco', gate: 'ungated',
      title: 'Contribution Margin',
      promise: 'Your margin per unit after returns, and the extra units returns force you to sell.'
    },
    'free-shipping-threshold': {
      order: '03', family: 'uniteco', gate: 'ungated',
      title: 'Free Shipping Threshold',
      promise: 'A threshold that survives the customer who adds one more item, then sends it back.'
    },
    'discount-roi': {
      order: '04', family: 'uniteco', gate: 'ungated',
      title: 'Discount ROI',
      promise: 'The lift a promo needs before it pays, counting the discounted orders that come back.'
    },
    'break-even-roas': {
      order: '05', family: 'uniteco', gate: 'ungated',
      title: 'Break-Even ROAS',
      promise: 'The ROAS your own margin requires, once returns are inside it.'
    },
    'ltv': {
      order: '06', family: 'uniteco', gate: 'ungated',
      title: 'Customer Lifetime Value',
      promise: 'LTV on the revenue you keep, with exchanges retained and refunds removed.'
    },
    'cac': {
      order: '07', family: 'uniteco', gate: 'ungated',
      title: 'Customer Acquisition Cost',
      promise: 'Blended CAC, per-channel CAC, and the gap against what the ad platform claims.'
    },
    'ltv-cac-payback': {
      order: '08', family: 'uniteco', gate: 'ungated',
      title: 'LTV to CAC and Payback',
      promise: 'Your ratio and payback window as a range, with the guesswork made visible.'
    },
    'aov': {
      order: '09', family: 'uniteco', gate: 'ungated',
      title: 'Average Order Value',
      promise: 'The AOV on your dashboard, the AOV you keep, and what another $10 is worth.'
    },
    'repeat-purchase-rate': {
      order: '10', family: 'uniteco', gate: 'ungated',
      title: 'Repeat Purchase Rate',
      promise: 'Your repeat rate with exchange orders taken out, so size swaps stop inflating it.'
    },
    'pricing-margin': {
      order: '11', family: 'uniteco', gate: 'ungated',
      title: 'Pricing and Margin',
      promise: 'Markup, gross margin, realized margin after returns, and the price your target needs.'
    },

    /* ----------------------------------------------------- Paid ads, 12 to 21 */

    'mer-calculator': {
      order: '12', family: 'ads', gate: 'ungated',
      title: 'MER and aMER',
      promise: 'Whether the whole ad budget pays for itself, plus the MER floor your margin requires.'
    },
    'blended-roas-calculator': {
      order: '13', family: 'ads', gate: 'ungated',
      title: 'Blended ROAS Calculator',
      promise: 'One ROAS across every channel, the same number after returns, and how much of the store the ads are actually carrying.'
    },
    'cpm-calculator': {
      order: '14', family: 'ads', gate: 'ungated',
      title: 'CPM and Affordable CPM',
      promise: 'Spend and impressions in either direction, plus the highest CPM your funnel can carry.'
    },
    'cpc-calculator': {
      order: '15', family: 'ads', gate: 'ungated',
      title: 'CPC and Max Affordable CPC',
      promise: 'Cost per click both ways, plus the ceiling a click can cost after returns.'
    },
    'cpa-calculator': {
      order: '16', family: 'ads', gate: 'email_to_save',
      title: 'CPA and Max Affordable CPA',
      promise: 'What you pay per order and the most you can pay, on order one and across a repeat window.'
    },
    'ctr-calculator': {
      order: '17', family: 'ads', gate: 'ungated',
      title: 'CTR and A/B Significance',
      promise: 'Click-through rate for two creatives, and whether the gap between them is real yet.'
    },
    'conversion-rate-calculator': {
      order: '18', family: 'ads', gate: 'ungated',
      title: 'Conversion Rate, Blended and By Source',
      promise: 'Your site rate next to the per-source rates the blended number hides.'
    },
    'meta-ads-budget-calculator': {
      order: '19', family: 'ads', gate: 'email_to_save',
      title: 'Meta Ads Budget',
      promise: 'The budget your new-customer target needs, split across prospecting and retargeting.'
    },
    'google-ads-budget-calculator': {
      order: '20', family: 'ads', gate: 'email_to_save',
      title: 'Google Ads Budget',
      promise: 'Budget split the way the auction splits it: brand demand you already had, and non-brand.'
    },
    'ad-copy-generator': {
      order: '21', family: 'ads', gate: 'email_to_run',
      title: 'Meta Ad Copy Generator',
      promise: 'Describe the product once and get six Meta and Instagram feed ads written from six different angles.'
    },

    /* ------------------------------------------------------- Email, 22 to 25 */

    'email-roi-calculator': {
      order: '22', family: 'email', gate: 'email_to_save',
      title: 'Email Marketing ROI',
      promise: 'ROI after what subscribers, the platform, the people and the returns cost you.'
    },
    'email-list-value-calculator': {
      order: '23', family: 'email', gate: 'email_to_save',
      title: 'Email List Value',
      promise: 'What a subscriber is worth once the dead ones come out of the count.'
    },
    'email-flow-scorecard': {
      order: '24', family: 'email', gate: 'email_to_save',
      title: 'Email Flow Scorecard',
      promise: 'A weighted audit of the eight flows that carry email revenue.'
    },
    'subject-line-grader': {
      order: '25', family: 'email', gate: 'email_to_run',
      title: 'Email Subject Line Grader',
      promise: 'Paste one subject line and get it scored on the five things that decide whether it gets opened, plus three rewrites you can send.'
    }
  };
})();
