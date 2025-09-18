import React from 'react';
import { cn } from '@/lib/utils';
import { getDepartmentIconColor, Icon } from '@/lib/icons';

export type Dept = 'art' | 'modeling' | 'lookdev' | 'groom';

const deptName: Record<Dept, string> = {
  art: 'ART',
  modeling: 'MODELING',
  lookdev: 'LOOKDEV',
  groom: 'GROOM',
};

export interface DepartmentTokenProps {
  department: Dept;
  active?: boolean;
  onClick?: () => void;
}

export const DepartmentToken = ({ department, active, onClick }: DepartmentTokenProps) => (
  <button
    onClick={onClick}
    className={cn(
      'inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-[11px]',
      active ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'
    )}
  >
    <Icon name={`lasso-${department}` as any} size="sm" className={getDepartmentIconColor(department)} />
    {deptName[department]}
  </button>
);

export const DepartmentTokensRow = ({
  departments = ['art', 'modeling', 'lookdev', 'groom'],
  active,
  onSelect,
  className,
}: {
  departments?: Dept[];
  active?: Dept;
  onSelect?: (d: Dept) => void;
  className?: string;
}) => (
  <div className={cn('flex flex-wrap items-center gap-2', className)}>
    {departments.map((d) => (
      <DepartmentToken key={d} department={d} active={active === d} onClick={() => onSelect?.(d)} />
    ))}
  </div>
);

export default DepartmentTokensRow;

