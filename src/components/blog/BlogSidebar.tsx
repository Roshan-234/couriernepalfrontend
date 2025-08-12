"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Category, Tag } from "@/types/blog";
import { useRouter } from "next/navigation";

export default function BlogSidebar() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSidebarData = async () => {
      try {
        const [categoriesRes, tagsRes] = await Promise.all([
          fetch("/api/blog/categories"),
          fetch("/api/blog/tags"),
        ]);

        if (!categoriesRes.ok || !tagsRes.ok) {
          throw new Error("Failed to fetch sidebar data");
        }

        const [categoriesData, tagsData] = await Promise.all([
          categoriesRes.json(),
          tagsRes.json(),
        ]);

        setCategories(categoriesData);
        setTags(tagsData);
      } catch (err) {
        setError("Failed to load sidebar data");
        console.error("Error fetching sidebar data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSidebarData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery) {
      router.push(`/blog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  if (loading) {
    return (
      <aside className="space-y-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-48 bg-gray-200 rounded-lg mb-8"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </aside>
    );
  }

  if (error) {
    return (
      <aside className="p-4 text-center">
        <p className="text-gray-600">{error}</p>
      </aside>
    );
  }

  return (
    <aside className="space-y-8">
      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Search</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>
        </form>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/blog/category/${category.slug}`}
                  className="text-gray-600 hover:text-blue-600"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug}`}
                className="px-3 py-1 bg-gray-100 text-sm text-gray-600 rounded-full hover:bg-gray-200"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
