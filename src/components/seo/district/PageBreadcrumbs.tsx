import JsonLd from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/kit";
import { breadcrumbs, type Crumb } from "@/lib/seo/jsonld";
import { siteUrl } from "@/lib/content";

/**
 * A breadcrumb trail rendered twice: once as markup a visitor can click, once
 * as `BreadcrumbList` structured data. Marking up a trail that is not on the
 * page is the kind of mismatch that earns a manual action, so the two are
 * built from the same array and cannot drift apart.
 *
 * Pass the whole trail, root first, ending at the current page. The last
 * crumb renders as plain text with `aria-current="page"`.
 */
export default function PageBreadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbs(siteUrl, trail)} />
      <Breadcrumbs
        className="mb-6"
        items={trail.map((crumb, index) => ({
          label: crumb.name,
          href: index === trail.length - 1 ? undefined : crumb.path,
        }))}
      />
    </>
  );
}
