import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  /**
   * Path the links are built from, optionally carrying a query string.
   * Defaults to the blog index.
   */
  baseUrl?: string;
  /** Filters that must survive paging, e.g. category, tag or search. */
  query?: Record<string, string | undefined>;
}

/**
 * Page navigation for the article list.
 *
 * This used to be `<Button onClick={router.push}>`, which meant page two
 * and beyond existed only as a click handler: a crawler reading the HTML
 * found no href to follow, so every post past the first page was
 * unreachable from the site. The controls are real `<a>` elements now, and
 * the component takes the current filters as props rather than reading
 * them from the browser, so it renders on the server with no hydration.
 */
export default function BlogPagination({
  currentPage,
  totalPages,
  baseUrl = "/blog",
  query,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const [path, existingQuery] = baseUrl.split("?");

  const hrefFor = (page: number) => {
    const params = new URLSearchParams(existingQuery);
    for (const [key, value] of Object.entries(query || {})) {
      if (value) params.set(key, value);
    }
    // Page one is the canonical list, so it carries no `page` parameter.
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    const search = params.toString();
    return search ? `${path}?${search}` : path;
  };

  const visiblePages = getVisiblePages(currentPage, totalPages);

  const itemClass = (current: boolean) =>
    cn(
      "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-4 text-sm font-semibold",
      current
        ? "bg-[color:var(--brand-navy)] text-white"
        : "border border-slate-300 bg-white text-slate-700 hover:border-[color:var(--brand-navy)] hover:text-[color:var(--brand-navy)]",
    );

  const disabledClass = cn(
    "inline-flex min-h-11 min-w-11 cursor-not-allowed items-center justify-center rounded-lg",
    "border border-slate-200 px-4 text-sm font-semibold text-slate-400",
  );

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label="Pagination"
    >
      {currentPage > 1 ? (
        <Link href={hrefFor(currentPage - 1)} rel="prev" className={itemClass(false)}>
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          Previous
        </span>
      )}

      {visiblePages.map((page, index) =>
        page === null ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            className="px-2 py-2 text-slate-600"
          >
            &hellip;
          </span>
        ) : (
          <Link
            key={page}
            href={hrefFor(page)}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={itemClass(page === currentPage)}
          >
            {page}
          </Link>
        ),
      )}

      {currentPage < totalPages ? (
        <Link href={hrefFor(currentPage + 1)} rel="next" className={itemClass(false)}>
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          Next
        </span>
      )}
    </nav>
  );
}

/** Page numbers to show, with `null` standing in for a gap. */
function getVisiblePages(currentPage: number, totalPages: number): Array<number | null> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 5, null, totalPages];
  }

  if (currentPage >= totalPages - 2) {
    return [1, null, ...Array.from({ length: 5 }, (_, index) => totalPages - 4 + index)];
  }

  return [1, null, currentPage - 1, currentPage, currentPage + 1, null, totalPages];
}
