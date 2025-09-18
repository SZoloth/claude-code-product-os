import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { departmentThemes, type Department } from '@/lib/department-themes';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Play, 
  Pause,
  ArrowRight,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// Status types for different workflow stages
export type StatusType = 
  | 'not-started' 
  | 'in-progress' 
  | 'review' 
  | 'approved' 
  | 'rejected' 
  | 'on-hold' 
  | 'completed';

export type StatusLevel = 'primary' | 'secondary' | 'tertiary';

export interface StatusNode {
  id: string;
  name: string;
  type: StatusType;
  level: StatusLevel;
  department?: Department;
  children?: StatusNode[];
  isExpanded?: boolean;
  metadata?: {
    assignee?: string;
    dueDate?: string;
    notes?: string;
  };
}

interface StatusFlowProps {
  nodes: StatusNode[];
  onStatusClick?: (node: StatusNode) => void;
  onExpandToggle?: (nodeId: string) => void;
  department?: Department;
  variant?: 'tree' | 'linear' | 'compact';
  className?: string;
}

// Status configuration with icons and colors
const statusConfig = {
  'not-started': {
    icon: Clock,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    label: 'Not Started'
  },
  'in-progress': {
    icon: Play,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'In Progress'
  },
  'review': {
    icon: AlertCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Under Review'
  },
  'approved': {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Approved'
  },
  'rejected': {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Rejected'
  },
  'on-hold': {
    icon: Pause,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: 'On Hold'
  },
  'completed': {
    icon: CheckCircle,
    color: 'text-green-700',
    bgColor: 'bg-green-200',
    label: 'Completed'
  }
};

// Individual status node component
const StatusNodeComponent: React.FC<{
  node: StatusNode;
  onStatusClick?: (node: StatusNode) => void;
  onExpandToggle?: (nodeId: string) => void;
  department?: Department;
  level?: number;
}> = ({ 
  node, 
  onStatusClick, 
  onExpandToggle, 
  department,
  level = 0 
}) => {
  const config = statusConfig[node.type];
  const Icon = config.icon;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = node.isExpanded ?? false;

  const departmentColors = department ? departmentThemes[department] : null;

  return (
    <div className={cn("space-y-2", level > 0 && "ml-6")}>
      <div className="flex items-center gap-3 group">
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-muted"
            onClick={() => onExpandToggle?.(node.id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        )}
        
        {/* Status Indicator */}
        <div 
          className={cn(
            "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all",
            "hover:shadow-sm group-hover:border-primary/20",
            config.bgColor,
            departmentColors && `hover:border-${department}-primary/30`
          )}
          onClick={() => onStatusClick?.(node)}
        >
          <Icon className={cn("h-4 w-4", config.color)} />
          <span className="text-sm font-medium text-foreground">
            {node.name}
          </span>
          
          {/* Status Badge */}
          <Badge 
            variant="secondary" 
            className={cn(
              "ml-2 text-xs",
              departmentColors && `bg-${department}-primary/10 text-${department}-primary`
            )}
          >
            {config.label}
          </Badge>
        </div>

        {/* Metadata */}
        {node.metadata && (
          <div className="text-xs text-muted-foreground">
            {node.metadata.assignee && (
              <span className="mr-3">@{node.metadata.assignee}</span>
            )}
            {node.metadata.dueDate && (
              <span>Due: {node.metadata.dueDate}</span>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-1">
          {node.children!.map((child, index) => (
            <div key={child.id} className="relative">
              {/* Connection Lines */}
              <div className="absolute left-3 top-0 h-full w-px bg-border" />
              <div className="absolute left-3 top-3 w-3 h-px bg-border" />
              
              <StatusNodeComponent
                node={child}
                onStatusClick={onStatusClick}
                onExpandToggle={onExpandToggle}
                department={department}
                level={level + 1}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main StatusFlow component
export const StatusFlow: React.FC<StatusFlowProps> = ({
  nodes,
  onStatusClick,
  onExpandToggle,
  department,
  variant = 'tree',
  className
}) => {
  if (variant === 'linear') {
    return (
      <div className={cn("flex items-center gap-2 overflow-x-auto", className)}>
        {nodes.map((node, index) => {
          const config = statusConfig[node.type];
          const Icon = config.icon;
          
          return (
            <React.Fragment key={node.id}>
              <div 
                className={cn(
                  "flex items-center gap-2 p-2 rounded-lg border cursor-pointer",
                  "hover:shadow-sm transition-all whitespace-nowrap",
                  config.bgColor
                )}
                onClick={() => onStatusClick?.(node)}
              >
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className="text-sm font-medium">{node.name}</span>
              </div>
              
              {index < nodes.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-1", className)}>
        {nodes.map((node) => {
          const config = statusConfig[node.type];
          const Icon = config.icon;
          
          return (
            <div 
              key={node.id}
              className={cn(
                "flex items-center gap-2 p-1 rounded cursor-pointer",
                "hover:bg-muted transition-colors"
              )}
              onClick={() => onStatusClick?.(node)}
            >
              <Icon className={cn("h-3 w-3", config.color)} />
              <span className="text-xs">{node.name}</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {config.label}
              </Badge>
            </div>
          );
        })}
      </div>
    );
  }

  // Default tree variant
  return (
    <div className={cn("space-y-4", className)}>
      {nodes.map((node) => (
        <StatusNodeComponent
          key={node.id}
          node={node}
          onStatusClick={onStatusClick}
          onExpandToggle={onExpandToggle}
          department={department}
        />
      ))}
    </div>
  );
};

// StatusFlow Card wrapper for dashboard use
export const StatusFlowCard: React.FC<{
  title: string;
  nodes: StatusNode[];
  department?: Department;
  variant?: 'tree' | 'linear' | 'compact';
  onStatusClick?: (node: StatusNode) => void;
  onExpandToggle?: (nodeId: string) => void;
  className?: string;
}> = ({ 
  title, 
  nodes, 
  department, 
  variant = 'tree',
  onStatusClick,
  onExpandToggle,
  className 
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
          {department && (
            <Badge 
              variant="outline" 
              className={cn(
                `border-${department}-primary/30 text-${department}-primary`
              )}
            >
              {department}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <StatusFlow
          nodes={nodes}
          onStatusClick={onStatusClick}
          onExpandToggle={onExpandToggle}
          department={department}
          variant={variant}
        />
      </CardContent>
    </Card>
  );
};

export type { StatusFlowProps };