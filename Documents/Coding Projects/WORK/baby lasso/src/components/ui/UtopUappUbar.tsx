import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Icon } from '@/lib/icons';
import { AvatarGroup, type Avatar } from './avatar-group';

export interface TopAppBarProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  onMenuClick?: () => void;
  center?: React.ReactNode; // e.g., tabs or breadcrumbs
  actions?: React.ReactNode; // right-side actions before avatars
  avatars?: Avatar[];
}

export const TopAppBar = ({ title, onMenuClick, center, actions, avatars = [], className, ...props }: TopAppBarProps) => {
  return (
    <div className={cn('w-full border-b bg-secondary/40', className)} {...props}>
      <div className="mx-auto flex h-12 max-w-7xl items-center gap-3 px-3">
        {onMenuClick && (
          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={onMenuClick}>
            <Icon name="horizontal-grid" />
          </Button>
        )}
        {title && <div className="font-semibold text-sm">{title}</div>}
        <div className="flex-1" />
        {center}
        <div className="flex-1" />
        {actions}
        {avatars.length > 0 && <AvatarGroup avatars={avatars} size="sm" className="ml-2" />}
        <Button size="icon" variant="ghost" className="h-8 w-8">
          <Icon name="gear-fill" />
        </Button>
      </div>
    </div>
  );
};

export default TopAppBar;

