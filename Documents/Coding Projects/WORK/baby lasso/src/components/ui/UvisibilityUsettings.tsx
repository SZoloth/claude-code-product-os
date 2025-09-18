import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Icon } from '@/lib/icons';

export interface VisibilityItem { id: string; label: string; enabled: boolean }

export interface VisibilityColumn {
  id: string;
  title: string;
  items: VisibilityItem[];
}

export interface VisibilitySettingsProps extends React.HTMLAttributes<HTMLDivElement> {
  columns: VisibilityColumn[];
  onChange: (cols: VisibilityColumn[]) => void;
}

export const VisibilitySettings = ({ columns, onChange, className, ...props }: VisibilitySettingsProps) => {
  const toggle = (cid: string, iid: string) => {
    onChange(columns.map((c) => c.id !== cid ? c : ({ ...c, items: c.items.map((i) => i.id === iid ? { ...i, enabled: !i.enabled } : i) })));
  };
  const move = (cid: string, idx: number, delta: number) => {
    const col = columns.find((c) => c.id === cid)!;
    const arr = [...col.items];
    const newIdx = Math.max(0, Math.min(arr.length - 1, idx + delta));
    if (newIdx === idx) return;
    const [it] = arr.splice(idx, 1);
    arr.splice(newIdx, 0, it);
    onChange(columns.map((c) => c.id !== cid ? c : ({ ...c, items: arr })));
  };

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)} {...props}>
      {columns.map((col) => (
        <div key={col.id} className="rounded-md border bg-secondary/30 p-3">
          <div className="mb-2 text-sm font-medium">{col.title}</div>
          <div className="space-y-2">
            {col.items.map((it, idx) => (
              <div key={it.id} className="flex items-center gap-2 rounded-sm border bg-background p-2">
                <input type="checkbox" checked={it.enabled} onChange={() => toggle(col.id, it.id)} className="h-3 w-3" />
                <div className="text-xs">{it.label}</div>
                <div className="ml-auto flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(col.id, idx, -1)}><Icon name="caret-up-fill" size="sm" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(col.id, idx, 1)}><Icon name="caret-down-fill" size="sm" /></Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VisibilitySettings;
