import React from 'react';
import { cn } from '@/lib/utils';

export interface NumberRangeValue { min?: number; max?: number }

export interface NumberRangeFacetProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: NumberRangeValue;
  onChange: (v: NumberRangeValue) => void;
  unit?: string;
}

export const NumberRangeFacet = ({ label, value, onChange, unit, className }: NumberRangeFacetProps) => {
  const set = (patch: Partial<NumberRangeValue>) => onChange({ ...value, ...patch });
  return (
    <div className={cn('space-y-2', className)}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <div className="text-[11px] text-muted-foreground mb-1">Min{unit ? ` (${unit})` : ''}</div>
          <input type="number" value={value.min ?? ''} onChange={(e) => set({ min: e.target.value === '' ? undefined : Number(e.target.value) })} className="h-8 w-full rounded-sm border bg-background px-2 text-xs" />
        </div>
        <div className="flex-1">
          <div className="text-[11px] text-muted-foreground mb-1">Max{unit ? ` (${unit})` : ''}</div>
          <input type="number" value={value.max ?? ''} onChange={(e) => set({ max: e.target.value === '' ? undefined : Number(e.target.value) })} className="h-8 w-full rounded-sm border bg-background px-2 text-xs" />
        </div>
      </div>
    </div>
  );
};

export default NumberRangeFacet;

