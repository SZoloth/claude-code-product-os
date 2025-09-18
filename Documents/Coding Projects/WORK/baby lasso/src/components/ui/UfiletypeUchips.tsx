import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/lib/icons';

export interface FileTypeChip {
  id: string;
  label: string;
  icon?: keyof typeof import('@/lib/icons').iconLibrary;
}

export interface FileTypeChipsProps extends React.HTMLAttributes<HTMLDivElement> {
  types: FileTypeChip[];
  selected?: string[];
  onToggle?: (id: string) => void;
}

export const FileTypeChips = ({ types, selected = [], onToggle, className, ...props }: FileTypeChipsProps) => (
  <div className={cn('flex flex-wrap items-center gap-2', className)} {...props}>
    {types.map((t) => {
      const active = selected.includes(t.id);
      return (
        <button
          key={t.id}
          onClick={() => onToggle?.(t.id)}
          className={cn('inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-xs', active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground')}
          aria-pressed={active}
        >
          {t.icon && <Icon name={t.icon as any} size="sm" />}
          <span>{t.label}</span>
        </button>
      );
    })}
  </div>
);

export default FileTypeChips;

