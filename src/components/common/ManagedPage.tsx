import type { ReactNode } from 'react';
import Link from 'next/link';
import { getPage } from '@/lib/content';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/kit';
import PageIntro from './PageIntro';

export interface ManagedPageProps {
  /** Managed path to look up. `getPage` 404s when it is unknown. */
  path: string;
  /** Visible trail rendered above the heading. Omit on top-level pages. */
  trail?: BreadcrumbItem[];
  /**
   * Page-specific static content, rendered after the editor-managed
   * sections. The managed rows are deliberately short and shared between
   * sibling pages, so anything substantial belongs here.
   */
  children?: ReactNode;
}

/**
 * Renders an editor-managed page: eyebrow, heading, intro and the section
 * rows stored against the path, followed by whatever static content the
 * route passes as children.
 */
export default async function ManagedPage({ path, trail, children }: ManagedPageProps) {
  const page = await getPage(path);

  return (
    <div className="container py-16 sm:py-20">
      {trail && trail.length > 0 && <Breadcrumbs items={trail} className="mb-6" />}

      <PageIntro page={page} />

      {page.sections.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2">
          {page.sections.map((section, index) => (
            <section className="panel" key={index}>
              <h2 className="text-xl font-bold">{section.heading}</h2>
              <p className="mt-4 whitespace-pre-line leading-8 text-slate-600">{section.body}</p>
            </section>
          ))}
        </div>
      )}

      {children}

      {path.startsWith('/services/') && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/dashboard/create-shipment" className="action">
            Create a shipment →
          </Link>
          <Link href="/contact" className="action action-outline">
            Talk to our team
          </Link>
        </div>
      )}
    </div>
  );
}
