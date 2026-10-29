/**
 * The page's structured data, rendered inside <head> (this slot is placed there by app/[locale]/layout.js).
 * What each URL gets is decided in ../routes.js; nothing here reads the request, so pages stay static.
 */
import { JsonLd, SITE_URL, localeUrl } from '@/lib/seo';
import { pageSchema } from '@/lib/pageSchemas';
import { schemaPropsFor } from '../routes';

export default async function PageSchemaSlot({ params }) {
  const { locale, path = [] } = await params;
  const url = `${SITE_URL}${localeUrl(locale, path.length ? `/${path.join('/')}` : '')}`;
  const props = await schemaPropsFor(locale, path, url);
  const data = props && pageSchema({ locale, ...props });
  return data ? <JsonLd data={data} /> : null;
}
