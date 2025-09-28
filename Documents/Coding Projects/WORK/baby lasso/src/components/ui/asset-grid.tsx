import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { AssetCard } from '@/components/ui';
import type { Asset } from '@/components/ui';
import { cn } from '@/lib/utils';

interface AssetGridProps {
  assets: Asset[];
  selectedAssetId?: string;
  onSelect?: (assetId: string) => void;
  viewMode?: 'grid' | 'list';
  className?: string;
}

const AssetGrid: React.FC<AssetGridProps> = ({ assets, selectedAssetId, onSelect, viewMode = 'grid', className }) => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const gridRef = useRef<HTMLDivElement>(null);
  const isGridView = viewMode !== 'list';

  useEffect(() => {
    if (!selectedAssetId) return;
    const idx = assets.findIndex((asset) => asset.id === selectedAssetId);
    if (idx !== -1) {
      setFocusedIndex(idx);
    }
  }, [assets, selectedAssetId]);

  useEffect(() => {
    if (focusedIndex >= 0 && gridRef.current) {
      const focusedElement = gridRef.current.children[focusedIndex] as HTMLElement;
      focusedElement.focus();
    }
  }, [focusedIndex]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { key } = event;
    const itemsPerRow = isGridView ? 6 : 1;
    const totalItems = assets.length;

    if (totalItems === 0) return;

    switch (key) {
      case 'ArrowRight':
        setFocusedIndex((prev) => {
          const next = (prev + 1 + totalItems) % totalItems;
          onSelect?.(assets[next].id);
          return next;
        });
        break;
      case 'ArrowLeft':
        setFocusedIndex((prev) => {
          const next = (prev - 1 + totalItems) % totalItems;
          onSelect?.(assets[next].id);
          return next;
        });
        break;
      case 'ArrowDown':
        setFocusedIndex((prev) => {
          const next = (prev + itemsPerRow) % totalItems;
          onSelect?.(assets[next].id);
          return next;
        });
        break;
      case 'ArrowUp':
        setFocusedIndex((prev) => {
          const next = (prev - itemsPerRow + totalItems) % totalItems;
          onSelect?.(assets[next].id);
          return next;
        });
        break;
      default:
        return;
    }
    event.preventDefault();
  };

  return (
    <div
      ref={gridRef}
      className={cn(
        'grid gap-4 outline-none',
        isGridView ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6' : 'grid-cols-1',
        className
      )}
      role="grid"
      aria-label="Assets"
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      {assets.map((asset, index) => (
        <div
          key={asset.id}
          role="gridcell"
          tabIndex={index === focusedIndex ? 0 : -1}
          aria-selected={asset.id === selectedAssetId}
          className={cn(!isGridView && 'w-full')}
        >
          <AssetCard
            asset={asset}
            selectable={Boolean(onSelect)}
            selected={asset.id === selectedAssetId}
            onSelect={onSelect}
            className={cn(isGridView ? '' : 'flex w-full')}
          />
        </div>
      ))}
    </div>
  );
};

export default AssetGrid;