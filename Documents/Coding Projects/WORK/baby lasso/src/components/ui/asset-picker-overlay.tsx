import React from 'react';
import { Modal } from './modal';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface AssetItem { id: string; title?: string; thumbnailUrl?: string }

export interface AssetPickerOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: AssetItem[];
  selected?: string[];
  onChange?: (ids: string[]) => void;
  onApply?: () => void;
}

export const AssetPickerOverlay = ({ open, onOpenChange, items, selected = [], onChange, onApply }: AssetPickerOverlayProps) => {
  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id];
    onChange?.(next);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Select Media"
      footer={(<div className="flex w-full justify-end gap-2"><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={onApply}>Add Selected</Button></div>)}
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((it) => {
          const active = selected.includes(it.id);
          return (
            <button key={it.id} onClick={() => toggle(it.id)} className={cn('group overflow-hidden rounded-md border', active ? 'ring-2 ring-primary' : '')}>
              <div className="aspect-square w-full bg-muted/40">
                {it.thumbnailUrl ? <img src={it.thumbnailUrl} alt={it.title || 'asset'} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>}
              </div>
              <div className="px-2 py-1 text-[11px] truncate text-left">{it.title || 'Untitled'}</div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
};

export default AssetPickerOverlay;

