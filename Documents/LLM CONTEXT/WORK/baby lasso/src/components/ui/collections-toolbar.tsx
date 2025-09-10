import React from 'react';
import { cn } from '@/lib/utils';
import { Toolbar, ToolbarGroup, ToolbarDivider, ToolbarCount, ToolbarDropdown, ToolbarIconButton, ToolbarSelection, ToolbarActions } from './toolbar';
import { Button } from './button';
import { Icon } from '@/lib/icons';

// Types for departments shown in the left rail
export interface CollectionDepartment {
  id: string;
  label: string;
  meta?: string; // e.g., "1 Selected" or "Default"
}

export interface CollectionsToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  itemCount: number | string;
  selectedCount?: number;
  departments?: CollectionDepartment[];
  selectedDepartmentId?: string;
  onDepartmentChange?: (id: string) => void;
  collectionSlots?: { id: string; icon?: keyof typeof import('@/lib/icons').iconLibrary }[];
  selectedSlots?: string[];
  onToggleSlot?: (id: string) => void;
  variant?: 'option1' | 'option2'; // matches the design reference
}

const LeftDeptRail = ({
  departments = [],
  selectedId,
  onSelect,
}: {
  departments: CollectionDepartment[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}) => {
  if (!departments.length) return null;
  return (
    <div className="w-40 shrink-0 space-y-1 pr-3 border-r">
      {departments.map((d) => {
        const active = d.id === selectedId;
        return (
          <button
            key={d.id}
            onClick={() => onSelect?.(d.id)}
            className={cn(
              'w-full text-left px-2 py-2 rounded-sm text-xs',
              active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{d.label}</span>
              {d.meta && <span className="text-[10px] opacity-80">{d.meta}</span>}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const SlotsRow = ({
  slots = [],
  selected = [],
  onToggle,
  className,
}: {
  slots: { id: string; icon?: keyof typeof import('@/lib/icons').iconLibrary }[];
  selected?: string[];
  onToggle?: (id: string) => void;
  className?: string;
}) => (
  <div className={cn('flex items-center gap-2', className)}>
    {slots.map((s) => {
      const isSel = selected?.includes(s.id);
      return (
        <button
          key={s.id}
          onClick={() => onToggle?.(s.id)}
          className={cn(
            'h-8 w-8 rounded-sm border flex items-center justify-center',
            isSel ? 'bg-accent text-accent-foreground' : 'bg-background hover:bg-accent hover:text-accent-foreground'
          )}
          aria-pressed={isSel}
        >
          {s.icon ? <Icon name={s.icon as any} size="sm" /> : <span className="text-[10px]">{s.id}</span>}
        </button>
      );
    })}
  </div>
);

export const CollectionsToolbar = ({
  itemCount,
  selectedCount = 0,
  departments,
  selectedDepartmentId,
  onDepartmentChange,
  collectionSlots,
  selectedSlots,
  onToggleSlot,
  variant = 'option1',
  className,
  ...props
}: CollectionsToolbarProps) => {
  const showActions = selectedCount > 0;

  const toolbarCore = (
    <Toolbar className="w-full" {...props}>
      <ToolbarGroup>
        <ToolbarCount count={itemCount} />
        {selectedCount > 0 && <ToolbarSelection count={selectedCount} />}
        <ToolbarDivider />
        <ToolbarDropdown label="Select Session" />
        <ToolbarDropdown label="Full Resolution" />
        <ToolbarDropdown label="Geo" />
      </ToolbarGroup>
      <ToolbarGroup align="end">
        <ToolbarIconButton icon="image-grid" />
        <ToolbarIconButton icon="table" />
        <ToolbarIconButton icon="info-details-panel" />
        <ToolbarIconButton icon="copy" />
        <ToolbarDropdown label="Name" />
        <ToolbarIconButton icon="three-dots" />
      </ToolbarGroup>
    </Toolbar>
  );

  if (variant === 'option2') {
    return (
      <div className={cn('w-full rounded-md border bg-secondary/30 p-3', className)}>
        {toolbarCore}
        <div className="mt-3 flex items-center justify-between">
          <Button size="sm" variant="outline" className="h-8 rounded-sm px-2">
            <Icon name="folder-fill" size="sm" />
            Add to Collection
          </Button>
          {collectionSlots && (
            <SlotsRow slots={collectionSlots} selected={selectedSlots} onToggle={onToggleSlot} />
          )}
        </div>
        {showActions && (
          <ToolbarActions
            className="text-xs mt-2"
            actions={[
              { key: 'replace', label: 'Replace', icon: 'replace' },
              { key: 'match', label: 'Match', icon: 'match' },
              { key: 'view', label: 'View', icon: 'box-arrow-up-right' },
              { key: 'import', label: 'Import', icon: 'import' },
            ]}
          />
        )}
      </div>
    );
  }

  // option1: with left department rail and stacked toolbars
  return (
    <div className={cn('w-full rounded-md border bg-secondary/30 p-3', className)}>
      <div className="flex">
        <LeftDeptRail
          departments={departments || []}
          selectedId={selectedDepartmentId}
          onSelect={onDepartmentChange}
        />
        <div className="flex-1 space-y-3 pl-3">
          {toolbarCore}
          <div className="flex items-center justify-between">
            <Button size="sm" variant="outline" className="h-8 rounded-sm px-2">
              <Icon name="folder-fill" size="sm" />
              Add to Collection
            </Button>
            {collectionSlots && (
              <SlotsRow slots={collectionSlots} selected={selectedSlots} onToggle={onToggleSlot} />
            )}
          </div>
          {showActions && (
            <ToolbarActions
              className="text-xs"
              actions={[
                { key: 'replace', label: 'Replace', icon: 'replace' },
                { key: 'match', label: 'Match', icon: 'match' },
                { key: 'view', label: 'View', icon: 'box-arrow-up-right' },
                { key: 'import', label: 'Import', icon: 'import' },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionsToolbar;

