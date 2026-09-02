import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  if (total <= pageSize) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      <span className="text-xs text-muted-foreground">
        Showing <span className="mono-ref text-foreground">{start}-{end}</span> of{" "}
        <span className="mono-ref text-foreground">{total}</span>
      </span>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <span className="px-2 text-xs text-muted-foreground">
          Page <span className="mono-ref text-foreground">{currentPage}</span> of{" "}
          <span className="mono-ref text-foreground">{pageCount}</span>
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={currentPage === pageCount}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
