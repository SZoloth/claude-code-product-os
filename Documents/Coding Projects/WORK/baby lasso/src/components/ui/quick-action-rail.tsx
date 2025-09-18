import React from 'react';
import { cn } from '@/lib/utils';
import { Icon } from '@/lib/icons';

export interface QuickAction {
  key: string;
  icon: keyof typeof import('@/lib/icons').iconLibrary;
  label?: string;
  onClick?: () => void;
}

export interface QuickActionRailProps extends React.HTMLAttributes<HTMLDivElement> {
  actions: QuickAction[];
  position?: 'fixed-right' | 'inline';
}

export const QuickActionRail = ({ actions, position = 'inline', className, ...props }: QuickActionRailProps) => {
  const base = (
    <div
      className={cn(
        'rounded-md border bg-secondary/40 p-2 flex flex-col gap-2',
        className
      )}
      {...props}
    >
      {actions.map((a) => (
        <button
          key={a.key}
          onClick={a.onClick}
          className="h-8 w-8 rounded-full border flex items-center justify-center bg-background hover:bg-accent hover:text-accent-foreground"
          aria-label={a.label || a.key}
          title={a.label}
        >
          <Icon name={a.icon as any} size="sm" />
        </button>
      ))}
    </div>
  );

  if (position === 'fixed-right') {
    return (
      <div className="fixed right-4 bottom-24">
        {base}
      </div>
    );
  }

  return base;
};

export default QuickActionRail;

