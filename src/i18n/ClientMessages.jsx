import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { namespacesOf } from './loadMessages';

/**
 * Sends the browser only the translations a part of the site needs (instead of the whole site's text on
 * every page, ~250 KB). The root layout passes the shared texts; each section layout adds its own file,
 * e.g. <ClientMessages files={['companyPage']}> in app/[locale]/company/layout.js.
 * Server components are unaffected (they always see every message).
 *
 *  - files: messages files (without .json) whose namespaces are all sent
 *  - pick:  single keys from other files, e.g. 'whyGtcGroupPage.cta' (a section reusing another's CTA)
 *
 * If a client component shows a MISSING_MESSAGE error, add its namespace to the section's `pick` (or SHARED).
 */
const SHARED_FILES = ['common'];
const SHARED_PICK = ['gtcGoApp.store']; // app store badges used across the site (StoreButtons, GoAppPromo)

function setPath(out, src, path) {
  const keys = path.split('.');
  let from = src;
  for (const k of keys) from = from?.[k];
  if (from === undefined) return;
  let to = out;
  keys.slice(0, -1).forEach((k) => (to = to[k] = { ...(to[k] ?? {}) }));
  to[keys.at(-1)] = from;
}

export default async function ClientMessages({ files = [], pick = [], children }) {
  const all = await getMessages();
  const keep = new Set([...SHARED_FILES, ...files].flatMap(namespacesOf));
  const messages = Object.fromEntries(Object.entries(all).filter(([k]) => keep.has(k)));
  for (const p of [...SHARED_PICK, ...pick]) if (!keep.has(p.split('.')[0])) setPath(messages, all, p);
  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
