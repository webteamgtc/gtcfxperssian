import { setRequestLocale } from 'next-intl/server';
import MetaTraderPage from '../common-metatrader/components/MetaTraderPage';
import { mtMetadata } from '../common-metatrader/metaPage';

const NS = 'mt4Page';
const PATH = '/trading/mt4-platform';

const links={
  windows: "https://download.terminal.free/cdn/web/gtc.global.sa/mt4/gtcglobalsa4setup.exe",
  mac: "https://download.terminal.free/cdn/web/gtc.global.sa/mt4/gtcglobalsa4setup.exe",
  linux: "https://download.terminal.free/cdn/web/gtc.global.sa/mt4/gtcglobalsa4setup.exe",
  ios: "https://download.terminal.free/cdn/mobile/mt4/ios",
  android: "https://download.terminal.free/cdn/web/gtc.global.sa/mt4/gtcglobalsa4setup.exe",
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return mtMetadata(locale, NS, PATH);
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MetaTraderPage ns="mt4Page" version="mt4" links={links} />;
}
