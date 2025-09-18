import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { typographyVariants, type TypographyVariant, type TypographyColor } from "@/lib/typography"

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  asChild?: boolean
  as?: keyof JSX.IntrinsicElements
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant = "body", color = "default", asChild = false, as, ...props }, ref) => {
    // Determine the component to render
    const getComponent = () => {
      if (asChild) return Slot;
      if (as) return as;
      
      // Auto-select semantic HTML element based on variant
      switch (variant) {
        case 'display-1':
        case 'display-2':
        case 'heading-1':
          return 'h1';
        case 'heading-2':
          return 'h2';
        case 'heading-3':
          return 'h3';
        case 'heading-4':
          return 'h4';
        case 'heading-5':
          return 'h5';
        case 'heading-6':
          return 'h6';
        case 'overline':
          return 'span';
        case 'code':
        case 'code-small':
          return 'code';
        case 'body-large':
        case 'body':
        case 'body-small':
          return 'p';
        case 'caption':
        case 'caption-bold':
        case 'label':
        case 'label-small':
        case 'button':
        case 'button-large':
        default:
          return 'span';
      }
    };

    const Comp = getComponent();
    
    return (
      <Comp
        className={cn(typographyVariants({ variant, color }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Typography.displayName = "Typography"

// Convenience components for common use cases
const H1 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="heading-1"
      as="h1"
      className={className}
      {...props}
    />
  )
)
H1.displayName = "H1"

const H2 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="heading-2"
      as="h2"
      className={className}
      {...props}
    />
  )
)
H2.displayName = "H2"

const H3 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="heading-3"
      as="h3"
      className={className}
      {...props}
    />
  )
)
H3.displayName = "H3"

const H4 = React.forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="heading-4"
      as="h4"
      className={className}
      {...props}
    />
  )
)
H4.displayName = "H4"

const Text = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="body"
      as="p"
      className={className}
      {...props}
    />
  )
)
Text.displayName = "Text"

const TextLarge = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="body-large"
      as="p"
      className={className}
      {...props}
    />
  )
)
TextLarge.displayName = "TextLarge"

const TextSmall = React.forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="body-small"
      as="p"
      className={className}
      {...props}
    />
  )
)
TextSmall.displayName = "TextSmall"

const Label = React.forwardRef<HTMLSpanElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="label"
      as="span"
      className={className}
      {...props}
    />
  )
)
Label.displayName = "Label"

const Caption = React.forwardRef<HTMLSpanElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="caption"
      as="span"
      className={className}
      {...props}
    />
  )
)
Caption.displayName = "Caption"

const Code = React.forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>(
  ({ className, ...props }, ref) => (
    <Typography
      ref={ref}
      variant="code"
      as="code"
      className={cn("bg-muted px-1.5 py-0.5 rounded", className)}
      {...props}
    />
  )
)
Code.displayName = "Code"

export { 
  Typography, 
  H1, 
  H2, 
  H3, 
  H4, 
  Text, 
  TextLarge, 
  TextSmall, 
  Label, 
  Caption, 
  Code,
  typographyVariants,
  type TypographyVariant,
  type TypographyColor
}