// Core ShadCN Components
export { Button, type ButtonProps, buttonVariants } from './button';
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from './card';
export { Badge, type BadgeProps, badgeVariants } from './badge';
export { Checkbox } from './checkbox';
export { 
  Table, 
  TableHeader, 
  TableBody, 
  TableFooter, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableCaption 
} from './table';

// Department-Themed Components
export { DepartmentButton, departmentButtonVariants } from './department-button';
export { DepartmentBadge, departmentBadgeVariants } from './department-badge';
export { ColorPalette } from './color-palette';

// Icon System
export { Icon, iconCategories, getDepartmentIconColor, type IconSize } from '@/lib/icons';
export { IconShowcase } from './icon-showcase';

// Typography System
export { 
  Typography, 
  H1, 
  H2, 
  H3, 
  H4, 
  Text, 
  TextLarge, 
  TextSmall, 
  Label, 
  Caption, 
  Code,
  typographyVariants,
  type TypographyVariant,
  type TypographyColor
} from './typography';
export { TypographyShowcase } from './typography-showcase';
export { typographyScale, typographyPresets } from '@/lib/typography';

// Enhanced DreamWorks Components
export { AssetCard, AssetType, type Asset } from './asset-card';
export { Dashboard } from './dashboard';

// Advanced Components
export { 
  StatusFlow, 
  StatusFlowCard, 
  type StatusNode, 
  type StatusType, 
  type StatusFlowProps 
} from './status-flow';
export { 
  DataTable, 
  type DataTableProps, 
  type Column, 
  type DataTableRow,
  type ColumnType 
} from './data-table';
export { 
  Breadcrumb, 
  ProjectBreadcrumb, 
  AssetBreadcrumb, 
  type BreadcrumbProps, 
  type BreadcrumbItem,
  type BreadcrumbItemType 
} from './breadcrumb';

// Theme utilities
export { departmentThemes, type Department } from '@/lib/department-themes';

// Re-export utilities
export { cn } from '@/lib/utils';

// Form Basics
export { Input, type InputProps } from './input';

// Toolbar Components
export {
  Toolbar,
  ToolbarGroup,
  ToolbarDivider,
  ToolbarCount,
  ToolbarSelection,
  ToolbarDropdown,
  ToolbarIconButton,
  ToolbarTextAction,
  ToolbarViewToggle,
  ToolbarActions,
  SelectionToolbar,
  type ToolbarDropdownOption,
  type ToolbarProps,
  type ToolbarDropdownProps,
  type ToolbarIconButtonProps,
  type SelectionToolbarProps
} from './toolbar';

// Collections Toolbar
export {
  CollectionsToolbar,
  type CollectionsToolbarProps,
  type CollectionDepartment
} from './collections-toolbar';

// Quick Action Rail
export {
  QuickActionRail,
  type QuickAction,
  type QuickActionRailProps
} from './quick-action-rail';

// Search Components
export {
  SearchInput,
  type SearchInputProps
} from './search-input';
export {
  SearchChip,
  SearchChipGroup,
  type SearchChipProps,
  type SearchChipGroupProps,
  type SearchOperator
} from './search-chip';
export {
  FacetMultiSelect,
  type FacetMultiSelectProps,
  type FacetOption
} from './facet-multi-select';
export {
  SearchBar,
  type SearchBarProps
} from './search-bar';
export {
  SearchResultsGrid,
  type SearchResultItem,
  type SearchResultsGridProps
} from './search-results-grid';

// Asset Grid Interface
export { AssetGridInterface } from './asset-grid-interface';
