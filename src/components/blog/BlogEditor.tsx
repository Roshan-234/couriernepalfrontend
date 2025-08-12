"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../ui/Button";
import { BlogPost } from "@/types/blog";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts/AuthContext";

const Editor = dynamic(() => import("@/components/blog/Editor"), { ssr: false });

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
  const [status, setStatus] = useState(post?.status || "draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (asDraft = true) => {
    if (!title || !content) {
      setError("Title and content are required");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const endpoint = isEdit ? `/api/blog/posts/${post?.id}` : "/api/blog/posts";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          excerpt: excerpt || content.substring(0, 200) + "...",
          status: asDraft ? "draft" : "published",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save post");
      }

      const savedPost = await response.json();
      router.push(`/blog/${savedPost.slug}`);
    } catch (err) {
      setError("Failed to save the post. Please try again.");
      console.error("Error saving post:", err);
    } finally {
      setSaving(false);
    }
  };

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
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            {error}
          </div>
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
