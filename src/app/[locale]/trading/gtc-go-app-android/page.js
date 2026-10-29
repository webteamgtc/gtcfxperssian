import { setRequestLocale } from 'next-intl/server';
import GtcGoPage from '../common-gtc-components/components/GtcGoPage';
import { mtMetadata as metadataFor } from '../common-metatrader/metaPage';

const NS = 'gtcGoAndroidPage';
const PATH = '/trading/gtc-go-app-android';

export async function generateMetadata({ params }) {
  const { locale } = await params;
  return metadataFor(locale, NS, PATH);
}

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GtcGoPage ns={NS} device="android" />;
}
