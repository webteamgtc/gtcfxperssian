import { setRequestLocale } from 'next-intl/server';
import MetaTraderPage from '../common-metatrader/components/MetaTraderPage';
import { mtMetadata } from '../common-metatrader/metaPage';

const NS = 'mt5Page';
const PATH = '/trading/mt5-platform';

const links={
  windows: "https://download.terminal.free/cdn/web/gtc.global.trade/mt5/gtcglobaltrade5setup.exe",
  mac: "https://download.terminal.free/cdn/web/gtc.global.trade/mt5/gtcglobaltrade5setup.exe",
  linux: "https://download.terminal.free/cdn/web/gtc.global.trade/mt5/gtcglobaltrade5setup.exe",
  ios: "https://download.terminal.free/cdn/mobile/mt5/ios",
  android: "https://download.terminal.free/cdn/web/gtc.global.trade/mt5/gtcglobaltrade5setup.exe",
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return mtMetadata(locale, NS, PATH);
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MetaTraderPage ns="mt5Page" version="mt5" links={links} />;
}
