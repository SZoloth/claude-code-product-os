import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/lib/icons';

export interface SearchChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  onRemove?: () => void;
}

export const SearchChip = ({ label, onRemove, className, ...props }: SearchChipProps) => (
  <div className={cn('inline-flex items-center gap-1 rounded-sm border bg-background px-2 py-1 text-xs', className)} {...props}>
    <span>{label}</span>
    {onRemove && (
      <button className="text-muted-foreground hover:text-foreground" aria-label={`Remove ${label}`} onClick={onRemove}>
        <Icon name="clear-input" size="sm" />
      </button>
    )}
  </div>
);

export type SearchOperator = 'AND' | 'OR' | 'NOT';

export interface SearchChipGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  chips: { id: string; label: string }[];
  operator?: SearchOperator;
  onOperatorChange?: (op: SearchOperator) => void;
  onRemoveChip?: (id: string) => void;
}

export const SearchChipGroup = ({ chips, operator = 'AND', onOperatorChange, onRemoveChip, className, ...props }: SearchChipGroupProps) => (
  <div className={cn('flex flex-wrap items-center gap-2', className)} {...props}>
    <div className="inline-flex overflow-hidden rounded-sm border" role="group" aria-label="Search Operator">
      {(['AND', 'OR', 'NOT'] as SearchOperator[]).map((op, idx) => (
        <button
          key={op}
          className={cn(
            'px-2 py-1 text-[10px] uppercase tracking-wide',
            operator === op ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground',
            idx > 0 && 'border-l'
          )}
          aria-pressed={operator === op}
          onClick={() => onOperatorChange?.(op)}
        >
          {op}
        </button>
      ))}
    </div>
    {chips.map((c) => (
      <SearchChip key={c.id} label={c.label} onRemove={onRemoveChip ? () => onRemoveChip(c.id) : undefined} />
    ))}
  </div>
);

export default SearchChip;

