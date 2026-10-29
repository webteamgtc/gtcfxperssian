'use client';
import { useEffect } from 'react';
import { useLocale } from 'next-intl';

/** notFound() on a page (unknown news article, symbol, guide…) → that locale's Home; the response itself stays a 404. */
export default function NotFound() {
  const locale = useLocale();
  useEffect(() => {
    window.location.replace(`/${locale}`);
  }, [locale]);
  return null;
}
