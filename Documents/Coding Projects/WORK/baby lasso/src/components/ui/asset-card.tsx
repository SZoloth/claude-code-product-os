import React from 'react';
import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';

export enum AssetType {
  MODEL = 'MODEL',
  PROP = 'PROP',
  ENVIRONMENT = 'ENVIRONMENT',
  CHARACTER = 'CHARACTER',
  TEXTURE = 'TEXTURE',
  CONCEPT_ART = 'CONCEPT_ART',
  REFERENCE = 'REFERENCE',
  ANIMATION = 'ANIMATION',
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  thumbnailUrl?: string;
  fileSize: number;
  dateModified: string;
  description?: string;
  tags?: string[];
  version?: string;
  stats?: string;
  project?: string;
  projectCount?: string;
  path?: string;
  notes?: string;
  lastModifiedLabel?: string;
}

interface AssetCardProps {
  asset: Asset;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
}

// Keep existing utility functions
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

const typeTone: Record<AssetType, string> = {
  [AssetType.CHARACTER]: 'bg-blue-600 text-white',
  [AssetType.ENVIRONMENT]: 'bg-emerald-500 text-white',
  [AssetType.PROP]: 'bg-amber-500 text-white',
  [AssetType.MODEL]: 'bg-indigo-600 text-white',
  [AssetType.TEXTURE]: 'bg-slate-800 text-white',
  [AssetType.CONCEPT_ART]: 'bg-pink-500 text-white',
  [AssetType.REFERENCE]: 'bg-fuchsia-500 text-white',
  [AssetType.ANIMATION]: 'bg-teal-500 text-white',
};

/**
 * AssetCard – presentation for assets within the modeling grid.
 * Highlights the selected asset, displays metadata, and supports keyboard focus.
 */
export const AssetCard = ({ 
  asset, 
  selectable = false, 
  selected = false, 
  onSelect, 
  className
}: AssetCardProps) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = '/placeholder-asset.svg';
  };

  const handleSelect = (e: React.MouseEvent) => {
    if (!selectable || !onSelect) return;
    e.preventDefault();
    onSelect(asset.id);
  };

  const formattedDate = formatDate(asset.dateModified);
  const formattedSize = formatFileSize(asset.fileSize);

  return (
    <Card 
      className={cn(
        'group relative cursor-pointer overflow-hidden rounded-2xl border border-transparent bg-white shadow-sm transition-all duration-200 hover:shadow-md',
        selected && 'ring-2 ring-primary shadow-lg',
        className
      )}
      onClick={handleSelect}
      role={selectable ? 'button' : undefined}
      aria-pressed={selectable ? selected : undefined}
    >
      {selectable && (
        <div className="absolute left-4 top-4 z-20">
          <div
            className={cn(
              'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
              selected ? 'border-primary bg-primary text-primary-foreground' : 'border-slate-200 bg-white text-transparent',
            )}
          >
            <span className="text-[10px] font-semibold">✓</span>
          </div>
        </div>
      )}

      <div className="relative h-48 w-full overflow-hidden">
        {asset.thumbnailUrl ? (
          <img
            src={asset.thumbnailUrl}
            alt={asset.name}
            onError={handleImageError}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
            <span className="text-xl font-semibold">{asset.type.charAt(0)}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
        <span
          className={cn(
            'absolute bottom-3 left-3 inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
            typeTone[asset.type] ?? 'bg-slate-800 text-white'
          )}
        >
          {asset.type}
        </span>
      </div>

      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between">
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900" title={asset.name}>
            {asset.name}
          </h3>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formattedDate}</span>
          <span>{formattedSize}</span>
        </div>
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {asset.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};