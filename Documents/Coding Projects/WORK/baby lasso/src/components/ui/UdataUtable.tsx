import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { Button } from './button';
import { Badge } from './badge';
import { Checkbox } from './checkbox';
import { cn } from '@/lib/utils';
import { departmentThemes, type Department } from '@/lib/department-themes';
import {
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Filter,
  Search,
  Download,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';

// Column definition types
export type ColumnType = 
  | 'text' 
  | 'number' 
  | 'badge' 
  | 'progress' 
  | 'date' 
  | 'actions' 
  | 'status'
  | 'department';

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T = any> {
  key: keyof T;
  title: string;
  type: ColumnType;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableRow {
  id: string;
  [key: string]: any;
}

export interface DataTableProps<T extends DataTableRow> {
  data: T[];
  columns: Column<T>[];
  department?: Department;
  selectable?: boolean;
  onRowSelect?: (selectedIds: string[]) => void;
  onRowClick?: (row: T) => void;
  onSort?: (key: keyof T, direction: SortDirection) => void;
  onFilter?: (filters: Record<string, any>) => void;
  actions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (row: T) => void;
    variant?: 'default' | 'destructive' | 'outline';
  }[];
  bulkActions?: {
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    onClick: (selectedIds: string[]) => void;
    variant?: 'default' | 'destructive' | 'outline';
  }[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

// Default cell renderers
const cellRenderers = {
  text: (value: any) => <span className="text-sm">{value}</span>,
  
  number: (value: any) => (
    <span className="text-sm font-mono text-right">{value?.toLocaleString()}</span>
  ),
  
  badge: (value: any) => (
    <Badge variant="secondary" className="text-xs">
      {value}
    </Badge>
  ),
  
  progress: (value: any) => (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{value}%</span>
    </div>
  ),
  
  date: (value: any) => {
    if (!value) return <span className="text-muted-foreground">—</span>;
    const date = new Date(value);
    return (
      <span className="text-sm">
        {date.toLocaleDateString()}
      </span>
    );
  },
  
  status: (value: any) => {
    const statusColors: Record<string, string> = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'error': 'bg-red-100 text-red-800',
    };
    
    return (
      <Badge 
        variant="outline" 
        className={cn("text-xs", statusColors[value?.toLowerCase()] || 'bg-muted')}
      >
        {value}
      </Badge>
    );
  },
  
  department: (value: any, department?: Department) => {
    const deptColors = department ? departmentThemes[department] : null;
    return (
      <Badge 
        variant="outline"
        className={cn(
          "text-xs",
          deptColors && `border-${department}-primary/30 text-${department}-primary`
        )}
      >
        {value}
      </Badge>
    );
  }
};

// Enhanced DataTable component
export const DataTable = <T extends DataTableRow>({
  data,
  columns,
  department,
  selectable = false,
  onRowSelect,
  onRowClick,
  onSort,
  onFilter,
  actions = [],
  bulkActions = [],
  loading = false,
  emptyMessage = "No data available",
  className
}: DataTableProps<T>) => {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [sortState, setSortState] = useState<{ key: keyof T; direction: SortDirection }>({
    key: columns[0]?.key,
    direction: null
  });

  // Handle row selection
  const handleRowSelect = (rowId: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(rowId);
    } else {
      newSelected.delete(rowId);
    }
    setSelectedRows(newSelected);
    onRowSelect?.(Array.from(newSelected));
  };

  const handleSelectAll = (checked: boolean) => {
    const newSelected = checked ? new Set(data.map(row => row.id)) : new Set<string>();
    setSelectedRows(newSelected);
    onRowSelect?.(Array.from(newSelected));
  };

  // Handle sorting
  const handleSort = (key: keyof T) => {
    const newDirection: SortDirection = 
      sortState.key === key && sortState.direction === 'asc' ? 'desc' :
      sortState.key === key && sortState.direction === 'desc' ? null : 'asc';
    
    setSortState({ key, direction: newDirection });
    onSort?.(key, newDirection);
  };

  // Render cell content
  const renderCell = (column: Column<T>, row: T, value: any) => {
    if (column.render) {
      return column.render(value, row);
    }

    const renderer = cellRenderers[column.type];
    if (renderer) {
      return column.type === 'department' 
        ? renderer(value, department)
        : renderer(value);
    }

    return cellRenderers.text(value);
  };

  const isAllSelected = data.length > 0 && selectedRows.size === data.length;
  const isSomeSelected = selectedRows.size > 0 && selectedRows.size < data.length;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Bulk Actions Bar */}
      {selectable && selectedRows.size > 0 && bulkActions.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
          <span className="text-sm text-muted-foreground">
            {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2 ml-auto">
            {bulkActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => action.onClick(Array.from(selectedRows))}
                >
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Select All Checkbox */}
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isSomeSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              
              {/* Column Headers */}
              {columns.map((column) => (
                <TableHead 
                  key={String(column.key)}
                  className={cn(
                    column.className,
                    column.sortable && "cursor-pointer hover:bg-muted/50",
                    column.width && `w-[${column.width}]`
                  )}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {column.sortable && sortState.key === column.key && (
                      sortState.direction === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : sortState.direction === 'desc' ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : null
                    )}
                    {column.filterable && (
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <Filter className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableHead>
              ))}
              
              {/* Actions Column */}
              {actions.length > 0 && (
                <TableHead className="w-20">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} 
                  className="text-center py-8"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} 
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow 
                  key={row.id}
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    selectedRows.has(row.id) && "bg-muted/30",
                    onRowClick && "cursor-pointer"
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {/* Row Selection */}
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(row.id)}
                        onCheckedChange={(checked) => handleRowSelect(row.id, !!checked)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  
                  {/* Data Cells */}
                  {columns.map((column) => (
                    <TableCell 
                      key={String(column.key)}
                      className={cn(column.className)}
                    >
                      {renderCell(column, row, row[column.key])}
                    </TableCell>
                  ))}
                  
                  {/* Action Buttons */}
                  {actions.length > 0 && (
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {actions.slice(0, 2).map((action, index) => {
                          const Icon = action.icon;
                          return (
                            <Button
                              key={index}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row);
                              }}
                            >
                              {Icon ? <Icon className="h-4 w-4" /> : action.label}
                            </Button>
                          );
                        })}
                        {actions.length > 2 && (
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export type { DataTableProps, Column, DataTableRow };