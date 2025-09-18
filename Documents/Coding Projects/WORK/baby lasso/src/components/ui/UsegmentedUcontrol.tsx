import React from 'react';
import { cn } from '@/lib/utils';

export interface Segment<T extends string = string> { label: string; value: T }

export interface SegmentedControlProps<T extends string = string> extends React.HTMLAttributes<HTMLDivElement> {
  segments: Segment<T>[];
  value: T;
  onChange?: (value: T) => void;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string = string>({ segments, value, onChange, size = 'sm', className }: SegmentedControlProps<T>) {
  const item = (seg: Segment<T>, idx: number) => (
    <button
      key={String(seg.value)}
      className={cn(
        'px-2 py-1 text-[10px] uppercase tracking-wide',
        value === seg.value ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground',
        idx > 0 && 'border-l'
      )}
      aria-pressed={value === seg.value}
      onClick={() => onChange?.(seg.value)}
    >
      {seg.label}
    </button>
  );
  return (
    <div className={cn('inline-flex overflow-hidden rounded-sm border', className)} role="group">
      {segments.map((s, i) => item(s, i))}
    </div>
  );
}

export default SegmentedControl;

