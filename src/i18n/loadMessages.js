/**
 * Load translations: en / fa from messages/<lang>/*.json (any file in the folder), every other
 * language from S3 (see BUNDLED_LANGS + fetchS3Messages below).
 *
 * Local files are read from disk (cached in production; re-read in dev so new/edited JSON files work
 * without a restart).
 *
 * Namespace rules (see messages/README.md):
 *  - Flat keys in adeela.json → namespace `adeela` (filename without .json)
 *  - Or wrap yourself: { "adeela": { "label1": "…" } }
 *  - Bundles like common.json / homepage.json stay multi-root (no auto-wrap)
 */
import fs from 'fs';
import path from 'path';
import { LOCALES, langOf } from './locales';

const messagesRoot = path.join(process.cwd(), 'messages');

/** Languages shipped with the site in messages/<lang>/; every other language is fetched from S3. */
export const BUNDLED_LANGS = ['en', 'fa'];

/** S3 folder holding <lang>/<file>.json for the other languages (same files + namespaces as messages/en). */
const S3_BASE = (process.env.MESSAGES_S3_BASE || 'https://gtcfx-bucket.s3.ap-southeast-1.amazonaws.com/messages').replace(/\/$/, '');
const S3_REVALIDATE = 3600; // seconds; cached by Next's fetch cache, so pages stay static

/** Files that export several top-level namespaces (not wrapped by filename). */
const MULTI_NAMESPACE_FILES = new Set(['common', 'homepage']);

function isPlainLeaf(value) {
  return value === null || typeof value !== 'object' || Array.isArray(value);
}

/** @param {string} fileName e.g. adeela.json */
function namespaceBundlePart(fileName, part) {
  if (!part || typeof part !== 'object' || Array.isArray(part)) return part;

  const ns = path.basename(fileName, '.json');
  const keys = Object.keys(part);

  if (MULTI_NAMESPACE_FILES.has(ns)) return part;

  // Already { "companyPage": { … } } or { "test": { … } }
  if (keys.length === 1 && keys[0] === ns && typeof part[ns] === 'object' && !Array.isArray(part[ns])) {
    return part;
  }

  // Flat file: { "label1": "News 1", "label2": "…" } → { "adeela": { … } }
  if (keys.length > 0 && keys.every((k) => isPlainLeaf(part[k]))) {
    return { [ns]: part };
  }

  return part;
}

function merge(base, extra) {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) return extra ?? base;
  const out = { ...base };
  for (const k of Object.keys(extra)) {
    out[k] =
      base && typeof base[k] === 'object' && !Array.isArray(base[k]) && typeof extra[k] === 'object' && !Array.isArray(extra[k])
        ? merge(base[k], extra[k])
        : extra[k];
  }
  return out;
}

function loadFolderMessages(locale) {
  const dir = path.join(messagesRoot, locale);
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return { messages: {}, loaded: false };
  }

  let messages = {};
  const files = fs.readdirSync(dir).filter((name) => name.endsWith('.json')).sort();

  for (const file of files) {
    const filePath = path.join(dir, file);
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const part = namespaceBundlePart(file, raw);
      if (part && typeof part === 'object') messages = merge(messages, part);
    } catch (err) {
      console.error(`[i18n] Failed to parse ${filePath}:`, err);
    }
  }

  return { messages, loaded: files.length > 0 };
}

/** One file from S3, or null if it isn't there (S3 answers 403/404) / is invalid / can't be reached. */
async function fetchS3File(url) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const res = await fetch(url, { headers: { Accept: 'application/json' }, next: { revalidate: S3_REVALIDATE } });
      if (res.status === 403 || res.status === 404) return null; // not uploaded yet → English
      if (!res.ok) {
        console.error(`[i18n] ${url} returned ${res.status}`);
        return null;
      }
      const data = await res.json();
      return data && typeof data === 'object' && !Array.isArray(data) ? data : null;
    } catch (err) {
      if (attempt === 3) {
        console.error(`[i18n] ${url} failed:`, err);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, attempt * 300));
    }
  }
  return null;
}

/**
 * <S3_BASE>/<lang>/<file>.json for every file in messages/en (same layout as the local folders,
 * e.g. messages/es/common.json). Files not uploaded yet are skipped, so those texts show in English.
 */
async function fetchS3Messages(lang) {
  const files = fs.readdirSync(path.join(messagesRoot, 'en')).filter((name) => name.endsWith('.json')).sort();
  const parts = await Promise.all(files.map((file) => fetchS3File(`${S3_BASE}/${encodeURIComponent(lang)}/${file}`)));
  return parts.reduce((messages, raw, i) => {
    const part = raw && namespaceBundlePart(files[i], raw);
    return part && typeof part === 'object' ? merge(messages, part) : messages;
  }, {});
}

const cache = new Map();
const CACHE = process.env.NODE_ENV === 'production'; // dev re-reads files so edits show up without a restart

/**
 * Messages for one language (keys it lacks are filled from English in request.js).
 *  - en / fa: messages/<lang>/*.json
 *  - others: <S3_BASE>/<lang>/*.json; a local messages/<lang>/ folder, if there is one, overrides it key by key
 * Regional English (en-intl, en-ae…) is 'en'.
 * @param {string} locale
 * @returns {Promise<Record<string, unknown>>}
 */
export async function loadLocaleMessages(locale) {
  const langs = new Set(LOCALES.map((l) => langOf(l.code)));
  const lang = langs.has(locale) ? locale : langs.has(langOf(locale)) ? langOf(locale) : 'en';

  if (BUNDLED_LANGS.includes(lang)) {
    if (CACHE && cache.has(lang)) return cache.get(lang);
    const { messages } = loadFolderMessages(lang);
    if (CACHE) cache.set(lang, messages);
    return messages;
  }

  // not memoised here: the fetch cache refreshes the S3 file every S3_REVALIDATE seconds
  const remote = await fetchS3Messages(lang);
  const { messages: local, loaded } = loadFolderMessages(lang);
  return loaded ? merge(remote, local) : remote;
}

/**
 * Top-level namespaces a messages file provides, e.g. namespacesOf('companyPage') → ['companyPage', 'aboutUsPage', …].
 * Read from the English folder (every language uses the same keys).
 */
const nsCache = new Map();
export function namespacesOf(file) {
  if (nsCache.has(file)) return nsCache.get(file);
  let keys = [];
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(messagesRoot, 'en', `${file}.json`), 'utf8'));
    keys = Object.keys(namespaceBundlePart(`${file}.json`, raw) || {});
  } catch {}
  nsCache.set(file, keys);
  return keys;
}
