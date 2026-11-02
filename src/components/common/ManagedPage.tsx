import Link from 'next/link';
import { getPage } from '@/lib/content';
import PageIntro from './PageIntro';
export default async function ManagedPage({ path }: { path: string }) {
  const page = await getPage(path);
  return <div className="container py-16 sm:py-20"><PageIntro page={page} /><div className="grid gap-5 md:grid-cols-2">{page.sections.map((section, i) => <section className="panel" key={i}><h2 className="text-xl font-bold">{section.heading}</h2><p className="mt-4 whitespace-pre-line leading-8 text-slate-500">{section.body}</p></section>)}</div>{path.startsWith('/services/') && <div className="mt-8 flex flex-wrap gap-3"><Link href="/dashboard/create-shipment" className="action">Create a shipment →</Link><Link href="/contact" className="action action-outline">Talk to our team</Link></div>}</div>;
}
