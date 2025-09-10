import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Icon } from '@/lib/icons';

export interface FacetOption { label: string; value: string; }

export interface FacetMultiSelectProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  options: FacetOption[];
  values?: string[];
  onChange?: (values: string[]) => void;
}

export const FacetMultiSelect = ({ label, options, values = [], onChange, className }: FacetMultiSelectProps) => {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const toggleValue = (v: string) => {
    const next = values.includes(v) ? values.filter((x) => x !== v) : [...values, v];
    onChange?.(next);
  };

  const selectedText = values.length ? `${values.length} selected` : 'Any';

  return (
    <div className={cn('relative inline-block', className)}>
      <div className="text-[11px] mb-1 text-muted-foreground">{label}</div>
      <Button ref={buttonRef as any} size="sm" variant="outline" className="h-8 rounded-sm px-2 text-xs" onClick={() => setOpen((v) => !v)}>
        {selectedText}
        <Icon name={open ? 'caret-up-fill' : 'caret-down-fill'} size="sm" />
      </Button>
      {open && (
        <div ref={menuRef} className="absolute z-50 mt-1 min-w-[14rem] rounded-md border bg-background p-2 shadow-md">
          <div className="max-h-56 overflow-auto pr-1">
            {options.map((opt) => {
              const checked = values.includes(opt.value);
              return (
                <label key={opt.value} className="flex items-center gap-2 px-1 py-1.5 text-xs rounded hover:bg-accent hover:text-accent-foreground">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleValue(opt.value)}
                    className="h-3 w-3 accent-foreground"
                  />
                  <span>{opt.label}</span>
                </label>
              );
            })}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => onChange?.([])}>Clear</Button>
            <Button size="sm" className="h-8 px-2 text-xs" onClick={() => setOpen(false)}>Apply</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacetMultiSelect;

