"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}

export default function BlogPagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  const router = useRouter();
  const showEllipsis = totalPages > 7;

  const handlePageChange = (page: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set("page", String(page));
    router.push(url.pathname + url.search);
  };

  const getVisiblePages = () => {
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    if (!showEllipsis) return pages;

    if (currentPage <= 3) {
      return [...pages.slice(0, 5), null, totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [1, null, ...pages.slice(totalPages - 5)];
    }

    return [
      1,
      null,
      ...pages.slice(currentPage - 2, currentPage + 1),
      null,
      totalPages,
    ];
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      className="flex justify-center items-center space-x-2 mt-8"
      aria-label="Pagination"
    >
      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>

      {visiblePages.map((page, index) =>
        page === null ? (
          <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-500">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "primary" : "outline"}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>
    </nav>
  );
}
