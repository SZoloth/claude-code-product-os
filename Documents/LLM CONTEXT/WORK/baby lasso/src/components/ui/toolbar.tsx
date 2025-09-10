import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Button, type ButtonProps } from './button';
import { Badge } from './badge';
import { Icon, type IconSize } from '@/lib/icons';

// Toolbar container styles
const toolbarVariants = cva(
  'w-full rounded-md border bg-secondary/40 text-secondary-foreground',
  {
    variants: {
      size: {
        sm: 'h-10',
        md: 'h-12',
      },
      padded: {
        true: 'px-3',
        false: 'px-0',
      },
    },
    defaultVariants: {
      size: 'md',
      padded: true,
    },
  }
);

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toolbarVariants> {}

export const Toolbar = ({ className, size, padded, children, ...props }: ToolbarProps) => {
  return (
    <div className={cn(toolbarVariants({ size, padded }), 'flex items-center justify-between')} {...props}>
      {children}
    </div>
  );
};

// Group: simple flex wrapper for toolbar sections
export interface ToolbarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end';
}

export const ToolbarGroup = ({ className, align = 'start', ...props }: ToolbarGroupProps) => (
  <div
    className={cn(
      'flex items-center gap-2',
      align === 'center' && 'justify-center',
      align === 'end' && 'justify-end',
      className
    )}
    {...props}
  />
);

// Divider between groups
export const ToolbarDivider = ({ className = '' }: { className?: string }) => (
  <div className={cn('h-6 w-px bg-border/60 mx-2', className)} />
);

// Count pill (e.g., "29,981 items")
export const ToolbarCount = ({ count, label = 'items' }: { count: number | string; label?: string }) => (
  <Badge variant="outline" className="bg-background/40">
    {count} {label}
  </Badge>
);

// Selection badge (e.g., "2 Selected")
export const ToolbarSelection = ({ count }: { count: number }) => (
  <Badge variant="secondary">{count} Selected</Badge>
);

// Dropdown-like button used for filters (non-modal; consumer can attach handlers)
export interface ToolbarDropdownOption {
  label: string;
  value: string;
}

export interface ToolbarDropdownProps extends Omit<ButtonProps, 'variant' | 'size' | 'children'> {
  label: string;
  caret?: 'down' | 'up';
  options?: ToolbarDropdownOption[];
  value?: string;
  onValueChange?: (value: string) => void;
}

export const ToolbarDropdown = ({
  label,
  caret = 'down',
  className,
  options,
  value,
  onValueChange,
  ...props
}: ToolbarDropdownProps) => {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const hasMenu = Array.isArray(options) && options.length > 0;

  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!listRef.current && !buttonRef.current) return;
      const t = e.target as Node;
      if (listRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const toggle = () => (hasMenu ? setOpen((v) => !v) : undefined);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!hasMenu) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, (options?.length || 1) - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (open) {
        e.preventDefault();
        const opt = options?.[activeIndex];
        if (opt && onValueChange) onValueChange(opt.value);
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const selectedLabel = hasMenu && value
    ? options?.find((o) => o.value === value)?.label ?? label
    : label;

  return (
    <div className="relative inline-block">
      <Button
        ref={buttonRef as any}
        variant="outline"
        size="sm"
        className={cn('h-8 rounded-sm px-2 py-1 text-xs', className)}
        aria-haspopup={hasMenu ? 'listbox' : undefined}
        aria-expanded={hasMenu ? open : undefined}
        onClick={hasMenu ? toggle : props.onClick}
        onKeyDown={handleKeyDown}
        {...(!hasMenu ? props : { type: 'button' })}
      >
        <span>{selectedLabel}</span>
        <Icon name={open ? 'caret-up-fill' : 'caret-down-fill'} size="sm" />
      </Button>
      {hasMenu && open && (
        <ul
          ref={listRef}
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-1 min-w-[10rem] rounded-md border bg-background p-1 shadow-md focus:outline-none"
        >
          {options!.map((opt, idx) => {
            const isActive = idx === activeIndex;
            const isSelected = value === opt.value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                className={cn(
                  'cursor-pointer select-none rounded-sm px-2 py-1.5 text-xs',
                  isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground',
                )}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  onValueChange?.(opt.value);
                  setOpen(false);
                }}
              >
                {opt.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

// Icon-only button sized for toolbars
export interface ToolbarIconButtonProps extends Omit<ButtonProps, 'children'> {
  icon: keyof typeof import('@/lib/icons').iconLibrary;
  size?: IconSize;
}

export const ToolbarIconButton = ({ icon, size = 'sm', className, ...props }: ToolbarIconButtonProps) => (
  <Button variant="ghost" size="icon" className={cn('h-8 w-8 rounded-sm', className)} {...props}>
    <Icon name={icon as any} size={size} />
  </Button>
);

// Text action/link
export interface ToolbarTextActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const ToolbarTextAction = ({ label, className, ...props }: ToolbarTextActionProps) => (
  <button
    className={cn('text-xs text-muted-foreground hover:text-foreground transition-colors', className)}
    {...props}
  >
    {label}
  </button>
);

// View toggle (grid/table) with pressed state
export type ViewMode = 'grid' | 'table';
export const ToolbarViewToggle = ({
  value,
  onValueChange,
  className,
}: {
  value: ViewMode;
  onValueChange?: (v: ViewMode) => void;
  className?: string;
}) => (
  <div className={cn('inline-flex rounded-sm border overflow-hidden', className)} role="group" aria-label="View Mode">
    <button
      className={cn('h-8 w-8 flex items-center justify-center', value === 'grid' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground')}
      aria-pressed={value === 'grid'}
      onClick={() => onValueChange?.('grid')}
    >
      <Icon name="image-grid" size="sm" />
    </button>
    <button
      className={cn('h-8 w-8 flex items-center justify-center border-l', value === 'table' ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground')}
      aria-pressed={value === 'table'}
      onClick={() => onValueChange?.('table')}
    >
      <Icon name="table" size="sm" />
    </button>
  </div>
);

// Secondary action rail shown below the toolbar when items are selected
export interface ToolbarActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  actions: { key: string; label: string; icon?: keyof typeof import('@/lib/icons').iconLibrary; onClick?: () => void }[];
}

export const ToolbarActions = ({ actions, className, ...props }: ToolbarActionsProps) => (
  <div className={cn('flex items-center gap-2 px-3 py-2', className)} {...props}>
    {actions.map((a) => (
      <Button key={a.key} variant="outline" size="sm" onClick={a.onClick} className="h-8 rounded-sm px-2">
        {a.icon && <Icon name={a.icon as any} size="sm" />}
        <span className="text-xs">{a.label}</span>
      </Button>
    ))}
  </div>
);

// Convenience composition: A full toolbar with optional selection state
export interface SelectionToolbarProps extends ToolbarProps {
  itemCount: number | string;
  selectedCount?: number;
  filters?: string[]; // labels for dropdowns
  rightIcons?: (keyof typeof import('@/lib/icons').iconLibrary)[];
  sortLabel?: string; // e.g., "Name"
  onAction?: (action: string) => void; // for default actions below
}

export const SelectionToolbar = ({
  itemCount,
  selectedCount = 0,
  filters = ['Select Session', 'Full Resolution', 'Geo'],
  rightIcons = ['image-grid', 'table', 'info-details-panel', 'copy', 'three-dots'],
  sortLabel = 'Name',
  onAction,
  className,
  ...props
}: SelectionToolbarProps) => {
  const showActions = selectedCount > 0;

  return (
    <div className="w-full">
      <Toolbar className={className} {...props}>
        <ToolbarGroup>
          <ToolbarCount count={itemCount} />
          {selectedCount > 0 && (
            <ToolbarSelection count={selectedCount} />
          )}
          {filters.length > 0 && <ToolbarDivider />}
          {filters.map((f) => (
            <ToolbarDropdown key={f} label={f} />
          ))}
        </ToolbarGroup>
        <ToolbarGroup align="end">
          {/* View details text action to match reference */}
          <ToolbarTextAction label="View Details" />
          <ToolbarDivider />
          <ToolbarViewToggle value="grid" onValueChange={() => {}} />
          {rightIcons.map((i, idx) => (
            <ToolbarIconButton key={`${i}-${idx}`} icon={i as any} />
          ))}
          <ToolbarDropdown label={sortLabel + ' '} />
          <ToolbarIconButton icon="three-dots" />
        </ToolbarGroup>
      </Toolbar>
      {showActions && (
        <ToolbarActions
          actions={[
            { key: 'replace', label: 'Replace', icon: 'replace', onClick: () => onAction?.('replace') },
            { key: 'match', label: 'Match', icon: 'match', onClick: () => onAction?.('match') },
            { key: 'view', label: 'View', icon: 'box-arrow-up-right', onClick: () => onAction?.('view') },
            { key: 'import', label: 'Import', icon: 'import', onClick: () => onAction?.('import') },
          ]}
          className="text-xs"
        />
      )}
    </div>
  );
};

export default Toolbar;
