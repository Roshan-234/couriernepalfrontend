import Link from 'next/link';
import ManagedPage from '@/components/common/ManagedPage';
import JsonLd from '@/components/seo/JsonLd';
import { siteUrl } from '@/lib/content';
import { breadcrumbs, faqPage, service } from '@/lib/seo/jsonld';
import type { ServiceDetail } from './types';

export type { ServiceDetail } from './types';

/**
 * Renders one service route: the editor-managed copy, then the static
 * detail that makes the page worth landing on, then the structured data.
 *
 * The `Service`, `BreadcrumbList` and `FAQPage` nodes are built from the
 * same object that renders the markup, so the marked-up questions are by
 * construction the questions a visitor can see.
 */
export default function ServiceDetailPage({ detail }: { detail: ServiceDetail }) {
  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: detail.name },
  ];

  const structuredData = [
    service(siteUrl, {
      name: detail.name,
      description: detail.summary,
      path: detail.path,
      areaServed: detail.areaServed,
      serviceType: detail.serviceType,
    }),
    breadcrumbs(
      siteUrl,
      trail.map((crumb) => ({ name: crumb.label, path: crumb.href || detail.path })),
    ),
    faqPage(detail.faqs),
  ];

  return (
    <ManagedPage path={detail.path} trail={trail}>
      <div className="mt-14 space-y-14">
        <section aria-labelledby="covers">
          <h2 id="covers" className="text-2xl font-bold">
            What {detail.name.toLowerCase()} covers
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {detail.covers.map((item) => (
              <div key={item.title} className="panel">
                <h3 className="text-base font-bold text-[color:var(--brand-navy)]">{item.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="suits">
          <h2 id="suits" className="text-2xl font-bold">
            Who it suits
          </h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-2">
            {detail.suitedTo.map((item) => (
              <li key={item} className="flex gap-3 leading-7 text-slate-700">
                <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[color:var(--brand-teal)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="how-it-works">
          <h2 id="how-it-works" className="text-2xl font-bold">
            How it works
          </h2>
          <ol className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {detail.steps.map((step, index) => (
              <li key={step.title} className="panel">
                <span className="eyebrow text-teal-700">Step {String(index + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 text-base font-bold text-[color:var(--brand-navy)]">{step.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="prepare">
          <h2 id="prepare" className="text-2xl font-bold">
            What to have ready
          </h2>
          <dl className="mt-6 grid gap-5 md:grid-cols-2">
            {detail.prepare.map((item) => (
              <div key={item.title} className="border-l-2 border-[color:var(--brand-teal)] pl-4">
                <dt className="font-bold text-[color:var(--brand-navy)]">{item.title}</dt>
                <dd className="mt-2 leading-7 text-slate-600">{item.body}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="faqs">
          <h2 id="faqs" className="text-2xl font-bold">
            {detail.name} questions
          </h2>
          <div className="mt-6 space-y-4">
            {detail.faqs.map((faq) => (
              <details key={faq.question} className="panel">
                <summary className="cursor-pointer font-bold text-[color:var(--brand-navy)]">
                  <h3 className="inline text-base font-bold">{faq.question}</h3>
                </summary>
                <p className="mt-3 leading-7 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-labelledby="next">
          <h2 id="next" className="text-2xl font-bold">
            Next steps
          </h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {detail.related.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="panel transition hover:border-teal-600 hover:shadow-md"
              >
                <span className="text-base font-bold text-[color:var(--brand-navy)]">{link.label}</span>
                <span className="mt-3 block leading-7 text-slate-600">{link.description}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <JsonLd data={structuredData} />
    </ManagedPage>
  );
}
