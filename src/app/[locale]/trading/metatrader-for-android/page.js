import { setRequestLocale } from 'next-intl/server';
import MetaTraderPage from '../common-metatrader/components/MetaTraderPage';
import { mtMetadata } from '../common-metatrader/metaPage';

const NS = 'metatraderAndroidPage';
const PATH = '/trading/metatrader-for-android';

const links = {
  androidMt4: "https://download.terminal.free/cdn/web/gtc.global.sa/mt4/gtcglobalsa4setup.exe",
    androidMt5: "https://download.terminal.free/cdn/web/gtc.global.trade/mt5/gtcglobaltrade5setup.exe",

}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return mtMetadata(locale, NS, PATH);
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MetaTraderPage ns="metatraderAndroidPage" bodyNs="mt4Page" version="mt4" device="android" links={links} />;
}
