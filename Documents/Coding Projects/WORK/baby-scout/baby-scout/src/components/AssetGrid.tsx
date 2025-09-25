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
};

const Cell = ({ columnIndex, rowIndex, style, data }: GridChildComponentProps<CellData>) => {
  const { assets, columnCount, onDownload, isLoading } = data;
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
      >
        <AssetCardSkeleton />
      </div>
    );
  }

  return (
    <div
      key={`${rowIndex}-${columnIndex}`}
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

  return (
    <FixedSizeGrid
      className="grid"
      columnCount={columnCount}
      columnWidth={columnWidth}
      height={600}
      rowCount={rowCount}
      rowHeight={rowHeight}
      width={gridWidth}
      itemData={{ assets: displayAssets, columnCount, onDownload: handleDownload, isLoading: isLoading && !error }}
    >
      {Cell}
    </FixedSizeGrid>
  );
};

export default AssetGrid;
export { getColumnCount };
