import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/types/blog";

interface BlogCardProps {
  post: BlogPost;
  /**
   * Heading level for the card title. The list page puts cards directly
   * under its `<h1>`, so the default is `h2`; pass `h3` if a card is ever
   * nested under a section heading of its own.
   */
  headingLevel?: "h2" | "h3";
}

/**
 * The cover image fills a fixed-height box inside a card that is one
 * column on phones, two from `md` and three from `lg`, inside a 1200px
 * container with a 1.5rem gutter and a 1.5rem grid gap. Without this,
 * `fill` makes Next assume the image spans the viewport and serve the
 * largest candidate to every device.
 */
const COVER_SIZES =
  "(min-width: 1200px) 368px, (min-width: 1024px) 31vw, (min-width: 768px) 46vw, calc(100vw - 3rem)";

export default function BlogCard({ post, headingLevel = "h2" }: BlogCardProps) {
  const Heading = headingLevel;

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md transition-transform duration-200 hover:-translate-y-1">
      {post.cover_image?.startsWith("/images/") && (
        <div className="relative h-48">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            sizes={COVER_SIZES}
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6">
        {post.category && (
          <Link
            href={`/blog?category=${post.category.slug}`}
            className="text-sm font-semibold text-teal-700 hover:text-[color:var(--brand-navy)]"
          >
            {post.category.name}
          </Link>
        )}
        <Heading className="mt-2 text-xl font-semibold text-slate-900">
          <Link
            href={`/blog/${post.slug}`}
            className="hover:text-[color:var(--brand-navy)]"
          >
            {post.title}
          </Link>
        </Heading>
        <p className="mt-3 line-clamp-3 text-slate-600">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-slate-600">By {post.author.name}</div>
          <div className="text-sm text-slate-600">
            {formatDistanceToNow(new Date(post.published_at || post.created_at), {
              addSuffix: true,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
