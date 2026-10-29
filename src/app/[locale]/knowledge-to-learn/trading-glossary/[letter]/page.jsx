import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { ALPHABET, getGlossary } from '@/lib/glossary';
import GlossaryPage from '../components/GlossaryPage';
import { glossaryMetadata } from '../meta';

export const revalidate = 86400;
export const dynamicParams = false;

export function generateStaticParams() {
  return ALPHABET.map((l) => ({ letter: l.toLowerCase() }));
}

export async function generateMetadata({ params }) {
  const { locale, letter } = await params;
  return glossaryMetadata(locale, String(letter).toUpperCase());
}

export default async function Page({ params }) {
  const { locale, letter } = await params;
  const L = String(letter).toUpperCase();
  if (!ALPHABET.includes(L)) notFound();
  setRequestLocale(locale);
  const glossary = await getGlossary(locale);
  return <GlossaryPage glossary={glossary} initialLetter={L} />;
}
