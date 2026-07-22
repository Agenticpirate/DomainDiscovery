import { redirect } from 'next/navigation';

/** Brandable tool is covered by Keyword Domains — keep URL for old links */
export default function BrandableRedirectPage() {
  redirect('/tools/keyword');
}
