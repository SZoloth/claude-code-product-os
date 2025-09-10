import React from 'react';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '@/lib/utils';
import { departmentThemes, type Department } from '@/lib/department-themes';
import { 
  ChevronRight, 
  Home, 
  Folder, 
  File, 
  Settings, 
  Users,
  Database,
  Archive,
  Star,
  Tag
} from 'lucide-react';

export type BreadcrumbItemType = 
  | 'home' 
  | 'folder' 
  | 'file' 
  | 'settings' 
  | 'users' 
  | 'database' 
  | 'archive' 
  | 'favorite' 
  | 'tag' 
  | 'custom';

export interface BreadcrumbItem {
  id: string;
  label: string;
  type?: BreadcrumbItemType;
  href?: string;
  department?: Department;
  icon?: React.ComponentType<{ className?: string }>;
  metadata?: {
    count?: number;
    status?: string;
    isPrivate?: boolean;
  };
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  department?: Department;
  variant?: 'default' | 'compact' | 'detailed';
  showIcons?: boolean;
  showMetadata?: boolean;
  maxItems?: number;
  className?: string;
}

// Icon mapping for different item types
const typeIcons = {
  home: Home,
  folder: Folder,
  file: File,
  settings: Settings,
  users: Users,
  database: Database,
  archive: Archive,
  favorite: Star,
  tag: Tag,
  custom: Folder // fallback
};

// Individual breadcrumb item component
const BreadcrumbItemComponent: React.FC<{
  item: BreadcrumbItem;
  index: number;
  isLast: boolean;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
  department?: Department;
  variant?: 'default' | 'compact' | 'detailed';
  showIcons?: boolean;
  showMetadata?: boolean;
}> = ({ 
  item, 
  index, 
  isLast, 
  onItemClick, 
  department,
  variant = 'default',
  showIcons = true,
  showMetadata = true 
}) => {
  const Icon = item.icon || (item.type ? typeIcons[item.type] : typeIcons.folder);
  const departmentColors = (item.department || department) ? 
    departmentThemes[item.department || department!] : null;

  const itemDepartment = item.department || department;

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-6 px-2 text-xs hover:bg-muted",
            isLast ? "text-foreground font-medium" : "text-muted-foreground",
            departmentColors && !isLast && `hover:text-${itemDepartment}-primary`,
            departmentColors && isLast && `text-${itemDepartment}-primary`
          )}
          onClick={() => onItemClick?.(item, index)}
        >
          {showIcons && <Icon className="h-3 w-3 mr-1" />}
          {item.label}
        </Button>
        {!isLast && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all",
            "hover:shadow-sm",
            isLast ? "bg-muted/50 border-border" : "hover:bg-muted/30",
            departmentColors && `hover:border-${itemDepartment}-primary/30`
          )}
          onClick={() => onItemClick?.(item, index)}
        >
          {showIcons && <Icon className="h-4 w-4 text-muted-foreground" />}
          
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-medium",
              isLast ? "text-foreground" : "text-muted-foreground"
            )}>
              {item.label}
            </span>
            
            {showMetadata && item.metadata && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {item.metadata.count !== undefined && (
                  <span>{item.metadata.count} items</span>
                )}
                {item.metadata.status && (
                  <Badge variant="outline" className="text-xs">
                    {item.metadata.status}
                  </Badge>
                )}
                {item.metadata.isPrivate && (
                  <Badge variant="secondary" className="text-xs">
                    Private
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {item.department && (
            <Badge 
              variant="outline"
              className={cn(
                "ml-2 text-xs",
                departmentColors && `border-${item.department}-primary/30 text-${item.department}-primary`
              )}
            >
              {item.department}
            </Badge>
          )}
        </div>
        
        {!isLast && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 px-3 text-sm hover:bg-muted transition-colors",
          isLast ? "text-foreground font-medium" : "text-muted-foreground",
          departmentColors && !isLast && `hover:text-${itemDepartment}-primary`,
          departmentColors && isLast && `text-${itemDepartment}-primary`
        )}
        onClick={() => onItemClick?.(item, index)}
      >
        {showIcons && <Icon className="h-4 w-4 mr-2" />}
        {item.label}
        
        {showMetadata && item.metadata?.count !== undefined && (
          <Badge variant="secondary" className="ml-2 text-xs">
            {item.metadata.count}
          </Badge>
        )}
      </Button>
      
      {!isLast && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
    </div>
  );
};

// Main Breadcrumb component
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  onItemClick,
  department,
  variant = 'default',
  showIcons = true,
  showMetadata = true,
  maxItems,
  className
}) => {
  // Handle truncation when maxItems is specified
  const displayItems = useMemo(() => {
    if (!maxItems || items.length <= maxItems) {
      return items;
    }

    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 1));
    
    return [
      firstItem,
      {
        id: 'ellipsis',
        label: '...',
        type: 'custom' as BreadcrumbItemType
      },
      ...lastItems
    ];
  }, [items, maxItems]);

  return (
    <nav className={cn("flex items-center gap-1", className)} aria-label="Breadcrumb">
      {variant === 'detailed' ? (
        <div className="flex flex-col gap-2">
          {displayItems.map((item, index) => (
            <BreadcrumbItemComponent
              key={item.id}
              item={item}
              index={index}
              isLast={index === displayItems.length - 1}
              onItemClick={item.id === 'ellipsis' ? undefined : onItemClick}
              department={department}
              variant={variant}
              showIcons={showIcons}
              showMetadata={showMetadata}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-1 overflow-x-auto">
          {displayItems.map((item, index) => (
            <BreadcrumbItemComponent
              key={item.id}
              item={item}
              index={index}
              isLast={index === displayItems.length - 1}
              onItemClick={item.id === 'ellipsis' ? undefined : onItemClick}
              department={department}
              variant={variant}
              showIcons={showIcons}
              showMetadata={showMetadata}
            />
          ))}
        </div>
      )}
    </nav>
  );
};

// Specialized breadcrumb variants
export const ProjectBreadcrumb: React.FC<{
  projectName: string;
  currentPath: string[];
  department?: Department;
  onNavigate?: (path: string[]) => void;
  className?: string;
}> = ({ projectName, currentPath, department, onNavigate, className }) => {
  const items: BreadcrumbItem[] = [
    {
      id: 'home',
      label: 'Projects',
      type: 'home'
    },
    {
      id: 'project',
      label: projectName,
      type: 'folder',
      department,
      metadata: { status: 'active' }
    },
    ...currentPath.map((path, index) => ({
      id: `path-${index}`,
      label: path,
      type: 'folder' as BreadcrumbItemType
    }))
  ];

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (index === 0) {
      onNavigate?.([]);
    } else if (index === 1) {
      onNavigate?.([]);
    } else {
      onNavigate?.(currentPath.slice(0, index - 1));
    }
  };

  return (
    <Breadcrumb
      items={items}
      onItemClick={handleItemClick}
      department={department}
      variant="default"
      className={className}
    />
  );
};

export const AssetBreadcrumb: React.FC<{
  assetPath: string[];
  assetName: string;
  assetType: string;
  department?: Department;
  onNavigate?: (path: string[]) => void;
  className?: string;
}> = ({ assetPath, assetName, assetType, department, onNavigate, className }) => {
  const items: BreadcrumbItem[] = [
    {
      id: 'assets',
      label: 'Assets',
      type: 'database'
    },
    ...assetPath.map((path, index) => ({
      id: `path-${index}`,
      label: path,
      type: 'folder' as BreadcrumbItemType
    })),
    {
      id: 'asset',
      label: assetName,
      type: 'file',
      department,
      metadata: { status: assetType }
    }
  ];

  const handleItemClick = (item: BreadcrumbItem, index: number) => {
    if (index === 0) {
      onNavigate?.([]);
    } else if (index < items.length - 1) {
      onNavigate?.(assetPath.slice(0, index));
    }
  };

  return (
    <Breadcrumb
      items={items}
      onItemClick={handleItemClick}
      department={department}
      variant="default"
      className={className}
    />
  );
};

function useMemo<T>(factory: () => T, deps: React.DependencyList | undefined): T {
  return React.useMemo(factory, deps);
}

export type { BreadcrumbProps, BreadcrumbItem };