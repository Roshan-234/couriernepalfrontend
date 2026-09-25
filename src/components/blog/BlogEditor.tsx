"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { BlogPost } from "@/types/blog";
import dynamic from "next/dynamic";
import api, { errorMessage } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const Editor = dynamic(() => import("@/components/blog/Editor"), {
  ssr: false,
});

interface BlogEditorProps {
  post?: BlogPost;
  isEdit?: boolean;
}

export function BlogEditor({ post, isEdit }: BlogEditorProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [categoryId, setCategoryId] = useState(post?.category?.id || 0);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    [],
  );
  useEffect(() => {
    api
      .get("/blog/categories")
      .then(({ data }) => setCategories(data))
      .catch(() => setError("Unable to load categories."));
  }, []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (asDraft = true) => {
    if (!title || !content || !categoryId) {
      setError("Title, category and content are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const endpoint = isEdit ? `/blog/posts/${post?.slug}` : "/blog/posts";
      const { data: savedPost } = await api.request({
        url: endpoint,
        method: isEdit ? "PUT" : "POST",
        data: {
          title,
          content,
          excerpt,
          category_id: categoryId,
          status: asDraft ? "draft" : "published",
        },
      });
      router.push(`/blog/${savedPost.slug}`);
    } catch (err) {
      setError(errorMessage(err, "Failed to save the post. Please try again."));
      console.error("Error saving post:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!user?.is_admin) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
        <p className="text-gray-600">
          You don&apos;t have permission to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Post title"
          className="w-full text-3xl font-bold border-none focus:outline-none focus:ring-0"
        />

        <label className="block text-sm font-medium">
          Category
          <select
            className="field mt-2"
            value={categoryId}
            onChange={(e) => setCategoryId(Number(e.target.value))}
          >
            <option value={0}>Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="prose max-w-none">
          <Editor value={content} onChange={setContent} />
        </div>

        <textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Excerpt (optional)"
          className="w-full h-24 p-2 border rounded-lg focus:border-blue-900 focus:ring-1 focus:ring-blue-900"
        />

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={saving}
          >
            Save as Draft
          </Button>
          <Button
            variant="primary"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? "Publishing..." : "Publish"}
          </Button>
        </div>
      </div>
    </div>
  );
}
