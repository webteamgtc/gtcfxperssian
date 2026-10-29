import { setRequestLocale } from 'next-intl/server';
import MetaTraderPage from '../common-metatrader/components/MetaTraderPage';
import { mtMetadata } from '../common-metatrader/metaPage';

const NS = 'metatraderIpadPage';
const PATH = '/trading/metatrader-for-ipad';

const links = {
  androidMt4: "https://download.terminal.free/cdn/mobile/mt4/ios",
    androidMt5: "https://download.terminal.free/cdn/mobile/mt5/ios",

}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return mtMetadata(locale, NS, PATH);
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MetaTraderPage ns="metatraderIpadPage" bodyNs="mt4Page" version="mt4" device="ios" links={links}/>;
}
