import Image from 'next/image';
import Link from 'next/link';
import { BlogPost } from "@/types/blog";

interface BlogCardProps {
  post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-200 hover:-translate-y-1">
      {post.cover_image && (
        <div className="relative h-48">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6">
        {post.category && (
          <Link 
            href={`/blog/category/${post.category.slug}`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            {post.category.name}
          </Link>
        )}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="mt-2 text-xl font-semibold text-gray-900 hover:text-blue-600">
            {post.title}
          </h3>
        </Link>
        <p className="mt-3 text-gray-600 line-clamp-3">
          {post.excerpt}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            By {post.author.name}
          </div>
          <div className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.published_at || post.created_at), { addSuffix: true })}
          </div>
        </div>
      </div>
    </div>
  );
}
