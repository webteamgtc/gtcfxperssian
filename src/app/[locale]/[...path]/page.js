import { redirect } from 'next/navigation';

/** Any URL under a locale that isn't a page (old-site links like /company/careers) → that locale's Home. */
export default async function UnknownPage({ params }) {
  const { locale } = await params;
  redirect(`/${locale}`);
}
