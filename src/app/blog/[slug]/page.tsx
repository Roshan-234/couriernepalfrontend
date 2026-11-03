import type { Metadata } from 'next';
import { getPost } from '@/lib/blog';
import { buildMetadata, siteUrl } from '@/lib/content';
import BlogContent from '@/components/blog/BlogContent';
import BlogComments from '@/components/blog/BlogComments';
import BlogActions from '@/components/blog/BlogActions';
import JsonLd from '@/components/seo/JsonLd';
import { Breadcrumbs } from '@/components/kit';
import { article, breadcrumbs } from '@/lib/seo/jsonld';
import type { BlogPost } from '@/types/blog';

type Props = { params: Promise<{ slug: string }> };

/**
 * The post's own image, when it has one worth sharing.
 *
 * Editors paste all sorts of things into this field, so only a local
 * upload or an absolute URL is used; anything else falls through to the
 * site default rather than producing a social card that fails to load.
 */
function socialImage(post: BlogPost) {
  const image = post.cover_image;
  if (!image) return undefined;
  return image.startsWith('/images/') || image.startsWith('https://') ? image : undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost((await params).slug);

  // The previous version set an `openGraph` block of its own with no
  // `images`, `url` or `siteName`, and no `twitter` block at all. Next
  // merges `openGraph` only one level deep, so that block replaced the
  // root one wholesale and the article shared as a bare link.
  return buildMetadata({
    title: post.title,
    description: post.excerpt || post.title,
    path: `/blog/${post.slug}`,
    image: socialImage(post),
    type: 'article',
    publishedTime: post.published_at,
    modifiedTime: post.updated_at,
    noindex: post.status !== 'published',
  });
}

export default async function Page({ params }: Props) {
  const post = await getPost((await params).slug);
  const path = `/blog/${post.slug}`;

  const trail = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title },
  ];

  const structuredData = [
    article(siteUrl, {
      headline: post.title,
      description: post.excerpt || post.title,
      path,
      image: socialImage(post),
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authorName: post.author?.name,
    }),
    breadcrumbs(
      siteUrl,
      trail.map((crumb) => ({ name: crumb.label, path: crumb.href || path })),
    ),
  ];

  return (
    <article className="container max-w-3xl py-16">
      <Breadcrumbs items={trail} className="mb-6" />

      <p className="eyebrow text-teal-700">
        {post.category?.name || 'Shipping updates'}
        {post.status === 'draft' ? ' · Draft' : ''}
      </p>

      <h1 className="my-5 text-4xl font-bold">{post.title}</h1>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
        <span>
          By {post.author?.name || 'Moonlight Freight'} ·{' '}
          <time dateTime={post.published_at || post.created_at}>
            {new Date(post.published_at || post.created_at).toLocaleDateString('en-GB')}
          </time>
        </span>
        <BlogActions slug={post.slug} />
      </div>

      <BlogContent content={post.content} />

      {post.status === 'published' && <BlogComments slug={post.slug} />}

      {post.status === 'published' && <JsonLd data={structuredData} />}
    </article>
  );
}
