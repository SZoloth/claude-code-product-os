import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Icon } from '@/lib/icons';

export interface SelectOption { label: string; value: string }

export interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  onChange?: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md';
}

export const Select = ({ value, onChange, options, placeholder = 'Select…', size = 'md', className }: SelectProps) => {
  const [open, setOpen] = React.useState(false);
  const refBtn = React.useRef<HTMLButtonElement | null>(null);
  const refList = React.useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (refBtn.current?.contains(t) || refList.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const sizeClasses = size === 'sm' ? 'h-8 text-xs px-2' : 'h-9 text-sm px-3';
  const display = value ? options.find(o => o.value === value)?.label : placeholder;

  return (
    <div className={cn('relative inline-block', className)}>
      <Button ref={refBtn as any} variant="outline" size="sm" className={cn('rounded-sm', sizeClasses)} onClick={() => setOpen(v => !v)}>
        {display}
        <Icon name={open ? 'caret-up-fill' : 'caret-down-fill'} size="sm" />
      </Button>
      {open && (
        <ul ref={refList} role="listbox" className="absolute z-50 mt-1 min-w-[10rem] rounded-md border bg-background p-1 shadow-md">
          {options.map((opt, idx) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              className={cn('cursor-pointer select-none rounded-sm px-2 py-1.5 text-xs', idx === activeIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground')}
              onMouseEnter={() => setActiveIndex(idx)}
              onClick={() => { onChange?.(opt.value); setOpen(false); }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;

