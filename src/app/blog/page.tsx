import { Suspense } from "react";
import { Metadata } from "next";
import BlogPosts from "@/components/blog/BlogPosts";
import BlogSidebar from "@/components/blog/BlogSidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export const metadata: Metadata = {
  title: "Blog - Courier Nepal",
  description:
    "Stay updated with the latest news and updates from Courier Nepal.",
};

export default async function BlogPage({
  searchParams: pendingParams,
}: {
  searchParams: Promise<{
    page?: string;
    category?: string;
    tag?: string;
    search?: string;
  }>;
}) {
  const searchParams = await pendingParams;
  const currentPage = Number(searchParams.page) || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Blog</h1>
          <Suspense fallback={<LoadingSpinner />}>
            <BlogPosts
              page={currentPage}
              category={searchParams.category}
              tag={searchParams.tag}
              search={searchParams.search}
            />
          </Suspense>
        </div>
        <div className="lg:w-1/4">
          <Suspense fallback={<LoadingSpinner />}>
            <BlogSidebar />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
