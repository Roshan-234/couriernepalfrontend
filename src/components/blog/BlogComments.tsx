"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { BlogComment } from "@/types/blog";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

interface BlogCommentsProps {
  slug: string;
}

export default function BlogComments({ slug }: BlogCommentsProps) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/blog/posts/${slug}/comments`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data);
    } catch (err) {
      setError("Failed to load comments");
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/blog/posts/${slug}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          parent_id: parentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      setNewComment("");
      setReplyTo(null);
      await fetchComments();
    } catch (err) {
      setError("Failed to post comment");
      console.error("Error posting comment:", err);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/blog/posts/${slug}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      await fetchComments();
    } catch (err) {
      setError("Failed to delete comment");
      console.error("Error deleting comment:", err);
    }
  };

  const renderComment = (comment: BlogComment) => (
    <div key={comment.id} className="border-b border-gray-200 py-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-medium text-gray-900">
            {comment.author.name || comment.author.username}
          </span>
          <span className="text-gray-500 text-sm ml-2">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
        {(user?.is_admin || user?.id === comment.author.id) && (
          <button
            onClick={() => handleDelete(comment.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Delete
          </button>
        )}
      </div>
      <p className="text-gray-700 mb-2">{comment.content}</p>
      {user && (
        <button
          onClick={() => setReplyTo(comment.id)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          Reply
        </button>
      )}
      {replyTo === comment.id && (
        <form onSubmit={(e) => handleSubmit(e, comment.id)} className="mt-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a reply..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => setReplyTo(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Reply
            </Button>
          </div>
        </form>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="pl-4 mt-4 border-l-2 border-gray-200">
          {comment.replies.map(renderComment)}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>
      
      {user ? (
        <form onSubmit={(e) => handleSubmit(e)} className="mb-8">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
          <div className="flex justify-end mt-2">
            <Button variant="primary" type="submit">
              Post Comment
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-4 bg-gray-50 rounded-lg mb-8">
          <p className="text-gray-600">
            Please{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              log in
            </Link>{" "}
            to post a comment.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map(renderComment)
        ) : (
          <p className="text-gray-600 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  );
}
