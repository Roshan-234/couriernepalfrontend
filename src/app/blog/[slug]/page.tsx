import { getPost } from '@/lib/blog';
import BlogContent from '@/components/blog/BlogContent';
import BlogComments from '@/components/blog/BlogComments';
import BlogActions from '@/components/blog/BlogActions';
import type { Metadata } from 'next';
type Props = { params: Promise<{slug:string}> };
export async function generateMetadata({params}:Props):Promise<Metadata> {
 const post=await getPost((await params).slug);
 return { title:post.title,description:post.excerpt || post.title,alternates:{canonical:`/blog/${post.slug}`},openGraph:{type:'article',title:post.title,description:post.excerpt,publishedTime:post.published_at,modifiedTime:post.updated_at},robots:post.status === 'published' ? {index:true,follow:true} : {index:false,follow:false} };
}
export default async function Page({params}:Props) {
 const post=await getPost((await params).slug);
 return <article className="container max-w-3xl py-16"><p className="eyebrow text-teal-700">{post.category?.name || 'Shipping updates'}{post.status === 'draft' ? ' · Draft' : ''}</p><h1 className="my-5 text-4xl font-bold">{post.title}</h1><div className="mb-8 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-500"><span>By {post.author?.name || 'Moonlight Freight'} · {new Date(post.created_at).toLocaleDateString('en-GB')}</span><BlogActions slug={post.slug}/></div><BlogContent content={post.content}/>{post.status === 'published' && <BlogComments slug={post.slug}/>}</article>;
}
