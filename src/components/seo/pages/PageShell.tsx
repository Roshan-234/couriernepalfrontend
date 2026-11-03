import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/kit";
import JsonLd from "@/components/seo/JsonLd";
import { siteUrl } from "@/lib/content";
import { breadcrumbs, type Crumb } from "@/lib/seo/jsonld";

export interface PageShellProps {
  /**
   * The whole trail, root first, ending at the current page. The same array
   * feeds the visible breadcrumb and the `BreadcrumbList` markup, so the two
   * can never drift apart.
   */
  trail: Crumb[];
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  /** Extra structured data for this page — FAQ, Service, and so on. */
  jsonLd?: unknown[];
  /** Rendered above the first section, for draft notices and alerts. */
  notice?: ReactNode;
  children: ReactNode;
}

/**
 * Shared frame for the informational and policy pages.
 *
 * Everything here renders on the server: the copy a crawler reads is the copy
 * in the first HTML response, with no hydration step in between.
 */
export default function PageShell({
  trail,
  eyebrow,
  title,
  intro,
  jsonLd,
  notice,
  children,
}: PageShellProps) {
  const items = trail.map((crumb, index) => ({
    label: crumb.name,
    href: index === trail.length - 1 ? undefined : crumb.path,
  }));

  return (
    <>
      <JsonLd data={[breadcrumbs(siteUrl, trail), ...(jsonLd ?? [])]} />
      <div className="container max-w-5xl py-10 sm:py-14">
        <Breadcrumbs className="mb-6" items={items} />

        <header className="max-w-[68ch]">
          <p className="eyebrow mb-3 text-teal-700">{eyebrow}</p>
          <h1 className="text-4xl font-bold leading-tight text-[color:var(--brand-navy)] sm:text-5xl">
            {title}
          </h1>
          {intro ? <div className="mt-5 text-lg leading-8 text-slate-600">{intro}</div> : null}
        </header>

        {notice ? <div className="mt-8">{notice}</div> : null}

        <div className="mt-12 space-y-12">{children}</div>
      </div>
    </>
  );
}
