import * as React from "react"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { departmentBadgeVariants, type DepartmentBadgeVariant, type Department } from "@/lib/department-themes"

export interface DepartmentBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof departmentBadgeVariants> {
  department?: Department
  status?: string | number
  statusType?: 'status' | 'legal' | 'variant'
}

function DepartmentBadge({ 
  className, 
  variant = "default", 
  department, 
  status,
  statusType = 'status',
  ...props 
}: DepartmentBadgeProps) {
  // Generate department-specific variant if department and status are provided
  const finalVariant = React.useMemo(() => {
    if (department && status !== undefined) {
      const statusKey = statusType === 'status' ? 'status' : statusType;
      return `${department}-${statusKey}-${status}` as DepartmentBadgeVariant;
    }
    return variant;
  }, [department, status, statusType, variant]);

  return (
    <div className={cn(departmentBadgeVariants({ variant: finalVariant }), className)} {...props} />
  )
}

export { DepartmentBadge, departmentBadgeVariants }