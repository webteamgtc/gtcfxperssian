/**
 * Trading glossary, loaded on the server from S3 (glossary/<lang>.json → { A: [{ term, definition }], … }).
 * Falls back to English when a language file is missing (ar / zh currently return 403). Cached for a day.
 */
const GLOSSARY_BASE = 'https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/glossary';
const TIMEOUT = 8000;

export const ALPHABET = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

async function fetchLang(lang) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT);
  try {
    const res = await fetch(`${GLOSSARY_BASE}/${lang}.json`, { next: { revalidate: 86400 }, signal: ctrl.signal });
    if (!res.ok) return null;
    const data = await res.json();
    return data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length ? data : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** { A: [{ term, definition }], … } with upper-case letter keys and clean entries; {} when unavailable. */
export async function getGlossary(locale = 'en') {
  const lang = String(locale).split('-')[0].toLowerCase();
  const raw = (lang !== 'en' && (await fetchLang(lang))) || (await fetchLang('en')) || {};
  const out = {};
  for (const [k, list] of Object.entries(raw)) {
    const letter = String(k).toUpperCase();
    if (!ALPHABET.includes(letter) || !Array.isArray(list)) continue;
    const terms = list.filter((x) => x?.term && x?.definition).map((x) => ({ term: String(x.term).trim(), definition: String(x.definition).trim() }));
    if (terms.length) out[letter] = terms;
  }
  return out;
}
