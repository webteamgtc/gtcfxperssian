'use client';
/**
 * Client-side navigations don't reload the page, so tags that only count the initial load miss them.
 * This sends a Meta Pixel PageView on every route change after the first (the first one is sent by the
 * pixel snippet in src/lib/ThirdPartyScripts.js). GA4 (enhanced measurement) and Umami count route changes
 * themselves, so they are not repeated here.
 */
import { Suspense, useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function Tracker() {
  const pathname = usePathname();
  const search = useSearchParams()?.toString();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (typeof window.fbq === 'function') window.fbq('track', 'PageView');
  }, [pathname, search]);

  return null;
}

// useSearchParams needs a Suspense boundary so static pages can still be prerendered
export default function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
