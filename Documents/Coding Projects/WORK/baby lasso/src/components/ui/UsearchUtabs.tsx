import React from 'react';
import { cn } from '@/lib/utils';

export interface SearchTab { id: string; label: string; count?: number }

export interface SearchTabsProps extends React.HTMLAttributes<HTMLDivElement> {
  tabs: SearchTab[];
  value: string;
  onChange?: (id: string) => void;
}

export const SearchTabs = ({ tabs, value, onChange, className, ...props }: SearchTabsProps) => (
  <div className={cn('flex items-center gap-2', className)} {...props}>
    {tabs.map((t) => {
      const active = value === t.id;
      return (
        <button key={t.id} onClick={() => onChange?.(t.id)} className={cn('rounded-md px-3 py-1.5 text-sm', active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground')} aria-current={active ? 'page' : undefined}>
          <span>{t.label}</span>
          {typeof t.count === 'number' && (
            <span className="ml-2 rounded-sm bg-secondary/50 px-1.5 py-0.5 text-[10px]">{t.count}</span>
          )}
        </button>
      );
    })}
  </div>
);

export default SearchTabs;

