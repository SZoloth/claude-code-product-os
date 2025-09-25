import React from 'react';

export type AssetStatus = 'draft' | 'in_review' | 'approved' | 'deprecated';

const STATUS_STYLES: Record<AssetStatus, string> = {
  draft: 'bg-gray-200 text-gray-700',
  in_review: 'bg-amber-100 text-amber-800',
  approved: 'bg-emerald-100 text-emerald-700',
  deprecated: 'bg-rose-100 text-rose-700',
};

const formatStatusLabel = (status: AssetStatus) =>
  status
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');

interface StatusBadgeProps {
  status: AssetStatus;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const styles = STATUS_STYLES[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles} ${
        className ?? ''
      }`.trim()}
      data-testid="status-badge"
    >
      {formatStatusLabel(status)}
    </span>
  );
};

export default StatusBadge;
export { formatStatusLabel };
