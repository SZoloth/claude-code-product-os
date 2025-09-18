import React from 'react';
import { cn } from '@/lib/utils';

export interface FilterRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  hint?: string;
  control: React.ReactNode;
}

export const FilterRow = ({ label, hint, control, className, ...props }: FilterRowProps) => (
  <div className={cn('grid grid-cols-12 items-center gap-2 py-1', className)} {...props}>
    <div className="col-span-4 text-xs text-muted-foreground">{label}{hint && <span className="ml-1 opacity-70">({hint})</span>}</div>
    <div className="col-span-8">{control}</div>
  </div>
);

export interface FilterStackProps extends React.HTMLAttributes<HTMLDivElement> {
  rows: FilterRowProps[];
}

export const FilterStack = ({ rows, className, ...props }: FilterStackProps) => (
  <div className={cn('rounded-md border bg-secondary/30 p-3', className)} {...props}>
    {rows.map((r, idx) => (
      <FilterRow key={idx} {...r} />
    ))}
  </div>
);

export default FilterRow;
