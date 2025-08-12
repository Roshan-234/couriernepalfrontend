import { API_BASE_URL } from '@/config';

interface PaginationParams {
  page?: number;
  category?: string;
  tag?: string;
  search?: string;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  status: string;
  views: number;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  author: {
    id: number;
    name: string;
    email: string;
  };
  tags: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

interface BlogPostsResponse {
  posts: BlogPost[];
  total: number;
  pages: number;
  current_page: number;
}

export async function getBlogPosts({
  page = 1,
  category,
  tag,
  search,
}: PaginationParams = {}): Promise<BlogPostsResponse> {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  if (category) params.append('category', category);
  if (tag) params.append('tag', tag);
  if (search) params.append('search', search);

  const response = await fetch(
    `${API_BASE_URL}/blog/posts?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch blog posts');
  }

  return response.json();
}

export async function getBlogPost(slug: string): Promise<BlogPost> {
  const response = await fetch(`${API_BASE_URL}/blog/posts/${slug}`);

  if (!response.ok) {
    throw new Error('Failed to fetch blog post');
  }

  return response.json();
}

export async function getCategories(): Promise<BlogCategory[]> {
  const response = await fetch(`${API_BASE_URL}/blog/categories`);

  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }

  return response.json();
}

export async function getTags(): Promise<BlogTag[]> {
  const response = await fetch(`${API_BASE_URL}/blog/tags`);

  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }

  return response.json();
}
