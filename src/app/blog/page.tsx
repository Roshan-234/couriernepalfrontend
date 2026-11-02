import { getPage, pageMetadata, backendUrl, backendHeaders } from '@/lib/content';
import PageIntro from '@/components/common/PageIntro';
import BlogCard from '@/components/blog/BlogCard';
import BlogPagination from '@/components/blog/BlogPagination';
import type { BlogPost } from '@/types/blog';
export const generateMetadata = () => pageMetadata('/blog');
export default async function Page({searchParams}: {searchParams: Promise<Record<string,string|undefined>>}) {
 const params=await searchParams;
 const requested=Number(params.page);
 const page=Number.isInteger(requested) && requested>0 ? requested : 1;
 const query=new URLSearchParams({page:String(page),per_page:'12'});
 for(const key of ['category','tag','search']) if(params[key]) query.set(key,params[key]!.slice(0,100));
 const response=await fetch(`${backendUrl}/api/blog/posts?${query}`,{headers:backendHeaders(),cache:'no-store',signal:AbortSignal.timeout(8000)});
 if(!response.ok) throw new Error('Unable to load articles');
 const result: {data:BlogPost[];meta:{totalPages:number}}=await response.json();
 return <div className="container py-16"><PageIntro page={await getPage('/blog')}/><form className="mb-8 flex gap-3" action="/blog"><input aria-label="Search articles" className="field max-w-md" name="search" defaultValue={params.search} maxLength={100}/><button className="action">Search</button></form>{result.data.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{result.data.map(post=><BlogCard key={post.id} post={post}/>)}</div> : <p>No articles match this selection.</p>}<BlogPagination currentPage={page} totalPages={result.meta.totalPages}/></div>;
}
