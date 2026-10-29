import Script from 'next/script';

/** https://cloud.umami.is — same website id as the legacy embed. */
export const UMAMI_WEBSITE_ID = '6e6d0916-5871-41f5-8ef5-1f89b83e611b';

const ENABLED =
  process.env.NEXT_PUBLIC_STATIC_EXPORT !== '1' &&
  (process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_ANALYTICS_DEV === '1');

export default function UmamiScript() {
  if (!ENABLED) return null;
  return (
    <Script defer src="https://cloud.umami.is/script.js" data-website-id={UMAMI_WEBSITE_ID} strategy="afterInteractive" />
  );
}
