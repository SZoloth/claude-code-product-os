import React from 'react';
import { Typography, Button, Badge } from '@/components/ui';
import type { Asset } from '@/components/ui';
import { cn } from '@/lib/utils';

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '—';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const value = bytes / Math.pow(k, i);
  return `${value % 1 === 0 ? value : value.toFixed(1)} ${sizes[i]}`;
};

interface AssetDetailsProps {
  asset: Asset | null | undefined;
}

const AssetDetails: React.FC<AssetDetailsProps> = ({ asset }) => {
  if (!asset) {
    return (
      <div className="flex h-full items-center justify-center bg-white text-sm text-muted-foreground">
        Select an asset to see details
      </div>
    );
  }

  const formattedModified = asset.lastModifiedLabel ?? new Date(asset.dateModified).toLocaleString();

  return (
    <aside
      className="flex h-full flex-col bg-white"
      role="region"
      aria-label={`Asset details for ${asset.name}`}
    >
      <div className="border-b border-slate-200 px-6 py-5">
        <Typography variant="h4" className="text-lg font-semibold text-slate-900">
          {asset.name}
        </Typography>
        <p className="mt-1 text-sm text-slate-500">
          {asset.version ?? 'Latest version'} • {asset.stats ?? 'High resolution asset'}
        </p>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto px-6 py-5">
        <div className="overflow-hidden rounded-xl bg-slate-100">
          <img
            src={asset.thumbnailUrl ?? '/placeholder-asset.svg'}
            alt={asset.name}
            className="h-56 w-full object-cover"
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {asset.version && <Badge variant="secondary">{asset.version}</Badge>}
          {asset.stats && <Badge variant="secondary">{asset.stats}</Badge>}
        </div>

        {asset.notes && (
          <p className="mt-4 text-sm text-slate-600">
            {asset.notes}
          </p>
        )}

        <dl className="mt-6 space-y-3 text-sm">
          <DefinitionItem label="Last modified" value={formattedModified} />
          {asset.project && (
            <DefinitionItem
              label="Project"
              value={
                <span className="flex items-center gap-2 text-slate-900">
                  {asset.project}
                  {asset.projectCount && <Badge variant="secondary">{asset.projectCount}</Badge>}
                </span>
              }
            />
          )}
          <DefinitionItem
            label="File size"
            value={formatFileSize(asset.fileSize)}
          />
          {asset.path && <DefinitionItem label="Path" value={asset.path} truncate />}
        </dl>
      </div>

      <div className="border-t border-slate-200 px-6 py-4">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            Add to Session
          </Button>
          <Button variant="secondary" size="sm">
            Open in Viewer
          </Button>
          <Button size="sm">Add</Button>
        </div>
      </div>
    </aside>
  );
};

const DefinitionItem = ({
  label,
  value,
  truncate,
}: {
  label: string;
  value: React.ReactNode;
  truncate?: boolean;
}) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
    <span
      className={cn('text-sm text-slate-900', truncate && 'truncate')}
      title={truncate && typeof value === 'string' ? value : undefined}
    >
      {value}
    </span>
  </div>
);

export default AssetDetails;