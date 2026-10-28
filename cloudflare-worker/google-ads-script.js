/**
 * Melsa Elevators: send Google Ads numbers to the owner dashboard.
 *
 * Paste into Google Ads → Tools → Bulk actions → Scripts, set PUSH_KEY to the
 * worker's ADS_PUSH_KEY secret, authorise, and schedule it "Hourly".
 */
var PUSH_URL = "https://melsa-ai.joeadel755.workers.dev/ads/push";
var PUSH_KEY = "PASTE_ADS_PUSH_KEY_HERE";
var START = "2026-10-28"; // first day of the offer

function rows(query) {
  var out = [], it = AdsApp.search(query);
  while (it.hasNext()) out.push(it.next());
  return out;
}
function m(r) {
  var x = (r && r.metrics) || {};
  return {
    cost: Number(x.costMicros || 0) / 1e6,
    clicks: Number(x.clicks || 0),
    impr: Number(x.impressions || 0),
    conv: Number(x.conversions || 0)
  };
}
function totals(where) {
  var r = rows("SELECT metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions FROM customer WHERE " + where);
  return m(r[0]);
}

function main() {
  var acct = AdsApp.currentAccount();
  var tz = acct.getTimeZone();
  var today = Utilities.formatDate(new Date(), tz, "yyyy-MM-dd");
  var all = "segments.date BETWEEN '" + START + "' AND '" + today + "'";

  var data = {
    updated: new Date().toISOString(),
    account: acct.getCustomerId(),
    currency: acct.getCurrencyCode(),
    start: START,
    total: totals(all),
    today: totals("segments.date DURING TODAY"),
    yesterday: totals("segments.date DURING YESTERDAY"),
    last7: totals("segments.date DURING LAST_7_DAYS"),
    daily: rows("SELECT segments.date, metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions FROM customer WHERE " + all + " ORDER BY segments.date")
      .map(function (r) { var o = m(r); o.date = r.segments.date; return o; }),
    campaigns: rows("SELECT campaign.name, campaign.status, campaign.primary_status, campaign_budget.amount_micros, metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions FROM campaign WHERE campaign.status != 'REMOVED' AND " + all)
      .map(function (r) { var o = m(r); o.name = r.campaign.name; o.status = r.campaign.status; o.primary = r.campaign.primaryStatus || ""; o.budget = Number((r.campaignBudget || {}).amountMicros || 0) / 1e6; return o; }),
    ads: rows("SELECT ad_group_ad.ad.id, ad_group_ad.status, ad_group_ad.policy_summary.approval_status, ad_group_ad.policy_summary.review_status FROM ad_group_ad WHERE ad_group_ad.status != 'REMOVED'")
      .map(function (r) { var a = r.adGroupAd; return { id: String(a.ad.id), status: a.status, approval: (a.policySummary || {}).approvalStatus || "", review: (a.policySummary || {}).reviewStatus || "" }; }),
    keywords: rows("SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions FROM keyword_view WHERE " + all + " ORDER BY metrics.clicks DESC LIMIT 15")
      .map(function (r) { var o = m(r); o.text = r.adGroupCriterion.keyword.text; o.match = r.adGroupCriterion.keyword.matchType; return o; }),
    terms: rows("SELECT search_term_view.search_term, metrics.cost_micros, metrics.clicks, metrics.impressions, metrics.conversions FROM search_term_view WHERE " + all + " ORDER BY metrics.cost_micros DESC LIMIT 15")
      .map(function (r) { var o = m(r); o.text = r.searchTermView.searchTerm; return o; })
  };

  var res = UrlFetchApp.fetch(PUSH_URL, {
    method: "post",
    contentType: "application/json",
    headers: { "X-Push-Key": PUSH_KEY },
    payload: JSON.stringify(data),
    muteHttpExceptions: true
  });
  Logger.log("Dashboard update: " + res.getResponseCode() + " " + res.getContentText());
}
