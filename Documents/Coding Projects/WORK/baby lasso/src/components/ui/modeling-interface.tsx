import React, { useMemo, useState } from 'react';
import { Typography, Button, Input, AssetType } from '@/components/ui';
import type { Asset } from '@/components/ui';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import TopNavigation from './top-navigation';
import AssetGrid from './asset-grid';
import AssetDetails from './asset-details';

const assetBlueprints: Array<{
  seed: string;
  type: AssetType;
  tags: string[];
  fileSizeKB: number;
  project: string;
  projectCount: string;
  notes: string;
}> = [
  {
    seed: 'lighthouse',
    type: AssetType.CHARACTER,
    tags: ['featured', 'model'],
    fileSizeKB: 15,
    project: 'Shrek 4',
    projectCount: '6,000+',
    notes: 'Optimized hero model with updated surface shaders.',
  },
  {
    seed: 'alpine-range',
    type: AssetType.ENVIRONMENT,
    tags: ['library'],
    fileSizeKB: 16,
    project: 'Dragon Peak',
    projectCount: '1,200+',
    notes: 'High altitude environment plate with volumetrics baked in.',
  },
  {
    seed: 'city-lights',
    type: AssetType.PROP,
    tags: ['library', 'prop'],
    fileSizeKB: 17,
    project: 'Metro Backlot',
    projectCount: '980+',
    notes: 'Modular prop with LOD variants for crowd scenes.',
  },
  {
    seed: 'sunset-bay',
    type: AssetType.MODEL,
    tags: ['featured'],
    fileSizeKB: 18,
    project: 'Ocean Story',
    projectCount: '2,400+',
    notes: 'Primary hero asset with articulated rig and texture set.',
  },
  {
    seed: 'forest-trail',
    type: AssetType.TEXTURE,
    tags: ['library', 'texture'],
    fileSizeKB: 19,
    project: 'Evergreen',
    projectCount: '540+',
    notes: 'Tileable texture set calibrated for ACEScg workflow.',
  },
  {
    seed: 'desert-dunes',
    type: AssetType.ENVIRONMENT,
    tags: ['library'],
    fileSizeKB: 20,
    project: 'Nomad',
    projectCount: '1,050+',
    notes: 'Procedural dune environment with baked lighting caches.',
  },
];

const statsOptions = [
  '12,800 verts • 11,362 faces • 28 parts',
  '8,420 verts • 7,110 faces • 12 parts',
  '24,560 verts • 19,880 faces • 6 parts',
];

const generateAssets = (count: number): Asset[] =>
  Array.from({ length: count }, (_, index) => {
    const blueprint = assetBlueprints[index % assetBlueprints.length];
    const stats = statsOptions[index % statsOptions.length];
    const date = new Date(2024, index % 12, (index % 27) + 1);

    return {
      id: `asset-${index + 1}`,
      name: `Asset ${index + 1}`,
      type: blueprint.type,
      tags: blueprint.tags,
      thumbnailUrl: `https://picsum.photos/seed/${blueprint.seed}-${index}/640/480`,
      fileSize: blueprint.fileSizeKB * 1024,
      dateModified: date.toISOString(),
      version: `Version ${(index % 4) + 1}`,
      stats,
      notes: blueprint.notes,
      project: blueprint.project,
      projectCount: blueprint.projectCount,
      path: `/assets/modeling/${blueprint.seed.replace(/\s+/g, '-').toLowerCase()}/asset-${index + 1}`,
      lastModifiedLabel: `${date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })} • Most Recent`,
    };
  });

const ModelingInterface: React.FC = () => {
  const assets = useMemo(() => generateAssets(30), []);
  const [selectedAssetId, setSelectedAssetId] = useState(() => assets[0]?.id ?? '');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) ?? null;
  const selectedCount = selectedAsset ? 1 : 0;
  const summary = `${assets.length} items${selectedCount ? ` · ${selectedCount} Selected` : ''}`;

  const viewButtonClass = (mode: 'grid' | 'list') =>
    cn(
      'flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 transition-colors',
      viewMode === mode ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
    );

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900">
      <TopNavigation />
      <div className="relative flex flex-1 overflow-hidden" role="main">
        <aside
          className={cn(
            'flex h-full flex-shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out',
            isFiltersOpen ? 'w-72' : 'w-0',
            !isFiltersOpen && 'overflow-hidden'
          )}
          aria-label="Filters"
        >
          {isFiltersOpen && (
            <div className="custom-scrollbar flex-1 overflow-y-auto px-5 py-6 space-y-6">
              <div>
                <Typography variant="h3" className="text-base font-semibold text-slate-900">
                  Modeling
                </Typography>
                <p className="mt-1 text-xs text-slate-500">
                  Filter assets by show, session, or resolution.
                </p>
              </div>
              <Input
                placeholder="Search Artwork, Artist names, Tags"
                className="w-full bg-slate-100"
                icon={<Search className="h-4 w-4 text-slate-400" />}
                aria-label="Search assets"
              />
              <div className="space-y-3">
                <FilterControl label="All Shows" icon={<Filter className="h-4 w-4 text-slate-400" />} />
                <FilterControl label="All Asset Types" icon={<Filter className="h-4 w-4 text-slate-400" />} />
              </div>
              <div className="space-y-2">
                {['Select Session', 'Full Resolution', 'Geo'].map((label) => (
                  <QuickFilterButton key={label} label={label} />
                ))}
              </div>
            </div>
          )}
        </aside>

        <Button
          variant="outline"
          size="icon"
          className="absolute left-3 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border-slate-200 bg-white shadow-sm lg:flex"
          onClick={() => setIsFiltersOpen((prev) => !prev)}
          aria-label={isFiltersOpen ? 'Collapse filters' : 'Expand filters'}
        >
          {isFiltersOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-slate-200 bg-white px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{summary}</p>
                <p className="text-xs text-slate-500">Assets curated for the modeling library</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={viewButtonClass('grid')}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  aria-pressed={viewMode === 'grid'}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={viewButtonClass('list')}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  aria-pressed={viewMode === 'list'}
                >
                  <List className="h-4 w-4" />
                </button>
                <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-md border-slate-200">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2 rounded-md border-slate-200">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
          </div>

          <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-6">
            <AssetGrid
              assets={assets}
              selectedAssetId={selectedAsset?.id}
              onSelect={setSelectedAssetId}
              viewMode={viewMode}
              className="pb-10"
            />
          </div>
        </div>

        <aside
          className={cn(
            'flex h-full flex-shrink-0 flex-col border-l border-slate-200 bg-white transition-all duration-300 ease-in-out',
            isDetailsOpen ? 'w-[320px]' : 'w-0',
            !isDetailsOpen && 'overflow-hidden'
          )}
          aria-label="Asset details"
        >
          {isDetailsOpen && <AssetDetails asset={selectedAsset} />}
        </aside>

        <Button
          variant="outline"
          size="icon"
          className="absolute right-3 top-1/2 z-30 hidden -translate-y-1/2 rounded-full border-slate-200 bg-white shadow-sm lg:flex"
          onClick={() => setIsDetailsOpen((prev) => !prev)}
          aria-label={isDetailsOpen ? 'Collapse asset details' : 'Expand asset details'}
        >
          {isDetailsOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

const FilterControl = ({ label, icon }: { label: string; icon?: React.ReactNode }) => (
  <Button
    variant="outline"
    className="flex w-full items-center justify-between rounded-lg border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50"
    aria-haspopup="listbox"
    aria-expanded="false"
  >
    <span className="flex items-center gap-2">
      {icon}
      {label}
    </span>
    <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
  </Button>
);

const QuickFilterButton = ({ label }: { label: string }) => (
  <Button
    variant="ghost"
    className="w-full justify-start rounded-lg bg-slate-100 text-sm font-medium text-slate-700 hover:bg-slate-200"
  >
    {label}
  </Button>
);

export default ModelingInterface;