import Link from 'next/link';
import Image from 'next/image';
import { FaArrowRight, FaBoxOpen, FaCheck } from 'react-icons/fa';
import { getPage, getPages, pageMetadata } from '@/lib/content';
export const generateMetadata = () => pageMetadata('/');
export default async function Home() {
 const page = await getPage('/');
 const services = (await getPages()).filter(item => item.path.startsWith('/services/')).slice(0,3);
 return <div>
  <section className="brand-hero overflow-hidden"><div className="container grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-23"><div>
   <p className="eyebrow mb-6 flex items-center gap-2 text-teal-700"><span className="h-2 w-2 rounded-full bg-teal-700" />{page.eyebrow}</p>
   <h1 className="max-w-xl text-5xl font-bold leading-[1.09] tracking-tight sm:text-6xl lg:text-[62px]">{page.heading}</h1>
   <p className="mt-7 max-w-md text-base leading-8 text-slate-600">{page.intro}</p>
   <div className="mt-8 flex flex-wrap gap-3"><Link href="/dashboard/create-shipment" className="action action-accent w-full sm:w-auto">Send a shipment <FaArrowRight /></Link><Link href="/pricing" className="action action-outline w-full sm:w-auto">Explore shipping rates</Link></div>
   <div className="mt-9 flex flex-wrap gap-5 text-xs text-slate-600">{['Careful handling','Shipment tracking','Local support'].map(label => <span className="flex items-center gap-2" key={label}><FaCheck className="text-teal-700" />{label}</span>)}</div>
  </div><div className="brand-hero-card"><div className="brand-hero-label"><span />FROM NEPAL TO THE WORLD</div><Image src="/images/moonlight-freight-logo.jpg" alt="Moonlight Freight" width={1081} height={1081} priority className="mx-auto w-full max-w-[380px]" sizes="(max-width:640px) 85vw,380px" /><div className="brand-hero-foot"><span>LOCAL CARE.</span><span className="text-teal-700">GLOBAL CONNECTIONS. ↗</span></div></div></div></section>
  <section className="border-b border-slate-200 bg-white"><div className="container grid items-center gap-6 py-8 md:grid-cols-[1fr_1.6fr]"><h2 className="text-xl font-bold">Where is your parcel?</h2><form action="/tracking" className="flex flex-col gap-3 sm:flex-row"><label htmlFor="home-tracking" className="sr-only">Tracking number</label><input id="home-tracking" name="id" required maxLength={100} className="field min-w-0 flex-1" placeholder="Enter your tracking number" /><button className="action">Track shipment <FaArrowRight /></button></form></div></section>
  <section className="container py-20"><div className="mb-10 flex flex-wrap items-end justify-between gap-5"><h2 className="text-3xl font-bold">One partner. Every delivery.</h2><Link href="/services" className="font-semibold text-teal-700">View all services →</Link></div><div className="grid gap-5 md:grid-cols-3">{services.map(service => <Link href={service.path} key={service.path} className="panel transition hover:-translate-y-1 hover:border-teal-700 hover:shadow-lg"><FaBoxOpen className="mb-8 text-3xl text-teal-700" /><h3 className="text-xl font-bold">{service.title}</h3><p className="mt-4 text-sm leading-7 text-slate-500">{service.intro}</p><span className="mt-7 block text-sm font-semibold">Explore service →</span></Link>)}</div></section>
  <section className="container pb-20"><div className="rounded-3xl bg-[#383772] p-8 text-white md:p-14"><h2 className="mb-10 text-3xl font-bold">Your next delivery, step by step.</h2><div className="grid gap-8 md:grid-cols-3">{page.sections.map((section,i) => <div key={i}><span className="text-sm text-[#ffda16]">{String(i+1).padStart(2,'0')}</span><h3 className="mt-4 text-xl font-semibold">{section.heading}</h3><p className="mt-3 leading-7 text-slate-300">{section.body}</p></div>)}</div><Link href="/contact" className="mt-10 inline-block font-semibold text-[#ffda16]">Let us plan your delivery →</Link></div></section>
 </div>;
}
