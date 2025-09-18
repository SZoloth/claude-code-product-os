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
export {
  PanelShell,
  PanelSection,
  PanelField,
  PanelEmptyState,
  PanelIconGrid,
  PanelAccordion,
  PanelImageCard,
  PanelImageGrid,
  VariantLabel,
  CopyField,
  type PanelHeaderAction,
  type PanelShellProps,
  type PanelFieldProps,
  type PanelAccordionProps,
  type PanelImageCardProps,
  type EmptyStateVariant
} from './panel';
export { GlobalPanelExamples } from './panel-examples';
export { ArtInfoPanel } from './art-info-panel';
export { CFXInfoPanel } from './cfx-info-panel';
export { FLOInfoPanel } from './flo-info-panel';
export { GroomInfoPanel } from './groom-info-panel';
export { LookDevInfoPanel } from './lookdev-info-panel';
export { ModelingInfoPanel } from './modeling-info-panel';
export { PrevizInfoPanel } from './previz-info-panel';
export {
  AssetPickerOverlay,
  type AssetPickerOverlayProps,
  type AssetItem
} from './asset-picker-overlay';
export { TopAppBar, type TopAppBarProps } from './top-app-bar';
export {
  CollectionsSideNav,
  type CollectionsSideNavProps,
  type CollectionItem
} from './collections-side-nav';
export { NavTiles, type NavTilesProps, type NavTileItem } from './nav-tiles';
export { SidebarNav, type SidebarNavProps, type SidebarNavSection, type SidebarNavItem } from './sidebar-nav';
export { AvatarGroup, type AvatarGroupProps, type Avatar } from './avatar-group';

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
export { Modal, type ModalProps } from './modal';

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
export {
  SearchResultsHeader,
  type SearchResultsHeaderProps
} from './search-results-header';
export {
  SearchResultsList,
  type SearchResultRow,
  type SearchResultsListProps
} from './search-results-list';
export {
  SearchSuggestions,
  type SearchSuggestionsProps,
  type SearchSuggestion
} from './search-suggestions';
export { SearchTabs, type SearchTabsProps, type SearchTab } from './search-tabs';
export {
  AdvancedSearchDialog,
  type AdvancedSearchDialogProps,
  type AdvancedSearchState
} from './advanced-search-dialog';
export {
  NumberRangeFacet,
  type NumberRangeFacetProps,
  type NumberRangeValue
} from './number-range-facet';
export { SegmentedControl, type SegmentedControlProps, type Segment } from './segmented-control';

// Asset Grid Interface
export { AssetGridInterface } from './asset-grid-interface';
export { AssetGridInterfaceFixed } from './asset-grid-interface-fixed';
