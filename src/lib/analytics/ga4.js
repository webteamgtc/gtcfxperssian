/**
 * GA4 / GTM helpers for conversion events that can be imported into Google Ads.
 *
 * After these events appear in GA4 (Admin → Events → mark as Key events),
 * import them into Google Ads from the MCC (manager) account:
 * https://support.google.com/analytics/answer/10632359
 */

export const GA4_MEASUREMENT_ID = "G-EGK1L0DGDX";
export const GOOGLE_ADS_ID = "AW-18143283488";
/** Primary GTM container — installed in root layout head + body. */
export const GTM_PRIMARY_CONTAINER_ID = "GTM-MPT7GX84";
/** Legacy GTM container — kept in code but disabled when legacy scripts are off. */
export const GTM_CONTAINER_ID = "GTM-PSWH9QF";
/** Set false to hide legacy ThirdPartyScripts (gtag, old GTM, pixels) without deleting code. */
export const LEGACY_THIRD_PARTY_SCRIPTS_ENABLED = true;
/** Google Ads lead conversion (direct send_to). Update label in Google Ads if needed. */
export const LIVE_ACCOUNT_ADS_CONVERSION = "AW-18143283488";

/** Custom GA4 event name — mark as a key event, then import at MCC level. */
export const LIVE_ACCOUNT_GA4_EVENT = "live_account_application";

function canTrack() {
  return typeof window !== "undefined";
}

function pushDataLayer(payload) {
  if (!canTrack()) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
}

function gtag(...args) {
  if (!canTrack() || typeof window.gtag !== "function") return;
  window.gtag(...args);
}

/**
 * Fire GA4 + GTM + Google Ads conversion for a successful live-account registration.
 * Safe to call multiple times only once per success path (caller responsibility).
 */
export function trackLiveAccountApplicationSuccess({
  accountKey = "standard-account",
  country = "",
  hasPartnerCode = false,
} = {}) {
  if (!canTrack()) return;

  try {
    sendLiveAccountEvents({ accountKey, country, hasPartnerCode });
  } catch {
    // Analytics must never affect the registration result.
  }
}

function sendLiveAccountEvents({ accountKey, country, hasPartnerCode }) {
  const params = {
    form_name: "live_account_application",
    account_type: accountKey,
    country: country || undefined,
    has_partner_code: hasPartnerCode,
    method: "website",
    send_to: GA4_MEASUREMENT_ID,
  };

  // 1) GA4 recommended lead event (importable into Google Ads)
  gtag("event", "generate_lead", params);

  // 2) Explicit custom key event for GA4 → Ads MCC import
  gtag("event", LIVE_ACCOUNT_GA4_EVENT, params);

  // 3) Recommended signup event (account created)
  gtag("event", "sign_up", {
    method: "live_account_application",
    account_type: accountKey,
  });

  // 4) Existing Google Ads conversion tag
  if (typeof window.gtag_report_conversion === "function") {
    window.gtag_report_conversion();
  } else {
    gtag("event", "conversion", {
      send_to: LIVE_ACCOUNT_ADS_CONVERSION,
    });
  }

  // 5) GTM dataLayer (for tags configured in GTM container)
  pushDataLayer({
    event: "live_account_application",
    formName: "live_account_application",
    accountType: accountKey,
    country: country || undefined,
    hasPartnerCode,
  });
  pushDataLayer({
    event: "formSubmission",
    formName: "live_account_application",
  });
}
