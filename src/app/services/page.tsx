import Link from 'next/link';
import { getPage, getPages, pageMetadata } from '@/lib/content';
import PageIntro from '@/components/common/PageIntro';
export const generateMetadata = () => pageMetadata('/services');
export default async function Page() {
 const page = await getPage('/services');
 const services = (await getPages()).filter(item => item.path.startsWith('/services/'));
 return <div className="container py-16 sm:py-20"><PageIntro page={page} /><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{services.map((service,i) => <Link key={service.path} href={service.path} className="panel transition hover:border-teal-600 hover:shadow-md"><span className="eyebrow text-teal-700">{String(i+1).padStart(2,'0')}</span><h2 className="mb-4 mt-7 text-xl font-bold">{service.title}</h2><p className="text-sm leading-7 text-slate-500">{service.intro}</p><span className="mt-6 block text-sm font-semibold text-teal-700">Explore service →</span></Link>)}</div></div>;
}
