import 'server-only';
import { cache } from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { backendUrl, backendHeaders } from './content';
import type { BlogPost } from '@/types/blog';
export const getPost = cache(async (slug: string): Promise<BlogPost> => {
  const cookie = (await headers()).get('cookie') || '';
  const result = await fetch(`${backendUrl}/api/blog/posts/${encodeURIComponent(slug)}`, { headers: { ...backendHeaders(), cookie }, cache: 'no-store', signal: AbortSignal.timeout(8000) });
  if ([401,403,404].includes(result.status)) notFound();
  if (!result.ok) throw new Error('Unable to load article');
  return result.json();
});
