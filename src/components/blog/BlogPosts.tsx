"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/contexts/AuthContext";
import { BlogPost } from "@/types/blog";
import BlogPagination from './BlogPagination';

interface BlogPostsProps {
  page: number;
  category?: string;
  tag?: string;
  search?: string;
}

export default function BlogPosts({ page, category, tag, search }: BlogPostsProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          ...(category && { category }),
          ...(tag && { tag }),
          ...(search && { search }),
        });

        const response = await fetch(`/api/blog/posts?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const { data, meta } = await response.json();
        setPosts(data);
        setTotalPages(meta.totalPages);
      } catch (err) {
        setError("Failed to load blog posts");
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page, category, tag, search]);

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
      {pages > 1 && (
        <BlogPagination 
          currentPage={current_page} 
          totalPages={pages}
          baseUrl={`/blog${category ? `/category/${category}` : ''}${tag ? `/tag/${tag}` : ''}${search ? `?search=${search}` : ''}`}
        />
      )}
    </div>
  );
}
