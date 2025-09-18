import React from 'react';
import { cn } from '@/lib/utils';

export interface SearchSuggestion { id: string; label: string; hint?: string }

export interface SearchSuggestionsProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  suggestions: SearchSuggestion[];
  onPick?: (id: string) => void;
}

export const SearchSuggestions = ({ open, suggestions, onPick, className, ...props }: SearchSuggestionsProps) => {
  if (!open) return null;
  return (
    <div className={cn('absolute z-50 mt-1 w-full rounded-md border bg-background p-1 shadow-md', className)} {...props}>
      {suggestions.length === 0 && (
        <div className="px-2 py-1.5 text-xs text-muted-foreground">No suggestions</div>
      )}
      {suggestions.map((s) => (
        <button
          key={s.id}
          onClick={() => onPick?.(s.id)}
          className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-xs hover:bg-accent hover:text-accent-foreground"
        >
          <span>{s.label}</span>
          {s.hint && <span className="text-[10px] opacity-70">{s.hint}</span>}
        </button>
      ))}
    </div>
  );
};

export default SearchSuggestions;

