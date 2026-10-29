import '@fontsource-variable/inter';
import '@fontsource/ibm-plex-sans-arabic/400.css';
import '@fontsource/ibm-plex-sans-arabic/600.css';
import '@fontsource/ibm-plex-sans-arabic/700.css';
import '../globals.css';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import ClientMessages from '@/i18n/ClientMessages';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Providers from '@/components/Providers';
import { routing } from '@/i18n/routing';
import { getDir, hreflangOf } from '@/i18n/locales';
import { SITE_URL } from '@/lib/seo';
import { INTRO_SCRIPT } from '@/components/shared/intro/introScript';
import { Analytics } from '@vercel/analytics/next';
import UmamiScript from '@/lib/analytics/UmamiScript';
import ThirdPartyScripts from '@/lib/ThirdPartyScripts';
import ConvrsChatScript from '@/config/ConvrsChatScript';

const VERCEL_ANALYTICS = process.env.NEXT_PUBLIC_STATIC_EXPORT !== '1';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    metadataBase: new URL(SITE_URL),
    title: t('title'),
    description: t('description'),
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [hreflangOf(l), `/${l}`]))
    }
  };
}

export default async function LocaleLayout({ children, schema, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={hreflangOf(locale)} dir={getDir(locale)} suppressHydrationWarning>
      <head>
        {/* decides before the first paint whether the opening intro plays (once per session) */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        {/* page structured data (JSON-LD) from the @schema slot — see ./@schema/routes.js */}
        {schema}
      </head>
      <body className="min-h-screen bg-white text-ink">
        <ClientMessages>
          <Providers>{children}</Providers>
        </ClientMessages>
        {/* site-wide analytics / ads tags (off in local development) */}
        <ThirdPartyScripts />
        {/* Vercel Web Analytics (Dashboard → Analytics; active on Vercel deployments) */}
        {VERCEL_ANALYTICS ? <Analytics /> : null}
        <UmamiScript />
        {/* Convrs live chat widget (loads when the browser is idle) */}
        <ConvrsChatScript />
      </body>
    </html>
  );
}
