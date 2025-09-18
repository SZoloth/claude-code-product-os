import React from 'react';
import { cn } from '@/lib/utils';

export type DatePreset = 'any' | '24h' | '7d' | '30d' | 'custom';

export interface DateRangeValue {
  preset: DatePreset;
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
}

export interface DateRangeFacetProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  value: DateRangeValue;
  onChange: (val: DateRangeValue) => void;
}

export const DateRangeFacet = ({ label = 'Date Created', value, onChange, className }: DateRangeFacetProps) => {
  const setPreset = (preset: DatePreset) => onChange({ ...value, preset });
  const setFrom = (from: string) => onChange({ ...value, from, preset: 'custom' });
  const setTo = (to: string) => onChange({ ...value, to, preset: 'custom' });

  return (
    <div className={cn('space-y-2', className)}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {([
          { key: 'any', label: 'Any' },
          { key: '24h', label: '24 hours' },
          { key: '7d', label: '7 days' },
          { key: '30d', label: '30 days' },
          { key: 'custom', label: 'Custom' },
        ] as const).map((p) => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            aria-pressed={value.preset === p.key}
            className={cn(
              'h-8 rounded-sm border text-xs px-2',
              value.preset === p.key ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {value.preset === 'custom' && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="text-[11px] text-muted-foreground mb-1">From</div>
            <input
              type="date"
              value={value.from || ''}
              onChange={(e) => setFrom(e.target.value)}
              className="h-8 w-full rounded-sm border bg-background px-2 text-xs"
            />
          </div>
          <div className="flex-1">
            <div className="text-[11px] text-muted-foreground mb-1">To</div>
            <input
              type="date"
              value={value.to || ''}
              onChange={(e) => setTo(e.target.value)}
              className="h-8 w-full rounded-sm border bg-background px-2 text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFacet;

