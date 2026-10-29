/**
 * Platform guides from Google Drive (server only), via a service account (drive.readonly).
 *
 * Folder layout per platform root (first match wins):
 *   <root>/<locale>/pdf|png  →  <root>/<locale>  →  <root>/pdf|png  →  <root>  →  nested pdf|png folders
 *
 * Credentials (first match wins):
 *   GOOGLE_SERVICE_ACCOUNT_JSON (JSON or base64) · GOOGLE_DRIVE_CLIENT_EMAIL + GOOGLE_DRIVE_PRIVATE_KEY
 *   · key file at GOOGLE_SERVICE_ACCOUNT_FILE (default secrets/google-drive-service-account.json)
 * Folders (required): GOOGLE_DRIVE_GTCGO_FOLDER_ID, GOOGLE_DRIVE_GTCFX_PORTAL_FOLDER_ID.
 * The Drive folders must be shared (Viewer) with the service-account email.
 *
 * Listings are cached in memory for PLATFORM_GUIDE_CACHE_SECONDS (default 600).
 */
import { readFileSync } from 'fs';
import { createSign } from 'crypto';
import { langOf } from '@/i18n/locales';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const FOLDER_MIME = 'application/vnd.google-apps.folder';
const SCOPE = 'https://www.googleapis.com/auth/drive.readonly';
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif']);
const CACHE_MS = Number(process.env.PLATFORM_GUIDE_CACHE_SECONDS ?? 600) * 1000;

// Folder ids come from the environment only (a link-shared folder is readable by anyone who has its id).
export const PLATFORM_DRIVE_FOLDERS = {
  gtcgo: process.env.GOOGLE_DRIVE_GTCGO_FOLDER_ID?.trim(),
  gettingStarted: process.env.GOOGLE_DRIVE_GTCFX_PORTAL_FOLDER_ID?.trim()
};

/** URL platform segment → PLATFORM_DRIVE_FOLDERS key (case-insensitive), or null. */
export function normalizePlatform(platform) {
  const value = String(platform ?? '').trim().toLowerCase();
  return Object.keys(PLATFORM_DRIVE_FOLDERS).find((k) => k.toLowerCase() === value) ?? null;
}

/* ------------------------------------------------------------ auth */

// Path is not built with process.cwd(): referencing it makes the bundler trace the whole project.
function credentialsFilePath() {
  const dir = process.env.SECRETS_DIR || 'secrets';
  const file = String(process.env.GOOGLE_SERVICE_ACCOUNT_FILE || '').trim();
  if (!file) return `${dir}/google-drive-service-account.json`;
  return /[\\/]/.test(file) ? file : `${dir}/${file}`;
}

function serviceAccount() {
  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    try {
      return JSON.parse(json.startsWith('{') ? json : Buffer.from(json, 'base64').toString('utf8'));
    } catch {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON must be single-line JSON or base64-encoded JSON.');
    }
  }
  const email = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
  const key = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  if (email && key) return { client_email: email, private_key: key };
  try {
    return JSON.parse(readFileSync(credentialsFilePath(), 'utf8'));
  } catch {
    throw new Error('Google Drive service account is not configured: set GOOGLE_SERVICE_ACCOUNT_JSON (or GOOGLE_DRIVE_CLIENT_EMAIL + GOOGLE_DRIVE_PRIVATE_KEY) in the environment.');
  }
}

const b64url = (v) => Buffer.from(v).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

let token = null;
let tokenExpiry = 0;

async function accessToken() {
  if (token && tokenExpiry > Date.now() + 60_000) return token;
  const creds = serviceAccount();
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))}.${b64url(JSON.stringify({ iss: creds.client_email, scope: SCOPE, aud: 'https://oauth2.googleapis.com/token', exp: now + 3600, iat: now }))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  const jwt = `${unsigned}.${b64url(signer.sign(creds.private_key))}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
    cache: 'no-store'
  });
  const payload = await res.json().catch(() => ({}));
  if (!res.ok || !payload.access_token) throw new Error(payload?.error_description || payload?.error || `Google OAuth failed (HTTP ${res.status}).`);
  token = payload.access_token;
  tokenExpiry = Date.now() + 3_500_000;
  return token;
}

/* ------------------------------------------------------------ drive */

async function listFolder(folderId) {
  if (!folderId) return [];
  const files = [];
  let pageToken;
  do {
    const params = new URLSearchParams({
      supportsAllDrives: 'true',
      includeItemsFromAllDrives: 'true',
      q: `'${folderId}' in parents and trashed=false`,
      fields: 'nextPageToken,files(id,name,mimeType,modifiedTime,size)',
      pageSize: '1000',
      ...(pageToken ? { pageToken } : {})
    });
    const res = await fetch(`${DRIVE_API}/files?${params}`, { headers: { Authorization: `Bearer ${await accessToken()}` }, cache: 'no-store' });
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(payload?.error?.message || `Google Drive API returned HTTP ${res.status}.`);
    files.push(...(payload.files || []));
    pageToken = payload.nextPageToken;
  } while (pageToken);
  return files;
}

const ext = (name = '') => (String(name).includes('.') ? String(name).split('.').pop().toLowerCase() : '');
const isFolder = (f) => f.mimeType === FOLDER_MIME;
const isImage = (f) => f.mimeType?.startsWith('image/') || IMAGE_EXTENSIONS.has(ext(f.name));
const isPdf = (f) => f.mimeType === 'application/pdf' || ext(f.name) === 'pdf';
const hasAssets = (files) => files.some((f) => isImage(f) || isPdf(f));

function childFolder(children, names) {
  const wanted = names.map((n) => n.toLowerCase());
  return children.find((c) => isFolder(c) && wanted.includes(c.name?.toLowerCase()))?.id ?? null;
}

/** Breadth-first search for the first "pdf" / "png" folders below the root. */
async function nestedAssetFolders(rootId, maxDepth = 4) {
  let pdf = null;
  let png = null;
  let level = [rootId];
  for (let depth = 0; depth <= maxDepth && level.length && !(pdf && png); depth += 1) {
    const children = (await Promise.all(level.map(listFolder))).flat().filter(isFolder);
    pdf ??= children.find((c) => c.name?.toLowerCase() === 'pdf')?.id ?? null;
    png ??= children.find((c) => c.name?.toLowerCase() === 'png')?.id ?? null;
    level = children.map((c) => c.id);
  }
  return { pdf, png };
}

async function assetFolders(rootId, locale) {
  const root = await listFolder(rootId);
  const localeId = childFolder(root, [locale]);
  if (localeId) {
    const inLocale = await listFolder(localeId);
    const pdf = childFolder(inLocale, ['pdf']);
    const png = childFolder(inLocale, ['png']);
    if (pdf || png) return { pdf, png };
    if (hasAssets(inLocale)) return { pdf: localeId, png: localeId };
  }
  const pdf = childFolder(root, ['pdf']);
  const png = childFolder(root, ['png']);
  if (pdf || png) return { pdf, png };
  if (hasAssets(root)) return { pdf: rootId, png: rootId };
  return nestedAssetFolders(rootId);
}

/* ------------------------------------------------------------ items */

/** "GTC Go - Deposit【v2】.png" → "GTC Go Deposit" */
export function createTitle(fileName = '') {
  return String(fileName)
    .replace(/\.[^.]+$/, '')
    .replace(/【[^】]*】/g, ' ')
    .replace(/\[[^\]]*]/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** URL-safe slug (keeps Arabic / Chinese letters). */
export function createSlug(title = '') {
  return (
    String(title)
      .normalize('NFC')
      .toLowerCase()
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 120) || 'guide'
  );
}

const comparable = (name) => createTitle(name).toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, '');
const imageUrl = (id, width = 1600) => `https://lh3.googleusercontent.com/d/${id}=w${width}`;

function toItems(pdfFiles, pngFiles) {
  const png = pngFiles
    .filter(isImage)
    .map((f) => {
      const title = createTitle(f.name) || f.name;
      return { id: f.id, type: 'png', title, slug: createSlug(title), thumbnail: imageUrl(f.id, 800), previewUrl: imageUrl(f.id, 1600), url: `https://drive.google.com/file/d/${f.id}/view`, updated: f.modifiedTime ?? null, _key: comparable(f.name) };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
  const thumbByName = new Map(png.map((p) => [p._key, p.thumbnail]));
  const pdf = pdfFiles
    .filter(isPdf)
    .map((f) => {
      const title = createTitle(f.name) || f.name;
      return { id: f.id, type: 'pdf', title, slug: createSlug(title), thumbnail: thumbByName.get(comparable(f.name)) ?? null, previewUrl: `https://drive.google.com/file/d/${f.id}/preview`, url: `https://drive.google.com/uc?export=download&id=${f.id}`, updated: f.modifiedTime ?? null };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
  return { png: png.map(({ _key, ...p }) => p), pdf };
}

const cache = new Map();

/** PNG + PDF guides of one platform folder for a locale folder → { png: [], pdf: [] } (cached). */
export async function getPlatformGuideFromDrive(rootFolderId, locale) {
  const key = `${rootFolderId}:${locale}`;
  const hit = cache.get(key);
  if (hit && hit.expires > Date.now()) return hit.data;

  const { pdf, png } = await assetFolders(rootFolderId, locale);
  const [pdfFiles, pngFiles] = await Promise.all([listFolder(pdf), pdf === png ? Promise.resolve(null) : listFolder(png)]);
  const data = toItems(pdfFiles, pngFiles ?? pdfFiles);
  cache.set(key, { data, expires: Date.now() + CACHE_MS });
  return data;
}

/** Guides for a platform + guide locale, falling back to English when the locale folder is empty. */
export async function getPlatformGuides(platform, locale) {
  const root = PLATFORM_DRIVE_FOLDERS[platform];
  if (!root) throw new Error(`Google Drive folder id for "${platform}" is not set (GOOGLE_DRIVE_*_FOLDER_ID).`);
  const data = await getPlatformGuideFromDrive(root, locale);
  if (langOf(locale) !== 'en' && !data.png.length && !data.pdf.length) {
    return { ...(await getPlatformGuideFromDrive(root, 'en')), resolvedLocale: 'en', fallbackUsed: true };
  }
  return { ...data, resolvedLocale: locale, fallbackUsed: false };
}
