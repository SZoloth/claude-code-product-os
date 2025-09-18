import React from 'react';
import { cn } from '@/lib/utils';

export interface SearchResultRow {
  id: string;
  title: string;
  subtitle?: string;
  meta?: string;
}

export interface SearchResultsListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SearchResultRow[];
}

export const SearchResultsList = ({ items, className, ...props }: SearchResultsListProps) => (
  <div className={cn('divide-y rounded-md border', className)} {...props}>
    {items.map((it) => (
      <div key={it.id} className="flex items-center justify-between p-3 hover:bg-accent/40">
        <div>
          <div className="text-sm font-medium">{it.title}</div>
          {it.subtitle && <div className="text-xs text-muted-foreground">{it.subtitle}</div>}
        </div>
        {it.meta && <div className="text-xs text-muted-foreground">{it.meta}</div>}
      </div>
    ))}
  </div>
);

export default SearchResultsList;

