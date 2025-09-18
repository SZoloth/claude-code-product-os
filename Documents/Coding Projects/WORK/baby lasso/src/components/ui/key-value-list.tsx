import React from 'react';
import { Button } from './button';
import { Input } from './input';
import { Icon } from '@/lib/icons';
import { cn } from '@/lib/utils';

export interface KeyValueItem { id: string; key: string; value: string; }

export interface KeyValueListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: KeyValueItem[];
  onChange: (items: KeyValueItem[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
  label?: string;
}

export const KeyValueList = ({ items, onChange, keyPlaceholder = 'Field', valuePlaceholder = 'Value', label = 'Job Container', className }: KeyValueListProps) => {
  const addRow = () => onChange([...items, { id: crypto.randomUUID(), key: '', value: '' }]);
  const removeRow = (id: string) => onChange(items.filter((i) => i.id !== id));
  const update = (id: string, patch: Partial<KeyValueItem>) => onChange(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));

  return (
    <div className={cn('space-y-2', className)}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="space-y-2">
        {items.map((row) => (
          <div key={row.id} className="flex items-center gap-2">
            <Input value={row.key} onChange={(e) => update(row.id, { key: e.target.value })} placeholder={keyPlaceholder} className="h-8 text-xs" />
            <Input value={row.value} onChange={(e) => update(row.id, { value: e.target.value })} placeholder={valuePlaceholder} className="h-8 text-xs" />
            <Button variant="outline" size="sm" className="h-8" onClick={() => removeRow(row.id)}>
              <Icon name="collapse" size="sm" />
            </Button>
          </div>
        ))}
      </div>
      <Button size="sm" variant="outline" className="h-8" onClick={addRow}>
        <Icon name="expand" size="sm" /> Add Row
      </Button>
    </div>
  );
};

export default KeyValueList;

