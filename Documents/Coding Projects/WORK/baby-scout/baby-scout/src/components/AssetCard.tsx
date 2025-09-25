import React from 'react';
import StatusBadge, { AssetStatus } from './StatusBadge';

type Asset = {
  id: string;
  name: string;
  imageUrl: string;
  status: AssetStatus;
  description?: string;
};

interface AssetCardProps {
  asset: Asset;
  onDownload?: (assetId: string) => void;
  isDownloading?: boolean;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onDownload, isDownloading }) => {
  const handleDownload = () => {
    onDownload?.(asset.id);
  };

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="relative block aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={asset.imageUrl}
          alt={asset.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute left-3 top-3">
          <StatusBadge status={asset.status} />
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900" title={asset.name}>
            {asset.name}
          </h3>
          {asset.description ? (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{asset.description}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center justify-center rounded-md border border-transparent bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          data-testid="asset-download"
        >
          {isDownloading ? 'Downloading…' : 'Download'}
        </button>
      </div>
    </article>
  );
};

const AssetCardSkeleton: React.FC = () => (
  <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="animate-pulse bg-slate-200" style={{ aspectRatio: '1 / 1' }} />
    <div className="space-y-3 px-4 py-4">
      <div className="h-3 w-2/3 rounded-full bg-slate-200" />
      <div className="h-3 w-1/2 rounded-full bg-slate-200" />
      <div className="h-9 w-full rounded-md bg-slate-200" />
    </div>
  </div>
);

export default AssetCard;
export { AssetCardSkeleton };
export type { AssetCardProps, Asset };
