import React from 'react';
import { cn } from '@/lib/utils';
import { ToolbarViewToggle } from './toolbar';
import { Select, type SelectOption } from './select';

export interface SearchResultsHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  total: number;
  view: 'grid' | 'table';
  onViewChange?: (v: 'grid' | 'table') => void;
  sortBy?: string;
  onSortChange?: (v: string) => void;
  sortOptions?: SelectOption[];
}

export const SearchResultsHeader = ({ total, view, onViewChange, sortBy, onSortChange, sortOptions = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Name', value: 'name' },
  { label: 'Date', value: 'date' },
], className, ...props }: SearchResultsHeaderProps) => (
  <div className={cn('flex items-center justify-between rounded-md border bg-secondary/40 px-3 py-2', className)} {...props}>
    <div className="text-sm">{total.toLocaleString()} results</div>
    <div className="flex items-center gap-2">
      <ToolbarViewToggle value={view} onValueChange={onViewChange} />
      <Select value={sortBy} onChange={onSortChange} options={sortOptions} size="sm" />
    </div>
  </div>
);

export default SearchResultsHeader;

