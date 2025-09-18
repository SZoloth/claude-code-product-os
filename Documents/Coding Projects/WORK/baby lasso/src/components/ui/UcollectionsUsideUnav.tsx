import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/lib/icons';

export interface CollectionItem { id: string; label: string; icon?: keyof typeof import('@/lib/icons').iconLibrary; count?: number; active?: boolean; }

export interface CollectionsSideNavProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  items: CollectionItem[];
  actions?: React.ReactNode; // e.g., new collection button
  onItemClick?: (id: string) => void;
}

export const CollectionsSideNav = ({ title = 'Collections', items, actions, onItemClick, className, ...props }: CollectionsSideNavProps) => (
  <div className={cn('w-72 rounded-md border bg-secondary/30', className)} {...props}>
    <div className="flex items-center justify-between px-3 py-2 border-b">
      <div className="text-sm font-medium">{title}</div>
      {actions}
    </div>
    <div className="p-2 space-y-1">
      {items.map((it) => (
        <button key={it.id} onClick={() => onItemClick?.(it.id)} className={cn('flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent/50', it.active && 'bg-accent/60 text-accent-foreground')}>
          {it.icon && <Icon name={it.icon as any} size="sm" />}
          <span className="flex-1 truncate">{it.label}</span>
          {typeof it.count === 'number' && <span className="rounded bg-secondary/60 px-1.5 py-0.5 text-[10px]">{it.count}</span>}
        </button>
      ))}
    </div>
  </div>
);

export default CollectionsSideNav;

