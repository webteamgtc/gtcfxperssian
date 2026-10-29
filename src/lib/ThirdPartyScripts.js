import Script from 'next/script';
import { GA4_MEASUREMENT_ID, GOOGLE_ADS_ID, LEGACY_THIRD_PARTY_SCRIPTS_ENABLED, LIVE_ACCOUNT_ADS_CONVERSION } from '@/lib/analytics/ga4';
import PageViewTracker from '@/lib/analytics/PageViewTracker';

/**
 * Site-wide third-party tags, rendered once in the root layout (src/app/[locale]/layout.js):
 *   Google tag (Google Ads + GA4), Finteza, Trustpilot invitations, Meta Pixel,
 *   and window.gtag_report_conversion() for the forms.
 * All load after the page is interactive (Trustpilot when the browser is idle), so they never block rendering.
 *
 * Off in local development (keeps test traffic out of the reports) — set NEXT_PUBLIC_ANALYTICS_DEV=1 to test
 * them locally — and in static review builds. LEGACY_THIRD_PARTY_SCRIPTS_ENABLED (analytics/ga4.js) turns
 * everything off at once.
 */
const IDS = {
  finteza: 'dzwzfjftdagmxioapjzjratbyxemivrdqi',
  trustpilot: '4fTEXBqNZH9fKyyp',
  metaPixel: '884963704127462'
};

const ENABLED =
  LEGACY_THIRD_PARTY_SCRIPTS_ENABLED &&
  process.env.NEXT_PUBLIC_STATIC_EXPORT !== '1' &&
  (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ANALYTICS_DEV === '1');

export default function ThirdPartyScripts({ analytics = true, advertising = true }) {
  if (!ENABLED || (!analytics && !advertising)) return null;

  return (
    <>
      {/* Google tag: one loader for Google Ads + GA4 (GA4's enhanced measurement also counts client-side page changes) */}
      <Script id="google-gtag-loader" src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`} strategy="afterInteractive" />
      <Script id="google-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
          gtag('js', new Date());
          ${advertising ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}
          ${analytics ? `gtag('config', '${GA4_MEASUREMENT_ID}');` : ''}
        `}
      </Script>

      {analytics && (
        <>
          <Script id="finteza-script" strategy="afterInteractive">
            {`
              (function(a,e,f,g,b,c,d){
                a[b] || (
                  a.FintezaCoreObject=b,
                  a[b]=a[b]||function(){(a[b].q=a[b].q||[]).push(arguments)},
                  a[b].l=1*new Date,
                  c=e.createElement(f),
                  d=e.getElementsByTagName(f)[0],
                  c.async=!0,
                  c.defer=!0,
                  c.src=g,
                  d && d.parentNode && d.parentNode.insertBefore(c,d)
                );
              })(window,document,"script","https://content.mql5.com/core.js","fz");
              fz("register","website",{ id:"${IDS.finteza}", trackLinks:true, timeOnPage:true });
            `}
          </Script>

          <Script id="trustpilot-script" strategy="lazyOnload">
            {`
              (function(w,d,s,r,n){
                w.TrustpilotObject=n;
                w[n]=w[n]||function(){ (w[n].q=w[n].q||[]).push(arguments); };
                var a=d.createElement(s); a.async=1; a.src=r; a.type='text/javascript';
                var f=d.getElementsByTagName(s)[0]; f.parentNode.insertBefore(a,f);
              })(window,document,'script','https://invitejs.trustpilot.com/tp.min.js','tp');
              tp('register', '${IDS.trustpilot}');
            `}
          </Script>
        </>
      )}

      {advertising && (
        <>
          {/* Google Ads conversion used by the forms (TicketForm, live account tracking). Uses window.gtag so it
              never depends on load order, and still follows \`url\` if the Google tag is blocked. */}
          <Script id="aw-conversion" strategy="afterInteractive">
            {`
              window.gtag_report_conversion = function (url) {
                var done = false;
                var go = function () { if (done) return; done = true; if (typeof url !== 'undefined') window.location = url; };
                if (typeof window.gtag === 'function') {
                  window.gtag('event', 'conversion', { send_to: '${LIVE_ACCOUNT_ADS_CONVERSION}', event_callback: go, event_timeout: 2000 });
                } else { go(); }
                return false;
              };
            `}
          </Script>

          <Script id="meta-pixel" strategy="afterInteractive">
            {`
              !function(f,b,e,v,n,t,s){
                if(f.fbq) return;
                n=f.fbq=function(){ n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments); };
                if(!f._fbq) f._fbq=n;
                n.push=n; n.loaded=!0; n.version='2.0'; n.queue=[];
                t=b.createElement(e); t.async=!0; t.src=v;
                s=b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t,s);
              }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${IDS.metaPixel}');
              fbq('track', 'PageView');
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img height="1" width="1" style={{ display: 'none' }} alt="" src={`https://www.facebook.com/tr?id=${IDS.metaPixel}&ev=PageView&noscript=1`} />
          </noscript>

          {/* the pixel only counts the first page by itself — this sends PageView on every in-site navigation */}
          <PageViewTracker />
        </>
      )}
    </>
  );
}
