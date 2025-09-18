import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { SearchInput } from './search-input';
import { SearchChipGroup, type SearchOperator } from './search-chip';
import { FacetMultiSelect, type FacetOption } from './facet-multi-select';
import { Icon } from '@/lib/icons';

export interface SearchBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onChange: (v: string) => void;
  chips?: { id: string; label: string }[];
  onRemoveChip?: (id: string) => void;
  operator?: SearchOperator;
  onOperatorChange?: (op: SearchOperator) => void;
  facets?: { key: string; label: string; options: FacetOption[] }[];
  facetValues?: Record<string, string[]>;
  onFacetChange?: (key: string, values: string[]) => void;
  onSubmit?: () => void;
  onReset?: () => void;
  onSave?: () => void;
}

export const SearchBar = ({
  value,
  onChange,
  chips = [],
  onRemoveChip,
  operator = 'AND',
  onOperatorChange,
  facets = [],
  facetValues = {},
  onFacetChange,
  onSubmit,
  onReset,
  onSave,
  className,
  ...props
}: SearchBarProps) => {
  const [local, setLocal] = React.useState(value);
  React.useEffect(() => setLocal(value), [value]);

  return (
    <div className={cn('rounded-md border bg-secondary/30 p-3 space-y-2', className)} {...props}>
      <div className="flex items-center gap-2">
        <SearchInput
          value={local}
          onChange={(e) => {
            const next = e.currentTarget.value;
            setLocal(next);
            onChange?.(next);
          }}
          onClear={() => {
            setLocal('');
            onChange?.('');
          }}
          onSubmit={() => onSubmit?.()}
          placeholder="Search assets, tags, users…"
          className="flex-1"
        />
        <Button onClick={() => onSubmit?.()} className="h-9">
          <Icon name="search" size="sm" />
          Search
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            setLocal('');
            onReset?.();
            onChange?.('');
          }}
          className="h-9"
        >
          Reset
        </Button>
        <Button variant="outline" onClick={onSave} className="h-9">Save Search</Button>
      </div>

      {(chips.length > 0 || facets.length > 0) && (
        <div className="flex flex-wrap items-start gap-4">
          {chips.length > 0 && (
            <SearchChipGroup
              chips={chips}
              operator={operator}
              onOperatorChange={onOperatorChange}
              onRemoveChip={onRemoveChip}
            />
          )}
          {facets.length > 0 && (
            <div className="flex flex-wrap items-center gap-4">
              {facets.map((f) => (
                <FacetMultiSelect
                  key={f.key}
                  label={f.label}
                  options={f.options}
                  values={facetValues[f.key] || []}
                  onChange={(vals) => onFacetChange?.(f.key, vals)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
