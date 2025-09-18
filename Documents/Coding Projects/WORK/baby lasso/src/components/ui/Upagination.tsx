import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/lib/icons';

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  page: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
}

export const Pagination = ({ page, pageCount, onPageChange, className, ...props }: PaginationProps) => {
  const go = (p: number) => {
    const clamped = Math.max(1, Math.min(pageCount, p));
    if (clamped !== page) onPageChange?.(clamped);
  };
  const pages = Array.from({ length: pageCount }).map((_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(pageCount, page + 2));
  return (
    <div className={cn('flex items-center gap-1', className)} {...props}>
      <button className="h-8 w-8 rounded-sm border hover:bg-accent hover:text-accent-foreground" onClick={() => go(page - 1)} aria-label="Previous">
        <Icon name="card-left-square-fill" size="sm" />
      </button>
      {pages.map((p) => (
        <button key={p} onClick={() => go(p)} className={cn('h-8 w-8 rounded-sm border text-xs', p === page ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground')} aria-current={p === page ? 'page' : undefined}>
          {p}
        </button>
      ))}
      <button className="h-8 w-8 rounded-sm border hover:bg-accent hover:text-accent-foreground" onClick={() => go(page + 1)} aria-label="Next">
        <Icon name="card-right-square-fill" size="sm" />
      </button>
    </div>
  );
};

export default Pagination;

