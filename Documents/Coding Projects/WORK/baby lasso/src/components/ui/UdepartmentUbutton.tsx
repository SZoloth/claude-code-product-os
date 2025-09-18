import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { departmentButtonVariants, type DepartmentButtonVariant, type Department } from "@/lib/department-themes"

export interface DepartmentButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof departmentButtonVariants> {
  asChild?: boolean
  department?: Department
}

const DepartmentButton = React.forwardRef<HTMLButtonElement, DepartmentButtonProps>(
  ({ className, variant = "default", size, department, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // If department is specified and no variant, use department primary
    const finalVariant = React.useMemo(() => {
      if (department && variant === "default") {
        return `${department}-primary` as DepartmentButtonVariant;
      }
      return variant;
    }, [department, variant]);

    return (
      <Comp
        className={cn(departmentButtonVariants({ variant: finalVariant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
DepartmentButton.displayName = "DepartmentButton"

export { DepartmentButton, departmentButtonVariants }