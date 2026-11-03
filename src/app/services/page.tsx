import Link from 'next/link';
import { getPage, getPages, pageMetadata, siteUrl } from '@/lib/content';
import PageIntro from '@/components/common/PageIntro';
import JsonLd from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/kit';
import { breadcrumbs } from '@/lib/seo/jsonld';

export const generateMetadata = () => pageMetadata('/services');

/**
 * One line per service saying when to choose it.
 *
 * The managed rows behind the six service pages share an eyebrow and two
 * sections, so the intro alone does not tell a visitor which one they
 * want. These lines are the differentiator on the hub.
 */
const BEST_FOR: Record<string, string> = {
  '/services/domestic': 'Best for documents and parcels moving between districts inside Nepal.',
  '/services/international': 'Best for parcels, documents and export consignments leaving Nepal.',
  '/services/ecommerce': 'Best for online sellers with repeat orders, pickups and returns.',
  '/services/warehouse': 'Best for stock that needs somewhere to sit before it moves on.',
  '/services/packing': 'Best for fragile, awkward or high-value items before they travel.',
  '/services/express': 'Best when the deadline, not the price, decides the booking.',
};

const TRAIL = [{ label: 'Home', href: '/' }, { label: 'Services' }];

export default async function Page() {
  const page = await getPage('/services');
  const services = (await getPages()).filter((item) => item.path.startsWith('/services/'));

  return (
    <div className="container py-16 sm:py-20">
      <Breadcrumbs items={TRAIL} className="mb-6" />

      <PageIntro page={page} />

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <Link
            key={service.path}
            href={service.path}
            className="panel transition hover:border-teal-600 hover:shadow-md"
          >
            <span className="eyebrow text-teal-700">{String(index + 1).padStart(2, '0')}</span>
            <h2 className="mb-4 mt-7 text-xl font-bold">{service.title}</h2>
            <p className="text-sm leading-7 text-slate-600">{service.intro}</p>
            {BEST_FOR[service.path] && (
              <p className="mt-3 text-sm font-semibold leading-7 text-[color:var(--brand-navy)]">
                {BEST_FOR[service.path]}
              </p>
            )}
            <span className="mt-6 block text-sm font-semibold text-teal-700">Explore service →</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/pricing" className="action">
          See rates →
        </Link>
        <Link href="/tracking" className="action action-outline">
          Track a shipment
        </Link>
        <Link href="/contact" className="action action-outline">
          Talk to our team
        </Link>
      </div>

      <JsonLd
        data={breadcrumbs(
          siteUrl,
          TRAIL.map((crumb) => ({ name: crumb.label, path: crumb.href || '/services' })),
        )}
      />
    </div>
  );
}
