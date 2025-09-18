import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/lib/icons';

export interface SidebarNavItem {
  id: string;
  label: string;
  icon?: keyof typeof import('@/lib/icons').iconLibrary;
  active?: boolean;
  badge?: string;
  children?: SidebarNavItem[];
}

export interface SidebarNavSection {
  id: string;
  label?: string;
  items: SidebarNavItem[];
}

export interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  sections: SidebarNavSection[];
  collapsible?: boolean;
  onItemClick?: (item: SidebarNavItem) => void;
}

const Row = ({ item, depth, onClick }: { item: SidebarNavItem; depth: number; onClick?: (i: SidebarNavItem) => void }) => {
  const [open, setOpen] = React.useState(true);
  const hasChildren = (item.children?.length || 0) > 0;
  return (
    <div>
      <button
        className={cn(
          'group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent/50',
          item.active && 'bg-accent/60 text-accent-foreground'
        )}
        style={{ paddingLeft: 8 + depth * 12 }}
        onClick={() => (hasChildren ? setOpen(!open) : onClick?.(item))}
      >
        {item.icon && <Icon name={item.icon as any} size="sm" />}
        <span className="flex-1 truncate">{item.label}</span>
        {item.badge && <span className="rounded bg-secondary/60 px-1.5 py-0.5 text-[10px]">{item.badge}</span>}
        {hasChildren && <Icon name={open ? 'caret-down-fill' : 'caret-right-fill'} size="sm" />}
      </button>
      {hasChildren && open && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <Row key={child.id} item={child} depth={depth + 1} onClick={onClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export const SidebarNav = ({ sections, className, onItemClick, ...props }: SidebarNavProps) => (
  <div className={cn('w-64 rounded-md border bg-secondary/30 p-2', className)} {...props}>
    {sections.map((s) => (
      <div key={s.id} className="mb-2">
        {s.label && <div className="px-2 py-1 text-[11px] uppercase tracking-wide text-muted-foreground">{s.label}</div>}
        <div className="space-y-1">
          {s.items.map((it) => (
            <Row key={it.id} item={it} depth={0} onClick={onItemClick} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default SidebarNav;
