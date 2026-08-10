"use client";

import { Button } from "@/components/ui";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  );

  return (
    <div className="mt-6 flex items-center justify-between">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() =>
          onPageChange(currentPage - 1)
        }
      >
        Previous
      </Button>

      <div className="flex items-center gap-2">
        {pages.map((page) => (
          <Button
            key={page}
            variant={
              currentPage === page
                ? "primary"
                : "outline"
            }
            onClick={() =>
              onPageChange(page)
            }
          >
            {page}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        disabled={
          currentPage === totalPages
        }
        onClick={() =>
          onPageChange(currentPage + 1)
        }
      >
        Next
      </Button>
    </div>
  );
}