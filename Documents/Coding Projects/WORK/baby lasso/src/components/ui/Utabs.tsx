import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const listVariants = cva('flex gap-2', {
  variants: {
    orientation: {
      horizontal: 'flex-row items-end',
      vertical: 'flex-col items-stretch',
    },
    variant: {
      underline: '',
      pill: '',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
    },
  },
  defaultVariants: { orientation: 'horizontal', variant: 'underline', size: 'md' },
});

const triggerVariants = cva(
  'relative select-none rounded-sm px-3 py-1.5 transition-colors',
  {
    variants: {
      orientation: {
        horizontal: '',
        vertical: 'w-full justify-start',
      },
      variant: {
        underline: 'text-muted-foreground hover:text-foreground',
        pill: 'border bg-background text-foreground hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
      },
      active: {
        true: '',
        false: '',
      },
    },
    defaultVariants: { orientation: 'horizontal', variant: 'underline', size: 'md' },
  }
);

const underlineActive = 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary';

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof listVariants> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const TabsContext = React.createContext<{
  value: string | undefined;
  setValue: (v: string) => void;
  orientation: 'horizontal' | 'vertical';
  variant: 'underline' | 'pill';
  size: 'sm' | 'md';
} | null>(null);

export const Tabs = ({ children, className, value, onValueChange, orientation = 'horizontal', variant = 'underline', size = 'md', ...props }: TabsProps) => {
  const [internal, setInternal] = React.useState<string | undefined>(value);
  React.useEffect(() => setInternal(value), [value]);
  const setValue = (v: string) => {
    setInternal(v);
    onValueChange?.(v);
  };
  return (
    <TabsContext.Provider value={{ value: internal, setValue, orientation, variant, size }}>
      <div className={cn('w-full', className)} {...props}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabList = ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => {
  const ctx = React.useContext(TabsContext)!;
  return (
    <div className={cn(listVariants({ orientation: ctx.orientation, variant: ctx.variant, size: ctx.size }), className)} role="tablist">
      {children}
    </div>
  );
};

export interface TabTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabTrigger = ({ value, className, children, ...props }: TabTriggerProps) => {
  const ctx = React.useContext(TabsContext)!;
  const active = ctx.value === value || (ctx.value == null && props['aria-selected']);
  return (
    <button
      role="tab"
      aria-selected={active}
      className={cn(
        triggerVariants({ orientation: ctx.orientation, variant: ctx.variant, size: ctx.size, active: active ? true : false }),
        ctx.variant === 'underline' && active && underlineActive,
        className
      )}
      onClick={() => ctx.setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabPanel = ({ value, className, children, ...props }: TabPanelProps) => {
  const ctx = React.useContext(TabsContext)!;
  const hidden = ctx.value !== value && ctx.value !== undefined;
  return (
    <div role="tabpanel" hidden={hidden} className={cn('mt-3', className)} {...props}>
      {!hidden && children}
    </div>
  );
};

export default Tabs;

