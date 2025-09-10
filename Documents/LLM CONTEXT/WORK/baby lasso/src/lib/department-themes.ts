import { type VariantProps, cva } from "class-variance-authority";

// Department types
export type Department = 'art' | 'modeling' | 'lookdev' | 'groom';

// Department theme configurations
export const departmentThemes = {
  art: {
    primary: 'bg-art-primary text-art-primary-text',
    secondary: 'bg-art-background-dark text-art-text-white',
    accent: 'bg-art-brand text-art-text-white',
    border: 'border-art-border-active',
    link: 'text-art-link-primary hover:text-art-link-secondary',
    status: {
      1: 'bg-art-status-1',
      2: 'bg-art-status-2', 
      3: 'bg-art-status-3',
      4: 'bg-art-status-4',
      5: 'bg-art-status-5',
      6: 'bg-art-status-6',
      7: 'bg-art-status-7',
      8: 'bg-art-status-8',
    },
    legal: {
      1: 'bg-art-legal-1',
      2: 'bg-art-legal-2',
      3: 'bg-art-legal-3', 
      4: 'bg-art-legal-4',
      5: 'bg-art-legal-5',
    }
  },
  modeling: {
    primary: 'bg-modeling-primary text-modeling-primary-text',
    secondary: 'bg-modeling-background-dark text-modeling-text-white',
    accent: 'bg-modeling-brand text-modeling-text-white',
    border: 'border-modeling-border-active',
    link: 'text-modeling-link-primary hover:text-modeling-link-secondary',
    status: {
      orange: 'bg-modeling-status-orange',
      red: 'bg-modeling-status-red',
      green: 'bg-modeling-status-green',
    }
  },
  lookdev: {
    primary: 'bg-lookdev-primary text-lookdev-primary-text',
    secondary: 'bg-lookdev-background-dark text-lookdev-text-white',
    accent: 'bg-lookdev-brand text-lookdev-text-white',
    border: 'border-lookdev-border-active',
    link: 'text-lookdev-link-primary hover:text-lookdev-link-secondary',
    variant: {
      purple: 'bg-lookdev-variant-purple',
      blue: 'bg-lookdev-variant-blue',
    }
  },
  groom: {
    primary: 'bg-groom-primary text-groom-primary-text',
    secondary: 'bg-groom-background-dark text-groom-text-white',
    accent: 'bg-groom-brand text-groom-text-white',
    border: 'border-groom-border-active',
    link: 'text-groom-link-primary hover:text-groom-link-secondary',
    variant: {
      teal: 'bg-groom-variant-teal',  
      blue: 'bg-groom-variant-blue',
    }
  }
};

// Button variants with department theming
export const departmentButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Department-specific variants
        'art-primary': "bg-art-primary text-art-text-white hover:opacity-90",
        'art-secondary': "bg-art-background-dark text-art-text-white border border-art-stroke-medium hover:bg-art-stroke-dark",
        'modeling-primary': "bg-modeling-primary text-modeling-text-white hover:opacity-90",
        'modeling-secondary': "bg-modeling-background-dark text-modeling-text-white border border-modeling-stroke-medium hover:bg-modeling-stroke-dark",
        'lookdev-primary': "bg-lookdev-primary text-lookdev-text-black hover:opacity-90",
        'lookdev-secondary': "bg-lookdev-background-dark text-lookdev-text-white border border-lookdev-stroke-medium hover:bg-lookdev-stroke-dark",
        'groom-primary': "bg-groom-primary text-groom-text-white hover:opacity-90",
        'groom-secondary': "bg-groom-background-dark text-groom-text-white border border-groom-stroke-medium hover:bg-groom-stroke-dark",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",  
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Badge variants with department theming
export const departmentBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        // Department status badges
        'art-status-1': "border-transparent bg-art-status-1 text-white",
        'art-status-2': "border-transparent bg-art-status-2 text-black",
        'art-status-3': "border-transparent bg-art-status-3 text-black",
        'art-status-4': "border-transparent bg-art-status-4 text-white",
        'art-status-5': "border-transparent bg-art-status-5 text-white",
        'art-status-6': "border-transparent bg-art-status-6 text-black",
        'art-status-7': "border-transparent bg-art-status-7 text-black",
        'art-status-8': "border-transparent bg-art-status-8 text-black",
        'art-legal-1': "border-transparent bg-art-legal-1 text-black",
        'art-legal-2': "border-transparent bg-art-legal-2 text-white",
        'art-legal-3': "border-transparent bg-art-legal-3 text-white",
        'art-legal-4': "border-transparent bg-art-legal-4 text-white",
        'art-legal-5': "border-transparent bg-art-legal-5 text-white",
        'modeling-status-orange': "border-transparent bg-modeling-status-orange text-black",
        'modeling-status-red': "border-transparent bg-modeling-status-red text-white",
        'modeling-status-green': "border-transparent bg-modeling-status-green text-white",
        'lookdev-variant-purple': "border-transparent bg-lookdev-variant-purple text-white",
        'lookdev-variant-blue': "border-transparent bg-lookdev-variant-blue text-white",
        'groom-variant-teal': "border-transparent bg-groom-variant-teal text-white",
        'groom-variant-blue': "border-transparent bg-groom-variant-blue text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type DepartmentButtonVariant = VariantProps<typeof departmentButtonVariants>['variant'];
export type DepartmentBadgeVariant = VariantProps<typeof departmentBadgeVariants>['variant'];