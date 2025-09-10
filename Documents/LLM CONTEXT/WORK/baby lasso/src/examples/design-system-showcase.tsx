import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
  Badge,
  AssetCard,
  Dashboard,
  AssetType,
  type Asset,
  DepartmentButton,
  DepartmentBadge,
  ColorPalette,
  Icon,
  IconShowcase,
  Typography,
  H1,
  H2,
  TypographyShowcase,
  StatusFlow,
  StatusFlowCard,
  DataTable,
  Breadcrumb,
  ProjectBreadcrumb,
  AssetBreadcrumb,
  SelectionToolbar,
  Toolbar,
  ToolbarGroup,
  ToolbarDivider,
  ToolbarDropdown,
  ToolbarIconButton,
  ToolbarCount,
  ToolbarSelection,
  CollectionsToolbar,
  QuickActionRail,
  SearchBar,
  SearchResultsGrid,
  type Department,
  type StatusNode,
  type Column,
  type DataTableRow,
  type BreadcrumbItem
} from '@/components/ui';
import { Moon, Sun, Palette, Layout, Zap } from 'lucide-react';

// Local demo component to keep hooks at top-level
const SearchDemoBlock: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [chips, setChips] = React.useState([
    { id: 'asset:dragon', label: 'asset:dragon' },
    { id: 'type:model', label: 'type:model' },
  ]);
  const [operator, setOperator] = React.useState<'AND' | 'OR' | 'NOT'>('AND');
  const [facets, setFacets] = React.useState<Record<string, string[]>>({ size: ['2k'], keywords: ['fantasy'] });

  const facetDefs = [
    { key: 'keywords', label: 'Keywords', options: [
      { label: 'fantasy', value: 'fantasy' },
      { label: 'dragon', value: 'dragon' },
      { label: 'castle', value: 'castle' },
      { label: 'forest', value: 'forest' },
    ] },
    { key: 'size', label: 'Image Size', options: [
      { label: '1k', value: '1k' },
      { label: '2k', value: '2k' },
      { label: '4k', value: '4k' },
    ] },
  ] as const;

  const handleSubmit = () => {
    console.log('search', { query, chips, operator, facets });
  };

  return (
    <div className="space-y-6">
      <SearchBar
        value={query}
        onChange={setQuery}
        chips={chips}
        onRemoveChip={(id) => setChips((c) => c.filter((x) => x.id !== id))}
        operator={operator}
        onOperatorChange={setOperator}
        facets={facetDefs as any}
        facetValues={facets}
        onFacetChange={(k, v) => setFacets((f) => ({ ...f, [k]: v }))}
        onSubmit={handleSubmit}
        onReset={() => { setQuery(''); setChips([]); setFacets({}); }}
        onSave={() => console.log('save search')}
      />

      <SearchResultsGrid
        items={Array.from({ length: 18 }).map((_, i) => ({
          id: String(i + 1),
          title: `Result ${i + 1}`,
          thumbnailUrl: `https://picsum.photos/seed/search${i}/300/300`,
        }))}
      />
    </div>
  );
};

// Sample data
const sampleAssets: Asset[] = [
  {
    id: '1',
    name: 'Dragon Character',
    type: AssetType.CHARACTER,
    fileSize: 15728640,
    dateModified: '2024-01-15',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
    tags: ['rigged', 'fantasy'],
  },
  {
    id: '2',
    name: 'Magic Sword',
    type: AssetType.PROP,
    fileSize: 8388608,
    dateModified: '2024-01-13',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
    tags: ['weapon', 'fantasy'],
  },
  {
    id: '3',
    name: 'Flight Animation',
    type: AssetType.ANIMATION,
    fileSize: 52428800,
    dateModified: '2024-01-11',
    tags: ['motion', 'flight'],
  },
];

// Sample data for new components
const sampleStatusNodes: StatusNode[] = [
  {
    id: 'modeling',
    name: 'Character Modeling',
    type: 'in-progress',
    level: 'primary',
    department: 'modeling',
    isExpanded: true,
    metadata: { assignee: 'john.doe', dueDate: '2024-01-20' },
    children: [
      {
        id: 'base-mesh',
        name: 'Base Mesh',
        type: 'completed',
        level: 'secondary',
        metadata: { assignee: 'john.doe' }
      },
      {
        id: 'detail-sculpt',
        name: 'Detail Sculpting',
        type: 'in-progress',
        level: 'secondary',
        metadata: { assignee: 'jane.smith' }
      },
      {
        id: 'retopology',
        name: 'Retopology',
        type: 'not-started',
        level: 'secondary'
      }
    ]
  },
  {
    id: 'texturing',
    name: 'Texturing & Materials',
    type: 'not-started',
    level: 'primary',
    department: 'lookdev'
  }
];

const sampleTableData: (DataTableRow & {
  name: string;
  department: string;
  status: string;
  progress: number;
  lastModified: string;
  assignee: string;
})[] = [
  {
    id: '1',
    name: 'Dragon Character',
    department: 'Modeling',
    status: 'In Progress',
    progress: 75,
    lastModified: '2024-01-15',
    assignee: 'John Doe'
  },
  {
    id: '2',
    name: 'Castle Environment',
    department: 'Art',
    status: 'Review',
    progress: 90,
    lastModified: '2024-01-14',
    assignee: 'Jane Smith'
  },
  {
    id: '3',
    name: 'Fire VFX',
    department: 'LookDev',
    status: 'Completed',
    progress: 100,
    lastModified: '2024-01-12',
    assignee: 'Bob Wilson'
  }
];

const sampleTableColumns: Column<typeof sampleTableData[0]>[] = [
  { key: 'name', title: 'Asset Name', type: 'text', sortable: true },
  { key: 'department', title: 'Department', type: 'department', sortable: true },
  { key: 'status', title: 'Status', type: 'status', sortable: true },
  { key: 'progress', title: 'Progress', type: 'progress', sortable: true },
  { key: 'lastModified', title: 'Last Modified', type: 'date', sortable: true },
  { key: 'assignee', title: 'Assignee', type: 'text', sortable: true }
];

const sampleBreadcrumbs: BreadcrumbItem[] = [
  { id: 'projects', label: 'Projects', type: 'home' },
  { id: 'dragon-movie', label: 'Dragon Movie', type: 'folder', department: 'art' },
  { id: 'characters', label: 'Characters', type: 'folder' },
  { id: 'dragon', label: 'Dragon', type: 'file', metadata: { status: 'In Progress' } }
];

export const DesignSystemShowcase = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleAssetSelect = (id: string) => {
    setSelectedAssets(prev => 
      prev.includes(id) 
        ? prev.filter(assetId => assetId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">DreamWorks Lasso Design System</h1>
              <p className="text-muted-foreground mt-2">
                Built with ShadCN UI for consistent, accessible interfaces
              </p>
            </div>
            <Button onClick={toggleDarkMode} variant="outline" size="sm">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="text-center">
                <Palette className="h-8 w-8 mx-auto text-primary" />
                <CardTitle>Design Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Consistent colors, typography, and spacing across all components
                </p>
                <div className="flex gap-2 mt-4 justify-center">
                  <Badge variant="default">Primary</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Accent</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Layout className="h-8 w-8 mx-auto text-primary" />
                <CardTitle>Components</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  Enhanced ShadCN components with DreamWorks-specific functionality
                </p>
                <div className="flex gap-2 mt-4 justify-center">
                  <Button size="sm">Button</Button>
                  <Button size="sm" variant="outline">Card</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <Zap className="h-8 w-8 mx-auto text-primary" />
                <CardTitle>Developer Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground text-center">
                  TypeScript support, Storybook documentation, and easy customization
                </p>
                <div className="flex gap-2 mt-4 justify-center">
                  <Badge variant="outline">TypeScript</Badge>
                  <Badge variant="outline">Storybook</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Button Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="default" size="sm">Small</Button>
                <Button variant="default" size="lg">Large</Button>
              </div>
            </CardContent>
          </Card>

          {/* Toolbar Components */}
          <Card>
            <CardHeader>
              <CardTitle>Toolbar Components</CardTitle>
              <p className="text-muted-foreground text-sm">Reusable toolbar for tables and grids with selection-aware actions</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Default (nothing selected) */}
              <SelectionToolbar itemCount={29981} selectedCount={0} />

              {/* One selected */}
              <SelectionToolbar itemCount={29981} selectedCount={1} />

              {/* Two selected with customized filters/icons */}
              <SelectionToolbar
                itemCount={29981}
                selectedCount={2}
                filters={["1 Selected", "Select Session", "Full Resolution", "Geo"]}
                rightIcons={["image-grid", "table", "info-details-panel", "copy"]}
                sortLabel="Name"
                onAction={(a) => console.log('toolbar action:', a)}
              />

              {/* Manual composition example */}
              <div>
                <Toolbar>
                  <ToolbarGroup>
                    <ToolbarCount count={29981} />
                    <ToolbarSelection count={1} />
                    <ToolbarDivider />
                    <ToolbarDropdown
                      label="Select Session"
                      options={[
                        { label: 'Session A', value: 'a' },
                        { label: 'Session B', value: 'b' },
                        { label: 'Session C', value: 'c' },
                      ]}
                      value={'a'}
                      onValueChange={(v) => console.log('session', v)}
                    />
                    <ToolbarDropdown
                      label="Full Resolution"
                      options={[
                        { label: 'Full Resolution', value: 'full' },
                        { label: 'Half Resolution', value: 'half' },
                        { label: 'Quarter Resolution', value: 'quarter' },
                      ]}
                      value={'full'}
                      onValueChange={(v) => console.log('resolution', v)}
                    />
                    <ToolbarDropdown
                      label="Geo"
                      options={[
                        { label: 'Geo', value: 'geo' },
                        { label: 'Textures', value: 'tex' },
                        { label: 'Materials', value: 'mat' },
                      ]}
                      value={'geo'}
                      onValueChange={(v) => console.log('type', v)}
                    />
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
              </div>
            </CardContent>
          </Card>

          {/* Collections Toolbar Variants */}
          <Card>
            <CardHeader>
              <CardTitle>Collections Toolbar</CardTitle>
              <p className="text-muted-foreground text-sm">Variants inspired by the design reference (Option 1 and Option 2)</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Option 1 */}
              <CollectionsToolbar
                itemCount={29981}
                selectedCount={1}
                variant="option1"
                departments={[
                  { id: 'modeling', label: 'Modeling', meta: '1 Selected' },
                  { id: 'dmp', label: 'DMP', meta: 'Default' },
                ]}
                selectedDepartmentId={"modeling"}
                onDepartmentChange={(id) => console.log('dept', id)}
                collectionSlots={Array.from({ length: 6 }).map((_, i) => ({ id: String(i + 1), icon: 'folder-fill' }))}
                selectedSlots={["1"]}
                onToggleSlot={(id) => console.log('slot', id)}
              />

              {/* Option 2 */}
              <CollectionsToolbar
                itemCount={29981}
                selectedCount={2}
                variant="option2"
                collectionSlots={Array.from({ length: 8 }).map((_, i) => ({ id: String(i + 1), icon: 'folder-fill' }))}
                selectedSlots={["1", "3"]}
                onToggleSlot={(id) => console.log('slot2', id)}
              />
            </CardContent>
          </Card>

          {/* Quick Action Rail (floating) */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Action Rail</CardTitle>
              <p className="text-muted-foreground text-sm">Vertical floating actions as shown on the right side of the reference</p>
            </CardHeader>
            <CardContent>
              <div className="relative h-48 border rounded-md p-4">
                <QuickActionRail
                  className="absolute right-4 top-4"
                  actions={[
                    { key: 'up', icon: 'arrow-up-short', label: 'Move Up' },
                    { key: 'down', icon: 'arrow-down-short', label: 'Move Down' },
                    { key: 'copy', icon: 'copy', label: 'Copy' },
                    { key: 'link', icon: 'link-45deg', label: 'Link' },
                    { key: 'pin', icon: 'pin-pinned', label: 'Pin' },
                    { key: 'settings', icon: 'gear-fill', label: 'Settings' },
                  ]}
                />
                <div className="text-xs text-muted-foreground">Canvas placeholder to show the rail anchored to the right</div>
              </div>
            </CardContent>
          </Card>

          {/* Search Components */}
          <Card>
            <CardHeader>
              <CardTitle>Search Components</CardTitle>
              <p className="text-muted-foreground text-sm">Search bar, chips with AND/OR/NOT, facet multi-selects, and results grid</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <SearchDemoBlock />
            </CardContent>
          </Card>

          {/* Asset Cards Showcase */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Asset Cards</CardTitle>
                <div className="text-sm text-muted-foreground">
                  {selectedAssets.length} selected
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {sampleAssets.map((asset) => (
                  <AssetCard
                    key={asset.id}
                    asset={asset}
                    selectable
                    selected={selectedAssets.includes(asset.id)}
                    onSelect={handleAssetSelect}
                    showActions
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Dashboard Showcase */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Component</CardTitle>
            </CardHeader>
            <CardContent>
              <Dashboard 
                recentAssets={sampleAssets}
                stats={{
                  totalAssets: 1243,
                  collections: 32,
                  storageUsed: '42.3 GB',
                  storageUsedPercentage: 67,
                  activeUsers: 12,
                }}
              />
            </CardContent>
          </Card>

          {/* Department Color Palettes */}
          <Card>
            <CardHeader>
              <CardTitle>Department Color Palettes</CardTitle>
              <p className="text-muted-foreground text-sm">
                Each department has its own color system for status indicators and branding
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(['art', 'modeling', 'lookdev', 'groom'] as Department[]).map((dept) => (
                  <ColorPalette key={dept} department={dept} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Icon Library */}
          <IconShowcase />

          {/* Typography System */}
          <TypographyShowcase />

          {/* Status Flow System */}
          <Card>
            <CardHeader>
              <CardTitle>Status Flow Components</CardTitle>
              <p className="text-muted-foreground text-sm">
                Interactive workflow management with hierarchical status tracking
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tree View */}
              <div>
                <H2 className="mb-4">Tree View (Default)</H2>
                <StatusFlowCard
                  title="Character Production Pipeline"
                  nodes={sampleStatusNodes}
                  department="modeling"
                  onStatusClick={(node) => console.log('Status clicked:', node)}
                  onExpandToggle={(nodeId) => console.log('Toggle expand:', nodeId)}
                />
              </div>

              {/* Linear View */}
              <div>
                <H2 className="mb-4">Linear View</H2>
                <Card>
                  <CardContent className="pt-6">
                    <StatusFlow
                      nodes={sampleStatusNodes.flatMap(node => [node, ...(node.children || [])])}
                      variant="linear"
                      department="art"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Compact View */}
              <div>
                <H2 className="mb-4">Compact View</H2>
                <Card>
                  <CardContent className="pt-6">
                    <StatusFlow
                      nodes={sampleStatusNodes}
                      variant="compact"
                      department="lookdev"
                    />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Data Table Component */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Data Tables</CardTitle>
              <p className="text-muted-foreground text-sm">
                Feature-rich tables with sorting, filtering, selection, and actions
              </p>
            </CardHeader>
            <CardContent>
              <DataTable
                data={sampleTableData}
                columns={sampleTableColumns}
                department="art"
                selectable
                onRowSelect={(selected) => console.log('Selected rows:', selected)}
                onRowClick={(row) => console.log('Row clicked:', row)}
                actions={[
                  { 
                    label: 'View', 
                    icon: ({ className }) => <Icon name="eye" className={className} />,
                    onClick: (row) => console.log('View:', row),
                    variant: 'outline'
                  },
                  { 
                    label: 'Edit', 
                    icon: ({ className }) => <Icon name="edit" className={className} />,
                    onClick: (row) => console.log('Edit:', row)
                  }
                ]}
                bulkActions={[
                  { 
                    label: 'Download', 
                    icon: ({ className }) => <Icon name="download" className={className} />,
                    onClick: (ids) => console.log('Download:', ids),
                    variant: 'outline'
                  },
                  { 
                    label: 'Delete', 
                    icon: ({ className }) => <Icon name="trash" className={className} />,
                    onClick: (ids) => console.log('Delete:', ids),
                    variant: 'destructive'
                  }
                ]}
              />
            </CardContent>
          </Card>

          {/* Navigation & Breadcrumbs */}
          <Card>
            <CardHeader>
              <CardTitle>Navigation & Breadcrumbs</CardTitle>
              <p className="text-muted-foreground text-sm">
                Contextual navigation with department theming and metadata
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Default Breadcrumbs */}
              <div>
                <H2 className="mb-4">Default Breadcrumbs</H2>
                <Breadcrumb
                  items={sampleBreadcrumbs}
                  department="art"
                  onItemClick={(item, index) => console.log('Breadcrumb clicked:', item, index)}
                />
              </div>

              {/* Project Breadcrumbs */}
              <div>
                <H2 className="mb-4">Project Navigation</H2>
                <ProjectBreadcrumb
                  projectName="Dragon Movie Production"
                  currentPath={['Characters', 'Main Characters', 'Dragon']}
                  department="modeling"
                  onNavigate={(path) => console.log('Navigate to:', path)}
                />
              </div>

              {/* Asset Breadcrumbs */}
              <div>
                <H2 className="mb-4">Asset Navigation</H2>
                <AssetBreadcrumb
                  assetPath={['Characters', 'Dragons']}
                  assetName="Fire Dragon Model"
                  assetType="3D Model"
                  department="lookdev"
                  onNavigate={(path) => console.log('Navigate to asset:', path)}
                />
              </div>

              {/* Detailed View */}
              <div>
                <H2 className="mb-4">Detailed View</H2>
                <Breadcrumb
                  items={sampleBreadcrumbs}
                  variant="detailed"
                  department="groom"
                  showMetadata
                />
              </div>
            </CardContent>
          </Card>

          {/* Usage Example */}
          <Card>
            <CardHeader>
              <CardTitle>Usage Example</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto">
                <code>{`import { 
  Button, AssetCard, Dashboard, DepartmentButton, DepartmentBadge,
  StatusFlow, DataTable, Breadcrumb, Icon, Typography, H2
} from '@/components/ui';

// Enhanced components with ShadCN design system
<Button variant="primary">Upload Asset</Button>

// Department-specific theming
<DepartmentButton department="art">Art Department Action</DepartmentButton>
<DepartmentBadge department="modeling" status="orange" statusType="status">
  Modeling Status
</DepartmentBadge>

// Status workflow management
<StatusFlow
  nodes={statusNodes}
  department="modeling"
  variant="tree"
  onStatusClick={handleStatusClick}
/>

// Advanced data tables
<DataTable
  data={tableData}
  columns={columns}
  selectable
  department="art"
  onRowSelect={handleSelection}
  actions={rowActions}
  bulkActions={bulkActions}
/>

// Contextual navigation
<Breadcrumb
  items={breadcrumbItems}
  department="lookdev"
  variant="default"
  onItemClick={handleNavigation}
/>

// Icon system
<Icon name="search" size="md" />
<Icon name="lasso-art" size="lg" />
<Icon name="filter" className="text-primary" />

// Typography system
<Typography variant="heading-1">Page Title</Typography>
<Typography variant="body" color="muted">Body text</Typography>
<H2>Section Heading</H2>

<AssetCard 
  asset={asset}
  selectable
  showActions
  onSelect={handleSelect}
/>

<Dashboard 
  recentAssets={assets}
  stats={dashboardStats}
/>`}</code>
              </pre>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default DesignSystemShowcase;
