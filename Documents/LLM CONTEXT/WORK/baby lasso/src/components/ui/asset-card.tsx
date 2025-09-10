import React from 'react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { MoreHorizontal, Eye, Download, Share2 } from 'lucide-react';

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
}

interface AssetCardProps {
  asset: Asset;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: (id: string) => void;
  compact?: boolean;
  showActions?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
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

const getAssetTypeVariant = (type: AssetType) => {
  switch (type) {
    case AssetType.CHARACTER:
      return 'default';
    case AssetType.ENVIRONMENT:
      return 'secondary';
    case AssetType.PROP:
      return 'outline';
    case AssetType.TEXTURE:
    case AssetType.CONCEPT_ART:
    case AssetType.REFERENCE:
      return 'secondary';
    case AssetType.ANIMATION:
      return 'default';
    default:
      return 'outline';
  }
};

/**
 * Enhanced AssetCard component using ShadCN UI components
 * 
 * Features:
 * - Built with ShadCN Card, Badge, and Button components
 * - Multiple variants (default, outline, ghost)
 * - Consistent design system integration
 * - Responsive and accessible
 * - Optional action buttons
 */
export const AssetCard = ({ 
  asset, 
  selectable = false, 
  selected = false, 
  onSelect, 
  compact = false,
  showActions = false,
  variant = 'default',
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

  return (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-200 hover:shadow-md",
        {
          "border-primary ring-1 ring-primary": selected,
          "hover:border-primary/50": selectable && !selected,
        },
        className
      )}
      onClick={handleSelect}
    >
      {/* Selection indicator */}
      {selectable && (
        <div className="absolute top-3 left-3 z-10">
          <div className={cn(
            "w-5 h-5 rounded-full border-2 transition-colors",
            selected 
              ? "bg-primary border-primary" 
              : "bg-background border-muted-foreground/30 group-hover:border-primary/50"
          )}>
            {selected && (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-2 h-2 bg-primary-foreground rounded-full" />
              </div>
            )}
          </div>
        </div>
      )}

      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
          {asset.thumbnailUrl ? (
            <img 
              src={asset.thumbnailUrl} 
              alt={asset.name} 
              onError={handleImageError}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-muted-foreground/10 flex items-center justify-center">
                <span className="text-lg font-medium">
                  {asset.type.charAt(0)}
                </span>
              </div>
            </div>
          )}
          
          {/* Asset type badge */}
          <div className="absolute bottom-2 right-2">
            <Badge variant={getAssetTypeVariant(asset.type)} className="text-xs">
              {asset.type}
            </Badge>
          </div>

          {/* Action buttons overlay */}
          {showActions && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <Download className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Metadata */}
        <div className="p-4">
          <div className="space-y-2">
            <h3 className="font-medium text-sm truncate" title={asset.name}>
              {asset.name}
            </h3>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>{formatDate(asset.dateModified)}</span>
              <span>{formatFileSize(asset.fileSize)}</span>
            </div>
            {asset.tags && asset.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {asset.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs px-2 py-0">
                    {tag}
                  </Badge>
                ))}
                {asset.tags.length > 2 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{asset.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};