"use client";

import React from "react";
import { Button } from "./Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  totalPage: number;
  currentPage: number;
  onPageChange?: (page: number) => void;
};

const SHOW_LIMIT = 4;

export const Pagination = ({
  totalPage,
  currentPage,
  onPageChange,
}: PaginationProps) => {
  if (totalPage <= 1) return null;

  const clamp = (page: number) => Math.min(Math.max(page, 1), totalPage);

  const goTo = (page: number) => {
    onPageChange?.(clamp(page));
  };

  const pages: number[] = [];

  // sliding window centered around current page
  const half = Math.floor(SHOW_LIMIT / 2);
  let start = Math.max(2, currentPage - half);
  let end = Math.min(totalPage - 1, currentPage + half);

  // adjust if near the edges
  if (currentPage <= half) {
    end = Math.min(totalPage - 1, SHOW_LIMIT);
  }

  if (currentPage > totalPage - half) {
    start = Math.max(2, totalPage - SHOW_LIMIT + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center w-full gap-2">
      {/* Prev */}
      <Button
        variant="outline"
        className="px-2 py-2"
        disabled={currentPage === 1}
        onClick={() => goTo(currentPage - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft size={19} />
      </Button>

      {/* First page */}
      <Button
        variant={currentPage === 1 ? "primary" : "outline"}
        onClick={() => goTo(1)}
        aria-current={currentPage === 1 ? "page" : undefined}
        className="px-3 py-2"
      >
        1
      </Button>

      {/* Left ellipsis */}
      {start > 2 && <span className="mx-2">…</span>}

      {/* Middle pages */}
      {pages.map((p) => (
        <Button
          key={p}
          variant={currentPage === p ? "primary" : "outline"}
          onClick={() => goTo(p)}
          aria-current={currentPage === p ? "page" : undefined}
          className="px-3 py-2"
        >
          {p}
        </Button>
      ))}

      {/* Right ellipsis */}
      {end < totalPage - 1 && <span className="mx-2">…</span>}

      {/* Last page */}
      {totalPage > 1 && (
        <Button
          variant={currentPage === totalPage ? "primary" : "outline"}
          onClick={() => goTo(totalPage)}
          aria-current={currentPage === totalPage ? "page" : undefined}
          className="px-3 py-2"
        >
          {totalPage}
        </Button>
      )}

      {/* Next */}
      <Button
        variant="outline"
        className="px-2 py-2"
        disabled={currentPage === totalPage}
        onClick={() => goTo(currentPage + 1)}
        aria-label="Next page"
      >
        <ChevronRight size={19} />
      </Button>
    </div>
  );
};
