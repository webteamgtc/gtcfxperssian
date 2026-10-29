import { setRequestLocale } from 'next-intl/server';
import ClientMessages from '@/i18n/ClientMessages';

/** Sends the browser only the shared texts + messages/<lang>/tradingPage.json for this section (see src/i18n/ClientMessages.jsx). */
export default async function Layout({ children, params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ClientMessages files={['tradingPage']} pick={['features']}>{children}</ClientMessages>;
}
