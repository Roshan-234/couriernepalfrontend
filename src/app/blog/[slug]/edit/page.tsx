"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { BlogEditor } from "@/components/blog/BlogEditor";
import { useAuth } from "@/contexts/AuthContext";
import { BlogPost } from "@/types/blog";

interface BlogEditPageProps {
  params: {
    slug: string;
  };
}

export default function BlogEditPage({ params: { slug } }: BlogEditPageProps) {
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/posts/${slug}`);
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

    if (slug !== "new") {
      fetchPost();
    } else {
      setLoading(false);
    }
  }, [slug]);

  if (!user?.is_admin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600">
          You don't have permission to access this page.
        </p>
      </div>
    );
  }

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {slug === "new" ? "New Blog Post" : "Edit Blog Post"}
      </h1>
      <BlogEditor post={post} isEdit={slug !== "new"} />
    </div>
  );
}
