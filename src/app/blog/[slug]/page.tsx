"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { BlogPost } from "@/types/blog";
import BlogComments from "@/components/blog/BlogComments";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/posts/${params.slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error("Failed to fetch post");
        }
        const data = await response.json();
        setPost(data);
      } catch (err) {
        setError("Failed to load blog post");
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Error Loading Post
        </h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!post) {
    return notFound();
  }

  return (
    <article className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with Category and Title */}
        <div className="mb-8">
          {post.category && (
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
            >
              {post.category.name}
            </Link>
          )}
          <h1 className="mt-2 text-4xl font-bold text-gray-900">{post.title}</h1>
          <div className="mt-4 flex justify-between items-center">
            <div className="flex items-center text-gray-600">
              <span>By {post.author.name || post.author.username}</span>
              <span className="mx-2">•</span>
              <time>{new Date(post.created_at).toLocaleDateString()}</time>
            </div>
            {user?.is_admin && (
              <Link href={`/blog/${post.slug}/edit`} passHref>
                <Button variant="outline">Edit Post</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Post Cover Image */}
        {post.cover_image && (
          <div className="relative aspect-[16/9] mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Post Content */}
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug}`}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-12 pt-8 border-t">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Comments</h2>
          <BlogComments slug={params.slug} />
        </div>
      </div>
    </article>
  );
}
