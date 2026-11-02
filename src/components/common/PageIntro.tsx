import type { SitePage } from '@/lib/content';
export default function PageIntro({ page }: { page: SitePage }) {
  return <header className="mb-10 max-w-3xl"><p className="eyebrow mb-4 text-teal-700">{page.eyebrow}</p><h1 className="text-4xl font-bold leading-tight sm:text-5xl">{page.heading}</h1><p className="mt-5 whitespace-pre-line leading-8 text-slate-500">{page.intro}</p></header>;
}
