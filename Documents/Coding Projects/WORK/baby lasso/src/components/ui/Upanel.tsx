import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/lib/icons';

// Panel shell and header
export interface PanelHeaderAction {
  key: string;
  icon: keyof typeof import('@/lib/icons').iconLibrary;
  onClick?: () => void;
  title?: string;
}

export interface PanelShellProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  actions?: PanelHeaderAction[];
}

export const PanelShell = ({ title, actions = [], className, children, ...props }: PanelShellProps) => (
  <div className={cn('rounded-md border bg-secondary/30 text-foreground', className)} {...props}>
    {(title || actions.length > 0) && (
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="text-sm font-medium">{title}</div>
        <div className="flex items-center gap-1">
          {actions.map((a) => (
            <button key={a.key} onClick={a.onClick} title={a.title} className="h-8 w-8 rounded-sm border bg-background hover:bg-accent hover:text-accent-foreground">
              <Icon name={a.icon as any} size="sm" />
            </button>
          ))}
        </div>
      </div>
    )}
    <div className="p-3">{children}</div>
  </div>
);

// Sections & fields
export const PanelSection = ({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) => (
  <div className={cn('mb-4 last:mb-0', className)}>
    {title && <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</div>}
    <div className="space-y-1.5">{children}</div>
  </div>
);

export interface PanelFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value?: React.ReactNode;
  icon?: keyof typeof import('@/lib/icons').iconLibrary;
}

export const PanelField = ({ label, value, icon, className, ...props }: PanelFieldProps) => (
  <div className={cn('grid grid-cols-12 items-center gap-2 rounded-sm border bg-background px-2 py-1 text-xs', className)} {...props}>
    <div className="col-span-4 flex items-center gap-1 text-muted-foreground">
      {icon && <Icon name={icon as any} size="sm" />}
      <span>{label}</span>
    </div>
    <div className="col-span-8 truncate">{value}</div>
  </div>
);

// Empty states
export type EmptyStateVariant = 'none' | 'multiple';

export const PanelEmptyState = ({ variant = 'none', className }: { variant?: EmptyStateVariant; className?: string }) => {
  const data =
    variant === 'multiple'
      ? { icon: 'copy' as const, label: 'Multiple items selected' }
      : { icon: 'file-earmark-text-fill' as const, label: 'Select an item to see details' };
  return (
    <div className={cn('flex h-40 w-full items-center justify-center rounded-md border bg-background', className)}>
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <Icon name={data.icon} size="lg" />
        <div className="text-xs">{data.label}</div>
      </div>
    </div>
  );
};

// Icon grid reference
export const PanelIconGrid = ({ icons }: { icons: { label: string; icon: keyof typeof import('@/lib/icons').iconLibrary }[] }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
    {icons.map((it) => (
      <div key={it.label} className="flex items-center gap-2 rounded-sm border bg-background px-2 py-1">
        <Icon name={it.icon as any} size="sm" />
        <span className="text-xs">{it.label}</span>
      </div>
    ))}
  </div>
);

// Accordion for dense lists (history, assets, etc.)
export interface PanelAccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  defaultOpen?: boolean;
  right?: React.ReactNode; // e.g., count or small actions
}

export const PanelAccordion = ({ title, defaultOpen = false, right, children, className }: PanelAccordionProps) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className={cn('rounded-md border bg-background', className)}>
      <button className="flex w-full items-center justify-between px-2 py-1.5 text-left" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-2 text-sm">
          <Icon name={open ? 'caret-down-fill' : 'caret-right-fill'} size="sm" />
          <span className="font-medium">{title}</span>
        </div>
        {right && <div className="text-xs text-muted-foreground">{right}</div>}
      </button>
      {open && <div className="border-t p-2 text-xs">{children}</div>}
    </div>
  );
};

// Image cards for sources/previews
export interface PanelImageCardProps {
  src?: string;
  title?: string;
  selected?: boolean;
}

export const PanelImageCard = ({ src, title, selected }: PanelImageCardProps) => (
  <div className={cn('overflow-hidden rounded-md border bg-muted/30', selected && 'ring-2 ring-primary')}> 
    <div className="aspect-square w-full bg-muted/40">
      {src ? (
        <img src={src} alt={title || ''} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground">img</div>
      )}
    </div>
    {title && <div className="px-2 py-1 text-[11px] truncate">{title}</div>}
  </div>
);

export const PanelImageGrid = ({ items }: { items: PanelImageCardProps[] }) => (
  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2">
    {items.map((it, idx) => (
      <PanelImageCard key={idx} {...it} />
    ))}
  </div>
);

// Variant labels (small colored pills)
export const VariantLabel = ({ label, color = 'bg-secondary/60' }: { label: string; color?: string }) => (
  <span className={cn('inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[10px]', color)}>
    <span className="h-1.5 w-1.5 rounded-full bg-foreground/70" />
    {label}
  </span>
);

// Copyable path field
export const CopyField = ({ value }: { value: string }) => {
  const [copied, setCopied] = React.useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };
  return (
    <div className="flex items-center gap-2 rounded-sm border bg-background px-2 py-1 text-xs">
      <code className="flex-1 truncate">{value}</code>
      <button onClick={copy} className="rounded border px-1.5 py-0.5 hover:bg-accent hover:text-accent-foreground">
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
};

export default PanelShell;
