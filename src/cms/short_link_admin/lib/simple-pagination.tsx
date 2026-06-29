"use client";

import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SimplePaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function SimplePagination({ page, totalPages, onChange }: SimplePaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "ellipsis") {
      pages.push("ellipsis");
    }
  }

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        isDisabled={page <= 1}
        onPress={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e${i}`} className="px-2 text-default-400">…</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "primary" : "ghost"}
            size="sm"
            onPress={() => onChange(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Button>
        )
      )}
      <Button
        variant="ghost"
        size="sm"
        isIconOnly
        isDisabled={page >= totalPages}
        onPress={() => onChange(page + 1)}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
