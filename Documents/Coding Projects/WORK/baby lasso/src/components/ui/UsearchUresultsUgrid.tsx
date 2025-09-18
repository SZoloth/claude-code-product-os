import React from 'react';
import { cn } from '@/lib/utils';

export interface SearchResultItem {
  id: string;
  title?: string;
  thumbnailUrl?: string;
}

export interface SearchResultsGridProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SearchResultItem[];
}

export const SearchResultsGrid = ({ items, className, ...props }: SearchResultsGridProps) => {
  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3', className)} {...props}>
      {items.map((it) => (
        <div key={it.id} className="group overflow-hidden rounded-md border bg-background">
          <div className="aspect-square w-full bg-muted/40">
            {it.thumbnailUrl ? (
              <img src={it.thumbnailUrl} alt={it.title || 'result'} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
            )}
          </div>
          {it.title && <div className="px-2 py-1 text-[11px] truncate">{it.title}</div>}
        </div>
      ))}
    </div>
  );
};

export default SearchResultsGrid;

