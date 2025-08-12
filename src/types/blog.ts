export interface User {
  id: number;
  username: string;
  name?: string;
  email: string;
  is_admin: boolean;
  avatar?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  status: 'draft' | 'published';
  views?: number;
  category?: Category;
  author: User;
  tags?: Tag[];
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface BlogComment {
  id: number;
  content: string;
  author: User;
  created_at: string;
  updated_at: string;
  replies?: BlogComment[];
  post_id: number;
  parent_id?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    totalPages: number;
    currentPage: number;
  }
}

export type PaginatedBlogResponse = PaginatedResponse<BlogPost>;
  current_page: number;
}
