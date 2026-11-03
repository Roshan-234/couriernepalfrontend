import type { Metadata } from 'next';
import { getPage, buildMetadata, backendUrl, backendHeaders, siteUrl } from '@/lib/content';
import PageIntro from '@/components/common/PageIntro';
import BlogCard from '@/components/blog/BlogCard';
import BlogPagination from '@/components/blog/BlogPagination';
import JsonLd from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/kit';
import { breadcrumbs } from '@/lib/seo/jsonld';
import type { BlogPost } from '@/types/blog';

type SearchParams = Record<string, string | undefined>;
type Props = { searchParams: Promise<SearchParams> };

const FILTER_KEYS = ['category', 'tag', 'search'] as const;

/** 1-based page number from `?page=`, defaulting to the first page. */
function pageNumber(params: SearchParams) {
  const requested = Number(params.page);
  return Number.isInteger(requested) && requested > 0 ? requested : 1;
}

/** Filters that have to survive paging, trimmed the same way the fetch trims them. */
function filters(params: SearchParams) {
  const active: SearchParams = {};
  for (const key of FILTER_KEYS) if (params[key]) active[key] = params[key]!.slice(0, 100);
  return active;
}

const TRAIL = [{ label: 'Home', href: '/' }, { label: 'Blog' }];

/**
 * Metadata for the list.
 *
 * Page two and beyond each canonicalise to themselves. Pointing them all
 * at `/blog` would tell a crawler the deeper pages are duplicates and undo
 * the point of giving the pagination real links in the first place.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const page = pageNumber(params);
  const managed = await getPage('/blog');
  const suffix = page > 1 ? ` — page ${page}` : '';

  return buildMetadata({
    title: `${managed.title}${suffix}`,
    description: managed.description,
    path: page > 1 ? `/blog?page=${page}` : '/blog',
  });
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  const page = pageNumber(params);
  const active = filters(params);

  const query = new URLSearchParams({ page: String(page), per_page: '12' });
  for (const [key, value] of Object.entries(active)) query.set(key, value!);

  const response = await fetch(`${backendUrl}/api/blog/posts?${query}`, {
    headers: backendHeaders(),
    cache: 'no-store',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Unable to load articles');
  const result: { data: BlogPost[]; meta: { totalPages: number } } = await response.json();

  return (
    <div className="container py-16">
      <Breadcrumbs items={TRAIL} className="mb-6" />

      <PageIntro page={await getPage('/blog')} />

      <form className="mb-8 flex gap-3" action="/blog">
        <input
          aria-label="Search articles"
          className="field max-w-md"
          name="search"
          defaultValue={params.search}
          maxLength={100}
        />
        <button className="action">Search</button>
      </form>

      {result.data.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {result.data.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <p className="text-slate-600">No articles match this selection.</p>
      )}

      <BlogPagination currentPage={page} totalPages={result.meta.totalPages} query={active} />

      <JsonLd
        data={breadcrumbs(
          siteUrl,
          TRAIL.map((crumb) => ({ name: crumb.label, path: crumb.href || '/blog' })),
        )}
      />
    </div>
  );
}
