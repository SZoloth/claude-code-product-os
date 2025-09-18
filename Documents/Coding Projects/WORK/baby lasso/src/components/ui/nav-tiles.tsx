import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/lib/icons';

export interface NavTileItem {
  id: string;
  label: string;
  description?: string;
  icon?: keyof typeof import('@/lib/icons').iconLibrary;
  action?: string; // small action label at right
}

export interface NavTilesProps extends React.HTMLAttributes<HTMLDivElement> {
  items: NavTileItem[];
  columns?: number;
  onClick?: (id: string) => void;
}

export const NavTiles = ({ items, columns = 3, onClick, className, ...props }: NavTilesProps) => {
  return (
    <div className={cn(`grid gap-2`, className)} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} {...props}>
      {items.map((it) => (
        <button key={it.id} onClick={() => onClick?.(it.id)} className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-left hover:bg-accent/40">
          {it.icon && <Icon name={it.icon as any} size="sm" />}
          <div className="flex-1">
            <div className="text-sm font-medium leading-tight">{it.label}</div>
            {it.description && <div className="text-xs text-muted-foreground leading-tight">{it.description}</div>}
          </div>
          {it.action && <span className="text-[10px] rounded bg-secondary/60 px-1.5 py-0.5">{it.action}</span>}
        </button>
      ))}
    </div>
  );
};

export default NavTiles;

