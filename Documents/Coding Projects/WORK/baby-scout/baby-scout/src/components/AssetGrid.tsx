import React from 'react';
import type { GridChildComponentProps } from 'react-window';
import { FixedSizeGrid } from 'react-window';
import AssetCard, { AssetCardSkeleton, type Asset } from './AssetCard';

type AssetsResponse = {
  assets: Asset[];
};

const DESKTOP_REFERENCE_WIDTH = 1440;
const TARGET_DESKTOP_COLUMNS = 10;
const MAX_COLUMNS = 12;
const MIN_COLUMNS = 2;
const MOBILE_BREAKPOINT = 480;
const MIN_COLUMN_WIDTH = 140;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getColumnCount = (width: number): number => {
  if (width <= 0) return MIN_COLUMNS;
  if (width <= MOBILE_BREAKPOINT) {
    return 1;
  }

  const maxColumnsForWidth = Math.max(1, Math.floor(width / MIN_COLUMN_WIDTH));
  const estimated = Math.round((width / DESKTOP_REFERENCE_WIDTH) * TARGET_DESKTOP_COLUMNS);
  const clamped = clamp(estimated, MIN_COLUMNS, MAX_COLUMNS);

  return clamp(clamped, MIN_COLUMNS, Math.max(MIN_COLUMNS, maxColumnsForWidth));
};

const getColumnWidth = (width: number, columns: number): number => {
  if (columns <= 0) return MIN_COLUMN_WIDTH;
  return Math.floor(width / columns);
};

const getRowHeight = (columnWidth: number): number => Math.max(columnWidth + 72, 240);

type CellData = {
  assets: Asset[];
  columnCount: number;
  onDownload: (assetId: string) => void;
  isLoading: boolean;
  focusedIndex: number;
  onFocusCell: (index: number) => void;
  registerCell: (index: number, node: HTMLDivElement | null) => void;
};

const Cell = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps<CellData>) => {
  const { assets, columnCount, onDownload, isLoading, focusedIndex, onFocusCell, registerCell } = data;
  const index = rowIndex * columnCount + columnIndex;
  const asset = assets[index];

  if (!asset || isLoading) {
    return (
      <div
        key={`${rowIndex}-${columnIndex}-skeleton`}
        style={{
          ...style,
          padding: '0.75rem',
        }}
        role="presentation"
        aria-hidden="true"
      >
        <AssetCardSkeleton />
      </div>
    );
  }

  const assignRef = (node: HTMLDivElement | null) => registerCell(index, node);

  return (
    <div
      key={`${rowIndex}-${columnIndex}`}
      ref={assignRef}
      role="gridcell"
      tabIndex={focusedIndex === index ? 0 : -1}
      onFocus={() => onFocusCell(index)}
      style={{
        ...style,
        padding: '0.75rem',
      }}
    >
      <AssetCard asset={asset} onDownload={onDownload} />
    </div>
  );
};

const AssetGrid: React.FC = () => {
  const [windowWidth, setWindowWidth] = React.useState(
    typeof window !== 'undefined' ? window.innerWidth : DESKTOP_REFERENCE_WIDTH
  );
  const [assets, setAssets] = React.useState<Asset[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const gridRef = React.useRef<React.ElementRef<typeof FixedSizeGrid>>(null);
  const cellRefs = React.useRef<Map<number, HTMLDivElement>>(new Map());

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    async function fetchAssets() {
      try {
        const response = await fetch('/api/assets');
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const json = (await response.json()) as AssetsResponse;

        if (isMounted) {
          setAssets(json.assets);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchAssets();

    return () => {
      isMounted = false;
    };
  }, []);

  const columnCount = React.useMemo(() => getColumnCount(windowWidth), [windowWidth]);
  const columnWidth = React.useMemo(
    () => getColumnWidth(windowWidth, columnCount),
    [windowWidth, columnCount]
  );
  const rowHeight = React.useMemo(() => getRowHeight(columnWidth), [columnWidth]);
  const placeholderCount = columnCount * 3;
  const displayAssets = assets.length > 0 ? assets : new Array<Asset>(placeholderCount);
  const rowCount = Math.max(1, Math.ceil(displayAssets.length / columnCount));

  const gridWidth = columnWidth * columnCount;
  const handleDownload = React.useCallback((assetId: string) => {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.log('Download requested for asset', assetId);
    }
  }, []);

  const registerCell = React.useCallback((index: number, node: HTMLDivElement | null) => {
    if (node) {
      cellRefs.current.set(index, node);
    } else {
      cellRefs.current.delete(index);
    }
  }, []);

  const focusCell = React.useCallback(
    (index: number) => {
      setFocusedIndex(index);
      const rowIndex = Math.floor(index / columnCount);
      const columnIndex = index % columnCount;
      gridRef.current?.scrollToItem({ rowIndex, columnIndex, align: 'smart' });

      const requestFrame =
        typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
          ? window.requestAnimationFrame.bind(window)
          : (cb: FrameRequestCallback) => setTimeout(() => cb(0), 0);

      const attemptFocus = (tries: number) => {
        const node = cellRefs.current.get(index);
        if (node) {
          node.focus();
          return;
        }

        if (tries < 10) {
          requestFrame(() => attemptFocus(tries + 1));
        }
      };

      requestFrame(() => attemptFocus(0));
    },
    [columnCount]
  );

  const handleCellFocus = React.useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isLoading || assets.length === 0) {
        return;
      }

      const totalItems = assets.length;
      let nextIndex = focusedIndex;

      switch (event.key) {
        case 'ArrowRight':
          nextIndex = Math.min(focusedIndex + 1, totalItems - 1);
          break;
        case 'ArrowLeft':
          nextIndex = Math.max(focusedIndex - 1, 0);
          break;
        case 'ArrowDown':
          nextIndex = Math.min(focusedIndex + columnCount, totalItems - 1);
          break;
        case 'ArrowUp':
          nextIndex = Math.max(focusedIndex - columnCount, 0);
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = totalItems - 1;
          break;
        case 'Enter':
        case ' ': {
          event.preventDefault();
          const asset = assets[focusedIndex];
          if (asset) {
            handleDownload(asset.id);
          }
          return;
        }
        default:
          return;
      }

      if (nextIndex !== focusedIndex) {
        event.preventDefault();
        focusCell(nextIndex);
      }
    },
    [assets, columnCount, focusCell, focusedIndex, handleDownload, isLoading]
  );

  React.useEffect(() => {
    if (!isLoading && assets.length > 0) {
      setFocusedIndex(0);
    }
  }, [assets.length, isLoading]);

  if (error) {
    return (
      <div
        data-testid="grid-error"
        className="flex h-[600px] items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-6 text-center text-sm font-medium text-rose-700"
      >
        We couldn&apos;t load assets. {error}
      </div>
    );
  }

  if (!isLoading && assets.length === 0) {
    return (
      <div
        data-testid="grid-empty"
        className="flex h-[600px] items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center text-sm text-slate-500"
      >
        No assets found. Try adjusting your filters or check back later.
      </div>
    );
  }

  return (
    <div
      data-testid="asset-grid"
      className="relative outline-none"
      role="grid"
      aria-busy={isLoading}
      aria-colcount={columnCount}
      aria-rowcount={assets.length || placeholderCount}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <FixedSizeGrid
        ref={gridRef}
        className="grid"
        columnCount={columnCount}
        columnWidth={columnWidth}
        height={600}
        rowCount={rowCount}
        rowHeight={rowHeight}
        width={gridWidth}
        overscanRowCount={2}
        overscanColumnCount={1}
        itemData={{
          assets: displayAssets,
          columnCount,
          onDownload: handleDownload,
          isLoading: isLoading && !error,
          focusedIndex,
          onFocusCell: handleCellFocus,
          registerCell,
        }}
      >
        {Cell}
      </FixedSizeGrid>
    </div>
  );
};

export default AssetGrid;
export { getColumnCount };
